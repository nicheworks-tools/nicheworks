#!/usr/bin/env node
// Read-only production audit of three source-reviewed GSC-focused Construction Tools Atlas pages.
import assert from "node:assert/strict";
import fs from "node:fs";
const ROOT="https://nicheworks.app/tools/construction-tools-atlas";
const ledger=JSON.parse(fs.readFileSync(new URL("../data/reviewed-editorial-five-v2.3.json",import.meta.url),"utf8"));
const rows=ledger.entries.filter(r=>r.review_state==="approved_editorial_gsc_20261105");
assert.equal(rows.length,3,"Exactly three approved editorial entries");
const gate="atlas-editorial-three-20261105";
async function fetchLive(p){
 const res=await fetch(ROOT+"/"+p+"?audit="+gate,{headers:{"cache-control":"no-cache","user-agent":"NicheWorks-Atlas-SEO-Production-QA/2.3"},signal:AbortSignal.timeout(35000),redirect:"follow"});
 assert.equal(res.status,200,"Live public HTTP 200 required: "+p+" (HTTP "+res.status+")");
 return await res.text();
}
const [corpus,manifest,loader,liveLedger]=await Promise.all([
 fetchLive("data/public-image-inventory-v2.3.json"),
 fetchLive("data/seo-detail-pages-v2.3.json"),
 fetchLive("data/quality-loader.js"),
 fetchLive("data/reviewed-editorial-five-v2.3.json")
]);
const publicInventory=JSON.parse(corpus),seo=JSON.parse(manifest),liveSource=JSON.parse(liveLedger);
assert.equal(publicInventory.summary.public_entries,865);
assert.ok(publicInventory.summary.formal_image_entries>=64);
assert.ok(seo.summary.published_static_detail_pages>=55);
assert.equal(seo.summary.public_runtime_entries,865);
assert.equal(liveSource.version,ledger.version,"Public editorial source must be current");
assert.ok(loader.includes(ledger.version),"Public JS loader must reference current editorial version");
for(const row of rows){
 const id=row.id,html=await fetchLive("entries/"+id+"/");
 const canonical=ROOT+"/entries/"+id+"/";
 assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),id+": canonical missing");
 assert.ok(html.includes('<meta name="robots" content="index,follow">'),id+": not indexable");
 assert.ok(html.includes('<title>'+row.seo.title_ja+'</title>'),id+": SEO title not deployed");
 assert.ok(html.includes('<meta name="description" content="'+row.seo.meta_description_ja+'">'),id+": SEO meta not deployed");
 for(const lang of ["ja","en"])assert.ok(html.includes('<p lang="'+lang+'">'+row.description[lang]+'</p>'),id+": "+lang+" definition not deployed");
 assert.ok(html.includes('data-affiliate-entry="'+id+'"'),id+": maintained affiliate mapping absent");
 assert.ok(html.includes('/images/'+id+'/primary.webp'),id+": formal image missing");
 const schema=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
 assert.ok(schema,id+": schema missing");
 assert.equal(JSON.parse(schema[1])[0].description,row.description.ja,id+": structured description stale");
}
console.log("CTA_LIVE_REVIEWED_EDITORIAL_THREE_PASS="+JSON.stringify({entries:rows.map(x=>x.id),public_terms:865,seo_pages:seo.summary.published_static_detail_pages,formal_images:publicInventory.summary.formal_image_entries,bilingual_definitions:6,verified_titles:3,verified_meta:3}));
