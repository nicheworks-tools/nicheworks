import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('coverage-passes/epson/jp-colorio-wave3i-9-legacy-models-20261102.json', root), 'utf8'));
assert.equal(manifest.records.length, 9);
assert.deepEqual(manifest.counts, { officialManualModels: 9, newBasicTaggedModelSearches: 9, newVerifiedTaggedInkSearches: 18 });
const expected = new Map(manifest.records.map(x=>[x.model,x]));
assert.equal(expected.size, 9);
const sandbox = { window: {}, URL };
const ctx = vm.createContext(sandbox);
function load(path) { vm.runInContext(fs.readFileSync(new URL(path, root), 'utf8'), ctx, { filename: path }); }
load('data/manuals.wave3.js');
load('data/manuals.wave3.09.js');
load('affiliate-config.js');
assert.ok(Array.from(ctx.window.MANUALFINDER_WAVE3_BATCHES).includes('manuals.wave3.09.js'));
const rows = Array.from(ctx.window.MANUALFINDER_BUILD_WAVE3()).filter(x=>x.maker==='Epson');
assert.equal(rows.length, 9);
assert.deepEqual(new Set(rows.map(x=>x.model)),new Set(expected.keys()));
const config=ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(config.trackingId, 'nicheworks09-22');
for(const row of rows) {
 const evidence = expected.get(row.model);
 assert.ok(evidence, 'unreviewed model '+row.model);
 assert.equal(row.sourceType,'official');
 assert.equal(row.sourceLevel,'A');
 assert.equal(row.category,'プリンター・複合機');
 assert.equal(row.manualUrl,evidence.manualUrl);
 assert.equal(row.supportUrl,evidence.supportUrl);
 assert.equal(row.resolutionState,'direct_manual_page');
 assert.equal(new URL(row.manualUrl).hostname,'www.epson.jp');
 const search=new URL(config.buildModelSearchUrl(row));
 assert.equal(search.hostname,'www.amazon.co.jp');
 assert.equal(search.searchParams.get('tag'),'nicheworks09-22');
 assert.equal(search.searchParams.get('k'),'Epson '+row.model);
 const offers=Array.from(config.getConsumableOffers(row));
 assert.equal(offers.length,2,'expected two manufacturer-evidenced ink SKUs: '+row.model);
 assert.deepEqual(new Set(offers.map(x=>x.query)),new Set(evidence.inkCodes.map(x=>'Epson '+x)));
 for(const offer of offers){
  assert.equal(offer.sourceUrl,evidence.consumablesUrl);
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
console.log('Epson Colorio Wave 3I: nine exact official manual entries, nine tagged model searches, eighteen verified SKU search links passed.');
