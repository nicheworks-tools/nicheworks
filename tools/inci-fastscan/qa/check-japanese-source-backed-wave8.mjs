/**
 * Three independently source-backed Japanese label ↔ exact INCI identities,
 * separate from photographic OCR accuracy or cosmetic safety evaluation.
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
 ['jp_source_20261105_w8_hydrogenated_rapeseed_alcohol','水添ナタネ油アルコール','Hydrogenated Rapeseed Alcohol','emollient','https://www.kak.co.jp/product/saturated_higher_alcohol/item_68'],
 ['jp_source_20261105_w8_hypericum_perforatum_flower_leaf_stem_extract','セイヨウオトギリソウ花/葉/茎エキス','Hypericum Perforatum Flower/Leaf/Stem Extract','skin conditioning','https://beaker.media/jsln_ingredients/560722'],
 ['jp_source_20261105_w8_sodium_retinoyl_hyaluronate','レチノイルヒアルロン酸Na','Sodium Retinoyl Hyaluronate','skin conditioning','https://cosme-hub.com/stats/new-ingredients']
];
assert.equal(expected.length,3);
assert.equal(new Set(expected.map(x=>parser.normalizeKey(x[1]))).size,3);
assert.equal(new Set(expected.map(x=>parser.canonicalIdentityKey(x[2]))).size,3);
const scorer=createProductionLabelScorer();
for(const[id,jp,en,role,primary]of expected){
 const row=rows.find(x=>x.id===id);
 assert.ok(row,id+': new identity is missing');
 assert.equal(row.en,en);
 assert.deepEqual(row.jp,[jp]);
 assert.equal(row.category,role);
 assert.equal(row.safety,'unrated','Do not fabricate ingredient safety grades');
 assert.equal(row.note_verified,true);
 assert.ok(row.note_short.length>=65);
 assert.ok(Array.isArray(row.note_sources)&&row.note_sources.length>=2);
 assert.ok(row.note_sources.includes(primary));
 assert.ok(row.note_sources.every(u=>new URL(u).protocol==='https:'));
 assert.equal(rows.filter(x=>parser.canonicalIdentityKey(x.en)===parser.canonicalIdentityKey(en)).length,1,
   en+': duplicate canonical ingredient identity');
 assert.equal(rows.filter(x=>(x.jp||[]).some(v=>parser.normalizeKey(v)===parser.normalizeKey(jp))).length,1,
   jp+': same Japanese ingredient assigned to multiple records');
 assert.ok(japaneseRealPhotoSources.some(s=>s.ingredientList.includes(jp)),
   jp+': not present exactly in fixed published source lists');
 const check=await scorer.assess(jp,[en]);
 assert.equal(check.eligibleReferenceUniqueNames,1,'Production dictionary must recognize source name');
 assert.equal(check.afterRepair.exactReferenceHits,1,'Production parser must resolve exact INCI');
 assert.equal(check.afterRepair.extraMatchesNotInAnnotation,0);
}
for(const[a,b]of[
 ['Hydrogenated Rapeseed Alcohol','Hydrogenated Rapeseed Oil'],
 ['Hypericum Perforatum Flower/Leaf/Stem Extract','Hypericum Perforatum Extract'],
 ['Sodium Retinoyl Hyaluronate','Sodium Hyaluronate']
])assert.notEqual(parser.canonicalIdentityKey(a),parser.canonicalIdentityKey(b),
 'No distinct alcohol/oil, botanical part or retinoid/hyaluronate conflation');
let total=0,supported=0;
for(const p of japaneseRealPhotoSources){
 total+=p.ingredientList.length;
 const check=await scorer.assess(p.ingredients,p.ingredientList);
 supported+=check.eligibleReferenceUniqueNames;
 assert.equal(check.afterRepair.exactReferenceHits,check.eligibleReferenceUniqueNames);
}
assert.equal(total,127);
assert.ok(supported>=111,'Wave7 108 + wave8 3 independently supported identities = 111');
console.log('FASTSCAN_JAPANESE_WAVE8='+JSON.stringify({
 status:'PASS',newCanonicalIdentities:3,referenceNames:total,
 dictionarySupportedNames:supported,remainingUnmatched:total-supported,
 safetyGradesInferred:0,photoOCRAccuracyCertified:false,
 mobileDeviceAccuracyCertified:false,productFormulaPhotoVersionVerified:false
}));
