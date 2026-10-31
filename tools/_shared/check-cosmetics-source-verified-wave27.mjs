import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync('tools/_shared/cosmetics-category-taxonomy.json','utf8'));
const paths=['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const records = paths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const merged = parser.mergeDictionaryRecords(records);
const runtime = new Map(merged.map(x=>[parser.canonicalIdentityKey(x.en),x]));
const expected = Object.freeze({
  "hydrolyzed wheat protein": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/7030/hydrolyzed-wheat-protein/",
    "note": "Hydrolyzed Wheat Protein is used for hair and skin conditioning; COSMILE Europe also lists an antistatic function."
  },
  "hydrolyzed rice protein": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/6964/hydrolyzed-rice-protein/",
    "note": "Hydrolyzed Rice Protein serves hair and skin conditioning and helps reduce static charge in hair."
  },
  "hydrolyzed vegetable protein": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/7022/hydrolyzed-vegetable-protein/",
    "note": "Hydrolyzed Vegetable Protein can condition hair and skin and is also listed for its antistatic function."
  },
  "hydrolyzed soy protein": {
    "category": "humectant",
    "sourceFunction": "humectant",
    "source": "https://cosmileeurope.eu/inci/detail/6993/hydrolyzed-soy-protein/",
    "note": "Hydrolyzed Soy Protein is a moisture-retaining ingredient; COSMILE Europe also lists hair and skin conditioning and antistatic functions."
  },
  "hydrolyzed pea protein": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/6937/hydrolyzed-pea-protein/",
    "note": "Hydrolyzed Pea Protein is used for hair conditioning; COSMILE Europe also lists skin conditioning, emollience and antistatic functions."
  },
  "hydrolyzed elastin": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/6846/hydrolyzed-elastin/",
    "note": "Hydrolyzed Elastin serves hair and skin conditioning; COSMILE Europe also lists emollient use."
  },
  "collagen": {
    "category": "hair conditioning",
    "sourceFunction": "hair conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/3743/collagen/",
    "note": "Collagen is listed for hair and skin conditioning and moisturising functions in cosmetics."
  },
  "magnesium chloride": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "source": "https://cosmileeurope.eu/inci/detail/8518/magnesium-chloride/",
    "note": "Magnesium Chloride can adjust a cosmetic formulation's viscosity; COSMILE Europe also lists flavouring and fragrance-functional uses."
  },
  "calcium chloride": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "source": "https://cosmileeurope.eu/inci/detail/2378/calcium-chloride/",
    "note": "Calcium Chloride is used to control cosmetic formulation viscosity; COSMILE Europe also lists an astringent function."
  },
  "aluminum hydroxide": {
    "category": "viscosity adjuster",
    "sourceFunction": "viscosity controlling",
    "source": "https://cosmileeurope.eu/inci/detail/767/aluminum-hydroxide/",
    "note": "Aluminum Hydroxide is used for viscosity control, opacifying and skin-protecting functions."
  },
  "boron nitride": {
    "category": "skin conditioning",
    "sourceFunction": "skin conditioning",
    "source": "https://cosmileeurope.eu/inci/detail/1864/boron-nitride/",
    "note": "Boron Nitride has skin-conditioning, absorbent and opacifying functions in cosmetics."
  },
  "cinnamyl alcohol": {
    "category": "fragrance",
    "sourceFunction": "fragrance",
    "source": "https://cosmileeurope.eu/inci/detail/3353/cinnamyl-alcohol/",
    "note": "Cinnamyl Alcohol is used as a fragrance ingredient; COSMILE Europe also lists a flavouring function."
  }
});
const authority='Cosmetics Europe / COSMILE Europe';
assert.equal(records.length,725,'reviewed wave must not rewrite raw ingredient recognition');
assert.equal(merged.length,599,'no new or removed canonical identities');
assert.equal(Object.keys(expected).length,12);
assert.ok(Object.keys(parser.verifiedCategoryEvidence).length >= 142, 'wave27 roles retained');
assert.ok(Object.keys(parser.verifiedNoteEvidence).length >= 108, 'wave27 notes retained');
assert.ok(Object.keys(taxonomy.reviewed_mappings).length >= 142, 'wave27 mappings retained');
assert.ok(Number(parser.version.split('.')[1]) >= 60, 'wave27 parser version retained');
for (const [key,item] of Object.entries(expected)) {
  const category=parser.verifiedCategoryEvidence[key];
  const note=parser.verifiedNoteEvidence[key];
  const mapping=taxonomy.reviewed_mappings[key];
  const row=runtime.get(key);
  assert.ok(category,key+': missing reviewed function evidence');
  assert.equal(category.category,item.category,key+': reviewed category changed');
  assert.deepEqual([...category.sources],[item.source],key+': reviewed function evidence URL changed');
  assert.equal(category.authority,authority);
  assert.ok(note,key+': missing source-backed note');
  assert.equal(note.note_short,item.note,key+': reviewed ingredient note changed');
  assert.deepEqual([...note.note_sources],[item.source],key+': reviewed ingredient evidence URL changed');
  assert.equal(note.authority,authority);
  assert.ok(mapping?.runtime_verified,key+': reviewed mapping not runtime-verified');
  assert.equal(mapping.category,item.category,key+': taxonomy differs from verified parser');
  assert.deepEqual(mapping.source_functions,[item.sourceFunction]);
  assert.deepEqual(mapping.sources,[item.source]);
  assert.equal(mapping.authority,authority);
  assert.ok(row,key+': runtime canonical ingredient missing');
  assert.equal(row.category,item.category,key+': public primary role must be reviewed');
  assert.equal(row.category_verified,true,key+': public role provenance missing');
  assert.equal(row.note_verified,true,key+': note not source verified');
  assert.equal(row.note_short,item.note);
  assert.ok(row.note_sources.includes(item.source),key+': runtime source link missing');
  assert.ok(Array.isArray(row.jp) && row.jp.some(Boolean),key+': Japanese ingredient name missing');
  assert.equal(row.note_provenance_conflict,undefined,key+': note provenance conflict');
}
for(const token of parser.ambiguousExactKeys||[]) {
  assert.equal(parser.verifiedCategoryEvidence[token],undefined,token+': ambiguous name must not be source-promoted');
  assert.equal(parser.verifiedNoteEvidence[token],undefined,token+': ambiguous name must not be source-noted');
}
console.log('COSMETICS_VERIFIED_WAVE27=PASS: 12 official-source roles and notes, 142 category identities, 108 strong reviewed note identities, 599 canonical recognition identities');
