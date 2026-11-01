import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const paths = [
  'tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')
];
const raw=paths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const runtime=parser.mergeDictionaryRecords(raw);
const byCanonical=new Map(runtime.map(row=>[parser.canonicalIdentityKey(row.en),row]));
const expected=Object.freeze({
  "dipropylene glycol": {
    "url": "https://cosmileeurope.eu/inci/detail/4871/dipropylene-glycol/",
    "note": "Dipropylene Glycol serves as a solvent and viscosity-control ingredient; COSMILE Europe also lists fragrance-functional use."
  },
  "propylene glycol": {
    "url": "https://cosmileeurope.eu/inci/detail/13188/propylene-glycol/",
    "note": "Propylene Glycol retains moisture and can dissolve other ingredients; COSMILE Europe also lists skin conditioning and viscosity control."
  },
  "tocopheryl acetate": {
    "url": "https://cosmileeurope.eu/inci/detail/16237/tocopheryl-acetate/",
    "note": "Tocopheryl Acetate is a vitamin E derivative listed for antioxidant and skin-conditioning functions in cosmetics."
  },
  "trehalose": {
    "url": "https://cosmileeurope.eu/inci/detail/16284/trehalose/",
    "note": "Trehalose is a moisture-retaining ingredient; COSMILE Europe also lists a moisturising function."
  },
  "sodium lauryl sulfate": {
    "url": "https://cosmileeurope.eu/inci/detail/14906/sodium-lauryl-sulfate/",
    "note": "Sodium Lauryl Sulfate is a cleansing surfactant that also supports foam formation."
  },
  "sodium laureth sulfate": {
    "url": "https://cosmileeurope.eu/inci/detail/14857/sodium-laureth-sulfate/",
    "note": "Sodium Laureth Sulfate is used for cleansing and foam formation; COSMILE Europe also lists emulsifying action."
  },
  "decyl glucoside": {
    "url": "https://cosmileeurope.eu/inci/detail/4177/decyl-glucoside/",
    "note": "Decyl Glucoside is a cleansing surfactant; COSMILE Europe also lists an emulsion-stabilising function."
  },
  "lauryl glucoside": {
    "url": "https://cosmileeurope.eu/inci/detail/8133/lauryl-glucoside/",
    "note": "Lauryl Glucoside cleanses skin or hair and acts as a cleansing surfactant."
  },
  "polysorbate 80": {
    "url": "https://cosmileeurope.eu/inci/detail/12497/polysorbate-80/",
    "note": "Polysorbate 80 helps emulsify oil and water; COSMILE Europe also lists a cleansing-surfactant function."
  },
  "cetyl alcohol": {
    "url": "https://cosmileeurope.eu/inci/detail/2973/cetyl-alcohol/",
    "note": "Cetyl Alcohol softens skin as an emollient and also has emulsifying and viscosity-controlling functions."
  },
  "petrolatum": {
    "url": "https://cosmileeurope.eu/inci/detail/11488/petrolatum/",
    "note": "Petrolatum is used to soften and condition skin; its hydrocarbon composition also supports film-like, occlusive formulations."
  },
  "mineral oil": {
    "url": "https://cosmileeurope.eu/inci/detail/31712/mineral-oil/",
    "note": "Mineral Oil functions as an emollient and occlusive skin-conditioning ingredient; COSMILE Europe also lists hair conditioning."
  },
  "glycolic acid": {
    "url": "https://cosmileeurope.eu/inci/detail/6139/glycolic-acid/",
    "note": "Glycolic Acid is listed for buffering a formulation's pH; COSMILE Europe also describes its use in peeling cosmetics."
  },
  "avobenzone": {
    "url": "https://cosmileeurope.eu/inci/detail/2000/butyl-methoxydibenzoylmethane/",
    "note": "Avobenzone (Butyl Methoxydibenzoylmethane) is used as a UV filter, particularly for UVA protection."
  },
  "sodium cocoyl isethionate": {
    "url": "https://cosmileeurope.eu/inci/detail/14723/sodium-cocoyl-isethionate/",
    "note": "Sodium Cocoyl Isethionate is used for cleansing and is also listed for hair conditioning."
  },
  "sodium cocoyl glutamate": {
    "url": "https://cosmileeurope.eu/inci/detail/14710/sodium-cocoyl-glutamate/",
    "note": "Sodium Cocoyl Glutamate is a cleansing surfactant used to clean skin or hair."
  },
  "sodium coco-sulfate": {
    "url": "https://cosmileeurope.eu/inci/detail/14690/sodium-coco-sulfate/",
    "note": "Sodium Coco-Sulfate is a surfactant used for cleansing skin or hair."
  },
  "isopropyl palmitate": {
    "url": "https://cosmileeurope.eu/inci/detail/7514/isopropyl-palmitate/",
    "note": "Isopropyl Palmitate is a skin-softening emollient; COSMILE Europe also lists binding of powdered products."
  },
  "sodium lauroyl glutamate": {
    "url": "https://cosmileeurope.eu/inci/detail/14885/sodium-lauroyl-glutamate/",
    "note": "Sodium Lauroyl Glutamate is a cleansing surfactant for skin or hair."
  }
});
const authority='Cosmetics Europe / COSMILE Europe';
assert.equal(raw.length,725,'note-only wave may not rewrite raw dictionary records');
assert.equal(runtime.length,599,'note-only wave may not change canonical recognition');
assert.equal(Object.keys(expected).length,19);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length,196,'verified categories must remain unchanged');
assert.equal(Object.keys(parser.verifiedNoteEvidence).length,181,'nineteen new source-backed ingredient notes');
assert.equal(parser.version,'1.65.0');
for(const [key,want] of Object.entries(expected)) {
  const note=parser.verifiedNoteEvidence[key];
  const row=byCanonical.get(key);
  assert.ok(note,key+': ingredient-specific evidence missing');
  assert.equal(note.note_short,want.note,key+': source-reviewed text changed');
  assert.deepEqual([...note.note_sources],[want.url],key+': wrong ingredient evidence URL');
  assert.equal(note.authority,authority);
  assert.ok(row,key+': merged runtime ingredient absent');
  assert.equal(row.note_verified,true,key+': note provenance not present at runtime');
  assert.equal(row.note_short,want.note,key+': merged note differs from reviewed evidence');
  assert.ok(row.note_sources.includes(want.url),key+': source link lost during merge');
  assert.equal(row.note_provenance_conflict,undefined);
  assert.ok(Array.isArray(row.jp) && row.jp.some(Boolean),key+': maintained Japanese name required');
  assert.ok(row.category && row.category!=='general',key+': maintain supported primary role');
}
for(const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(parser.verifiedNoteEvidence[ambiguous],undefined,
    ambiguous+': ambiguous exact token must not receive a note');
}
console.log('COSMETICS_NOTE_WAVE28=PASS: 19 exact COSMILE source-backed notes, 181 strong notes, 196 unchanged reviewed roles, 599 unchanged identities');
