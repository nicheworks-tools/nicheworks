const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MANIFEST = path.join(DATA, 'quality-manifest.json');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const IDENTITY = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');
const pack = String(process.argv[2] || '').replace(/^q/i, '').padStart(3, '0');
if (!/^\d{3}$/.test(pack)) throw new Error('Usage: node report-quality-pack-collisions-v2.3.cjs <pack number, e.g. 012>');
const TARGET = path.join(DATA, `tools.quality-${pack}.json`);

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
  for (const item of arr(manifest.packs)) {
    const p = typeof item === 'string' ? item : item?.path;
    if (p) out.push(String(p).replace(/^\.\/data\//, ''));
  }
  for (const p of arr(manifest.base)) if (p) out.push(String(p).replace(/^\.\/data\//, ''));
  return out;
}

if (!fs.existsSync(TARGET)) throw new Error(`Missing target pack: ${path.basename(TARGET)}`);
const redirects = new Map(arr(readJson(REDIRECTS)?.redirects).map((row) => [text(row?.from), text(row?.to)]).filter(([a,b]) => a && b));
const identity = readJson(IDENTITY);
const reviewedDistinct = new Map(arr(identity?.resolved_distinct_pairs).map((row) => [pairKey(text(row?.a), text(row?.b)), row]));
const aliasRemovalById = new Map();
for (const row of arr(identity?.alias_removals)) {
  const id = text(row?.id);
  if (!id) continue;
  aliasRemovalById.set(id, { ja: new Set(arr(row?.ja).map(norm)), en: new Set(arr(row?.en).map(norm)) });
}
function effectiveAliases(row, lang) {
  const raw = lang === 'ja' ? aliasesJa(row) : aliasesEn(row);
  const removed = aliasRemovalById.get(idOf(row))?.[lang] || new Set();
  return raw.filter((value) => !removed.has(norm(value)));
}

const all = [];
for (const rel of sourcePaths()) {
  const file = path.join(DATA, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing source: ${rel}`);
  for (const row of rowsFrom(readJson(file))) {
    const id = idOf(row);
    if (!id || redirects.has(id)) continue;
    all.push({ row, source: `data/${rel}` });
  }
}

const targets = rowsFrom(readJson(TARGET)).filter((row) => !redirects.has(idOf(row)));
const collisions = [];
const reviewedSignals = [];
for (const target of targets) {
  const id = idOf(target);
  const nja = norm(jaOf(target));
  const nen = norm(enOf(target));
  const tja = effectiveAliases(target, 'ja').map(norm);
  const ten = effectiveAliases(target, 'en').map(norm);
  const hits = [];
  for (const item of all) {
    const other = item.row;
    const oid = idOf(other);
    if (!oid || oid === id) continue;
    const noja = norm(jaOf(other));
    const noen = norm(enOf(other));
    const oja = effectiveAliases(other, 'ja').map(norm);
    const oen = effectiveAliases(other, 'en').map(norm);
    const reasons = [];
    if (nja && nen && nja === noja && nen === noen) reasons.push('exact_bilingual_name');
    else {
      if (nja && nja === noja) reasons.push('exact_ja_name');
      if (nen && nen === noen) reasons.push('exact_en_name');
    }
    if (stem(id) === stem(oid)) reasons.push('same_id_stem');
    if (nja && oja.includes(nja)) reasons.push('target_ja_matches_other_alias');
    if (nen && oen.includes(nen)) reasons.push('target_en_matches_other_alias');
    if (noja && tja.includes(noja)) reasons.push('other_ja_matches_target_alias');
    if (noen && ten.includes(noen)) reasons.push('other_en_matches_target_alias');
    if (!reasons.length) continue;
    const reviewed = reviewedDistinct.get(pairKey(id, oid));
    if (reviewed) {
      reviewedSignals.push({ a: id, b: oid, resolution: text(reviewed?.resolution), reasons: [...new Set(reasons)] });
      continue;
    }
    hits.push({ id: oid, type: typeOf(other), ja: jaOf(other), en: enOf(other), desc_ja: descJa(other), desc_en: descEn(other), aliases_ja: effectiveAliases(other, 'ja'), aliases_en: effectiveAliases(other, 'en'), source: item.source, reasons: [...new Set(reasons)] });
  }
  if (hits.length) collisions.push({ id, type: typeOf(target), ja: jaOf(target), en: enOf(target), desc_ja: descJa(target), desc_en: descEn(target), aliases_ja: effectiveAliases(target, 'ja'), aliases_en: effectiveAliases(target, 'en'), hits });
}
const collisionIds = new Set(collisions.map((row) => row.id));
const safe = targets.filter((row) => !collisionIds.has(idOf(row))).map((row) => ({ id: idOf(row), type: typeOf(row), ja: jaOf(row), en: enOf(row), desc_ja: descJa(row), desc_en: descEn(row) }));
const summary = { pack, active_rows: targets.length, rows_with_collision_signal: collisions.length, collision_free_rows: safe.length, reviewed_distinct_signals: reviewedSignals.length };
console.log(`CTA_PACK_COLLISION_SUMMARY=${JSON.stringify(summary)}`);
console.log(`CTA_PACK_COLLISION_FREE=${JSON.stringify(safe)}`);
console.log(`CTA_PACK_COLLISIONS=${JSON.stringify(collisions)}`);
console.log(`CTA_PACK_REVIEWED_DISTINCT=${JSON.stringify(reviewedSignals)}`);
console.log(`Construction Tools Atlas quality-${pack} collision report: PASS`);
