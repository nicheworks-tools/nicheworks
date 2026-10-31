import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
import {reconcile} from '../scripts/asus-jp-vivobook-reconcile.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/asus/jp-vivobook-official-2026-product-index.json',import.meta.url),'utf8'));
const gate=validateCoveragePass(pass);
assert.equal(gate.valid,true,gate.errors.join('; '));
assert.equal(gate.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(gate.summary.capturedPopulation,35);
assert.equal(gate.summary.unreviewedCount,0);
assert.deepEqual(gate.summary.states,{direct:35,shared:0,support_only:0,held:0});
assert.equal(pass.universe.officialProducts.length,35);
assert.deepEqual(pass.universe.officialProducts.map(x=>x.model),pass.universe.models);
const digest=crypto.createHash('sha256').update(pass.universe.officialProducts.map(x=>x.model+'|'+x.productUrl+'|'+x.productId).join('\n'),'utf8').digest('hex');
assert.equal(digest,pass.universe.sourceObservation.orderedModelIdUrlSha256);
assert.equal(pass.universe.sourceObservation.firstPage,20);
assert.equal(pass.universe.sourceObservation.secondPage,15);
assert.equal(pass.universe.sourceObservation.fullPage,35);

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
 'data/manuals.coverage-pass.google-pixel-jp.js',
 'data/manuals.coverage-pass.motorola-jp-lineup.js',
 'data/manuals.coverage-pass.asus-jp-vivobook.js'
])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context,{filename:file});
const rows=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_ASUS_JP_VIVOBOOK||[]);
assert.equal(rows.length,35);
assert.equal(new Set(rows.map(x=>x.id)).size,35);
assert.equal(new Set(rows.map(x=>x.manualUrl)).size,35);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
const byModel=new Map(pass.records.map(x=>[x.model,x]));
let englishOnly=0;
for(const row of rows){
 const record=byModel.get(row.model);
 assert.ok(record,row.model);
 assert.equal(record.state,'direct');
 assert.equal(row.brand,'ASUS');
 assert.equal(row.maker,'ASUS');
 assert.equal(row.country,'Japan');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.manualKind,'manual-index');
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.sharedTarget,false);
 assert.equal(row.verifiedAt,'2026-10-31');
 assert.equal(row.manualUrl,record.manualUrl);
 assert.equal(row.supportUrl,record.supportUrl);
 assert.equal(row.evidenceUrl,record.manualUrl);
 assert.ok(hostAllowed(row.manualUrl,['asus.com']));
 assert.ok(hostAllowed(row.supportUrl,['asus.com']));
 const dest=new URL(row.manualUrl);
 assert.ok(/\/helpdesk_manual\/?$/.test(dest.pathname),'exact manual not marketing: '+row.model);
 const selected=dest.searchParams.get('model2Name');
 assert.equal(selected,record.selectedVariant);
 assert.ok(row.nameJa.includes(selected),'selected SKU not disclosed to user: '+row.model);
 assert.ok(row.nameEn.includes(selected));
 assert.ok(row.noteJa.includes('別構成'),'configuration-specific safety missing: '+row.model);
 assert.ok(row.noteEn.includes('Other variants'),'non-interchangeability missing: '+row.model);
 if(record.manualLanguage==='en'){englishOnly++;assert.ok(row.noteJa.includes('英語版'));}else assert.ok(row.noteJa.includes('日本語・英語'));
}
assert.equal(englishOnly,1);
assert.equal(pass.records.find(x=>x.manualLanguage==='en')?.model,'ASUS Vivobook 16 (X1605)');
const scripts=Array.from(context.window.MANUALFINDER_COVERAGE_PASS_BATCHES||[]);
assert.ok(scripts.includes('manuals.coverage-pass.asus-jp-vivobook.js'));
const combined=Array.from(context.window.MANUALFINDER_BUILD_COVERAGE_PASSES());
assert.ok(combined.length>=801,'later manufacturer batches must not break ASUS scope regression');
for(const [maker,expected] of [['ASUS',35],['Motorola',11],['Google Pixel',38],['Fujitsu FMV',148],['dynabook',177],['Samsung Mobile',89]]){
 assert.equal(combined.filter(x=>x.maker===maker).length,expected);
}
const coverage=fs.readFileSync(new URL('../COVERAGE.md',import.meta.url),'utf8');
assert.ok(coverage.includes('| ASUS | 35 | expanded, scope-complete |'), 'ASUS own scope must remain documented');
assert.ok(coverage.includes('ASUS Japan Vivobook official 2026 product catalog Coverage-Pass'), 'ASUS provenance must remain documented');
assert.ok(coverage.includes('| ASUS | 35 | expanded, scope-complete |'));
const reviewed={
 officialPopulation:35,manufacturerPageRows:[20,15],sourceDigest:digest,
 counts:{direct:35,shared:0,support_only:0,held:0},
 records:pass.records.map(x=>({model:x.model,state:x.state,productId:x.productId,productUrl:x.supportUrl,
  manualUrl:x.manualUrl,selectedVariant:x.selectedVariant,
  manualEvidence:{accepted:true,english:true,japanese:x.manualLanguage.includes('ja')}}))
};
assert.equal(reconcile(pass,reviewed).valid,true);
reviewed.records[0].manualUrl='https://www.asus.com/incorrect';
assert.equal(reconcile(pass,reviewed).valid,false,'even a previously accepted model must be reverified at its exact destination');
reviewed.records[0].manualUrl=pass.records[0].manualUrl;
reviewed.records[4].manualEvidence.japanese=false;
assert.equal(reconcile(pass,reviewed).valid,false,'operational manual language evidence drift must fail');
console.log('ASUS 35 exact selected variant manuals, 801 runtime Coverage-Pass rows, full source lock and live evidence reconciliation passed.');
