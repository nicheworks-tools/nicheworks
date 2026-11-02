import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('coverage-passes/epson/jp-colorio-wave3h-8-legacy-models-20261102.json',root),'utf8'));
assert.equal(source.records.length,8);
assert.equal(source.counts.publishedManualModels,8);
assert.equal(source.counts.newBasicAmazonModelSearches,8);
assert.equal(source.counts.newExactInkSkuAffiliateSearches,16);
const expected=new Map(source.records.map(row=>[row.model,row]));
assert.equal(expected.size,8,'new model keys are unique');
const sandbox={window:{},URL},ctx=vm.createContext(sandbox);
function load(name){vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),ctx,{filename:name});}
load('data/manuals.wave3.js');
load('data/manuals.wave3.08.js');
load('affiliate-config.js');
const batches=Array.from(ctx.window.MANUALFINDER_WAVE3_BATCHES||[]);
assert.ok(batches.includes('manuals.wave3.08.js'));
const published=Array.from(ctx.window.MANUALFINDER_BUILD_WAVE3()||[]).filter(row=>row.maker==='Epson');
assert.equal(published.length,8);
assert.deepEqual(new Set(published.map(r=>r.model)),new Set(expected.keys()));
const conf=ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(conf.trackingId,'nicheworks09-22');
for(const row of published){
 const e=expected.get(row.model);
 assert.ok(e,'unreviewed model '+row.model);
 assert.equal(row.category,'プリンター・複合機');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.sourceType,'official');
 assert.equal(row.manualUrl,e.manualUrl);
 assert.equal(row.supportUrl,e.manualUrl);
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(new URL(row.manualUrl).hostname,'www.epson.jp');
 const modelLink=new URL(conf.buildModelSearchUrl(row));
 assert.equal(modelLink.hostname,'www.amazon.co.jp');
 assert.equal(modelLink.searchParams.get('tag'),'nicheworks09-22');
 assert.equal(modelLink.searchParams.get('k'),'Epson '+row.model);
 const mapped=Array.from(conf.getConsumableOffers(row));
 assert.equal(mapped.length,2,'exact manufacturer ink pair for '+row.model);
 assert.deepEqual(new Set(mapped.map(x=>x.query)),new Set(e.inkCodes.map(c=>'Epson '+c)));
 for(const offer of mapped){
  assert.equal(offer.sourceUrl,e.consumablesUrl);
  assert.equal(offer.verifiedAt,'2026-11-02');
  const u=new URL(offer.url);
  assert.equal(u.hostname,'www.amazon.co.jp');
  assert.equal(u.searchParams.get('tag'),'nicheworks09-22');
  assert.equal(u.searchParams.get('k'),offer.query);
 }
}
const coverage=fs.readFileSync(new URL('COVERAGE.md',root),'utf8');
const affiliate=fs.readFileSync(new URL('AFFILIATE_COVERAGE.md',root),'utf8');
const spec=fs.readFileSync(new URL('SPEC.md',root),'utf8');
assert.ok(coverage.includes('**2,546 verified model/caliber rows**'));
assert.ok(coverage.includes('| Epson | 31 | expanded |'));
assert.ok(affiliate.includes('printer basic 324 = detail 317 + reviewed exclusion 7 + missing 0'));
assert.ok(spec.includes('**324 basic = 317 detail + 7 reviewed exclusions + 0 missing detail**'));
console.log('Epson Colorio Wave 3H: eight official manual pages, eight model Amazon searches and sixteen manufacturer-confirmed ink searches passed.');
