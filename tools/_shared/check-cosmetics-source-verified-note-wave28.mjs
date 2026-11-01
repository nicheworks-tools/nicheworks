import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json','utf8'));
const files = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const raw = files.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const byCanonical = new Map(merged.map(row=>[parser.canonicalIdentityKey(row.en),row]));
const reviewedNotes = {
  "hyaluronic acid": "https://cosmileeurope.eu/inci/detail/6550/hyaluronic-acid/",
  "zinc oxide": "https://cosmileeurope.eu/inci/detail/17131/zinc-oxide/",
  "titanium dioxide": "https://cosmileeurope.eu/inci/detail/16217/titanium-dioxide/",
  "petrolatum": "https://cosmileeurope.eu/inci/detail/11488/petrolatum/",
  "retinol": "https://cosmileeurope.eu/inci/detail/13645/retinol/",
  "ascorbic acid": "https://cosmileeurope.eu/inci/detail/1234/ascorbic-acid/",
  "cetyl alcohol": "https://cosmileeurope.eu/inci/detail/2973/cetyl-alcohol/",
  "glycolic acid": "https://cosmileeurope.eu/inci/detail/6139/glycolic-acid/",
  "polysorbate 80": "https://cosmileeurope.eu/inci/detail/12497/polysorbate-80/",
  "benzyl alcohol": "https://cosmileeurope.eu/inci/detail/1592/benzyl-alcohol/",
  "glucose": "https://cosmileeurope.eu/inci/detail/5897/glucose/",
  "methylparaben": "https://cosmileeurope.eu/inci/detail/9041/methylparaben/",
  "sorbitol": "https://cosmileeurope.eu/inci/detail/15325/sorbitol/",
  "propylene glycol": "https://cosmileeurope.eu/inci/detail/13188/propylene-glycol/",
  "maltitol": "https://cosmileeurope.eu/inci/detail/8621/maltitol/",
  "sorbic acid": "https://cosmileeurope.eu/inci/detail/15303/sorbic-acid/",
  "xylitol": "https://cosmileeurope.eu/inci/detail/17013/xylitol/",
  "sodium phosphate": "https://cosmileeurope.eu/inci/detail/15034/sodium-phosphate/",
  "mannitol": "https://cosmileeurope.eu/inci/detail/8681/mannitol/",
  "potassium citrate": "https://cosmileeurope.eu/inci/detail/12642/potassium-citrate/",
  "propylparaben": "https://cosmileeurope.eu/inci/detail/13237/propylparaben/",
  "ethylparaben": "https://cosmileeurope.eu/inci/detail/5504/ethylparaben/",
  "disodium phosphate": "https://cosmileeurope.eu/inci/detail/5003/disodium-phosphate/"
};
const originalRoleMappings = taxonomy.reviewed_mappings;

assert.equal(raw.length,725,'note-only review must not touch frozen 725 raw records');
assert.equal(merged.length,599,'note-only review must not add or drop canonical recognition identities');
assert.equal(Object.keys(reviewedNotes).length,23);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length,196,
  'verified role count must stay 196: this wave is notes only');
assert.equal(Object.keys(originalRoleMappings).length,196,
  'source taxonomy and verified role evidence must be unchanged');
assert.equal(Object.keys(parser.verifiedNoteEvidence).length,185,
  'twenty-three new ingredient-specific notes must exist');
assert.equal(parser.version,'1.65.0');

const allNotes = new Set();
for (const [canonical,source] of Object.entries(reviewedNotes)) {
  assert.ok(source.startsWith('https://cosmileeurope.eu/inci/detail/'),canonical+': source host changed');
  const official = parser.verifiedNoteEvidence[canonical];
  assert.ok(official,canonical+': source-backed note missing');
  assert.equal(official.authority,'Cosmetics Europe / COSMILE Europe',canonical+': provenance authority mismatch');
  assert.deepEqual([...official.note_sources],[source],canonical+': source entry must match exact INCI');
  assert.ok(typeof official.note_short==='string' && official.note_short.trim().length>=45,
    canonical+': ingredient-specific explanation must be substantial');
  assert.ok(!/\b(always safe|no risk|allergy[- ]free|guaranteed|FDA approved|clinically proven)\b/i.test(official.note_short),
    canonical+': must not smuggle product safety or medical efficacy promises into source description');
  assert.ok(!allNotes.has(official.note_short),canonical+': copied generic note detected');
  allNotes.add(official.note_short);
  const runtime=byCanonical.get(canonical);
  assert.ok(runtime,canonical+': existing ingredient missing');
  assert.ok(Array.isArray(runtime.jp)&&runtime.jp.some(Boolean),canonical+': maintained Japanese name missing');
  assert.equal(runtime.note_verified,true,canonical+': reviewed note flag absent');
  assert.equal(runtime.note_short,official.note_short,canonical+': note was lost or replaced by legacy raw metadata');
  assert.ok(runtime.note_sources.includes(source),canonical+': exact source must survive runtime merge');
  assert.equal(runtime.note_provenance_conflict,undefined,canonical+': ambiguity must fail closed');
}
assert.equal(parser.verifiedCategoryEvidence.bha,undefined,
  'ambiguous BHA must not be promoted into a verified role');
assert.equal(parser.verifiedNoteEvidence.bha,undefined,
  'ambiguous BHA must not acquire an ingredient-specific note');
console.log('COSMETICS_SOURCE_NOTE_WAVE28=PASS: 23 exact COSMILE evidence URLs; 196 verified roles unchanged; 185 reviewed ingredient notes across 599 canonical entries');
