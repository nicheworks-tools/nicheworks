import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/dynabook/jp-announced-pc-2024-2026-official-manual-index.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);
assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(v.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(v.summary.capturedPopulation,177);
assert.deepEqual(v.summary.states,{direct:16,shared:161,support_only:0,held:0});
assert.equal(v.summary.unreviewedCount,0);
assert.deepEqual(pass.subscopes.map(s=>s.models.length),[47,32,98]);
assert.deepEqual(pass.subscopes.map(s=>s.sourceRowCount),[47,32,99]);
const sandbox={window:{}},context=vm.createContext(sandbox);
for(const name of [
 'data/manuals.coverage-passes.js',
 'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
 'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
 'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
 'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
 'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js',
 'data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js',
 'data/manuals.coverage-pass.dynabook-jp-2024-2026.js'
])vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),context,{filename:name});
const rows=Array.from(sandbox.window.MANUALFINDER_COVERAGE_PASS_DYNABOOK_JP||[]);
assert.equal(rows.length,177);
assert.equal(new Set(rows.map(x=>x.id)).size,177);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
const byModel=new Map(pass.records.map(x=>[x.model,x]));
const byManual=new Map();
for(const row of rows){
 const record=byModel.get(row.model);assert.ok(record,row.model);
 assert.equal(row.brand,'dynabook');
 assert.equal(row.maker,'dynabook');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.country,'Japan');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.equal(row.manualUrl,record.manualUrl);
 assert.equal(row.supportUrl,record.supportUrl);
 assert.equal(row.evidenceUrl,record.evidenceUrls[0]);
 assert.equal(row.sharedTarget,record.state==='shared');
 assert.equal(row.resolutionState,record.state==='shared'?'shared_manual_page':'direct_manual_page');
 assert.equal(row.manualKind,'pdf-manual');
 assert.ok(hostAllowed(row.manualUrl,['dynabook.com']));
 assert.ok(hostAllowed(row.supportUrl,['dynabook.com']));
 assert.ok(row.manualUrl.endsWith('.pdf'));
 const linked=byManual.get(row.manualUrl)||[];linked.push(row.model);byManual.set(row.manualUrl,linked);
}
assert.equal(byManual.size,53);
for(const row of rows){
 const grouped=byManual.get(row.manualUrl);
 assert.equal(row.sharedTarget,grouped.length>1,'shared classification must follow explicit identical manufacturer link');
}
const sources=Array.from(sandbox.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(sources.includes('manuals.coverage-pass.dynabook-jp-2024-2026.js'));
const merged=Array.from(sandbox.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(merged.length>=569,'later manufacturer batches must not break dynabook scope tests');
for(const [maker,n] of [['Sony',107],['Panasonic',27],['Apple',31],['Fujifilm',56],['VAIO',82],['Samsung Mobile',89],['dynabook',177]]){
 assert.equal(merged.filter(x=>x.maker===maker).length,n);
}
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('| dynabook | 177 | expanded, scope-complete |'), 'dynabook scope remains published');
assert.ok(coverage.includes('dynabook JP 2024–2026 PC official manual-index coverage pass'), 'dynabook bounded provenance remains recorded');
console.log('dynabook 177-model PDF publication and 569-row Coverage-Pass runtime fully reconciled.');
