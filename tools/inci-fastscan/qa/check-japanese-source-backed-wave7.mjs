/**
 * Verified Japanese reference-name / INCI identity controls for wave 7.
 * Published product-source list coverage is NOT photograph OCR accuracy.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {japaneseRealPhotoSources} from './japanese-real-photo-corpus.mjs';
import {createProductionLabelScorer} from './production-label-scoring.mjs';
const require=createRequire(import.meta.url);
const parser=require('../../_shared/cosmetic-ingredient-parser.js');
const paths=['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const rows=paths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const expected=[
  ['jp_source_20261105_w7_nasturtium_officinale_leaf_stem_extract','オランダガラシ葉/茎エキス','Nasturtium Officinale Leaf/Stem Extract','skin conditioning','https://www.ichimaru.co.jp/dev/cosmetics/176'],
  ['jp_source_20261105_w7_hedera_helix_ivy_leaf_stem_extract','セイヨウキズタ葉/茎エキス','Hedera Helix (Ivy) Leaf/Stem Extract','skin conditioning','https://www.ikedabussan.com/itemindex/itemdetail/72'],
  ['jp_source_20261105_w7_salvia_sclarea_clary_oil','オニサルビア油','Salvia Sclarea (Clary) Oil','fragrance','https://www.ypcyy.co.jp/product/natural/herbal/clary-sage-french/']
];
assert.equal(expected.length,3);
assert.equal(new Set(expected.map(e=>parser.normalizeKey(e[1]))).size,3);
assert.equal(new Set(expected.map(e=>parser.canonicalIdentityKey(e[2]))).size,3);
const scorer=createProductionLabelScorer();
for(const[id,jp,en,category,primary]of expected){
  const row=rows.find(r=>r.id===id);
  assert.ok(row,id+': not registered');
  assert.equal(row.en,en);
  assert.deepEqual(row.jp,[jp]);
  assert.equal(row.category,category);
  assert.equal(row.safety,'unrated','No unreviewed safety verdicts');
  assert.equal(row.note_verified,true);
  assert.ok(row.note_short.length>=60);
  assert.ok(Array.isArray(row.note_sources)&&row.note_sources.length>=2);
  assert.ok(row.note_sources.includes(primary));
  assert.ok(row.note_sources.every(u=>new URL(u).protocol==='https:'));
  assert.equal(rows.filter(r=>parser.canonicalIdentityKey(r.en)===parser.canonicalIdentityKey(en)).length,1,
    en+': canonical identity collision');
  assert.equal(rows.filter(r=>(r.jp||[]).some(name=>parser.normalizeKey(name)===parser.normalizeKey(jp))).length,1,
    jp+': assigned to multiple identities');
  assert.ok(japaneseRealPhotoSources.some(s=>s.ingredientList.includes(jp)),
    jp+': must appear exactly on existing published source product lists');
  const check=await scorer.assess(jp,[en]);
  assert.equal(check.eligibleReferenceUniqueNames,1,jp+': not supported in merged production dictionary');
  assert.equal(check.afterRepair.exactReferenceHits,1,jp+': production label parser mismatch');
  assert.equal(check.afterRepair.extraMatchesNotInAnnotation,0);
}
for(const[a,b]of[
  ['Nasturtium Officinale Leaf/Stem Extract','Nasturtium Officinale Extract'],
  ['Hedera Helix (Ivy) Leaf/Stem Extract','Hedera Helix (Ivy) Extract'],
  ['Salvia Sclarea (Clary) Oil','Salvia Officinalis Leaf Extract']
])assert.notEqual(parser.canonicalIdentityKey(a),parser.canonicalIdentityKey(b),
  'No plant-part/general extract/species identity conflation');
let total=0,supported=0;
for(const p of japaneseRealPhotoSources){
  total+=p.ingredientList.length;
  const check=await scorer.assess(p.ingredients,p.ingredientList);
  supported+=check.eligibleReferenceUniqueNames;
  assert.equal(check.afterRepair.exactReferenceHits,check.eligibleReferenceUniqueNames);
}
assert.equal(total,127);
assert.ok(supported>=108,'Wave6 105 + wave7 3 source-backed exact identities');
console.log('FASTSCAN_JAPANESE_WAVE7='+JSON.stringify({
  status:'PASS',addedExactIdentities:3,referenceNames:total,dictionarySupportedNames:supported,
  remainingUnmatched:total-supported,safetyGradesInferred:0,
  photoOcrAccuracyCertified:false,actualSmartphoneAccuracyCertified:false,
  productPhotoFormulaVersionMatched:false
}));
