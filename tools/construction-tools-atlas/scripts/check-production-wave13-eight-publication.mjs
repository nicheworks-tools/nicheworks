#!/usr/bin/env node
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
// Read-only live production gate for the eight source-reviewed Atlas Wave13 details.
const ROOT="https://nicheworks.app/tools/construction-tools-atlas";
const EXPECTED=[
  [
    "anchor_bolt",
    "16249a4282e59cd9ced009dbc8492db406192a2d"
  ],
  [
    "bolt_nut",
    "bf57183a7f8db505d8451d61f18d922262be9dac"
  ],
  [
    "concrete_mixer",
    "ceb610da346c12ea4aed592adbece84dbc5742f2"
  ],
  [
    "fish_tape",
    "cc1591fbc2f811d00cb667a7e28d1a76093b09d5"
  ],
  [
    "generator",
    "aa091cdc53fc228de1dea72aae2f53f646aa6bd1"
  ],
  [
    "heat_gun",
    "6df3047dedda6a3e5b01fec744fbaf8053bd2de6"
  ],
  [
    "hole_saw",
    "4999c894ea6e61ed1f877cb0848f4497ae09ba31"
  ],
  [
    "plumb_bob",
    "0d4ebc6eaf339dd350a8444efa4891c18537b4e5"
  ]
];
const gate="atlas-wave13-20261106";
async function fetchBytes(file){
 const response=await fetch(ROOT+"/"+file+"?live_verify="+gate,{redirect:"follow",headers:{"user-agent":"NicheWorks-Atlas-ProductionQA/2.3","cache-control":"no-cache"},signal:AbortSignal.timeout(40000)});
 assert.equal(response.status,200,file+" must be HTTP 200");
 return Buffer.from(await response.arrayBuffer());
}
const [invBytes,seoBytes,queueBytes]=await Promise.all([
 fetchBytes("data/public-image-inventory-v2.3.json"),
 fetchBytes("data/seo-detail-pages-v2.3.json"),
 fetchBytes("data/affiliate-image-acquisition-queue-v2.3.json")
]);
const inv=JSON.parse(invBytes.toString("utf8")),seo=JSON.parse(seoBytes.toString("utf8")),queue=JSON.parse(queueBytes.toString("utf8"));
assert.equal(inv.summary.public_entries,865,"public dictionary size changed");
assert.ok(inv.summary.formal_image_entries>=72,"Wave13 formal images not published");
assert.ok(inv.summary.missing_formal_image_entries<=748,"Wave13 image backlog not updated");
assert.ok(seo.summary.published_static_detail_pages>=63,"Wave13 static details not published");
assert.equal(seo.summary.public_runtime_entries,865,"SEO dictionary size changed");
assert.ok(queue.summary.revenue_ready>=63&&queue.summary.awaiting_source<=367,"Wave13 affiliate readiness not published");
const verified=[];
for(const [id,pin] of EXPECTED){
 const [htmlBytes,source,primary,thumb]=await Promise.all([
  fetchBytes("entries/"+id+"/"),fetchBytes("images/"+id+"/source.jpg"),
  fetchBytes("images/"+id+"/primary.webp"),fetchBytes("images/"+id+"/thumb.webp")
 ]);
 const html=htmlBytes.toString("utf8"),canonical=ROOT+"/entries/"+id+"/";
 assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),id+" canonical not deployed");
 assert.ok(html.includes('<meta name="robots" content="index,follow">'),id+" entry not indexable");
 assert.ok(html.includes("/images/"+id+"/primary.webp"),id+" formal image not referenced");
 assert.ok(html.includes('data-affiliate-entry="'+id+'"'),id+" retained affiliate mapping missing");
 assert.ok(seo.entries.some(x=>x.id===id&&x.url===canonical&&x.image==="promoted"),id+" SEO manifest mismatch");
 const sha1=createHash("sha1").update(source).digest("hex");
 assert.equal(sha1,pin,id+" original SHA1 changed");
 assert.ok(source.length>10000&&source[0]===255&&source[1]===216&&source[2]===255,id+" original JPEG invalid");
 for(const [label,bytes] of [["primary",primary],["thumbnail",thumb]])
  assert.ok(bytes.length>1000&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP",id+" "+label+" WebP invalid");
 assert.notDeepEqual(primary,thumb,id+" derivative and thumbnail must be distinct");
 verified.push({id,source_sha1:sha1,original_bytes:source.length,primary_bytes:primary.length,thumbnail_bytes:thumb.length});
}
for(const id of ["crimping_tool","pvc_pipe"])assert.ok(!seo.entries.some(x=>x.id===id),id+" rejected image must not be in SEO cohort");
console.log("CTA_WAVE13_EIGHT_PRODUCTION_PASS="+JSON.stringify({public_terms:inv.summary.public_entries,formal_images:inv.summary.formal_image_entries,seo_pages:seo.summary.published_static_detail_pages,affiliate_ready:queue.summary.revenue_ready,awaiting_source:queue.summary.awaiting_source,verified}));
