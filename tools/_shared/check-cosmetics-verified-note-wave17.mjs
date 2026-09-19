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

const PRIOR_VERIFIED_NOTE_COUNT = 66;
const EXPECTED_WAVE17 = Object.freeze({
  pca: Object.freeze({
    note_short: 'Humectant and moisturising ingredient; COSMILE Europe lists both functions for PCA.',
    source: 'https://cosmileeurope.eu/inci/detail/10309/pca/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  serine: Object.freeze({
    note_short: 'Amino acid used for skin and hair conditioning; COSMILE Europe also lists antistatic and fragrance functions for Serine.',
    source: 'https://cosmileeurope.eu/inci/detail/14316/serine/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'sodium methyl cocoyl taurate': Object.freeze({
    note_short: 'Cleansing surfactant; COSMILE Europe lists Sodium Methyl Cocoyl Taurate as a surfactant used to clean skin, hair or teeth.',
    source: 'https://cosmileeurope.eu/inci/detail/14933/sodium-methyl-cocoyl-taurate/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'tetrasodium edta': Object.freeze({
    note_short: 'Chelating ingredient; COSMILE Europe lists Tetrasodium EDTA as binding metal ions that could affect product stability or appearance, with a perfume-oil excipient function.',
    source: 'https://cosmileeurope.eu/inci/detail/16076/tetrasodium-edta/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  })
});

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function validCosmileSource(value) {
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
  return payload;
});

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

const evidence = parser.verifiedNoteEvidence || {};
assert.ok(
  Object.keys(evidence).length >= PRIOR_VERIFIED_NOTE_COUNT + Object.keys(EXPECTED_WAVE17).length,
  'wave 17 reviewed identities must remain present as later verified-note waves extend the overlay'
);

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE17)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 17 verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: reviewed note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), expected.authority, `${canonical}: reviewed authority changed unexpectedly`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length === 1, `${canonical}: exactly one reviewed source is required`);
  assert.ok(item.note_sources.every(validCosmileSource), `${canonical}: source must use COSMILE Europe HTTPS`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE17)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must equal the reviewed wave 17 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create a note provenance conflict`);
  assert.ok(normalizeText(item.category), `${canonical}: wave 17 note identity must retain a supported public role`);
  assert.ok(Array.isArray(item.jp) && item.jp.some((value) => normalizeText(value)), `${canonical}: wave 17 note identity must retain a Japanese name`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-17-common-label-priority',
  prior_verified_note_identities: PRIOR_VERIFIED_NOTE_COUNT,
  wave_17_verified_note_identities: Object.keys(EXPECTED_WAVE17).length,
  cumulative_verified_note_identities: Object.keys(evidence).length,
  wave_17_identities: Object.keys(EXPECTED_WAVE17),
  source_authority: 'Cosmetics Europe / COSMILE Europe',
  raw_dictionary_records_rewritten: false,
  recognition_contract_changed: false,
  safety_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
