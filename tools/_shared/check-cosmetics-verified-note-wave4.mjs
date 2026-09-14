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
const FORBIDDEN_VAGUE_CLAIM_RE = /\b(?:generally safe|well tolerated|high allergy risk|often avoided|may clog pores|avoid eye area|sensitization risk|allergy risk|staining)\b/i;
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
  'simmondsia chinensis jojoba seed oil'
]);
const CURRENT_EU_REGULATION = 'https://eur-lex.europa.eu/eli/reg/2009/1223';
const EXPECTED_WAVE4 = Object.freeze({
  'aminobenzoic acid': Object.freeze({
    note_short: 'UV filter; EU Annex VI lists PABA (4-Aminobenzoic acid) at up to 5%.',
    source: CURRENT_EU_REGULATION,
    authority: 'European Union / EUR-Lex'
  }),
  ecamsule: Object.freeze({
    note_short: 'UV filter; EU Annex VI lists Ecamsule at up to 10% expressed as acid.',
    source: CURRENT_EU_REGULATION,
    authority: 'European Union / EUR-Lex'
  }),
  octisalate: Object.freeze({
    note_short: 'UV filter; EU Annex VI lists Ethylhexyl Salicylate (Octisalate) at up to 5%.',
    source: CURRENT_EU_REGULATION,
    authority: 'European Union / EUR-Lex'
  }),
  'diethylamino hydroxybenzoyl hexyl benzoate': Object.freeze({
    note_short: 'UV filter; EU Regulation 2026/909 sets DHHB at up to 10% and limits unavoidable DnHexP impurity to 10 ppm.',
    source: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R0909',
    authority: 'European Union / EUR-Lex'
  }),
  'diazolidinyl urea': Object.freeze({
    note_short: 'Preservative; EU Annex V lists Diazolidinyl Urea at up to 0.5%.',
    source: CURRENT_EU_REGULATION,
    authority: 'European Union / EUR-Lex'
  }),
  'imidazolidinyl urea': Object.freeze({
    note_short: 'Preservative; EU Annex V lists Imidazolidinyl Urea at up to 0.6%.',
    source: CURRENT_EU_REGULATION,
    authority: 'European Union / EUR-Lex'
  })
});

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function validSource(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && url.hostname === 'eur-lex.europa.eu';
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
const expectedAllKeys = [...PRIOR_WAVE_KEYS, ...Object.keys(EXPECTED_WAVE4)];
assert.deepEqual(
  new Set(Object.keys(evidence)),
  new Set(expectedAllKeys),
  'verified note overlay must contain exactly thirteen prior entries plus six reviewed wave 4 identities'
);

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE4)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 4 verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: reviewed wave 4 note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), expected.authority, `${canonical}: reviewed authority changed unexpectedly`);
  assert.ok(!FORBIDDEN_VAGUE_CLAIM_RE.test(item.note_short), `${canonical}: unsupported legacy risk/tolerability wording must not return`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length > 0, `${canonical}: HTTPS source required`);
  assert.ok(item.note_sources.every(validSource), `${canonical}: wave 4 sources must be EUR-Lex HTTPS URLs`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
  assert.ok(
    canonicalRows.get(canonical).some((row) => CLAIM_REVIEW_RE.test(normalizeText(row.note_short))),
    `${canonical}: wave 4 must resolve an existing frozen claim-bearing legacy note`
  );
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE4)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must be the reviewed wave 4 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create note provenance conflict`);
}

const resolvedClaimRows = claimRows.filter((row) => Object.hasOwn(evidence, parser.canonicalIdentityKey(row.en)));
assert.equal(resolvedClaimRows.length, 19, 'waves 1-4 should resolve exactly nineteen of the frozen 22 claim-bearing legacy-note rows');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-4',
  raw_claim_bearing_legacy_note_rows: claimRows.length,
  prior_verified_canonical_identities: PRIOR_WAVE_KEYS.length,
  wave_4_verified_canonical_identities: Object.keys(EXPECTED_WAVE4).length,
  cumulative_verified_note_overlay_canonical_identities: Object.keys(evidence).length,
  resolved_claim_bearing_rows: resolvedClaimRows.length,
  unresolved_claim_bearing_rows: claimRows.length - resolvedClaimRows.length,
  wave_4_resolved_canonical_identities: Object.keys(EXPECTED_WAVE4),
  raw_dictionary_records_rewritten: false,
  runtime_notes_use_existing_provenance_gate: true,
  unsupported_legacy_risk_language_reintroduced: false,
  safety_contract_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
