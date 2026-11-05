#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"data/reviewed-editorial-five-v2.3.json"),"utf8"));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"data/seo-detail-pages-v2.3.json"),"utf8"));
const expected=["ball_valve","insulation","laser_level","rotary_hammer","safety_harness"];
assert.equal(data.schema,"cta-reviewed-editorial-five-v2.3");
assert.equal(data.version,"2026-11-05-gsc-five-source-guard-1");
assert.deepEqual(data.entries.map(x=>x.id).sort(),expected);
assert.equal(manifest.summary.public_runtime_entries,865);
assert.equal(manifest.summary.published_static_detail_pages,55);
assert.equal(manifest.summary.with_active_affiliate_mapping,55);
assert.equal(manifest.summary.with_promoted_image,54);
const approved=data.entries.filter(row=>row.review_state==="approved_editorial_gsc_20261105");
assert.equal(approved.length,3);
for(const row of approved){
 assert.ok(row.review_state==="approved_editorial_gsc_20261105");
 assert.ok(row.expected_description.ja.length>15&&row.expected_description.en.length>15);
 const id=row.id,html=fs.readFileSync(path.join(root,"entries",id,"index.html"),"utf8");
 const canonical="https://nicheworks.app/tools/construction-tools-atlas/entries/"+id+"/";
 assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),id+" canonical changed");
 assert.ok(html.includes('<meta name="robots" content="index,follow">'),id+" indexability changed");
 assert.ok(html.includes('<title>'+row.seo.title_ja+'</title>'),id+" reviewed title missing");
 assert.ok(html.includes('<meta name="description" content="'+row.seo.meta_description_ja+'">'),id+" reviewed meta description missing");
 for(const lang of ["ja","en"]){
  assert.ok(html.includes('<p lang="'+lang+'">'+row.description[lang]+'</p>'),id+" reviewed definition missing for "+lang);
 }
 assert.ok(!html.includes(row.expected_description.ja+'</p>'),id+" stale JA source remains");
 assert.ok(html.includes('data-affiliate-entry="'+id+'"'),id+" maintained affiliate mapping missing");
 assert.ok(manifest.entries.some(e=>e.id===id&&e.image==="promoted"&&e.affiliate==="active"),id+" revenue-ready cohort changed");
 assert.ok(html.includes('/images/'+id+'/primary.webp'),id+" reviewed image missing");
}
console.log("CTA_GSC_FIVE_EDITORIAL_PASS="+JSON.stringify({entry_ids:expected,published_terms:865,seo_pages:55,reviewed_titles:3,reviewed_ja_en_definitions:6,affiliate_links_preserved:3,canonicals_preserved:3}));
