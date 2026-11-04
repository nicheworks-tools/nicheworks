import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateCoveragePass,hostAllowed} from '../scripts/coverage-pass-lib.mjs';
const root=new URL('../',import.meta.url);
const pass=JSON.parse(fs.readFileSync(new URL('coverage-passes/acer/jp-six-japanese-user-manual-pdf-groups-20261104.json',root),'utf8'));
const gate=validateCoveragePass(pass);
assert.equal(gate.valid,true,gate.errors.join('; '));
assert.equal(gate.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(gate.summary.capturedPopulation,17);
assert.equal(gate.summary.unreviewedCount,0);
assert.deepEqual(gate.summary.states,{direct:1,shared:15,support_only:0,held:1});
assert.deepEqual(pass.reconciliation,{candidateUniverse:17,direct:1,shared:15,support_only:0,held:1,published:16,verifiedOfficialPdfGroups:5,brokenPdfGroups:1});
assert.equal(pass.groups.length,5);
assert.equal(pass.universe.sourceObservation.validatedCiRunId,41773975781);
assert.equal(pass.universe.sourceObservation.bytesVerified,true);
const held=pass.records.find(x=>x.state==='held');
assert.equal(held.model,'SF713-51');
assert.ok(held.reason.includes('/error_page'));
assert.equal(held.attemptedDiscovery.length,2);
const ctx=vm.createContext({window:{},URL});
for(const name of ['data/manuals.coverage-passes.js','data/manuals.coverage-pass.acer-jp-pdf16.js','affiliate-config.js']){
 vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),ctx,{filename:name});
}
assert.ok(Array.from(ctx.window.MANUALFINDER_COVERAGE_PASS_BATCHES).includes('manuals.coverage-pass.acer-jp-pdf16.js'));
const rows=Array.from(ctx.window.MANUALFINDER_BUILD_COVERAGE_PASSES()).filter(x=>x.maker==='Acer');
assert.equal(rows.length,16);
assert.equal(new Set(rows.map(x=>x.id)).size,16);
assert.equal(new Set(rows.map(x=>x.model)).size,16);
assert.equal(new Set(rows.map(x=>x.manualUrl)).size,5);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(pass.records.filter(x=>x.state!=='held').map(x=>x.model)));
assert.equal(rows.filter(x=>x.sharedTarget).length,15);
assert.equal(rows.filter(x=>!x.sharedTarget).length,1);
assert.ok(!rows.some(x=>x.model==='SF713-51'));
const proof=new Map(pass.records.map(x=>[x.model,x]));
const affiliate=ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
for(const row of rows){
 const evidence=proof.get(row.model);
 assert.ok(evidence,'not in official source population '+row.model);
 assert.equal(row.brand,'Acer');
 assert.equal(row.category,'PC・スマホ');
 assert.equal(row.country,'Japan');
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.verifiedAt,'2026-11-04');
 assert.equal(row.manualUrl,evidence.manualUrl);
 assert.equal(row.evidenceUrl,evidence.manualUrl);
 assert.ok(hostAllowed(row.manualUrl,['global-download.acer.com']));
 assert.equal(row.sharedTarget,evidence.state==='shared');
 assert.equal(row.resolutionState,evidence.state==='shared'?'shared_manual_page':'direct_manual_page');
 assert.equal(row.manualKind,evidence.state==='shared'?'shared-user-guide-pdf':'direct-user-guide-pdf');
 assert.ok(row.noteJa.includes('日本語ユーザーマニュアル'));
 assert.ok(row.linkReview.includes('41773975781'));
 const u=new URL(affiliate.buildModelSearchUrl(row));
 assert.equal(u.hostname,'www.amazon.co.jp');
 assert.equal(u.searchParams.get('tag'),'nicheworks09-22');
 assert.equal(u.searchParams.get('k'),'Acer '+row.model);
 assert.equal(affiliate.getConsumableOffers(row).length,0,'no inferred battery, charger or other accessory fits');
}
const cov=fs.readFileSync(new URL('COVERAGE.md',root),'utf8');
assert.ok(cov.includes('**2,655 verified model/caliber rows**'));
assert.ok(cov.includes('| **Total** | **2,655** |'));
assert.ok(cov.includes('| Acer | 16 | expanded, bounded |'));
assert.ok(cov.includes('| 13 | Acer | **expanded — 16**'));
for(const p of ['index.html','en/index.html','app.paged.js']){
 assert.ok(fs.readFileSync(new URL(p,root),'utf8').includes('mf-msi6-20261104a'));
}
console.log('Acer JP publication: 5 actual Japanese PDFs / 16 models (1 direct + 15 explicitly shared), Swift7 held, tagged model searches, bilingual loader and documentation PASS.');
