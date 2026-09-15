const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-011.json');
const MANIFEST = path.join(DATA, 'quality-manifest.json');

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
function aliasesJa(row) { return arr(row?.aliases?.ja || row?.aj || row?.aliases_ja).map(text).filter(Boolean); }
function aliasesEn(row) { return arr(row?.aliases?.en || row?.ae || row?.aliases_en).map(text).filter(Boolean); }
function norm(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\u3000]+/g, '').replace(/[‐‑‒–—―ー_\-・･\/()（）]/g, '').trim();
}
function stem(id) { return String(id || '').replace(/^q\d+_/, ''); }
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
function classify(targetType, hit) {
  const sameType = targetType === hit.type;
  const reasons = new Set(hit.reasons);
  if (sameType && reasons.has('exact_bilingual_name')) return 'strong_duplicate';
  if (sameType && reasons.has('same_id_stem') && (reasons.has('exact_ja_name') || reasons.has('exact_en_name') || [...reasons].some(r => r.includes('alias')))) return 'strong_duplicate';
  if (!sameType && reasons.has('same_id_stem')) return 'semantic_conflict_review';
  if (sameType && reasons.has('same_id_stem')) return 'probable_duplicate_review';
  if (sameType && (reasons.has('exact_ja_name') || reasons.has('exact_en_name')) && [...reasons].some(r => r.includes('alias'))) return 'probable_duplicate_review';
  return 'related_name_review';
}

const all = [];
for (const rel of sourcePaths()) {
  const file = path.join(DATA, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing source: ${rel}`);
  for (const row of rowsFrom(readJson(file))) all.push({ row, source: `data/${rel}` });
}

const targets = rowsFrom(readJson(TARGET));
const collisions = [];
for (const target of targets) {
  const id = idOf(target);
  const type = typeOf(target);
  const ja = jaOf(target);
  const en = enOf(target);
  const nja = norm(ja);
  const nen = norm(en);
  const tAliasesJa = aliasesJa(target).map(norm);
  const tAliasesEn = aliasesEn(target).map(norm);
  const hits = [];

  for (const item of all) {
    const other = item.row;
    const oid = idOf(other);
    if (!oid || oid === id) continue;
    const oja = jaOf(other);
    const oen = enOf(other);
    const noja = norm(oja);
    const noen = norm(oen);
    const oAliasesJa = aliasesJa(other).map(norm);
    const oAliasesEn = aliasesEn(other).map(norm);
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
    const hit = { id: oid, type: typeOf(other), ja: oja, en: oen, source: item.source, reasons: [...new Set(reasons)] };
    hit.classification = classify(type, hit);
    hits.push(hit);
  }

  if (hits.length) collisions.push({ id, type, ja, en, hits });
}

const classifications = { strong_duplicate: 0, probable_duplicate_review: 0, semantic_conflict_review: 0, related_name_review: 0 };
for (const row of collisions) {
  const rowClasses = new Set(row.hits.map(h => h.classification));
  for (const key of Object.keys(classifications)) if (rowClasses.has(key)) classifications[key] += 1;
}
const summary = {
  q011_rows: targets.length,
  rows_with_collision_signal: collisions.length,
  exact_bilingual_name: collisions.filter(x => x.hits.some(h => h.reasons.includes('exact_bilingual_name'))).length,
  same_id_stem: collisions.filter(x => x.hits.some(h => h.reasons.includes('same_id_stem'))).length,
  exact_single_language_only: collisions.filter(x => x.hits.some(h => h.reasons.includes('exact_ja_name') || h.reasons.includes('exact_en_name')) && !x.hits.some(h => h.reasons.includes('exact_bilingual_name'))).length,
  alias_signal: collisions.filter(x => x.hits.some(h => h.reasons.some(r => r.includes('alias')))).length,
  classifications
};
console.log(`CTA_Q011_COLLISION_SUMMARY=${JSON.stringify(summary)}`);
console.log(`CTA_Q011_COLLISIONS=${JSON.stringify(collisions)}`);
console.log('Construction Tools Atlas q011 canonical collision audit: PASS');
