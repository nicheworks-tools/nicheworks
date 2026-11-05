/**
 * Exact Japanese source-list name to full canonical INCI identity: wave 10.
 * Source-list dictionary coverage is NOT actual-photo OCR, formula-version
 * matching, product regulatory compliance, or a safety determination.
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
const rows=files.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')));
const expected=[
 ['jp_source_20261105_w10_colloidal_platinum','コロイド性白金','Colloidal Platinum','antioxidant','https://www.yamakawa-and.co.jp/products/index.php?inCtg=%E3%82%B9%E3%82%AD%E3%83%B3%E3%82%B1%E3%82%A2&mode=dtl'],
 ['jp_source_20261105_w10_chlorella_vulgaris_lupinus_albus_protein_ferment','クロレラ/シロバナルーピンタンパク発酵物','Chlorella Vulgaris/Lupinus Albus Protein Ferment','skin conditioning','https://www.toyo-asia.co.jp/assets/export/trade/tra00300/tra00302/tra00302_01/tra00302_32.htm']
];
assert.equal(expected.length,2);
assert.equal(new Set(expected.map(x=>parser.normalizeKey(x[1]))).size,2);
assert.equal(new Set(expected.map(x=>parser.canonicalIdentityKey(x[2]))).size,2);
const scorer=createProductionLabelScorer();
for(const [id,jp,en,role,primary] of expected){
 const item=rows.find(r=>r.id===id);
 assert.ok(item,id+': missing independent documented full INCI identity');
 assert.equal(item.en,en);
 assert.deepEqual(item.jp,[jp]);
 assert.equal(item.category,role);
 assert.equal(item.safety,'unrated','Do not invent safety grades');
 assert.equal(item.note_verified,true);
 assert.ok(item.note_short.length>=70);
 assert.ok(item.note_sources.length>=2);
 assert.ok(item.note_sources.includes(primary));
 assert.ok(item.note_sources.every(url=>new URL(url).protocol==='https:'));
 assert.equal(rows.filter(r=>parser.canonicalIdentityKey(r.en)===parser.canonicalIdentityKey(en)).length,1,
   en+': multiple raw records share canonical identity');
 assert.equal(rows.filter(r=>(r.jp||[]).some(name=>parser.normalizeKey(name)===parser.normalizeKey(jp))).length,1,
   jp+': alias assigned to multiple identities');
 assert.ok(japaneseRealPhotoSources.some(s=>s.ingredientList.includes(jp)),
   jp+': exact source Japanese name absent');
 const check=await scorer.assess(jp,[en]);
 assert.equal(check.eligibleReferenceUniqueNames,1,'Production exact-name dictionary must support '+jp);
 assert.equal(check.afterRepair.exactReferenceHits,1,'Production parser mismatches '+jp);
 assert.equal(check.afterRepair.extraMatchesNotInAnnotation,0);
}
for(const [a,b] of [
 ['Colloidal Platinum','Platinum'],
 ['Colloidal Platinum','Platinum Powder'],
 ['Chlorella Vulgaris/Lupinus Albus Protein Ferment','Chlorella Ferment'],
 ['Chlorella Vulgaris/Lupinus Albus Protein Ferment','Lupinus Albus Protein']
])assert.notEqual(parser.canonicalIdentityKey(a),parser.canonicalIdentityKey(b),
 'Never collapse form, species or distinct INCI ingredient identities');
let total=0,supported=0;
for(const source of japaneseRealPhotoSources){
 total+=source.ingredientList.length;
 const check=await scorer.assess(source.ingredients,source.ingredientList);
 supported+=check.eligibleReferenceUniqueNames;
 assert.equal(check.afterRepair.exactReferenceHits,check.eligibleReferenceUniqueNames);
}
assert.equal(total,127);
assert.ok(supported>=118,'Wave9 116 + wave10 2 independently evidenced source names >=118');
console.log('FASTSCAN_JAPANESE_WAVE10='+JSON.stringify({
 status:'PASS',newCanonicalIdentities:2,publishedNames:total,
 dictionarySupportedNames:supported,remainingUnmatched:total-supported,
 imageOCRAccuracyCertified:false,smartphoneAccuracyCertified:false,
 photoFormulaVersionVerified:false,productSafetyGradesAdded:0
}));
