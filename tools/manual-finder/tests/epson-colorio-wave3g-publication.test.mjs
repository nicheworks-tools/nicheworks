import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL("coverage-passes/epson/jp-colorio-8-model-manual-ink-20261102.json",root),"utf8"));
const expected=new Map(source.records.map(x=>[x.model,x]));
assert.equal(source.reviewedCount,8);
assert.equal(expected.size,8);
assert.equal(source.counts.addedBasicTaggedAmazonPaths,8);
assert.equal(source.counts.addedCompatibilityBackedInkTaggedAmazonPaths,16);
const sandbox={window:{},URL},context=vm.createContext(sandbox);
const load=(path)=>vm.runInContext(fs.readFileSync(new URL(path,root),"utf8"),context,{filename:path});
load("data/manuals.wave3.js");
load("data/manuals.wave3.07.js");
load("affiliate-config.js");
assert.ok(Array.from(context.window.MANUALFINDER_WAVE3_BATCHES).includes("manuals.wave3.07.js"));
const actual=Array.from(context.window.MANUALFINDER_BUILD_WAVE3()).filter(x=>x.maker==="Epson");
assert.equal(actual.length,8);
assert.deepEqual(new Set(actual.map(x=>x.model)),new Set(expected.keys()));
const config=context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(config.trackingId,"nicheworks09-22");
const seen=new Set();
for(const row of actual){
 const evidence=expected.get(row.model);
 assert.ok(evidence&&row.model);
 assert.equal(row.manualUrl,evidence.officialManualUrl);
 assert.equal(row.supportUrl,evidence.officialSupportUrl);
 assert.equal(row.category,"プリンター・複合機");
 assert.equal(row.sourceType,"official");
 assert.equal(row.sourceLevel,"A");
 assert.ok(!seen.has(row.model));seen.add(row.model);
 const manual=new URL(row.manualUrl),sourceUrl=new URL(evidence.officialConsumableUrl);
 assert.equal(manual.hostname,"www.epson.jp");
 assert.equal(sourceUrl.hostname,"www.epson.jp");
 assert.match(manual.pathname,/\/support\/portal\/used\/ep-[0-9]+[a-z]+\.htm$/);
 const offerLinks=Array.from(config.getConsumableOffers(row));
 assert.equal(offerLinks.length,2,row.model+" requires both manufacturer verified ink links");
 assert.deepEqual(new Set(offerLinks.map(o=>o.query)),new Set(evidence.inkCodes.map(s=>"Epson "+s)));
 for(const offer of offerLinks){
  assert.equal(offer.sourceUrl,evidence.officialConsumableUrl);
  assert.equal(offer.verifiedAt,"2026-11-02");
  const link=new URL(offer.url);
  assert.equal(link.hostname,"www.amazon.co.jp");
  assert.equal(link.searchParams.get("tag"),"nicheworks09-22");
  assert.equal(link.searchParams.get("k"),offer.query);
 }
 const canonical=new URL(config.buildModelSearchUrl(row));
 assert.equal(canonical.searchParams.get("k"),"Epson "+row.model);
 assert.equal(canonical.searchParams.get("tag"),"nicheworks09-22");
}
const coverage=fs.readFileSync(new URL("COVERAGE.md",root),"utf8");
const affiliate=fs.readFileSync(new URL("AFFILIATE_COVERAGE.md",root),"utf8");
const spec=fs.readFileSync(new URL("SPEC.md",root),"utf8");
assert.ok(coverage.includes("**2,529 verified model/caliber rows**"));
assert.ok(coverage.includes("| Epson | 14 | expanded |"));
assert.ok(affiliate.includes("printer basic 307 = detail 300 + reviewed exclusion 7 + missing 0"));
assert.ok(spec.includes("**307 basic = 300 detail + 7 reviewed exclusions + 0 missing detail**"));
console.log("Epson Colorio Wave 3G: 8 exact official manual links, 8 Amazon model searches, 16 exact compatible ink Amazon searches passed.");
