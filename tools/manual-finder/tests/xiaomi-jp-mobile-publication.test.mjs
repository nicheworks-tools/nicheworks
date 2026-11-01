import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
import {reconcile} from '../scripts/xiaomi-jp-mobile-reconcile.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/xiaomi/jp-mobile-user-guide-2026.json',import.meta.url),'utf8'));
const val=validateCoveragePass(pass);
assert.equal(val.valid,true,val.errors.join('; '));
assert.equal(val.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(val.summary.capturedPopulation,60);
assert.deepEqual(val.summary.states,{direct:59,shared:0,support_only:0,held:1});
assert.equal(pass.universe.sourceObservation.totalOfficialGuideLinks,306);
assert.equal(pass.universe.sourceObservation.mobileSectionRawLinks,74);
assert.equal(pass.records.filter(x=>x.state==='direct').length,59);
const leica=pass.records.find(x=>x.model==='Leica Leitzphone powered by Xiaomi');
assert.ok(leica&&leica.state==='held'&&!leica.manualUrl);
assert.ok(leica.reason.includes('502'));
assert.ok(leica.attemptedDiscovery.length>=5);
assert.ok(leica.evidenceUrls.some(x=>x.startsWith('https://leica-camera.com/')));

const sandbox=vm.createContext({window:{}});
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
 'data/manuals.coverage-pass.google-pixel-jp.js',
 'data/manuals.coverage-pass.motorola-jp-lineup.js',
 'data/manuals.coverage-pass.asus-jp-vivobook.js',
 'data/manuals.coverage-pass.xiaomi-jp-mobile.js',
 'data/manuals.coverage-pass.canon-jp-lens.js'
])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),sandbox,{filename:file});
const rows=Array.from(sandbox.window.MANUALFINDER_COVERAGE_PASS_XIAOMI_JP_MOBILE||[]);
assert.equal(rows.length,59);
assert.equal(new Set(rows.map(x=>x.id)).size,59);
assert.equal(new Set(rows.map(x=>x.model)).size,59);
assert.equal(new Set(rows.map(x=>x.manualUrl)).size,59);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.records.filter(x=>x.state==='direct').map(x=>x.model)));
assert.ok(!rows.some(x=>x.model.includes('Leica Leitzphone')));
const records=new Map(pass.records.map(x=>[x.model,x]));
for(const row of rows){
 const e=records.get(row.model);
 assert.ok(e&&e.state==='direct');
 assert.equal(row.brand,'Xiaomi');
 assert.equal(row.maker,'Xiaomi');
 assert.equal(row.country,'Japan');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.verifiedAt,'2026-11-01');
 assert.equal(row.manualUrl,e.manualUrl);
 assert.equal(row.evidenceUrl,e.manualUrl);
 assert.equal(row.supportUrl,e.manufacturerGuidePage);
 assert.ok(hostAllowed(row.manualUrl,pass.allowedDomains),'non manufacturer PDF host '+row.model);
 assert.ok(row.manualUrl.toLowerCase().split('?')[0].endsWith('.pdf'));
 assert.ok(row.noteJa.includes('詳細な操作説明書とは限りません'),'must disclose quick start limits');
}
const names=Array.from(sandbox.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(names.includes('manuals.coverage-pass.xiaomi-jp-mobile.js'));
const all=Array.from(sandbox.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.equal(all.length,997);
assert.equal(all.filter(x=>x.maker==='Xiaomi').length,59);
assert.equal(all.filter(x=>x.maker==='ASUS').length,35);
assert.equal(all.filter(x=>x.maker==='Motorola').length,11);
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('**2,513 verified model/caliber rows**'));
assert.ok(coverage.includes('**44 of the 66 baseline brands are still generic-only**'));
assert.ok(coverage.includes('| Xiaomi | 59 | expanded, scope-reviewed |'));
const fake={
 sourceDigest:pass.universe.sourceObservation.officialIndexSha256,
 officialPopulation:60,officialTotalGuideRows:306,sourceMobileRawRows:74,
 counts:{direct:59,shared:0,support_only:0,held:1},
 records:pass.records.map(x=>({...x,pdfEvidence:x.state==='direct'?{url:x.manualUrl,pdfVersion:'%PDF-1.7'}:null}))
};
assert.equal(reconcile(pass,fake).valid,true);
fake.records[0].manualUrl='https://bad.example/test.pdf';
assert.equal(reconcile(pass,fake).valid,false,'never accept a changed manufacturer PDF destination');
console.log('Xiaomi JP 59 exact verified manufacturer PDFs, held Leica, 60-model lock and 997-row public runtime passed.');
