import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const parser=require('./cosmetic-ingredient-parser.js');
const taxonomy=JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json','utf8'));
const files=['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const raw=files.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const merged=parser.mergeDictionaryRecords(raw);
const byCanonical=new Map(merged.map(item=>[parser.canonicalIdentityKey(item.en),item]));
const expected=Object.freeze({
  "dioxybenzone": {
    "category": "uv filter",
    "sourceFunction": "uv filter",
    "source": "https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun",
    "note": "Dioxybenzone is listed by the FDA as a sunscreen active ingredient; this identifies its UV-filtering purpose, not a safety or approval determination.",
    "authority": "U.S. Food and Drug Administration (FDA)"
  },
  "ensulizole": {
    "category": "uv filter",
    "sourceFunction": "uv filter",
    "source": "https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun",
    "note": "Ensulizole is listed by the FDA as a sunscreen active ingredient used for UV protection; the listing alone does not establish product safety.",
    "authority": "U.S. Food and Drug Administration (FDA)"
  },
  "meradimate": {
    "category": "uv filter",
    "sourceFunction": "uv filter",
    "source": "https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun",
    "note": "Meradimate is listed by the FDA as a sunscreen active ingredient for UV protection; this is a function description, not a product safety assessment.",
    "authority": "U.S. Food and Drug Administration (FDA)"
  },
  "3-o-ethyl ascorbic acid": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/25166/3-o-ethyl-ascorbic-acid/",
    "note": "3-O-Ethyl Ascorbic Acid is listed for skin-conditioning use in cosmetics.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "trametes versicolor extract": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/16277/trametes-versicolor-extract/",
    "note": "Trametes Versicolor Extract is listed as a hair-conditioning ingredient in cosmetics.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "madecassic acid": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/8503/madecassic-acid/",
    "note": "Madecassic Acid is listed for skin-conditioning use in cosmetics.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "asiatic acid": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/1251/asiatic-acid/",
    "note": "Asiatic Acid is used for skin conditioning; COSMILE Europe also lists light-stabilizing properties.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "anisyl alcohol": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/19193/anise-alcohol/",
    "note": "Anisyl Alcohol (also called Anise Alcohol) is used to impart fragrance to cosmetic products.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "isoamyl salicylate": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/26150/isoamyl-salicylate/",
    "note": "Isoamyl Salicylate is used as a fragrance ingredient in cosmetics.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "lavandula angustifolia lavender oil": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/8190/lavandula-angustifolia-oil/",
    "note": "Lavandula Angustifolia (Lavender) Oil is used for fragrance; COSMILE Europe also lists a tonic function.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "copernicia cerifera carnauba wax": {
    "category": "film former",
    "sourceFunction": "film forming",
    "source": "https://cosmileeurope.eu/inci/detail/3787/copernicia-cerifera-cera/",
    "note": "Copernicia Cerifera (Carnauba) Wax can form a film; COSMILE Europe also lists skin-conditioning and emollient functions.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "euphorbia cerifera candelilla wax": {
    "category": "film former",
    "sourceFunction": "film forming",
    "source": "https://cosmileeurope.eu/inci/detail/17595/euphorbia-cerifera-cera/",
    "note": "Euphorbia Cerifera (Candelilla) Wax can form a film; COSMILE Europe also lists emulsion stabilization, gel formation and viscosity control.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "peg-12": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "source": "https://cosmileeurope.eu/inci/detail/10395/peg-12/",
    "note": "PEG-12 retains moisture in cosmetic products and is also listed as a solvent and fragrance-functional ingredient.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "peg-75": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "source": "https://cosmileeurope.eu/inci/detail/11036/peg-75/",
    "note": "PEG-75 retains moisture and can also bind powdered ingredients or act as a solvent in cosmetics.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "ppg-26-buteth-26": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/12992/ppg-26-buteth-26/",
    "note": "PPG-26-Buteth-26 is listed for hair and skin conditioning, with a fragrance-functional role.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  },
  "elastin": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/5210/elastin/",
    "note": "Elastin is used for skin conditioning and smoothing in cosmetic products.",
    "authority": "Cosmetics Europe / COSMILE Europe"
  }
});
assert.equal(raw.length,725,'source review may not rewrite raw dictionary records');
assert.equal(merged.length,599,'source review may not change canonical recognition inventory');
assert.equal(Object.keys(expected).length,16);
assert.ok(Object.keys(parser.verifiedCategoryEvidence).length >= 190, 'wave30 role evidence retained');
assert.ok(Object.keys(parser.verifiedNoteEvidence).length >= 156, 'wave30 specific notes retained');
assert.ok(Object.keys(taxonomy.reviewed_mappings).length >= 190, 'wave30 reviewed mappings retained');
assert.ok(Number(parser.version.split('.')[1]) >= 63, 'wave30 parser contract retained');
for(const [key,want] of Object.entries(expected)){
  const category=parser.verifiedCategoryEvidence[key];
  const note=parser.verifiedNoteEvidence[key];
  const mapping=taxonomy.reviewed_mappings[key];
  const row=byCanonical.get(key);
  assert.ok(category,key+': missing official reviewed role');
  assert.equal(category.category,want.category);
  assert.deepEqual([...category.sources],[want.source]);
  assert.equal(category.authority,want.authority);
  assert.ok(note,key+': missing independent ingredient explanation');
  assert.equal(note.note_short,want.note);
  assert.deepEqual([...note.note_sources],[want.source]);
  assert.equal(note.authority,want.authority);
  assert.ok(mapping?.runtime_verified,key+': missing reviewed role mapping');
  assert.equal(mapping.category,want.category);
  assert.deepEqual(mapping.source_functions,[want.sourceFunction]);
  assert.deepEqual(mapping.sources,[want.source]);
  assert.equal(mapping.authority,want.authority);
  assert.ok(row,key+': missing merged canonical');
  assert.equal(row.category,want.category,key+': public first role differs from reviewed role');
  assert.equal(row.category_verified,true);
  assert.equal(row.note_verified,true);
  assert.equal(row.note_short,want.note);
  assert.ok(row.note_sources.includes(want.source));
  assert.ok(Array.isArray(row.jp)&&row.jp.some(Boolean),key+': maintained Japanese name absent');
  assert.equal(row.note_provenance_conflict,undefined,key+': source conflict must fail closed');
}
for(const ambiguous of parser.ambiguousExactKeys||[]){
  assert.equal(parser.verifiedCategoryEvidence[ambiguous],undefined,ambiguous+': ambiguous identity cannot be assigned a role');
  assert.equal(parser.verifiedNoteEvidence[ambiguous],undefined,ambiguous+': ambiguous identity cannot be given an invented note');
}
assert.equal(parser.verifiedCategoryEvidence['bha'],undefined,'ambiguous BHA must stay unresolved');
console.log('COSMETICS_VERIFIED_WAVE30=PASS: 16 independently reviewed roles and notes, 3 official FDA and 13 COSMILE, 190 verified roles and 156 source-backed notes');
