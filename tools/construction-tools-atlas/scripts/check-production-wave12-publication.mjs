#!/usr/bin/env node
// Read-only strict live Cloudflare deployment audit for Atlas Wave12 seven source-backed detail pages.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
const ROOT="https://nicheworks.app/tools/construction-tools-atlas";
const ITEMS=[
  [
    "pickaxe",
    "babc6384b8b1da00554341aac3e78522fb3fcd47",
    "つるはし",
    "Pickaxe"
  ],
  [
    "paint_roller",
    "77a00b805fe23a06d10948e26cb5a1b2551d063e",
    "ローラー",
    "Paint Roller"
  ],
  [
    "paint_brush",
    "3b76fd58afbf903f3d505d194a715349250952ed",
    "刷毛",
    "Paint Brush"
  ],
  [
    "nails",
    "3443c86316469094ff173160b5f863b1b3cb47a9",
    "釘",
    "Nails"
  ],
  [
    "ladder",
    "a9bf2747eb702e7133626c86594badb9aa03f75a",
    "はしご",
    "Ladder"
  ],
  [
    "masking_tape",
    "32b9e75d202297b1ff6332af9d44a6c6181aaf7c",
    "マスキングテープ",
    "Masking tape"
  ],
  [
    "extension_cord",
    "dd31c1f9fc625b0b6b44ae9c83238ca2d8e5d571",
    "延長コード",
    "Extension Cord"
  ]
];
const gate="atlas-wave12-20261105";
async function get(path){
 const url=ROOT+"/"+path+"?live_verify="+gate;
 const response=await fetch(url,{redirect:"follow",headers:{"user-agent":"NicheWorks-Construction-Atlas-Production-QA/2.3",accept:"*/*","cache-control":"no-cache"},signal:AbortSignal.timeout(40000)});
 assert.equal(response.status,200,"Public resource must return HTTP 200: "+path+" (got "+response.status+")");
 return Buffer.from(await response.arrayBuffer());
}
const [inventoryBytes,seoBytes,queueBytes]=await Promise.all([
 get("data/public-image-inventory-v2.3.json"),
 get("data/seo-detail-pages-v2.3.json"),
 get("data/affiliate-image-acquisition-queue-v2.3.json")
]);
const inventory=JSON.parse(inventoryBytes.toString("utf8")),seo=JSON.parse(seoBytes.toString("utf8")),queue=JSON.parse(queueBytes.toString("utf8"));
assert.equal(inventory.summary.public_entries,865,"Published public IDs must remain unchanged");
assert.ok(inventory.summary.formal_image_entries>=64,"Production formal image inventory must include Wave12");
assert.ok(inventory.summary.missing_formal_image_entries<=756,"Production missing image count must include Wave12");
assert.equal(seo.summary.public_runtime_entries,865,"SEO corpus count mismatch");
assert.ok(seo.summary.published_static_detail_pages>=55,"Production must have at least 48 static detail pages");
assert.ok(queue.summary.revenue_ready>=55&&queue.summary.awaiting_source<=375,"Production affiliate readiness must include Wave12");
const verdict=[];
for(const [id,expectedHash,ja,en] of ITEMS){
 const [htmlBytes,source,primary,thumb]=await Promise.all([
   get("entries/"+id+"/"),get("images/"+id+"/source.jpg"),get("images/"+id+"/primary.webp"),get("images/"+id+"/thumb.webp")
 ]);
 const html=htmlBytes.toString("utf8"),canonical=ROOT+"/entries/"+id+"/";
 assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),id+" live canonical missing or SPA fallback");
 assert.ok(html.includes('<meta name="robots" content="index,follow">'),id+" live page must be indexable");
 assert.ok(html.includes(ja)&&html.includes(en),id+" live bilingual subject identity missing");
 assert.ok(html.includes("/images/"+id+"/primary.webp"),id+" live article image missing");
 assert.ok(seo.entries.some(e=>e.id===id&&e.url===canonical&&e.image==="promoted"),id+" missing from SEO manifest");
 const actualHash=createHash("sha1").update(source).digest("hex");
 assert.equal(actualHash,expectedHash,id+" source SHA1 mismatch");
 assert.ok(source.length>10000&&source[0]===255&&source[1]===216&&source[2]===255,id+" source not a real JPEG");
 for(const [name,bytes] of [["primary",primary],["thumbnail",thumb]]){
   assert.ok(bytes.length>1000&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP",id+" invalid "+name+" WebP");
 }
 assert.notDeepEqual(primary,thumb,id+" primary and thumbnail duplicates");
 verdict.push({id,source_sha1:actualHash,source_bytes:source.length,primary_bytes:primary.length,thumb_bytes:thumb.length});
}
console.log("CTA_LIVE_WAVE12_PUBLICATION_PASS="+JSON.stringify({published_terms:inventory.summary.public_entries,formal_images:inventory.summary.formal_image_entries,missing_images:inventory.summary.missing_formal_image_entries,seo_pages:seo.summary.published_static_detail_pages,affiliate_ready:queue.summary.revenue_ready,pending_affiliate_images:queue.summary.awaiting_source,verified:verdict}));
