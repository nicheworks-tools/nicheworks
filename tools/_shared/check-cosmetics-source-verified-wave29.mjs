import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json', 'utf8'));
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const raw=paths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const merged=parser.mergeDictionaryRecords(raw);
const byCanonical=new Map(merged.map(record=>[parser.canonicalIdentityKey(record.en),record]));
const expected=Object.freeze({
  "honey extract": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "url": "https://cosmileeurope.eu/inci/detail/22039/honey-extract/",
    "note": "Honey Extract retains moisture in cosmetic formulations; COSMILE Europe also lists flavouring and skin-conditioning functions."
  },
  "royal jelly extract": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "url": "https://cosmileeurope.eu/inci/detail/13866/royal-jelly-extract/",
    "note": "Royal Jelly Extract is used to condition skin."
  },
  "propolis extract": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "url": "https://cosmileeurope.eu/inci/detail/13177/propolis-extract/",
    "note": "Propolis Extract is used to condition skin."
  },
  "sodium stearate": {
    "category": "cleanser",
    "sourceFunction": "cleansing",
    "url": "https://cosmileeurope.eu/inci/detail/15088/sodium-stearate/",
    "note": "Sodium Stearate is a cleansing ingredient; COSMILE Europe also lists emulsifying and viscosity-controlling functions."
  },
  "potassium laurate": {
    "category": "cleanser",
    "sourceFunction": "surfactant - cleansing",
    "url": "https://cosmileeurope.eu/inci/detail/12701/potassium-laurate/",
    "note": "Potassium Laurate is a cleansing surfactant; COSMILE Europe also lists an emulsifying function."
  },
  "sea salt": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "url": "https://cosmileeurope.eu/inci/detail/22800/sea-salt/",
    "note": "Sea Salt helps hold moisture in cosmetic products; COSMILE Europe also lists abrasive and skin-conditioning functions."
  },
  "camphor": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/2509/camphor/",
    "note": "Camphor has a fragrance function; COSMILE Europe also lists denaturant and plasticiser functions."
  },
  "hydrochloric acid": {
    "category": "buffer",
    "sourceFunction": "buffering",
    "url": "https://cosmileeurope.eu/inci/detail/6563/hydrochloric-acid/",
    "note": "Hydrochloric Acid is used to help control the pH of cosmetic formulations."
  },
  "eucalyptus globulus leaf oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/5516/eucalyptus-globulus-leaf-oil/",
    "note": "Eucalyptus Globulus Leaf Oil provides fragrance; COSMILE Europe also lists skin conditioning."
  },
  "citrus aurantium dulcis orange peel oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/21738/citrus-aurantium-dulcis-peel-oil/",
    "note": "Orange peel oil is used for fragrance; COSMILE Europe also lists a skin-conditioning function for Citrus Aurantium Dulcis Peel Oil."
  },
  "citrus limon lemon peel oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/18168/citrus-limon-peel-oil/",
    "note": "Lemon peel oil is used for fragrance; COSMILE Europe also lists skin conditioning for Citrus Limon Peel Oil."
  },
  "mentha piperita peppermint oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/18166/mentha-piperita-oil/",
    "note": "Peppermint Oil is used for fragrance; COSMILE Europe also lists refreshing and tonic functions."
  },
  "evernia prunastri extract": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/19229/evernia-prunastri-extract/",
    "note": "Evernia Prunastri (oakmoss) Extract is a fragrance ingredient."
  },
  "evernia furfuracea extract": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "url": "https://cosmileeurope.eu/inci/detail/19227/evernia-furfuracea-extract/",
    "note": "Evernia Furfuracea (tree moss) Extract is a fragrance ingredient."
  }
});
const AUTHORITY='Cosmetics Europe / COSMILE Europe';

assert.equal(raw.length,725,'source-backed overlays must preserve frozen 725-row recognition data');
assert.equal(merged.length,599,'source-backed overlays must preserve the 599 canonical identities');
assert.equal(Object.keys(expected).length,14);
assert.equal(Object.keys(parser.verifiedCategoryEvidence).length,174);
assert.equal(Object.keys(parser.verifiedNoteEvidence).length,140);
assert.equal(Object.keys(taxonomy.reviewed_mappings).length,174);
assert.equal(parser.version,'1.62.0');
for(const [canonical,e] of Object.entries(expected)) {
  const category=parser.verifiedCategoryEvidence[canonical];
  const note=parser.verifiedNoteEvidence[canonical];
  const mapping=taxonomy.reviewed_mappings[canonical];
  const runtime=byCanonical.get(canonical);
  assert.ok(category,canonical+': missing verified category');
  assert.equal(category.category,e.category);
  assert.deepEqual([...category.sources],[e.url]);
  assert.equal(category.authority,AUTHORITY);
  assert.ok(mapping?.runtime_verified,canonical+': source mapping must be reviewed');
  assert.equal(mapping.category,e.category);
  assert.deepEqual(mapping.source_functions,[e.sourceFunction]);
  assert.deepEqual(mapping.sources,[e.url]);
  assert.equal(mapping.authority,AUTHORITY);
  assert.ok(note,canonical+': missing source-verified note');
  assert.equal(note.note_short,e.note);
  assert.deepEqual([...note.note_sources],[e.url]);
  assert.equal(note.authority,AUTHORITY);
  assert.ok(runtime,canonical+': runtime identity absent');
  assert.equal(runtime.category,e.category);
  assert.equal(runtime.category_verified,true);
  assert.equal(runtime.note_verified,true);
  assert.equal(runtime.note_short,e.note);
  assert.ok(runtime.note_sources.includes(e.url));
  assert.ok(Array.isArray(runtime.jp) && runtime.jp.some(Boolean));
  assert.equal(runtime.note_provenance_conflict,undefined);
}
for(const ambiguous of parser.ambiguousExactKeys||[]) {
  assert.equal(parser.verifiedCategoryEvidence[ambiguous],undefined,ambiguous+': ambiguous identity must fail closed');
  assert.equal(parser.verifiedNoteEvidence[ambiguous],undefined,ambiguous+': ambiguous identity must not gain a note');
}
console.log('COSMETICS_VERIFIED_WAVE29=PASS: 14 roles and notes with exact official URLs; 174 category and 140 verified note identities');
