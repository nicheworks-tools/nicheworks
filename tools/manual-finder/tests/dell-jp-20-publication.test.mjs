import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';

const root = new URL('../', import.meta.url);
const pass = JSON.parse(fs.readFileSync(new URL('coverage-passes/dell/jp-20-model-manual-index-20261103.json',root),'utf8'));
const gate = validateCoveragePass(pass);
assert.equal(gate.valid,true,gate.errors.join('; '));
assert.equal(gate.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(gate.summary.capturedPopulation,20);
assert.equal(gate.summary.unreviewedCount,0);
assert.deepEqual(gate.summary.states,{direct:20,shared:0,support_only:0,held:0});
assert.deepEqual(pass.reconciliation,{captured:20,direct:20,shared:0,support_only:0,held:0,public:20});
assert.equal(new Set(pass.universe.sourceUrls).size,20);
const expected=new Map(pass.records.map(x=>[x.model,x]));
assert.equal(expected.size,20);
for(const record of pass.records){
 assert.ok(record.verifiedDocumentTitle.includes(record.model.split(' ')[0]),record.model);
 assert.equal(record.state,'direct');
 assert.ok(record.evidenceUrls.includes(record.manualUrl));
 assert.equal(record.supportUrl,record.manualUrl);
 assert.ok(hostAllowed(record.manualUrl,['dell.com']));
 const u=new URL(record.manualUrl);
 assert.equal(u.hostname,'www.dell.com');
 assert.match(u.pathname,/^\/support\/product-details\/ja-jp\/product\/[^/]+\/resources\/manuals$/);
}
const ctx=vm.createContext({window:{},URL});
for(const name of ['data/manuals.coverage-passes.js','data/manuals.coverage-pass.dell-jp-20.js','affiliate-config.js']){
 vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),ctx,{filename:name});
}
assert.ok(Array.from(ctx.window.MANUALFINDER_COVERAGE_PASS_BATCHES).includes('manuals.coverage-pass.dell-jp-20.js'));
const rows=Array.from(ctx.window.MANUALFINDER_BUILD_COVERAGE_PASSES()).filter(x=>x.maker==='Dell');
assert.equal(rows.length,20);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.universe.models));
assert.equal(new Set(rows.map(x=>x.id)).size,20);
const affiliate=ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
for(const row of rows){
 const found=expected.get(row.model);
 assert.ok(found);
 assert.equal(row.brand,'Dell');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.verifiedAt,'2026-11-03');
 assert.equal(row.manualUrl,found.manualUrl);
 assert.equal(row.supportUrl,found.supportUrl);
 assert.equal(row.evidenceUrl,found.manualUrl);
 assert.equal(row.manualKind,'manual-index');
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(row.sharedTarget,false);
 const modelSearch=new URL(affiliate.buildModelSearchUrl(row));
 assert.equal(modelSearch.hostname,'www.amazon.co.jp');
 assert.equal(modelSearch.searchParams.get('tag'),'nicheworks09-22');
 assert.equal(modelSearch.searchParams.get('k'),'Dell '+row.model);
 assert.equal(affiliate.getConsumableOffers(row).length,0,'no unsupported battery or charger claims');
 assert.ok(row.noteJa.includes('マニュアル一覧'));
 assert.ok(row.noteEn.includes('manual index'));
}
const variant=rows.find(x=>x.model==='Inspiron 15 3530');
assert.ok(variant.noteJa.includes('USB Type-C'));
assert.ok(variant.noteEn.includes('non-Type-C'));
const coverage=fs.readFileSync(new URL('COVERAGE.md',root),'utf8');
assert.ok(coverage.includes('**2,598 verified model/caliber rows**'));
assert.ok(coverage.includes('| **Total** | **2,598** |'));
assert.ok(coverage.includes('| Dell | 20 | expanded'));
assert.ok(coverage.includes('| 10 | Dell | **expanded — 20**'));
const jp=fs.readFileSync(new URL('index.html',root),'utf8');
const en=fs.readFileSync(new URL('en/index.html',root),'utf8');
assert.ok(jp.includes('app.paged.js?v=mf-lenovo13-20261103a'));
assert.ok(en.includes('app.paged.js?v=mf-lenovo13-20261103a'));
const runtime=fs.readFileSync(new URL('app.paged.js',root),'utf8');
assert.ok(runtime.includes('mf-lenovo13-20261103a'));
console.log('Dell Japan bounded first pass: 20 exact official manual indexes + 20 tagged model searches, zero inferred accessories, docs and bilingual runtime passed.');
