import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/motorola/jp-motobu-2026-smartphone-lineup.json',import.meta.url),'utf8'));
const checked=validateCoveragePass(pass);
assert.equal(checked.valid,true,checked.errors.join('; '));
assert.equal(checked.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(checked.summary.capturedPopulation,12);
assert.deepEqual(checked.summary.states,{direct:11,shared:0,support_only:0,held:1});
assert.equal(checked.summary.unreviewedCount,0);
const held=pass.records.filter(x=>x.state==='held');
assert.equal(held.length,1);
assert.equal(held[0].model,'moto g 37 j');
assert.ok(held[0].attemptedDiscovery.length>=2);
assert.ok(held[0].reason.includes('403'));
const context=vm.createContext({window:{}});
for(const name of [
 'data/manuals.coverage-passes.js',
 'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
 'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
 'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
 'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
 'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js',
 'data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js',
 'data/manuals.coverage-pass.dynabook-jp-2024-2026.js',
 'data/manuals.coverage-pass.fujitsu-lifebook-u.js',
 'data/manuals.coverage-pass.google-pixel-jp.js',
 'data/manuals.coverage-pass.motorola-jp-lineup.js'
])vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),context,{filename:name});
const rows=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_MOTOROLA_JP||[]);
assert.equal(rows.length,11);
assert.equal(new Set(rows.map(x=>x.id)).size,11);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.records.filter(x=>x.state==='direct').map(x=>x.model)));
const evidence=new Map(pass.records.map(x=>[x.model,x]));
for(const row of rows){
 const record=evidence.get(row.model);
 assert.ok(record,row.model);
 assert.equal(record.state,'direct');
 assert.equal(row.brand,'Motorola');
 assert.equal(row.maker,'Motorola');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.country,'Japan');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.manualKind,'online-manual');
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.equal(row.manualUrl,record.manualUrl);
 assert.equal(row.supportUrl,record.supportUrl);
 assert.equal(row.evidenceUrl,record.manualUrl);
 assert.ok(hostAllowed(row.manualUrl,pass.allowedDomains));
 assert.ok(row.manualUrl.includes('/hc/') && row.manualUrl.includes('/index.html?t=index'));
 assert.ok(row.noteJa.includes(row.manualUrl.includes('/ja-jp/')?'日本語':'英語版'));
}
assert.ok(!rows.some(x=>x.model==='moto g 37 j'));
assert.ok(!rows.some(x=>x.manualUrl.includes('/hc/3737/')));
assert.equal(new Set(rows.map(x=>x.manualUrl)).size,11);
assert.ok(Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]).includes('manuals.coverage-pass.motorola-jp-lineup.js'));
const combined=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(combined.length>=766,'later manufacturer batches must not break Motorola scope tests');
assert.equal(combined.filter(x=>x.maker==='Motorola').length,11);
assert.equal(combined.filter(x=>x.maker==='Google Pixel').length,38);
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('| Motorola | 11 | expanded, scope-reviewed |'));
assert.ok(coverage.includes('Motorola Japan currently listed smartphones Coverage-Pass'));
console.log('Motorola JP exact 11-row publication, held variant safety, and combined 766-row runtime passed.');
