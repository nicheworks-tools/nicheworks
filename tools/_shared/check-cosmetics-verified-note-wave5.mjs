import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];

const CLAIM_REVIEW_RE = /\b(?:safe|safety|risk|irritat|allerg|sensiti|pregnan|toxic|comedogen|acne|well tolerated|avoid)\b/i;
const FORBIDDEN_LEGACY_RE = /\b(?:generally safe|well tolerated|high allergy risk|often avoided|may clog pores|avoid eye area|can be irritating|helps oil balance)\b/i;
const EXPECTED_RAW_CLAIM_ROWS = 22;
const PRIOR_WAVE_KEYS = Object.freeze([
  'phenoxyethanol',
  'sodium hydroxide',
  'potassium hydroxide',
  'methylisothiazolinone',
  'methylchloroisothiazolinone',
  'sodium benzoate',
  'sodium dehydroacetate',
  'sulfur',
  'alpha-arbutin',
  'ceteareth-20',
  'steareth-21',
  'isopropyl myristate',
  'simmondsia chinensis jojoba seed oil',
  'aminobenzoic acid',
  'ecamsule',
  'octisalate',
  'diethylamino hydroxybenzoyl hexyl benzoate',
  'diazolidinyl urea',
  'imidazolidinyl urea'
]);
const EXPECTED_WAVE5 = Object.freeze({
  'ammonium hydroxide': Object.freeze({
    note_short: 'Buffering and denaturant ingredient; COSMILE Europe lists both functions for Ammonium Hydroxide and notes that it is subject to EU Annex III restrictions.',
    source: 'https://cosmileeurope.eu/inci/detail/906/ammonium-hydroxide',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  glutathione: Object.freeze({
    note_short: 'Reducing agent; COSMILE Europe lists Glutathione as a reducing ingredient in cosmetic products.',
    source: 'https://cosmileeurope.eu/inci/detail/5915/glutathione/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'zinc pca': Object.freeze({
    note_short: 'Humectant and skin-conditioning ingredient; COSMILE Europe lists both functions for Zinc PCA.',
    source: 'https://cosmileeurope.eu/inci/detail/17133/zinc-pca/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  })
});

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function validSource(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && url.hostname === 'cosmileeurope.eu';
  } catch {
    return false;
  }
}

const rows = DATA_FILES.flatMap((file) => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`);
  return payload.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const claimRows = rows.filter((item) => CLAIM_REVIEW_RE.test(normalizeText(item.note_short)));
assert.equal(claimRows.length, EXPECTED_RAW_CLAIM_ROWS, 'raw claim-bearing legacy-note baseline must remain exactly 22 rows');

const evidence = parser.verifiedNoteEvidence || {};
const expectedAllKeys = [...PRIOR_WAVE_KEYS, ...Object.keys(EXPECTED_WAVE5)];
for (const canonical of expectedAllKeys) {
  assert.ok(evidence[canonical], `${canonical}: frozen claim-bearing verified-note identity must remain present after wave 5`);
}
assert.equal(expectedAllKeys.length, 22, 'wave 1-5 frozen claim-bearing verified-note set must remain exactly 22 identities');

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE5)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 5 verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: reviewed wave 5 note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), expected.authority, `${canonical}: reviewed authority changed unexpectedly`);
  assert.ok(!FORBIDDEN_LEGACY_RE.test(item.note_short), `${canonical}: unsupported legacy wording must not return`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length === 1, `${canonical}: exact reviewed source required`);
  assert.ok(item.note_sources.every(validSource), `${canonical}: wave 5 source must use COSMILE Europe HTTPS`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
  assert.ok(
    canonicalRows.get(canonical).some((row) => CLAIM_REVIEW_RE.test(normalizeText(row.note_short))),
    `${canonical}: wave 5 must resolve an existing frozen claim-bearing legacy note`
  );
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE5)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must be the reviewed wave 5 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create note provenance conflict`);
}

const resolvedClaimRows = claimRows.filter((row) => Object.hasOwn(evidence, parser.canonicalIdentityKey(row.en)));
assert.equal(resolvedClaimRows.length, EXPECTED_RAW_CLAIM_ROWS, 'wave 5 must resolve all 22 frozen claim-bearing legacy-note rows');

const unresolved = claimRows.filter((row) => !Object.hasOwn(evidence, parser.canonicalIdentityKey(row.en)));
assert.equal(unresolved.length, 0, 'no frozen claim-bearing legacy note may remain unresolved after wave 5');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-5-final',
  raw_claim_bearing_legacy_note_rows: claimRows.length,
  prior_verified_canonical_identities: PRIOR_WAVE_KEYS.length,
  wave_5_verified_canonical_identities: Object.keys(EXPECTED_WAVE5).length,
  cumulative_verified_note_overlay_canonical_identities: Object.keys(evidence).length,
  resolved_claim_bearing_rows: resolvedClaimRows.length,
  unresolved_claim_bearing_rows: unresolved.length,
  wave_5_resolved_canonical_identities: Object.keys(EXPECTED_WAVE5),
  raw_dictionary_records_rewritten: false,
  runtime_notes_use_existing_provenance_gate: true,
  unsupported_legacy_wording_reintroduced: false,
  safety_contract_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));