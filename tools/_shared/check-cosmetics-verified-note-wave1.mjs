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
const EXPECTED_RAW_CLAIM_ROWS = 22;
const EXPECTED_WAVE1 = Object.freeze({
  phenoxyethanol: Object.freeze({
    note_short: 'Preservative; SCCS considers it safe for use up to 1.0% in cosmetic products.',
    source: 'https://health.ec.europa.eu/publications/phenoxyethanol_en'
  }),
  limonene: Object.freeze({
    note_short: 'Fragrance ingredient; oxidised limonene is an established contact allergen in the SCCS opinion.',
    source: 'https://health.ec.europa.eu/document/download/392a791e-d831-4bb0-a449-7031bffcd6a4_en'
  }),
  linalool: Object.freeze({
    note_short: 'Fragrance ingredient; oxidised linalool is an established contact allergen in the SCCS opinion.',
    source: 'https://health.ec.europa.eu/document/download/392a791e-d831-4bb0-a449-7031bffcd6a4_en'
  })
});
const EXPECTED_AUTHORITY = 'European Commission Scientific Committee on Consumer Safety';
const ALLOWED_SOURCE_HOSTS = new Set(['health.ec.europa.eu']);

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
assert.equal(
  claimRows.length,
  EXPECTED_RAW_CLAIM_ROWS,
  'raw claim-bearing legacy-note baseline must remain auditable at 22 rows'
);

const evidence = parser.verifiedNoteEvidence || {};
assert.deepEqual(
  new Set(Object.keys(evidence)),
  new Set(Object.keys(EXPECTED_WAVE1)),
  'verified note wave 1 must remain exactly Phenoxyethanol, Limonene and Linalool'
);

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE1)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: verified note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), EXPECTED_AUTHORITY, `${canonical}: authority must remain SCCS`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length > 0, `${canonical}: HTTPS source required`);
  assert.ok(item.note_sources.every(validSource), `${canonical}: only reviewed SCCS HTTPS sources are allowed in wave 1`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
  assert.ok(
    canonicalRows.get(canonical).some((row) => CLAIM_REVIEW_RE.test(normalizeText(row.note_short))),
    `${canonical}: wave 1 must resolve an existing claim-bearing legacy note rather than invent a new note surface`
  );
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE1)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must be the reviewed note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, EXPECTED_AUTHORITY, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create note provenance conflict`);
}

const resolvedClaimRows = claimRows.filter((row) => Object.hasOwn(evidence, parser.canonicalIdentityKey(row.en)));
assert.equal(resolvedClaimRows.length, 3, 'wave 1 should resolve exactly three of the frozen 22 claim-bearing legacy-note rows');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-1',
  raw_claim_bearing_legacy_note_rows: claimRows.length,
  verified_note_overlay_canonical_identities: Object.keys(evidence).length,
  resolved_claim_bearing_rows: resolvedClaimRows.length,
  unresolved_claim_bearing_rows: claimRows.length - resolvedClaimRows.length,
  raw_dictionary_records_rewritten: false,
  runtime_notes_use_existing_provenance_gate: true,
  safety_contract_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
