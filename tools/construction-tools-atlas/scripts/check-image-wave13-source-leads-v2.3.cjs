#!/usr/bin/env node
"use strict";
// Offline guard for source leads only. No source download or promotion occurs here.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const data=path.resolve(__dirname,"../data");
const read=name=>JSON.parse(fs.readFileSync(path.join(data,name),"utf8"));
const leads=read("image-wave13-source-leads-v2.3.json");
const queue=read("affiliate-image-acquisition-queue-v2.3.json");
const registry=read("image-registry-v2.3.json");
const queued=new Set(queue.rows.map(x=>x.entry_id));
const promoted=new Set(registry.items.map(x=>x.entry_id));
assert.equal(leads.schema,"cta-image-wave13-source-leads-v2.3");
assert.ok(leads.items.length>=10 && leads.items.length<=15,"Wave13 source-lead count 10-15");
assert.equal(leads.policy.no_publication_from_this_file,true);
assert.equal(leads.policy.no_hotlink,true);
const seen=new Set();
for(const x of leads.items){
 assert.match(x.entry_id,/^[a-z][a-z0-9_]*$/);
 assert.ok(!seen.has(x.entry_id),"duplicate "+x.entry_id);
 seen.add(x.entry_id);
 // Do not assert historic queue counts. A future promotion may move an entry from
 // the queue to the registry, but it must never appear in both.
 assert.ok(queued.has(x.entry_id)||promoted.has(x.entry_id),x.entry_id+" missing from queue and registry");
 assert.ok(!(queued.has(x.entry_id)&&promoted.has(x.entry_id)),x.entry_id+" simultaneously queued and promoted");
 assert.match(x.source_page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.match(x.license_url,/^https:\/\//);
 assert.ok(["CC BY-SA 2.0","CC BY-SA 3.0","CC BY-SA 4.0","Public Domain"].includes(x.license));
 if(x.commons_metadata_sha1!==null)assert.match(x.commons_metadata_sha1,/^[a-f0-9]{40}$/);
 assert.equal(x.promotion_allowed,false,"source leads cannot grant publication");
 assert.equal(x.original_binary_sha1_check,"pending","only source-lead status belongs in this file");
 assert.equal(x.visual_subject_review,"pending");
 assert.equal(x.attribution_derivative_review,"pending");
}
console.log("PASS: "+leads.items.length+" isolated Wave13 source leads; no image publication or count changes");
