import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/google/pixel-phone-jp-2016-2026.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);
assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(v.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(v.summary.capturedPopulation,38);
assert.deepEqual(v.summary.states,{direct:0,shared:0,support_only:38,held:0});
const context=vm.createContext({window:{}});
for(const file of [
 'data/manuals.coverage-passes.js',
 'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
 'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
 'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
 'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
 'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js',
 'data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js',
 'data/manuals.coverage-pass.dynabook-jp-2024-2026.js',
 'data/manuals.coverage-pass.fujitsu-lifebook-u.js',
 'data/manuals.coverage-pass.google-pixel-jp.js'
])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context,{filename:file});
const data=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_GOOGLE_PIXEL_JP||[]);
assert.equal(data.length,38);
assert.equal(new Set(data.map(x=>x.model)).size,38);
assert.deepEqual(new Set(data.map(x=>x.model)),new Set(pass.universe.models));
const record=new Map(pass.records.map(x=>[x.model,x]));
for(const row of data){
 const audit=record.get(row.model);assert.ok(audit,row.model);
 assert.equal(audit.state,'support_only');
 assert.equal(row.brand,'Google Pixel');
 assert.equal(row.maker,'Google Pixel');
 assert.equal(row.country,'Japan');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.manualUrl,'', 'regulatory docs must NEVER masquerade as user manuals');
 assert.equal(row.manualKind,'support');
 assert.equal(row.resolutionState,'direct_model_support');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.supportUrl,audit.supportUrl);
 assert.equal(row.evidenceUrl,audit.supportUrl);
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.ok(hostAllowed(row.supportUrl,pass.allowedDomains));
 assert.ok(/\/pixelphone\/answer\/\d+\?hl=ja$/.test(row.supportUrl));
 assert.ok(row.noteJa.includes('操作マニュアルではありません'), 'regulatory disclosure is mandatory');
}
assert.equal(new Set(data.map(x=>x.supportUrl)).size,24);
const names=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(names.includes('manuals.coverage-pass.google-pixel-jp.js'));
const combined=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(combined.length>=755);
assert.equal(combined.filter(x=>x.maker==='Google Pixel').length,38);
assert.equal(combined.filter(x=>x.maker==='Fujitsu FMV').length,148);
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('| Google Pixel | 38 | expanded, support-scope-complete |'));
assert.ok(coverage.includes('Google Pixel JP official manufacturer support scope'));
assert.ok(coverage.includes('**2,271 verified model/caliber rows**'));
assert.ok(coverage.includes('**47 of the 66 baseline brands are still generic-only**'));
console.log('Google Pixel 38 support-only rows, 24 exact manufacturer documents, no false manual claims, and public runtime passed.');
