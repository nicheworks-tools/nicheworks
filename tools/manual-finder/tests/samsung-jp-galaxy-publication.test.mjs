import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/samsung/jp-galaxy-smartphone-online-manual-index.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);
assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(v.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.deepEqual(v.summary.states,{direct:85,shared:0,support_only:4,held:0});
assert.equal(v.summary.capturedPopulation,89);
assert.equal(v.summary.unreviewedCount,0);
const window={};
const context=vm.createContext({window});
for(const file of [
 'data/manuals.coverage-passes.js',
 'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
 'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
 'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
 'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
 'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js',
 'data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js'
])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context,{filename:file});
const rows=Array.from(window.MANUALFINDER_COVERAGE_PASS_SAMSUNG_JP_GALAXY||[]);
assert.equal(rows.length,89);
assert.equal(new Set(rows.map(x=>x.id)).size,89);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
const audits=new Map(pass.records.map(x=>[x.model,x]));
let direct=0,support=0;
for(const row of rows) {
 const audit=audits.get(row.model);assert.ok(audit,row.model);
 assert.equal(row.maker,'Samsung Mobile');
 assert.equal(row.brand,'Samsung Mobile');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.country,'Japan');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.ok(hostAllowed(row.supportUrl,['samsung.com']));
 assert.equal(row.supportUrl,audit.supportUrl);
 const exactSku=new URL(row.supportUrl).pathname.match(/\/model\/([^/]+)/)?.[1];
 assert.ok(exactSku);
 assert.ok(row.nameJa.includes(exactSku), 'carrier/SKU disclosure mandatory: '+row.model);
 assert.ok(row.nameEn.includes(exactSku));
 assert.ok(row.noteJa.includes('通信会社'), 'no broad carrier equivalence: '+row.model);
 if(audit.state==='direct') {
   direct++;
   assert.equal(row.manualUrl,row.supportUrl+'#downloads');
   assert.equal(row.resolutionState,'direct_manual_page');
   assert.equal(row.manualKind,'manual-index');
 } else {
   support++;
   assert.equal(audit.state,'support_only');
   assert.equal(row.manualUrl,'');
   assert.equal(row.resolutionState,'direct_model_support');
   assert.equal(row.manualKind,'support');
 }
}
assert.equal(direct,85);
assert.equal(support,4);
const batchFiles=Array.from(window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(batchFiles.includes('manuals.coverage-pass.samsung-jp-galaxy-smartphones.js'));
const merged=Array.from(window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(merged.length>=392,'later manufacturer batches must not break Samsung scope tests');
assert.equal(merged.filter(x=>x.maker==='Samsung Mobile').length,89);
assert.equal(merged.filter(x=>x.maker==='VAIO').length,82);
assert.equal(merged.filter(x=>x.maker==='Sony').length,107);
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('| Samsung Mobile | 89 | expanded, scope-complete |'), 'Samsung own scope must remain listed regardless of other pass additions');
assert.ok(coverage.includes('Samsung JP Galaxy smartphone coverage pass'), 'Samsung own provenance must remain documented');
console.log('Samsung JP Galaxy 89-row publication, carrier disclosure, and 392-row runtime reconciliation passed.');
