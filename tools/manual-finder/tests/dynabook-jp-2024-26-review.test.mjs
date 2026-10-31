import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectYear} from '../scripts/dynabook-jp-official-index-probe.mjs';
import {reconcileOfficialRows,review} from '../scripts/dynabook-jp-2024-26-review.mjs';
import {validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/dynabook/jp-announced-pc-2024-2026-official-manual-index.json',import.meta.url),'utf8'));
const valid=validateCoveragePass(pass);
assert.equal(valid.valid,true,valid.errors.join('; '));
assert.equal(pass.status,'reviewing');
assert.equal(valid.completionReady,false);
assert.equal(pass.universe.models.length,177);
assert.deepEqual(pass.subscopes.map(x=>x.models.length),[47,32,98]);
assert.deepEqual(pass.subscopes.map(x=>x.sourceRowCount),[47,32,99]);
assert.equal(new Set(pass.universe.models).size,177);

function syntheticPage(scope){
 let sourceRows=[...scope.models];
 if(scope.id.endsWith('2026')){
  const i=sourceRows.indexOf('dynabook B86/PA');
  assert.ok(i>0);sourceRows.splice(i,0,'dynabook B86/PA');
 }
 const html='<table><tr><th>製品名</th><th>発表日</th><th>マニュアルPDF</th></tr>'+
 sourceRows.map(name=>'<tr><td>'+name+'</td><td>1月22日</td><td><table><tr><td><a href="https://dynabook.com/c/manual/common.pdf">取扱説明書[999KB]</a></td></tr></table></td></tr>').join('')+
 '</table>';
 return inspectYear(html,Number(scope.id.slice(-4)),scope.sourceUrl);
}
const pages=pass.subscopes.map(syntheticPage);
const pop=reconcileOfficialRows(pages,pass);
assert.equal(pop.grouped.size,177);
assert.equal(pop.duplicateSourceRows.length,1);
assert.equal(pop.duplicateSourceRows[0].model,'dynabook B86/PA');
const result=await review({pages,pass,pdfProbe:async url=>({valid:true,finalUrl:url,statusCode:206,contentType:'application/pdf'})});
assert.equal(result.records.length,177);
assert.equal(result.sourceRows,178);
assert.equal(result.counts.shared,177);
assert.equal(result.counts.held,0);
assert.equal(result.checkedPdfCount,1);
assert.equal(result.heldModels.length,0);
assert.equal(result.records.every(x=>x.manualUrl==='https://dynabook.com/c/manual/common.pdf'),true);
const drift=structuredClone(pages);
drift[1].tableResults[0].rows[0].name='dynabook FAKED-MODEL';
assert.throws(()=>reconcileOfficialRows(drift,pass),/order drift/);
const bad=structuredClone(pages);
bad[0].tableResults[0].rows[0].manualLinks=[{url:'https://example.com/steal.pdf',label:'取扱説明書'}];
const badReview=await review({pages:bad,pass,pdfProbe:async url=>({valid:true,finalUrl:url}),productProbe:async()=>({valid:false})});
assert.ok(badReview.counts.held>=1,'unofficial destination must not become published PDF');
console.log('dynabook 178-source-row / 177 canonical-model fail-closed tests passed.');
