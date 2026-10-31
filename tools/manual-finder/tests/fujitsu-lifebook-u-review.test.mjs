import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {extractUSeries} from '../scripts/fujitsu-lifebook-u-index-probe.mjs';
import {reconcilePopulation,analyzeManualPage,reviewAll} from '../scripts/fujitsu-lifebook-u-review.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json',import.meta.url),'utf8'));
const status=validateCoveragePass(pass);
assert.equal(status.valid,true,status.errors.join('; '));
assert.equal(pass.universe.models.length,148);
assert.equal(new Set(pass.universe.models).size,148);
const modelHref=model=>model.replace(/^LIFEBOOK /,'').toLowerCase().replaceAll('/','')+'.html';
// Deterministic fixture only: actual official hrefs are source-locked by SHA256 in
// the real live runner. This test must fail if source-bound URL shapes change.
const index='<html><table><tr><td>Uシリーズ</td><td>'+
 pass.universe.models.map(model=>'<a href="https://www.fmworld.net/biz/fmv/support/fmvmanual/lifebook2/'+modelHref(model)+'">'+model+'</a>').join('\n')+
 '</td></tr></table></html>';
const discovered=extractUSeries(index);
assert.equal(discovered.models.length,148);
reconcilePopulation(pass,index);
const bad=index.replace('LIFEBOOK U9416NQ/CX','LIFEBOOK U9416NQ/CZZ');
assert.throws(()=>reconcilePopulation(pass,bad),/drift/);
const example='<html><h1>LIFEBOOK U9416NQ/CX マニュアル一覧</h1><h2>本体マニュアル</h2><table><tr><td>製品ガイド（機種別編）</td><td><a href="https://www.fmworld.net/biz/fmv/support/fmvmanual/pdf/TEST/test.pdf">マニュアル</a></td></tr></table></html>';
assert.equal(analyzeManualPage(example,'LIFEBOOK U9416NQ/CX',discovered.candidates[0].url).identity,true);
assert.equal(analyzeManualPage(example,'LIFEBOOK U9416NQ/C',discovered.candidates[1].url).identity,false);
const all=await reviewAll({pass,indexHtml:index,pageFetch:async url=>{
 const model=discovered.candidates.find(x=>x.url===url)?.name;
 return {url,statusCode:200,html:example.replace('LIFEBOOK U9416NQ/CX',model)};
},pdfFetch:async url=>({valid:true,finalUrl:url,statusCode:206})});
assert.equal(all.population,148);
assert.equal(all.records.length,148);
assert.equal(all.counts.direct,148);
assert.equal(all.checkedPdfDestinations,1);
assert.equal(all.counts.held,0);
const malformed=await reviewAll({pass,indexHtml:index,pageFetch:async url=>({url,statusCode:200,html:example}),
 pdfFetch:async url=>({valid:true,finalUrl:url,statusCode:206})});
assert.equal(malformed.counts.held,147,'HTTP 200 and another model heading cannot be promoted');
console.log('Fujitsu LIFEBOOK U 148-model official source lock, positive document gates and silent-drop protection passed.');
