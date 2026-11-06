import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const root=new URL('../',import.meta.url);
const pass=JSON.parse(fs.readFileSync(new URL('coverage-passes/hp/jp-pc-17-user-guide-index-20261103.json',root),'utf8'));
const gate=validateCoveragePass(pass);
assert.equal(gate.valid,true,gate.errors.join('; '));
assert.equal(gate.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(gate.summary.capturedPopulation,17);
assert.equal(gate.summary.unreviewedCount,0);
assert.deepEqual(gate.summary.states,{direct:17,shared:0,support_only:0,held:0});
assert.deepEqual(pass.reconciliation,{captured:17,direct:17,shared:0,support_only:0,held:0,public:17});
assert.equal(new Set(pass.universe.models).size,17);
assert.equal(new Set(pass.universe.sourceUrls).size,17);
assert.ok(pass.universe.sourceObservation.machineAccess.includes('HTTP 403'),'Do not conceal HP access restriction');
const evidence=new Map(pass.records.map(x=>[x.model,x]));
const ctx=vm.createContext({window:{},URL});
for(const name of ['data/manuals.coverage-passes.js','data/manuals.coverage-pass.hp-jp-pc-17.js','affiliate-config.js']){
 vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),ctx,{filename:name});
}
const registered=Array.from(ctx.window.MANUALFINDER_COVERAGE_PASS_BATCHES);
assert.ok(registered.includes('manuals.coverage-pass.hp-jp-pc-17.js'));
const rows=Array.from(ctx.window.MANUALFINDER_BUILD_COVERAGE_PASSES()).filter(x=>x.maker==='HP');
assert.equal(rows.length,17);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
assert.equal(new Set(rows.map(x=>x.id)).size,17);
const affiliate=ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
for(const row of rows){
 const e=evidence.get(row.model);assert.ok(e,row.model);
 assert.equal(e.state,'direct');
 assert.equal(e.manualKind,'manual-index');
 assert.equal(e.documentTitle.includes('ガイド'),true);
 assert.equal(row.brand,'HP');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.country,'Japan');
 assert.equal(row.verifiedAt,'2026-11-03');
 assert.equal(row.manualUrl,e.manualUrl);
 assert.equal(row.supportUrl,e.supportUrl);
 assert.equal(row.evidenceUrl,e.manualUrl);
 assert.equal(row.manualKind,'manual-index');
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.sharedTarget,false);
 assert.ok(hostAllowed(row.manualUrl,['hp.com']));
 const u=new URL(row.manualUrl);
 assert.equal(u.hostname,'support.hp.com');
 assert.match(u.pathname,/^\/jp-ja\/product\/setup-user-guides\/[^/]+\/(?:model\/)?\d+$/);
 assert.ok(row.noteJa.includes('ユーザーガイド'));
 assert.ok(row.noteEn.includes('user-guide listing'));
 assert.ok(row.linkReview.includes('403'));
 const search=new URL(affiliate.buildModelSearchUrl(row));
 assert.equal(search.hostname,'www.amazon.co.jp');
 assert.equal(search.searchParams.get('tag'),'nicheworks09-22');
 assert.equal(search.searchParams.get('k'),'HP '+row.model);
 assert.equal(affiliate.getConsumableOffers(row).length,0,'No unsupported battery/charger compatibility');
}
assert.equal(rows.filter(x=>evidence.get(x.model).scopeKind==='series').length,2);
const cov=fs.readFileSync(new URL('COVERAGE.md',root),'utf8');
assert.ok(cov.includes('**2,685 verified model/caliber rows**'));
assert.ok(cov.includes('| **Total** | **2,685** |'));
assert.ok(cov.includes('| HP | 17 | expanded, bounded |'));
assert.ok(cov.includes('| 9 | HP | **expanded — 17**'));
for(const f of ['index.html','en/index.html','app.paged.js']){
 assert.ok(fs.readFileSync(new URL(f,root),'utf8').includes('mf-dyson6-20261106a'),f+' is not cache-refreshed');
}
console.log('HP JP bounded 17: official indexed model/series manuals, HP live 403 disclosed, 17 Amazon model searches, no inferred accessories; bilingual loader passed.');
