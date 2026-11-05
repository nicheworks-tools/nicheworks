/**
 * Source-backed exact INCI identities from two Japanese product source lists:
 * dictionary controls only, not photographic OCR/phone accuracy or safety.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const data = paths.flatMap(path=>JSON.parse(fs.readFileSync(path,'utf8')));
const expected = [
  ['jp_source_20261105_w6_arctium_lappa_root_extract','ゴボウ根エキス','Arctium Lappa Root Extract','skin conditioning','https://beaker.media/jsln_ingredients/556491'],
  ['jp_source_20261105_w6_polygonum_cuspidatum_root_extract','イタドリ根エキス','Polygonum Cuspidatum Root Extract','antioxidant','https://beaker.media/jsln_ingredients/557764'],
  ['jp_source_20261105_w6_cananga_odorata_flower_oil','イランイラン花油','Cananga Odorata Flower Oil','fragrance','https://www.ypcyy.co.jp/product/natural/floral/ylang-ylang-complete/'],
  ['jp_source_20261105_w6_sodium_hyaluronate_crosspolymer_2','ヒアルロン酸クロスポリマー-2-Na','Sodium Hyaluronate Crosspolymer-2','humectant','https://beaker.media/jsln_ingredients/565567'],
  ['jp_source_20261105_w6_hydrogenated_retinol','水添レチノール','Hydrogenated Retinol','skin conditioning','https://beaker.media/jsln_ingredients/560083'],
  ['jp_source_20261105_w6_hydroxypinacolone_retinoate','レチノイン酸ヒドロキシピナコロン','Hydroxypinacolone Retinoate','skin conditioning','https://tunemakers.net/products/0211390']
];
const scorer = createProductionLabelScorer();
assert.equal(expected.length,6);
assert.equal(new Set(expected.map(x=>parser.normalizeKey(x[1]))).size,6);
assert.equal(new Set(expected.map(x=>parser.canonicalIdentityKey(x[2]))).size,6);
for(const [id,jp,en,category,primary] of expected){
  const item = data.find(x=>x.id===id);
  assert.ok(item, id+': missing exact evidence-backed identity');
  assert.equal(item.en,en);
  assert.deepEqual(item.jp,[jp]);
  assert.equal(item.category,category);
  assert.equal(item.safety,'unrated','Never manufacture safe/unsafe grades');
  assert.equal(item.note_verified,true);
  assert.ok(item.note_short?.length>=60);
  assert.ok(Array.isArray(item.note_sources)&&item.note_sources.length>=2);
  assert.ok(item.note_sources.includes(primary));
  assert.ok(item.note_sources.every(url=>new URL(url).protocol==='https:'));
  assert.equal(data.filter(x=>parser.canonicalIdentityKey(x.en)===parser.canonicalIdentityKey(en)).length,1,
    'No duplicate full canonical identity: '+en);
  assert.equal(data.filter(x=>(x.jp||[]).some(v=>parser.normalizeKey(v)===parser.normalizeKey(jp))).length,1,
    'No Japanese alias assigned to two separate identities: '+jp);
  assert.ok(japaneseRealPhotoSources.some(source=>source.ingredientList.includes(jp)),
    'Exact Japanese product source name must be independently listed');
  const result=await scorer.assess(jp,[en]);
  assert.equal(result.eligibleReferenceUniqueNames,1,'New canonical identity must be matchable');
  assert.equal(result.afterRepair.exactReferenceHits,1,'Real production matching must resolve exact JP/INCI');
  assert.equal(result.afterRepair.extraMatchesNotInAnnotation,0);
}
assert.notEqual(parser.canonicalIdentityKey('Hydrogenated Retinol'),
  parser.canonicalIdentityKey('Hydroxypinacolone Retinoate'));
assert.notEqual(parser.canonicalIdentityKey('Sodium Hyaluronate Crosspolymer-2'),
  parser.canonicalIdentityKey('Sodium Hyaluronate Crosspolymer-3'));
assert.ok(!expected.some(x=>['レモン果実エキス','ハマメリス水','白金','コロイド性白金'].includes(x[1])),
  'Ambiguous product labels must not be guessed as single INCI identities');
let total=0,supported=0;
for(const source of japaneseRealPhotoSources){
  total+=source.ingredientList.length;
  const result=await scorer.assess(source.ingredients,source.ingredientList);
  supported+=result.eligibleReferenceUniqueNames;
  assert.equal(result.afterRepair.exactReferenceHits,result.eligibleReferenceUniqueNames,
    'Published source-list positive control is not OCR image accuracy');
}
assert.equal(total,127);
assert.ok(supported>=105,'Wave5 99 + six independent wave6 names = at least 105/127');
console.log('FASTSCAN_JAPANESE_WAVE6='+JSON.stringify({
  status:'PASS', addedExactIdentities:expected.length, referenceNames:total,
  dictionarySupportedNames:supported, remainingUnmatched:total-supported,
  safetyGradesInferred:0, actualPhotoAccuracyCertified:false,
  actualSmartphoneAccuracyCertified:false, packagingFormulaVersionVerified:false
}));
