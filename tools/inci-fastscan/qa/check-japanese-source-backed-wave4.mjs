/**
 * Source-backed Japanese display names for five distinct canonical INCI rows.
 * Published product ingredient lists are not independently photo-transcribed:
 * this is a dictionary-match coverage and exact-name identity gate, NOT photo
 * accuracy, regulatory-compliance or cosmetic safety certification.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {japaneseRealPhotoSources} from './japanese-real-photo-corpus.mjs';
import {createProductionLabelScorer} from './production-label-scoring.mjs';

const require=createRequire(import.meta.url);
const parser=require('../../_shared/cosmetic-ingredient-parser.js');
const items=[];
for(const suffix of ['',...Array.from({length:8},(_,i)=>'-extra-'+(i+1))]){
  items.push(...JSON.parse(fs.readFileSync('tools/inci-fastscan/data/ingredients'+suffix+'.json','utf8')));
}
const scorer=createProductionLabelScorer();
const expected=[
  {id:'jp_source_20261104_w4_ceramide_ag',jp:'セラミドAG',en:'Ceramide AG',role:'humectant',primary:'https://nipponseika-cosme.com/products/phytopresome-cera-v'},
  {id:'jp_source_20261104_w4_gold',jp:'金',en:'Gold',role:'colorant',primary:'https://www.cosmetic-info.jp/jcln/detail.php?id=3169'},
  {id:'jp_source_20261104_w4_silver',jp:'銀',en:'Silver',role:'skin conditioning',primary:'https://beaker.media/jsln_ingredients/555881'},
  {id:'jp_source_20261104_w4_methylheptyl_laurate',jp:'ラウリン酸メチルヘプチル',en:'Methylheptyl Laurate',role:'emollient',primary:'https://www.ishampoo.jp/kaiseki/ingredients/59577'},
  {id:'jp_source_20261104_w4_o_cymen_5_ol',jp:'o-シメン-5-オール',en:'o-Cymen-5-ol',role:'preservative',primary:'https://www.cosmetic-info.jp/jcln/detail.php?id=11529'}
];
assert.equal(expected.length,5);
assert.equal(new Set(expected.map(x=>parser.normalizeKey(x.jp))).size,5);
assert.equal(new Set(expected.map(x=>parser.canonicalIdentityKey(x.en))).size,5);
for(const row of expected){
  const ingredient=items.find(x=>x.id===row.id);
  assert.ok(ingredient,row.id+': independently verified new canonical name must exist');
  assert.equal(ingredient.en,row.en);
  assert.deepEqual(ingredient.jp,[row.jp]);
  assert.equal(ingredient.category,row.role);
  assert.equal(ingredient.safety,'unrated','Legacy safe/unsafe statuses may not be inferred');
  assert.equal(ingredient.note_verified,true);
  assert.ok(ingredient.note_short?.length>=65);
  assert.ok(ingredient.note_sources?.length>=2);
  assert.ok(ingredient.note_sources.includes(row.primary));
  assert.ok(ingredient.note_sources.every(url=>new URL(url).protocol==='https:'));
  assert.equal(items.filter(x=>parser.canonicalIdentityKey(x.en)===parser.canonicalIdentityKey(row.en)).length,1,
    'Never create multiple raw rows with the same new canonical identity');
  assert.equal(items.filter(x=>(x.jp||[]).some(jp=>parser.normalizeKey(jp)===parser.normalizeKey(row.jp))).length,1,
    'Never give one Japanese display name to two canonical identities');
  assert.ok(japaneseRealPhotoSources.some(photo=>photo.ingredientList.includes(row.jp)),
    'Source-corpus ingredient name, not guessed OCR, is required');
  const check=await scorer.assess(row.jp,[row.en]);
  assert.equal(check.eligibleReferenceUniqueNames,1,row.jp+': dictionary must support exact identity');
  assert.equal(check.afterRepair.exactReferenceHits,1,row.jp+': text input must match correct canonical name');
  assert.equal(check.afterRepair.extraMatchesNotInAnnotation,0,row.jp+': no unrequested ingredients');
}
assert.notEqual(parser.canonicalIdentityKey('Gold'),parser.canonicalIdentityKey('Platinum'));
assert.notEqual(parser.canonicalIdentityKey('Silver'),parser.canonicalIdentityKey('Silver Oxide'));
assert.ok(!expected.some(x=>x.jp==='白金'||x.jp==='ハマメリス水'),
  'Those source names have multiple possible INCI identities; do not force-match them');
let published=0,supported=0;
const sourceCounts=[];
for(const source of japaneseRealPhotoSources){
  const result=await scorer.assess(source.ingredients,source.ingredientList);
  published+=source.ingredientList.length;
  supported+=result.eligibleReferenceUniqueNames;
  assert.equal(result.afterRepair.exactReferenceHits,result.eligibleReferenceUniqueNames,
    'Published source positive-control only, NOT actual photo text accuracy');
  sourceCounts.push({id:source.id,referenceNames:source.ingredientList.length,dictionarySupported:result.eligibleReferenceUniqueNames});
}
assert.equal(published,127);
assert.ok(supported>=95,'Five new identities improve original 90 supported names to at least 95');
assert.ok(items.filter(x=>x.safety==='unrated').length>=16);
console.log('FASTSCAN_JAPANESE_WAVE4='+JSON.stringify({status:'PASS',newCanonicalIdentities:5,rawRecords:items.length,
  sourceReferences:published,supportedReferences:supported,unsupportedReferences:published-supported,
  sourceCounts,unsafeSafetyClaimsAdded:0,ambiguousIdentityAutoMerges:0,actualPhotoAccuracyCertified:false}));
