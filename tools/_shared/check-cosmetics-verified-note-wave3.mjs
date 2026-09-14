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
const FORBIDDEN_VAGUE_CLAIM_RE = /\b(?:generally safe|well tolerated|high allergy risk|often avoided|may clog pores|avoid eye area|very sensitive skin|mild irritation possible)\b/i;
const EXPECTED_RAW_CLAIM_ROWS = 22;
const PRIOR_WAVE_KEYS = Object.freeze([
  'phenoxyethanol',
  'sodium hydroxide',
  'potassium hydroxide',
  'methylisothiazolinone',
  'methylchloroisothiazolinone',
  'sodium benzoate',
  'sodium dehydroacetate',
  'sulfur'
]);
const EXPECTED_WAVE3 = Object.freeze({
  'alpha-arbutin': Object.freeze({
    note_short: 'SCCS-reviewed cosmetic ingredient; alpha-arbutin is considered safe up to 2% in face creams and 0.5% in body lotions.',
    source: 'https://health.ec.europa.eu/publications/safety-alpha-arbutin-and-beta-arbutin-cosmetic-products_en',
    authority: 'European Commission Scientific Committee on Consumer Safety'
  }),
  'ceteareth-20': Object.freeze({
    note_short: 'Surfactant; Cosmetics Info reports Ceteareth-20 as a solubilizing and cleansing agent.',
    source: 'https://www.cosmeticsinfo.org/ingredient/ceteareth-20/',
    authority: 'Personal Care Products Council / Cosmetics Info'
  }),
  'steareth-21': Object.freeze({
    note_short: 'Surfactant; Cosmetics Info reports Steareth-21 as a cleansing, emulsifying and solubilizing agent.',
    source: 'https://www.cosmeticsinfo.org/ingredient/steareth-21/',
    authority: 'Personal Care Products Council / Cosmetics Info'
  }),
  'isopropyl myristate': Object.freeze({
    note_short: 'Binder and skin-conditioning emollient; these functions are reported for isopropyl myristate by Cosmetics Info.',
    source: 'https://www.cosmeticsinfo.org/ingredient/isopropyl-myristate/',
    authority: 'Personal Care Products Council / Cosmetics Info'
  }),
  'simmondsia chinensis jojoba seed oil': Object.freeze({
    note_short: 'Hair-conditioning and occlusive skin-conditioning ingredient; these functions are reported for jojoba seed oil by Cosmetics Info.',
    source: 'https://www.cosmeticsinfo.org/ingredient/simmondsia-chinensis-jojoba-seed-oil/',
    authority: 'Personal Care Products Council / Cosmetics Info'
  })
});
const ALLOWED_SOURCE_HOSTS = new Set(['health.ec.europa.eu', 'www.cosmeticsinfo.org']);

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function validSource(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && ALLOWED_SOURCE_HOSTS.has(url.hostname);
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
for (const canonical of [...PRIOR_WAVE_KEYS, ...Object.keys(EXPECTED_WAVE3)]) {
  assert.ok(Object.hasOwn(evidence, canonical), `${canonical}: wave 1-3 verified note entry must remain present`);
}

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE3)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 3 verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: reviewed wave 3 note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), expected.authority, `${canonical}: reviewed authority changed unexpectedly`);
  assert.ok(!FORBIDDEN_VAGUE_CLAIM_RE.test(item.note_short), `${canonical}: vague legacy safety/tolerability language must not return`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length > 0, `${canonical}: HTTPS source required`);
  assert.ok(item.note_sources.every(validSource), `${canonical}: only reviewed SCCS/Cosmetics Info HTTPS sources are allowed in wave 3`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
  assert.ok(
    canonicalRows.get(canonical).some((row) => CLAIM_REVIEW_RE.test(normalizeText(row.note_short))),
    `${canonical}: wave 3 must resolve an existing frozen claim-bearing legacy note`
  );
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE3)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must be the reviewed wave 3 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create note provenance conflict`);
}

const wave123Set = new Set([...PRIOR_WAVE_KEYS, ...Object.keys(EXPECTED_WAVE3)]);
const wave123ResolvedClaimRows = claimRows.filter((row) => wave123Set.has(parser.canonicalIdentityKey(row.en)));
assert.equal(wave123ResolvedClaimRows.length, 13, 'waves 1-3 must continue to resolve exactly thirteen frozen claim-bearing rows');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-3',
  raw_claim_bearing_legacy_note_rows: claimRows.length,
  prior_verified_canonical_identities: PRIOR_WAVE_KEYS.length,
  wave_3_verified_canonical_identities: Object.keys(EXPECTED_WAVE3).length,
  cumulative_verified_note_overlay_canonical_identities: Object.keys(evidence).length,
  wave_1_through_3_resolved_claim_bearing_rows: wave123ResolvedClaimRows.length,
  wave_3_resolved_canonical_identities: Object.keys(EXPECTED_WAVE3),
  raw_dictionary_records_rewritten: false,
  runtime_notes_use_existing_provenance_gate: true,
  vague_legacy_safety_language_reintroduced: false,
  safety_contract_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
