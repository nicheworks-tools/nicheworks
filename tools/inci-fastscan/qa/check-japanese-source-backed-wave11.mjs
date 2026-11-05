/**
 * Silver Oxide JP source exact identity requires complete bilingual antimicrobial
 * role, not generic, preservative or safety-claim substitution.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {japaneseRealPhotoSources} from './japanese-real-photo-corpus.mjs';
import {createProductionLabelScorer} from './production-label-scoring.mjs';
const require=createRequire(import.meta.url);
const parser=require('../../_shared/cosmetic-ingredient-parser.js');
const rows=['tools/inci-fastscan/data/ingredients.json',
 ...Array.from({length:8},(_,i)=>'tools/inci-fastscan/data/ingredients-extra-'+(i+1)+'.json')]
 .flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')));
const row=rows.find(x=>x.id==='jp_source_20261105_w11_silver_oxide');
assert.ok(row,'Exact source-backed Silver Oxide identity required');
assert.equal(row.en,'Silver Oxide');
assert.deepEqual(row.jp,['酸化銀']);
assert.equal(row.safety,'unrated');
assert.equal(row.category,'antimicrobial','Do not conflate antimicrobial with preservative');
assert.equal(row.note_verified,true);
assert.ok(row.note_short?.length>=100);
assert.ok(row.note_sources?.length>=2);
assert.ok(row.note_sources.includes('https://cosme-hub.com/ingredients/3391'));
assert.ok(row.note_sources.includes('https://cosmileeurope.eu/de/inci/inhaltsstoff/14475/silver-oxide/'));
assert.ok(row.note_sources.every(url=>new URL(url).protocol==='https:'));
assert.ok(japaneseRealPhotoSources.some(s=>s.ingredientList.includes('酸化銀')));
assert.equal(rows.filter(x=>parser.canonicalIdentityKey(x.en)===parser.canonicalIdentityKey('Silver Oxide')).length,1);
assert.equal(rows.filter(x=>(x.jp||[]).some(n=>parser.normalizeKey(n)===parser.normalizeKey('酸化銀'))).length,1);
assert.notEqual(parser.canonicalIdentityKey('Silver Oxide'),parser.canonicalIdentityKey('Silver'));
assert.notEqual(parser.canonicalIdentityKey('Silver Oxide'),parser.canonicalIdentityKey('Colloidal Silver'));

// Legitimate public-role support requires parity across both user-facing tools.
const lite=fs.readFileSync('tools/cosmetic-ingredient-checker-lite/app.js','utf8');
const scan=fs.readFileSync('tools/inci-fastscan/js/web_ui.js','utf8');
const semantic=fs.readFileSync('tools/_shared/check-cosmetics-semantic-quality.mjs','utf8');
const completion=fs.readFileSync('tools/_shared/check-cosmetics-completion-readiness.mjs','utf8');
for(const source of [lite,scan]) {
 assert.match(source,/antimicrobial: \{ ja: ['"]抗菌['"], en: ['"]Antimicrobial['"] \}/);
 assert.match(source,/microorganisms/i);
 assert.match(source,/微生物/);
 assert.match(source,/製品の防腐性能や使用上の安全性を保証するものではありません/);
 assert.match(source,/not establish a product's preservation performance or safety/);
}
assert.match(semantic,/'antimicrobial'/);
assert.match(completion,/'antimicrobial'/);
assert.doesNotMatch(row.note_short,/approved for|safe for|legally permitted/i);

const scorer=createProductionLabelScorer();
const single=await scorer.assess('酸化銀',['Silver Oxide']);
assert.equal(single.eligibleReferenceUniqueNames,1);
assert.equal(single.afterRepair.exactReferenceHits,1);
assert.equal(single.afterRepair.extraMatchesNotInAnnotation,0);
let total=0,supported=0;
for(const source of japaneseRealPhotoSources){
 total+=source.ingredientList.length;
 const scored=await scorer.assess(source.ingredients,source.ingredientList);
 supported+=scored.eligibleReferenceUniqueNames;
 assert.equal(scored.afterRepair.exactReferenceHits,scored.eligibleReferenceUniqueNames);
}
assert.equal(total,127);
assert.ok(supported>=119,'Wave10 118 + exact oxide name = at least 119/127');
console.log('FASTSCAN_JAPANESE_WAVE11='+JSON.stringify({status:'PASS',
 publishedSourceNames:total,dictionarySupportedNames:supported,
 remainingUnmatched:total-supported,addedExactNames:1,
 bilingualAntimicrobialRole:true,preservativeConflation:false,
 productSafetyCertified:false,photoOcrAccuracyCertified:false}));
