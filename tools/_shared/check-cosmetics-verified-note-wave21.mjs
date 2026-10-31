import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const files = [
  'tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => `tools/inci-fastscan/data/ingredients-extra-${i + 1}.json`)
];
const rows = files.flatMap(file => {
  const payload = JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
  assert.ok(Array.isArray(payload), `${file} must be a dictionary array`);
  return payload;
});

const PRIOR_COUNT = 82;
const EXPECTED = Object.freeze({
  '1,2-hexanediol': {
    note: 'Solvent and skin-conditioning ingredient; COSMILE Europe also lists a fragrance-functional role for 1,2-Hexanediol.',
    url: 'https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/'
  },
  'sodium citrate': {
    note: "Buffering and chelating ingredient; COSMILE Europe lists pH control and metal-ion binding among Sodium Citrate's cosmetic functions.",
    url: 'https://cosmileeurope.eu/inci/detail/14681/sodium-citrate/'
  },
  'urea': {
    note: "Moisture-binding ingredient and natural component of skin's moisture factor; COSMILE Europe lists Urea as a humectant, buffer and skin-conditioning ingredient.",
    url: 'https://cosmileeurope.eu/inci/detail/16737/urea/'
  }
});
const AUTHORITY = 'Cosmetics Europe / COSMILE Europe';
const evidence = parser.verifiedNoteEvidence || {};
const keys = Object.keys(evidence);
assert.equal(keys.length, PRIOR_COUNT + Object.keys(EXPECTED).length, 'wave 21 must add exactly three reviewed identities');
const merged = parser.mergeDictionaryRecords(rows);
const byIdentity = new Map(merged.map(item => [parser.canonicalIdentityKey(item.en), item]));

for (const [canonical, expected] of Object.entries(EXPECTED)) {
  assert.ok(rows.some(row => parser.canonicalIdentityKey(row.en) === canonical),
    `${canonical}: maintained dictionary identity must exist`);
  const note = evidence[canonical];
  assert.ok(note, `${canonical}: verified note must exist`);
  assert.equal(note.note_short, expected.note, `${canonical}: use exactly the source-reviewed text`);
  assert.equal(note.authority, AUTHORITY);
  assert.deepEqual([...note.note_sources], [expected.url], `${canonical}: attach exactly the reviewed HTTPS source`);
  assert.match(expected.url, /^https:\/\/cosmileeurope\.eu\/inci\/detail\//);
  const runtime = byIdentity.get(canonical);
  assert.ok(runtime, `${canonical}: merged runtime identity missing`);
  assert.equal(runtime.note_verified, true, `${canonical}: runtime note must be verified`);
  assert.equal(runtime.note_short, expected.note);
  assert.ok(runtime.note_sources.includes(expected.url));
  assert.equal(runtime.note_provenance_conflict, undefined, `${canonical}: provenance conflict`);
  assert.ok(runtime.category && runtime.category !== 'general', `${canonical}: public role must be supported`);
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean), `${canonical}: maintained Japanese name required`);
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `${ambiguous}: ambiguous names cannot be verified notes`);
}
assert.equal(parser.version, '1.58.0');
console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-note-wave-21-common-label-priority',
  source_backed_note_identities: Object.keys(EXPECTED),
  prior_verified_notes: PRIOR_COUNT,
  total_verified_notes: keys.length,
  raw_dictionary_rewrites: false,
  image_processing_changed: false,
  safety_scoring_changed: false
}, null, 2));
