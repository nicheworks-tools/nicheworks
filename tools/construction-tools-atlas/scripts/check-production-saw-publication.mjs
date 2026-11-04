#!/usr/bin/env node
// Live production smoke: verify the previously promoted image binary and SEO route.
// This protects a publicly delivered release, not merely a successful git merge.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
const BASE="https://nicheworks.app/tools/construction-tools-atlas";
const ID="reciprocating_saw";
const EXPECTED_SOURCE_SHA1="9047f33a40e43b9467118af7f30851eda425fc04";
const BUILD="20261104-saw-publication";
async function get(relative){
 const path=relative+(relative.includes("?")?"&":"?")+"verify="+BUILD;
 const response=await fetch(BASE+"/"+path,{redirect:"follow",headers:{"user-agent":"NicheWorks-Construction-Atlas-production-QA/2.3","cache-control":"no-cache","accept":"*/*"},signal:AbortSignal.timeout(30000)});
 assert.equal(response.status,200,"Production HTTP status for "+relative+" must be 200; got "+response.status+" (final="+response.url+")");
 return {bytes:Buffer.from(await response.arrayBuffer()),mime:response.headers.get("content-type")||"",url:response.url};
}
function json(bytes,label){
 try{return JSON.parse(bytes.toString("utf8"))}catch(err){throw Error(label+" did not return parseable JSON: "+err.message)}
}
function webp(bytes,label){
 assert.ok(bytes.length>1000,label+": too small");
 assert.equal(bytes.toString("ascii",0,4),"RIFF",label+": missing RIFF header");
 assert.equal(bytes.toString("ascii",8,12),"WEBP",label+": missing WEBP header");
}
const [htmlResult,seoResult,imageInventoryResult,originalResult,primaryResult,thumbResult]=await Promise.all([
 get("entries/"+ID+"/"),
 get("data/seo-detail-pages-v2.3.json"),
 get("data/public-image-inventory-v2.3.json"),
 get("images/"+ID+"/source.jpg"),
 get("images/"+ID+"/primary.webp"),
 get("images/"+ID+"/thumb.webp")
]);
const html=htmlResult.bytes.toString("utf8");
const canonical=BASE+"/entries/"+ID+"/";
assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),"Live article must serve correct canonical URL; do not accept SPA fallback");
assert.ok(html.includes('<meta name="robots" content="index,follow">'),"Live article must be indexable");
assert.ok(html.includes("reciprocating_saw/primary.webp"),"Live article must reference the formal local image");
assert.ok(html.includes("Reciprocating Saw")&&html.includes("レシプロソー"),"Live article must retain bilingual identity");
const seo=json(seoResult.bytes,"SEO manifest");
assert.equal(seo.schema,"cta-seo-detail-pages-v2.3");
assert.equal(seo.summary.public_runtime_entries,865,"Published terms must remain at verified canonical count");
assert.ok(seo.summary.published_static_detail_pages>=45,"Production must include at least 45 static articles");
assert.ok(seo.entries.some(x=>x.id===ID&&x.image==="promoted"&&x.url===canonical),"Promoted saw entry missing from production SEO manifest");
const inv=json(imageInventoryResult.bytes,"Public image inventory");
assert.equal(inv.summary.public_entries,865,"Published image inventory must agree with canonical count");
assert.ok(inv.summary.formal_image_entries>=54,"Live formal image inventory is stale");
assert.ok(inv.summary.missing_formal_image_entries<=766,"Live missing-image count is stale");
const b=originalResult.bytes,hash=createHash("sha1").update(b).digest("hex");
assert.equal(hash,EXPECTED_SOURCE_SHA1,"Live Commons original must match pinned source SHA1");
assert.equal(b[0],255);assert.equal(b[1],216);assert.equal(b[2],255);
webp(primaryResult.bytes,"public primary");webp(thumbResult.bytes,"public thumbnail");
assert.notDeepEqual(primaryResult.bytes,thumbResult.bytes,"Primary and thumbnail cannot be identical");
console.log("CTA_LIVE_SAW_PUBLICATION_PASS="+JSON.stringify({
 canonical,public_terms:seo.summary.public_runtime_entries,seo_pages:seo.summary.published_static_detail_pages,
 formal_images:inv.summary.formal_image_entries,remaining_missing:inv.summary.missing_formal_image_entries,
 retained_source_sha1:hash,source_bytes:b.length,primary_bytes:primaryResult.bytes.length,
 thumbnail_bytes:thumbResult.bytes.length
}));
