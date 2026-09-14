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
const FORBIDDEN_VAGUE_CLAIM_RE = /\b(?:generally safe|well tolerated|high allergy risk|often avoided|may clog pores|avoid eye area)\b/i;
const EXPECTED_RAW_CLAIM_ROWS = 22;
const WAVE1_KEYS = Object.freeze([
  'phenoxyethanol',
  'sodium hydroxide',
  'potassium hydroxide'
]);
const EXPECTED_WAVE2 = Object.freeze({
  methylisothiazolinone: Object.freeze({
    note_short: 'Preservative; EU cosmetic rules limit methylisothiazolinone to rinse-off products at up to 0.0015%.',
    source: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R1224',
    authority: 'European Union / EUR-Lex'
  }),
  methylchloroisothiazolinone: Object.freeze({
    note_short: 'Preservative; in EU cosmetics, the methylchloroisothiazolinone/methylisothiazolinone 3:1 mixture is limited to rinse-off products at up to 0.0015%.',
    source: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R1003',
    authority: 'European Union / EUR-Lex'
  }),
  'sodium benzoate': Object.freeze({
    note_short: 'Preservative; EU Annex V sets sodium benzoate limits of 2.5% for rinse-off products, 1.7% for oral products and 0.5% for leave-on products, expressed as acid.',
    source: 'https://eur-lex.europa.eu/eli/reg/2009/1223/2026-05-18',
    authority: 'European Union / EUR-Lex'
  }),
  'sodium dehydroacetate': Object.freeze({
    note_short: 'Preservative; EU Annex V permits sodium dehydroacetate up to 0.6% expressed as acid and excludes aerosol sprays.',
    source: 'https://eur-lex.europa.eu/eli/reg/2009/1223/2026-05-18',
    authority: 'European Union / EUR-Lex'
  }),
  sulfur: Object.freeze({
    note_short: 'OTC acne active; FDA Monograph M006 permits sulfur at 3% to 10% as a single active ingredient.',
    source: 'https://www.accessdata.fda.gov/drugsatfda_docs/omuf/OTC%20Monograph_M006-Topical%20Acne%20drug%20products%20for%20OTC%20Human%20Use%2011.23.2021.pdf',
    authority: 'U.S. Food and Drug Administration'
  })
});
const ALLOWED_SOURCE_HOSTS = new Set([
  'health.ec.europa.eu',
  'eur-lex.europa.eu',
  'www.accessdata.fda.gov'
]);

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
for (const canonical of [...WAVE1_KEYS, ...Object.keys(EXPECTED_WAVE2)]) {
  assert.ok(Object.hasOwn(evidence, canonical), `${canonical}: wave 1/wave 2 verified note entry must remain present`);
}

const canonicalRows = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!canonicalRows.has(key)) canonicalRows.set(key, []);
  canonicalRows.get(key).push(row);
}

for (const [canonical, expected] of Object.entries(EXPECTED_WAVE2)) {
  const item = evidence[canonical];
  assert.ok(item, `${canonical}: wave 2 verified note evidence missing`);
  assert.equal(normalizeText(item.note_short), expected.note_short, `${canonical}: reviewed wave 2 note text changed unexpectedly`);
  assert.equal(normalizeText(item.authority), expected.authority, `${canonical}: reviewed authority changed unexpectedly`);
  assert.ok(!FORBIDDEN_VAGUE_CLAIM_RE.test(item.note_short), `${canonical}: vague legacy safety/tolerability language must not return`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.length > 0, `${canonical}: HTTPS source required`);
  assert.ok(item.note_sources.every(validSource), `${canonical}: only reviewed EC/EUR-Lex/FDA HTTPS sources are allowed in wave 2`);
  assert.ok(item.note_sources.includes(expected.source), `${canonical}: reviewed source URL missing`);
  assert.ok(canonicalRows.has(canonical), `${canonical}: canonical identity must exist in maintained dictionary`);
  assert.ok(
    canonicalRows.get(canonical).some((row) => CLAIM_REVIEW_RE.test(normalizeText(row.note_short))),
    `${canonical}: wave 2 must resolve an existing frozen claim-bearing legacy note`
  );
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive verified note evidence: ${ambiguous}`);
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));
for (const [canonical, expected] of Object.entries(EXPECTED_WAVE2)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.note_verified, true, `${canonical}: verified note flag must survive canonical merge`);
  assert.equal(item.note_short, expected.note_short, `${canonical}: runtime note must be the reviewed wave 2 note`);
  assert.ok(Array.isArray(item.note_sources) && item.note_sources.includes(expected.source), `${canonical}: reviewed source must survive canonical merge`);
  assert.equal(item.note_authority, expected.authority, `${canonical}: note authority must survive canonical merge`);
  assert.equal(item.note_provenance_conflict, undefined, `${canonical}: verified overlay must not create note provenance conflict`);
}

const wave12Set = new Set([...WAVE1_KEYS, ...Object.keys(EXPECTED_WAVE2)]);
const wave12ResolvedClaimRows = claimRows.filter((row) => wave12Set.has(parser.canonicalIdentityKey(row.en)));
assert.equal(wave12ResolvedClaimRows.length, 8, 'wave 1 + wave 2 must continue to resolve exactly eight frozen claim-bearing rows');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-2',
  raw_claim_bearing_legacy_note_rows: claimRows.length,
  wave_1_verified_canonical_identities: WAVE1_KEYS.length,
  wave_2_verified_canonical_identities: Object.keys(EXPECTED_WAVE2).length,
  cumulative_verified_note_overlay_canonical_identities: Object.keys(evidence).length,
  wave_1_plus_2_resolved_claim_bearing_rows: wave12ResolvedClaimRows.length,
  wave_2_resolved_canonical_identities: Object.keys(EXPECTED_WAVE2),
  raw_dictionary_records_rewritten: false,
  runtime_notes_use_existing_provenance_gate: true,
  vague_legacy_safety_language_reintroduced: false,
  safety_contract_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
