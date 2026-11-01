import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL("coverage-passes/brother/jp-mfcj-8-printer-manual-ink-20261102.json",root),"utf8"));
const expected=["MFC-J4950DN","MFC-J7110CDW","MFC-J7210CDW","MFC-J7310CDW","MFC-J7510CDW","MFC-J7610CDW","MFC-J742DN","MFC-J742DWN"];
assert.deepEqual(manifest.records.map(x=>x.model),expected);
assert.equal(manifest.records.length,8);
assert.deepEqual(manifest.counts,{direct:6,shared:2,support_only:0,held:0,verifiedInkOfferPaths:16});
assert.equal(new Set(expected).size,8);
const context=vm.createContext({window:{},URL});
function load(path){vm.runInContext(fs.readFileSync(new URL(path,root),"utf8"),context,{filename:path})}
load("data/manuals.wave3.js");
load("data/manuals.wave3.06.js");
load("affiliate-config.js");
const batches=Array.from(context.window.MANUALFINDER_WAVE3_BATCHES);
assert.ok(batches.includes("manuals.wave3.06.js"),"Wave 3F must be registered in live JS loader");
const live=Array.from(context.window.MANUALFINDER_BUILD_WAVE3()).filter(x=>expected.includes(x.model)&&x.maker==="Brother");
assert.equal(live.length,8,"exactly eight new published Brother canonical model entries");
const config=context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(config.trackingId,"nicheworks09-22");
assert.equal(config.enabled,true);
for(const row of live){
 const source=manifest.records.find(e=>e.model===row.model);
 assert.ok(source,"must be in manufacturer reviewed manifest");
 assert.equal(row.manualUrl,source.manualUrl);
 assert.equal(row.supportUrl,"https://support.brother.co.jp/j/b/productsearch.aspx?c=jp&content=ml&lang=ja");
 assert.equal(row.category,"プリンター・複合機");
 assert.equal(row.sourceType,"official");
 assert.equal(row.sourceLevel,"A");
 assert.equal(row.sharedTarget,source.state==="shared");
 assert.equal(row.resolutionState,source.state==="shared"?"shared_manual_page":"direct_manual_page");
 assert.equal(new URL(row.manualUrl).hostname,"support.brother.co.jp");
 const basic=new URL(config.buildModelSearchUrl(row));
 assert.equal(basic.searchParams.get("tag"),"nicheworks09-22");
 assert.equal(basic.searchParams.get("k"),"Brother "+row.model);
 const offers=Array.from(config.getConsumableOffers(row));
 assert.equal(offers.length,2,row.model+" must have both official ink search handoffs");
 assert.deepEqual(offers.map(x=>x.query),source.offers.map(x=>"Brother "+x));
 for(const offer of offers){
  assert.equal(new URL(offer.url).hostname,"www.amazon.co.jp");
  assert.equal(new URL(offer.url).searchParams.get("tag"),"nicheworks09-22");
  assert.equal(offer.sourceUrl,source.sourceUrl);
 }
}
const docs=fs.readFileSync(new URL("AFFILIATE_COVERAGE.md",root),"utf8");
assert.ok(docs.includes("printer basic 299 = detail 292 + reviewed exclusion 7 + missing 0"));
const inventory=fs.readFileSync(new URL("COVERAGE.md",root),"utf8");
assert.ok(inventory.includes("**2,521 verified model/caliber rows**"));
console.log("Brother MFC-J Wave 3F: 8 official user-guide entries, 8 tagged model searches, 16 official ink handoffs validated.");
