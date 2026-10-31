import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {hostAllowed,validateCoveragePass} from '../scripts/coverage-pass-lib.mjs';
import {compareFinal} from '../scripts/fujitsu-lifebook-u-reconcile-publication.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);
assert.equal(v.valid,true,v.errors.join('; '));
assert.equal(v.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(v.summary.capturedPopulation,148);
assert.deepEqual(v.summary.states,{direct:148,shared:0,support_only:0,held:0});
const sourceHash=crypto.createHash('sha256').update(pass.universe.models.join('\n'),'utf8').digest('hex');
assert.equal(sourceHash,pass.universe.sourceObservation.orderedModelSha256);
const sourceLinkHash=crypto.createHash('sha256').update(pass.records.map(x=>x.model+'|'+x.manualUrl).join('\n'),'utf8').digest('hex');
assert.equal(sourceLinkHash,pass.universe.sourceObservation.orderedModelUrlSha256, 'source links must match the independent official capture');
const context=vm.createContext({window:{}});
for(const f of [
 'data/manuals.coverage-passes.js',
 'data/manuals.coverage-pass.sony-jp-alpha-e-mount.js',
 'data/manuals.coverage-pass.panasonic-jp-lumix-camera-bodies.js',
 'data/manuals.coverage-pass.apple-jp-iphone-ios26-guide-models.js',
 'data/manuals.coverage-pass.fujifilm-jp-gfx-x-camera-manual-index.js',
 'data/manuals.coverage-pass.vaio-jp-pc-start-guide.js',
 'data/manuals.coverage-pass.samsung-jp-galaxy-smartphones.js',
 'data/manuals.coverage-pass.dynabook-jp-2024-2026.js',
 'data/manuals.coverage-pass.fujitsu-lifebook-u.js'
])vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),context,{filename:f});
const rows=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_FUJITSU_LIFEBOOK_U||[]);
assert.equal(rows.length,148);
assert.equal(new Set(rows.map(x=>x.id)).size,148);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
const evidence=new Map(pass.records.map(x=>[x.model,x]));
for(const row of rows){
 const rec=evidence.get(row.model);assert.ok(rec,row.model);
 assert.equal(row.brand,'Fujitsu FMV');
 assert.equal(row.maker,'Fujitsu FMV');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.country,'Japan');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.manualKind,'manual-index');
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.equal(row.manualUrl,rec.manualUrl);
 assert.equal(row.supportUrl,rec.supportUrl);
 assert.ok(row.manualUrl.endsWith('.html'));
 assert.ok(hostAllowed(rec.primaryDocumentUrl,pass.allowedDomains));
 assert.ok(rec.primaryDocumentUrl.endsWith('.pdf'));
 assert.equal(row.evidenceUrl,rec.manualUrl);
}
assert.equal(new Set(pass.records.map(x=>x.primaryDocumentUrl)).size,78);
const batches=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(batches.includes('manuals.coverage-pass.fujitsu-lifebook-u.js'));
const combined=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(combined.length>=717,'later manufacturer batches must not break Fujitsu scope tests');
for(const [maker,count] of [['Sony',107],['Panasonic',27],['Apple',31],['Fujifilm',56],['VAIO',82],['Samsung Mobile',89],['dynabook',177],['Fujitsu FMV',148]])
 assert.equal(combined.filter(x=>x.maker===maker).length,count);
const covered=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(covered.includes('| Fujitsu FMV | 148 | expanded, scope-complete |'), 'Fujitsu own scope must remain documented regardless of unrelated maker growth');
assert.ok(covered.includes('Fujitsu FMWORLD JP business LIFEBOOK U-series Coverage-Pass'), 'Fujitsu own provenance must remain documented');
const matching={population:148,checkedPdfDestinations:78,counts:{direct:148,shared:0,support_only:0,held:0},
 records:pass.records.map(x=>({model:x.model,state:x.state,manualUrl:x.manualUrl,supportUrl:x.supportUrl,primaryDocumentUrl:x.primaryDocumentUrl}))};
assert.equal(compareFinal(pass,matching).valid,true);
matching.records[0].primaryDocumentUrl='https://www.fmworld.net/incorrect.pdf';
assert.equal(compareFinal(pass,matching).valid,false,'exact positive PDF mismatch must fail publication');
console.log('Fujitsu LIFEBOOK U 148-row publication / 717 coverage-pass runtime / all exact model evidence passed.');
