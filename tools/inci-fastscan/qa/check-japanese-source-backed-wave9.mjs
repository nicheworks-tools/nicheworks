/**
 * Japanese product reference name expansion (wave 9): exact JP/INCI identity
 * and neutral roles ONLY. Dictionary matching is not photograph OCR accuracy,
 * cosmetics regulatory compliance, or a personal/product safety assessment.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {japaneseRealPhotoSources} from './japanese-real-photo-corpus.mjs';
import {createProductionLabelScorer} from './production-label-scoring.mjs';

const require=createRequire(import.meta.url);
const parser=require('../../_shared/cosmetic-ingredient-parser.js');
const files=['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')];
const records=files.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const expected=[
  ['jp_source_20261105_w9_acanthopanax_senticosus_root_extract','エゾウコギ根エキス','Acanthopanax Senticosus (Eleuthero) Root Extract','skin conditioning','https://www.holstein.co.jp/products/cosmetics/phytocodine/'],
  ['jp_source_20261105_w9_pelargonium_graveolens_oil','ニオイテンジクアオイ油','Pelargonium Graveolens Oil','fragrance','https://beaker.media/jsln_ingredients/560824'],
  ['jp_source_20261105_w9_tocopheryl_retinoate','レチノイン酸トコフェリル','Tocopheryl Retinoate','antioxidant','https://ai.gloshell.com/ingredients/tocopheryl-retinoate'],
  ['jp_source_20261105_w9_acetyl_tetrapeptide_17','アセチルテトラペプチド-17','Acetyl Tetrapeptide-17','skin conditioning','https://webprod.hc-sc.gc.ca/nhpid-bdipsn/ingredReq?id=17831'],
  ['jp_source_20261105_w9_silver_oxide','酸化銀','Silver Oxide','antimicrobial','https://cosme-hub.com/ingredients/3391'],
  ['jp_source_20261105_w9_rh_oligopeptide_1','ヒト遺伝子組換オリゴペプチド-1','rh-Oligopeptide-1','skin conditioning','https://www.cosmetic-info.jp/jcln/detail.php?id=11595']
];
assert.equal(expected.length,6);
assert.equal(new Set(expected.map(x=>parser.normalizeKey(x[1]))).size,6);
assert.equal(new Set(expected.map(x=>parser.canonicalIdentityKey(x[2]))).size,6);
const scorer=createProductionLabelScorer();
for(const [id,jp,en,role,primary] of expected) {
 const record=records.find(x=>x.id===id);
 assert.ok(record,id+': exact source-backed identity missing');
 assert.equal(record.en,en);
 assert.deepEqual(record.jp,[jp]);
 assert.equal(record.category,role);
 assert.equal(record.safety,'unrated','Do not assign a guessed safety or regulatory status');
 assert.equal(record.note_verified,true);
 assert.ok(record.note_short?.length>=65);
 assert.ok(Array.isArray(record.note_sources)&&record.note_sources.length>=2);
 assert.ok(record.note_sources.includes(primary));
 assert.ok(record.note_sources.every(u=>new URL(u).protocol==='https:'));
 assert.equal(records.filter(x=>parser.canonicalIdentityKey(x.en)===parser.canonicalIdentityKey(en)).length,1,
   'No duplicate canonical identity: '+en);
 assert.equal(records.filter(x=>(x.jp||[]).some(j=>parser.normalizeKey(j)===parser.normalizeKey(jp))).length,1,
   'No cross-identity Japanese name collision: '+jp);
 assert.ok(japaneseRealPhotoSources.some(s=>s.ingredientList.includes(jp)), jp+': exact source-list label required');
 const result=await scorer.assess(jp,[en]);
 assert.equal(result.eligibleReferenceUniqueNames,1,jp+': missing from merged production matcher');
 assert.equal(result.afterRepair.exactReferenceHits,1,jp+': mismatched exact canonical identity');
 assert.equal(result.afterRepair.extraMatchesNotInAnnotation,0,jp+': false extra match');
}
for(const [a,b] of [
 ['Acanthopanax Senticosus (Eleuthero) Root Extract','Eleutherococcus Senticosus Root Extract'],
 ['Pelargonium Graveolens Oil','Pelargonium Graveolens Flower Oil'],
 ['Tocopheryl Retinoate','Tocopheryl Glyceryl Retinoate'],
 ['Acetyl Tetrapeptide-17','Acetyl Tetrapeptide-17 Colloidal Platinum (Nano)'],
 ['Silver Oxide','Silver'],
 ['rh-Oligopeptide-1','sh-Oligopeptide-1']
]) assert.notEqual(parser.canonicalIdentityKey(a),parser.canonicalIdentityKey(b),
 'Never conflate retired botanical, plant parts, retinoids, peptides, metal chemistry or rh/sh EGF');
let count=0,supported=0;
for(const item of japaneseRealPhotoSources) {
 count+=item.ingredientList.length;
 const result=await scorer.assess(item.ingredients,item.ingredientList);
 supported+=result.eligibleReferenceUniqueNames;
 assert.equal(result.afterRepair.exactReferenceHits,result.eligibleReferenceUniqueNames,
   'Published product list is a dictionary positive-control, not image OCR accuracy');
}
assert.equal(count,127);
assert.ok(supported>=117,'Previously 111/127 and six independently verified wave9 new names = at least 117');
console.log('FASTSCAN_JAPANESE_WAVE9='+JSON.stringify({
 status:'PASS',addedSourceBackedNames:6,referenceNames:count,dictionarySupportedNames:supported,
 remainingUnmatched:count-supported,safetyGradesInferred:0,
 actualPhotoOCRAccuracyCertified:false,actualHandsetAccuracyCertified:false,
 exactProductFormulaPhotoVersionVerified:false
}));
