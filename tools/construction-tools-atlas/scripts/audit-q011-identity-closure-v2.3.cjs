const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-011.json');
const MANIFEST = path.join(DATA, 'quality-manifest.json');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const IDENTITY = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function arr(value) { return Array.isArray(value) ? value : []; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function idOf(row) { return text(row?.id || row?.slug); }
function typeOf(row) { return text(row?.type || row?.t || 'unknown') || 'unknown'; }
function jaOf(row) { return text(row?.term?.ja || row?.ja || row?.name_ja || row?.summary?.ja); }
function enOf(row) { return text(row?.term?.en || row?.en || row?.name_en || row?.summary?.en); }
function descJa(row) { return text(row?.description?.ja || row?.summary?.ja || row?.dj || row?.description_ja || row?.summary_ja || row?.detail_ja); }
function descEn(row) { return text(row?.description?.en || row?.summary?.en || row?.de || row?.description_en || row?.summary_en || row?.detail_en); }
function aliasesJa(row) { return arr(row?.aliases?.ja || row?.aj || row?.aliases_ja).map(text).filter(Boolean); }
function aliasesEn(row) { return arr(row?.aliases?.en || row?.ae || row?.aliases_en).map(text).filter(Boolean); }
function norm(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\u3000]+/g, '').replace(/[‐‑‒–—―ー_\-・･\/()（）]/g, '').trim();
}
function stem(id) { return String(id || '').replace(/^q\d+_/, ''); }
function pairKey(a, b) { return [a, b].sort((x, y) => x.localeCompare(y, 'en')).join('\t'); }
function sourcePaths() {
  const manifest = readJson(MANIFEST);
  const out = [];
  for (const pack of arr(manifest.packs)) {
    const p = typeof pack === 'string' ? pack : pack?.path;
    if (p) out.push(String(p).replace(/^\.\/data\//, ''));
  }
  for (const p of arr(manifest.base)) if (p) out.push(String(p).replace(/^\.\/data\//, ''));
  return out;
}
function redirectMap() {
  const raw = readJson(REDIRECTS);
  return new Map(arr(raw?.redirects).map((row) => [text(row?.from), text(row?.to)]).filter(([from, to]) => from && to));
}

const retired = redirectMap();
const identity = readJson(IDENTITY);
const reviewedDistinctPairs = new Map();
for (const row of arr(identity?.resolved_distinct_pairs)) {
  const a = text(row?.a);
  const b = text(row?.b);
  if (!a || !b) throw new Error('Resolved distinct pair requires both ids');
  reviewedDistinctPairs.set(pairKey(a, b), row);
}
const aliasRemovalById = new Map();
for (const row of arr(identity?.alias_removals)) {
  const id = text(row?.id);
  if (!id) throw new Error('Alias removal requires id');
  aliasRemovalById.set(id, {
    ja: new Set(arr(row?.ja).map(norm).filter(Boolean)),
    en: new Set(arr(row?.en).map(norm).filter(Boolean))
  });
}
function effectiveAliases(row, lang) {
  const values = lang === 'ja' ? aliasesJa(row) : aliasesEn(row);
  const removals = aliasRemovalById.get(idOf(row))?.[lang] || new Set();
  return values.filter((value) => !removals.has(norm(value)));
}

const all = [];
for (const rel of sourcePaths()) {
  const file = path.join(DATA, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing source: ${rel}`);
  for (const row of rowsFrom(readJson(file))) {
    const id = idOf(row);
    if (!id || retired.has(id)) continue;
    all.push({ row, source: `data/${rel}` });
  }
}

const targets = rowsFrom(readJson(TARGET)).filter((row) => !retired.has(idOf(row)));
const collisions = [];
const reviewedSignals = [];
for (const target of targets) {
  const id = idOf(target);
  const ja = jaOf(target);
  const en = enOf(target);
  const nja = norm(ja);
  const nen = norm(en);
  const tAliasesJa = effectiveAliases(target, 'ja').map(norm);
  const tAliasesEn = effectiveAliases(target, 'en').map(norm);
  const hits = [];
  for (const item of all) {
    const other = item.row;
    const oid = idOf(other);
    if (!oid || oid === id) continue;
    const oja = jaOf(other);
    const oen = enOf(other);
    const noja = norm(oja);
    const noen = norm(oen);
    const oAliasesJa = effectiveAliases(other, 'ja').map(norm);
    const oAliasesEn = effectiveAliases(other, 'en').map(norm);
    const reasons = [];
    if (nja && nen && nja === noja && nen === noen) reasons.push('exact_bilingual_name');
    else {
      if (nja && nja === noja) reasons.push('exact_ja_name');
      if (nen && nen === noen) reasons.push('exact_en_name');
    }
    if (stem(id) === stem(oid)) reasons.push('same_id_stem');
    if (nja && oAliasesJa.includes(nja)) reasons.push('target_ja_matches_other_alias');
    if (nen && oAliasesEn.includes(nen)) reasons.push('target_en_matches_other_alias');
    if (noja && tAliasesJa.includes(noja)) reasons.push('other_ja_matches_target_alias');
    if (noen && tAliasesEn.includes(noen)) reasons.push('other_en_matches_target_alias');
    if (!reasons.length) continue;

    const reviewed = reviewedDistinctPairs.get(pairKey(id, oid));
    if (reviewed) {
      reviewedSignals.push({ a: id, b: oid, resolution: text(reviewed?.resolution), reasons: [...new Set(reasons)] });
      continue;
    }

    hits.push({
      id: oid,
      type: typeOf(other),
      ja: oja,
      en: oen,
      desc_ja: descJa(other),
      desc_en: descEn(other),
      aliases_ja: effectiveAliases(other, 'ja'),
      aliases_en: effectiveAliases(other, 'en'),
      source: item.source,
      reasons: [...new Set(reasons)]
    });
  }
  if (hits.length) {
    collisions.push({
      id,
      type: typeOf(target),
      ja,
      en,
      desc_ja: descJa(target),
      desc_en: descEn(target),
      aliases_ja: effectiveAliases(target, 'ja'),
      aliases_en: effectiveAliases(target, 'en'),
      hits
    });
  }
}

const reviewedUnique = [...new Map(reviewedSignals.map((row) => [pairKey(row.a, row.b), row])).values()]
  .sort((a, b) => pairKey(a.a, a.b).localeCompare(pairKey(b.a, b.b), 'en'));

console.log(`CTA_Q011_RETIRED_REDIRECTS=${JSON.stringify(Object.fromEntries(retired))}`);
console.log(`CTA_Q011_ACTIVE_ROWS=${targets.length}`);
console.log(`CTA_Q011_REVIEWED_DISTINCT_SIGNALS=${JSON.stringify(reviewedUnique)}`);
console.log(`CTA_Q011_UNRESOLVED_COLLISION_ROWS=${collisions.length}`);
console.log(`CTA_Q011_UNRESOLVED_COLLISIONS=${JSON.stringify(collisions)}`);
if (collisions.length) throw new Error(`q011 identity closure has ${collisions.length} unresolved collision row(s)`);
console.log('Construction Tools Atlas q011 identity closure audit: PASS');
