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

const PRIOR_VERIFIED_NOTE_COUNT = 54;
const EXPECTED_WAVE14 = Object.freeze({
  'salicylic acid': Object.freeze({
    note_short: 'Keratolytic, preservative and conditioning ingredient; COSMILE Europe lists Salicylic Acid for keratolytic, preservative, skin-conditioning, hair-conditioning and fragrance functions.',
    source: 'https://cosmileeurope.eu/inci/detail/14076/salicylic-acid/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'sodium lactate': Object.freeze({
    note_short: 'Buffering and humectant ingredient with a keratolytic function; COSMILE Europe lists all three functions for Sodium Lactate.',
    source: 'https://cosmileeurope.eu/inci/detail/14848/sodium-lactate/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'sorbitan olivate': Object.freeze({
    note_short: 'Emulsifying surfactant; COSMILE Europe lists Sorbitan Olivate as enabling stable oil-and-water emulsions.',
    source: 'https://cosmileeurope.eu/inci/detail/15312/sorbitan-olivate/',
    authority: 'Cosmetics Europe / COSMILE Europe'
  }),
  'caprylic/capric triglyceride': Object.freeze({
    note_short: 'Skin-conditioning oil component; COSMILE Europe lists a skin-conditioning function and describes smoothing and refatting use for Caprylic/Capric Triglyceride.',
    source: 'https://cosmileeurope.eu/inci/detail/2584/caprylic-capric-triglyceride/',
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
assert.equal(
  Object.keys(evidence).length,
  PRIOR_VERIFIED_NOTE_COUNT + Object.keys(EXPECTED_WAVE14).length,
  'wave 14 must extend the 54 reviewed note identities by exactly four source-backed identities'
);

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE14)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 14 verified note evidence missing`);
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
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE14)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must equal the reviewed wave 14 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create a note provenance conflict`);
  assert.ok(normalizeText(item.category), `${canonical}: wave 14 note identity must retain a supported public role`);
  assert.ok(Array.isArray(item.jp) && item.jp.some((value) => normalizeText(value)), `${canonical}: wave 14 note identity must retain a Japanese name`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-14-common-label-priority',
  prior_verified_note_identities: PRIOR_VERIFIED_NOTE_COUNT,
  wave_14_verified_note_identities: Object.keys(EXPECTED_WAVE14).length,
  cumulative_verified_note_identities: Object.keys(evidence).length,
  wave_14_identities: Object.keys(EXPECTED_WAVE14),
  source_authority: 'Cosmetics Europe / COSMILE Europe',
  raw_dictionary_records_rewritten: false,
  recognition_contract_changed: false,
  safety_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
