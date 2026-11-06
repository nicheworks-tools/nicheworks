import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('coverage-passes/canon/jp-pixus-wave3l-six-manual-ink-20261103.json', root), 'utf8'));
assert.deepEqual(manifest.counts, { distinctModels: 6, officialManualPages: 6, newAmazonModelSearches: 6, manufacturerVerifiedInkOfferSearches: 12 });
assert.equal(manifest.records.length, 6);
const expected = new Map(manifest.records.map(x => [x.model, x]));
assert.equal(expected.size, 6);
const ctx = vm.createContext({ window: {}, URL });
function load(path) { vm.runInContext(fs.readFileSync(new URL(path, root), 'utf8'), ctx, { filename: path }); }
load('data/manuals.wave3.js');
load('data/manuals.wave3.12.js');
load('affiliate-config.js');
assert.ok(Array.from(ctx.window.MANUALFINDER_WAVE3_BATCHES).includes('manuals.wave3.12.js'));
const rows = Array.from(ctx.window.MANUALFINDER_BUILD_WAVE3()).filter(x => x.maker === 'Canon');
assert.equal(rows.length, 6);
assert.deepEqual(new Set(rows.map(x => x.model)), new Set(expected.keys()));
const config = ctx.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(config.trackingId, 'nicheworks09-22');
for (const row of rows) {
 const evidence = expected.get(row.model);
 assert.ok(evidence, 'Not in bounded official manifest: '+row.model);
 assert.equal(row.manualUrl, evidence.manualUrl);
 assert.equal(row.supportUrl, evidence.supportUrl);
 assert.equal(row.sourceType, 'official');
 assert.equal(row.sourceLevel, 'A');
 assert.equal(row.category, 'プリンター・複合機');
 assert.equal(row.manualKind, 'manual-index');
 assert.equal(row.resolutionState, 'direct_manual_page');
 assert.equal(row.verifiedAt, '2026-11-03');
 assert.equal(new URL(row.manualUrl).hostname, 'canon.jp');
 const modelSearch = new URL(config.buildModelSearchUrl(row));
 assert.equal(modelSearch.hostname, 'www.amazon.co.jp');
 assert.equal(modelSearch.searchParams.get('tag'), 'nicheworks09-22');
 assert.equal(modelSearch.searchParams.get('k'), 'Canon '+row.model);
 const offers = Array.from(config.getConsumableOffers(row));
 assert.equal(offers.length, 2);
 assert.deepEqual(new Set(offers.map(x=>x.query)), new Set(evidence.inkCodes.map(x=>'Canon '+x)));
 for(const offer of offers){
  const url = new URL(offer.url);
  assert.equal(url.hostname,'www.amazon.co.jp');
  assert.equal(url.searchParams.get('tag'),'nicheworks09-22');
  assert.equal(url.searchParams.get('k'),offer.query);
  assert.equal(offer.sourceUrl,evidence.consumablesUrl);
  assert.equal(offer.verifiedAt,'2026-11-03');
 }
}
const coverage = fs.readFileSync(new URL('COVERAGE.md', root), 'utf8');
const affiliate = fs.readFileSync(new URL('AFFILIATE_COVERAGE.md', root), 'utf8');
const spec = fs.readFileSync(new URL('SPEC.md', root), 'utf8');
assert.ok(coverage.includes('**2,685 verified model/caliber rows**'));
assert.ok(coverage.includes('| Canon | 155 | expanded |'));
assert.ok(coverage.includes('| **Total** | **2,685** |'));
assert.ok(affiliate.includes('| Printer records with a basic Amazon path | **343** |'));
assert.ok(affiliate.includes('printer basic 343 = detail 336 + reviewed exclusion 7 + missing 0'));
assert.ok(spec.includes('**343 basic = 336 detail + 7 reviewed exclusions + 0 missing detail**'));
console.log('Canon PIXUS Wave 3L: 6 exact manual-index URLs, 6 tagged model searches and 12 compatible ink offers passed.');
