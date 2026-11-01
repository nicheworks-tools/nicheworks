import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json', 'utf8'));
const dataPaths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length: 8}, (_,i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i+1) + '.json')];
const raw = dataPaths.flatMap(path=>JSON.parse(fs.readFileSync(path,'utf8')));
const merged = parser.mergeDictionaryRecords(raw);
const byCanonical = new Map(merged.map(item=>[parser.canonicalIdentityKey(item.en),item]));
const noteSources = Object.freeze({
  "zinc oxide": "https://cosmileeurope.eu/inci/detail/17131/zinc-oxide/",
  "titanium dioxide": "https://cosmileeurope.eu/inci/detail/16217/titanium-dioxide/",
  "retinol": "https://cosmileeurope.eu/inci/detail/13645/retinol/",
  "ascorbic acid": "https://cosmileeurope.eu/inci/detail/1234/ascorbic-acid/",
  "benzyl alcohol": "https://cosmileeurope.eu/inci/detail/1592/benzyl-alcohol/",
  "glucose": "https://cosmileeurope.eu/inci/detail/5897/glucose/",
  "methylparaben": "https://cosmileeurope.eu/inci/detail/9041/methylparaben/",
  "sorbitol": "https://cosmileeurope.eu/inci/detail/15325/sorbitol/",
  "maltitol": "https://cosmileeurope.eu/inci/detail/8621/maltitol/",
  "sorbic acid": "https://cosmileeurope.eu/inci/detail/15303/sorbic-acid/",
  "xylitol": "https://cosmileeurope.eu/inci/detail/17013/xylitol/",
  "sodium phosphate": "https://cosmileeurope.eu/inci/detail/15034/sodium-phosphate/",
  "mannitol": "https://cosmileeurope.eu/inci/detail/8681/mannitol/",
  "potassium citrate": "https://cosmileeurope.eu/inci/detail/12642/potassium-citrate/",
  "propylparaben": "https://cosmileeurope.eu/inci/detail/13237/propylparaben/",
  "ethylparaben": "https://cosmileeurope.eu/inci/detail/5504/ethylparaben/",
  "disodium phosphate": "https://cosmileeurope.eu/inci/detail/5003/disodium-phosphate/",
  "sodium acetylated hyaluronate": "https://cosmileeurope.eu/inci/detail/14518/sodium-acetylated-hyaluronate/",
  "hydroxyethyl urea": "https://cosmileeurope.eu/inci/detail/7106/hydroxyethyl-urea/",
  "butylparaben": "https://cosmileeurope.eu/inci/detail/2044/butylparaben/"
});

assert.equal(raw.length, 725, 'no raw dictionary rewrite');
assert.equal(merged.length, 599, 'no new or removed canonical ingredient');
assert.equal(Object.keys(noteSources).length, 20, 'the exact twenty reviewed identities');
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length, 196, 'note-only wave cannot promote categories');
assert.equal(Object.keys(taxonomy.reviewed_mappings).length, 196, 'authoritative category taxonomy unchanged');
assert.ok(Object.keys(parser.verifiedNoteEvidence).length >= 222, 'wave30 cumulative source-note floor must remain');
assert.equal(parser.version, '1.67.0', 'note-wave30 public shared parser version');
const uniqueNotes = new Set();
for (const [canonical, exactUrl] of Object.entries(noteSources)) {
  const evidence = parser.verifiedNoteEvidence[canonical];
  assert.ok(evidence,canonical + ': independently source-verified note missing');
  assert.equal(evidence.authority, 'Cosmetics Europe / COSMILE Europe');
  assert.deepEqual([...evidence.note_sources],[exactUrl],canonical+': source URL must be exact per-ingredient COSMILE entry');
  assert.ok(typeof evidence.note_short==='string' && evidence.note_short.length > 35,canonical+': note too short to be specific');
  assert.ok(!uniqueNotes.has(evidence.note_short), canonical+': duplicate generic text is disallowed');
  uniqueNotes.add(evidence.note_short);
  assert.ok(!/\b(always safe|no risk|allergy[- ]free|guaranteed|FDA approved|clinically proven)\b/i.test(evidence.note_short),
    canonical+': unsupported product-safety or medical guarantee');
  const runtime = byCanonical.get(canonical);
  assert.ok(runtime,canonical+': missing runtime ingredient');
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean),canonical+': Japanese ingredient name missing');
  assert.equal(runtime.note_verified,true,canonical+': evidence must survive canonical merging');
  assert.equal(runtime.note_short,evidence.note_short,canonical+': unreviewed raw note must not override verified note');
  assert.ok(runtime.note_sources.includes(exactUrl),canonical+': evidence URL not carried to runtime');
  assert.equal(runtime.note_provenance_conflict,undefined,canonical+': conflicting note must fail closed');
}
assert.equal(parser.verifiedCategoryEvidence.bha,undefined,
  'ambiguous BHA must remain incomplete');
assert.equal(parser.verifiedNoteEvidence.bha,undefined,
  'ambiguous BHA must not be assigned an ingredient note');
console.log('COSMETICS_NOTE_WAVE30=PASS: 20 unique source-backed notes, at least 222 strong reviewed identities, 196 verified roles unchanged, 599 canonical identities unchanged');
