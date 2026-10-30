import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {discoverOfficialPopulation,exactModelTitle,manufacturerManualEvidence,reviewIndex} from '../scripts/samsung-jp-galaxy-review.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/samsung/jp-galaxy-smartphone-online-manual-index.json',import.meta.url),'utf8'));
const validate=validateCoveragePass(pass);
assert.equal(validate.valid,true,validate.errors.join('; '));
assert.equal(pass.universe.models.length,89);
assert.equal(new Set(pass.universe.models).size,89);
assert.deepEqual(pass.subscopes.map(x=>x.models.length),[18,39,8,19,5]);

const escapeHtml=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
const sourceHtml='<html><body>'+[...pass.subscopes,{models:Array.from({length:34},(_,i)=>'Galaxy Tab '+i)}].map((scope,gi)=>
 '<table><tr><th>機種名</th><th>キャリア・モデル名</th></tr>'+
 scope.models.map((model,mi)=>'<tr><td>'+model+'</td><td><a href="https://www.samsung.com/jp/support/model/TEST-'+gi+'-'+mi+'/#downloads">OPEN</a></td></tr>').join('')+'</table>'
).join('')+'</body></html>';
const discovered=discoverOfficialPopulation(sourceHtml);
assert.deepEqual(discovered.groups.map(x=>x.length),[18,39,8,19,5]);
assert.equal(discovered.tabletCount,34);
const manual={description:'マニュアル',contentsTypeCode:'UM',downloadUrl:'https://org.downloadcenter.samsung.com/downloadfile/ContentsFile.aspx?CttFileID=42',
languageList:[{code:'JA'}],fileName:'Japanese.pdf'};
const doc=model=>'<html><head><title>'+model+' | Galaxyサポート | Samsung Japan</title></head><body><h1>'+model+'</h1><script>const files={"manuals":'+JSON.stringify([manual])+'};</script></body></html>';
assert.equal(exactModelTitle(doc('Galaxy S24 Ultra'),'Galaxy S24').exact,false);
assert.equal(exactModelTitle(doc('Galaxy S24'),'Galaxy S24').exact,true);
assert.equal(exactModelTitle(doc('Galaxy A8 SCV32'),'Galaxy A8').exact,true);
assert.equal(manufacturerManualEvidence(doc('Galaxy S24')).length,1);
assert.equal(manufacturerManualEvidence(doc('Galaxy S24').replace('org.downloadcenter.samsung.com','untrusted.example')).length,0);
const all=await reviewIndex({html:sourceHtml,pass,probe:async url=>{
 const match=url.match(/TEST-(\d+)-(\d+)/);const [g,i]=match.slice(1).map(Number);
 return{html:doc((pass.subscopes[g]||{models:[]}).models[i]),finalUrl:url,statusCode:200};
}});
assert.equal(all.officialPopulation,89);
assert.equal(all.records.length,89);
assert.equal(all.counts.direct,89);
assert.equal(all.counts.held,0);
assert.equal(all.publicationReady,true);
const changed=sourceHtml.replace('Galaxy A8</td>','Galaxy A9</td>');
await assert.rejects(()=>reviewIndex({html:changed,pass,probe:async()=>({})}),/population drift/);
assert.equal(all.records.every(x=>x.manualUrl.endsWith('#downloads')),true);
console.log('Samsung Galaxy locked 89-model universe, exact model title, manual metadata, full reconciliation tests passed.');
