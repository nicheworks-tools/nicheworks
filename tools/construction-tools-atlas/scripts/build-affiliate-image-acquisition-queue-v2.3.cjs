#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..","data");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
function computeQueue(image,affiliate,content,priority,selected){
 if(image.schema!=="cta-public-image-inventory-v2.3"||affiliate.schema!=="cta-affiliate-offers-v2.3"||content.schema!=="cta-public-content-quality-v2.3"||priority.schema!=="cta-revenue-priority-policy-v2.3"||selected.schema!=="cta-affiliate-image-acquisition-wave6-v2.3")throw Error("schema mismatch");
 for(const [k,v] of Object.entries({public_image_inventory:image.version,affiliate_offers:affiliate.version,content_quality:content.version,revenue_policy:priority.version}))if(selected.source_versions[k]!==v)throw Error("source version changed: "+k);
 if(content.summary.fallback_independent_core!==image.summary.public_entries||content.summary.runtime_fallback_dependent!==0)throw Error("content-quality readiness changed");
 if(affiliate.policy?.query_source!=="maintained_canonical_mapping_only"||affiliate.policy?.free_text_forwarding!==false)throw Error("unsafe affiliate routing");
 const stages=new Map(),active=new Map();
 for(const row of image.lifecycle.rows){if(!row.id||stages.has(row.id))throw Error("duplicate public image row");stages.set(row.id,row.stage)}
 for(const offer of affiliate.offers){if(offer.status!=="active")continue;if(active.has(offer.entry_id)||!stages.has(offer.entry_id))throw Error("invalid active offer "+offer.entry_id);active.set(offer.entry_id,offer)}
 const ready=[...active.keys()].filter(id=>["promoted","not_required"].includes(stages.get(id))).length;
 const pending=[...active.keys()].filter(id=>stages.get(id)==="awaiting_source").sort((a,b)=>a.localeCompare(b,"en"));
 if(ready+pending.length!==active.size)throw Error("affiliate in-progress rows require explicit review");
 const selectedIds=selected.first_wave_ids, leads=selected.source_leads;
 if(new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>!active.has(id)))throw Error("selected ID missing from active canonical mappings / duplicated");
 if(new Set(leads.map(x=>x.entry_id)).size!==leads.length||leads.some(x=>!selectedIds.includes(x.entry_id)))throw Error("unselected/duplicate lead");
 for(const lead of leads){
  if(!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(lead.source_page)||!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(lead.source_url)||!/^https:\/\//.test(lead.license_url)||!/^[a-f0-9]{40}$/.test(lead.expected_sha1)||lead.promotion_allowed!==false||!lead.binary_review.startsWith("pending_"))throw Error("source lead provenance/hash unverified or incorrectly promoted: "+lead.entry_id);
  for(const key of ["author","license","attribution","source_filename","subject_note"])if(!String(lead[key]||"").trim())throw Error("lead lacks "+key);
 }
 const remainingSelected=selectedIds.filter(id=>pending.includes(id));
 const decisions=new Map((selected.review_decisions||[]).map(x=>[x.entry_id,x]));
 for(const [id,decision] of decisions){
  if(!selectedIds.includes(id))throw Error("unselected decision: "+id);
  if(decision.disposition==="promoted"&&stages.get(id)!=="promoted")throw Error("claimed image promotion missing: "+id);
  if(decision.disposition==="rejected_subject_focus"&&stages.get(id)!=="awaiting_source")throw Error("rejected image must not be formally promoted: "+id);
 }
 for(const [k,v] of Object.entries({active_affiliate_mappings:active.size,revenue_ready:ready,awaiting_source:pending.length,first_wave:remainingSelected.length,source_leads:leads.length}))if(selected.expected[k]!==v)throw Error("cohort drift: "+k);
 const leadSet=new Set(leads.map(x=>x.entry_id)),waveSet=new Set(remainingSelected),ids=[...remainingSelected,...pending.filter(id=>!waveSet.has(id))];
 const rows=ids.map((id,index)=>{const o=active.get(id);return{order:index+1,entry_id:id,offer_id:o.offer_id,maintained_query:o.query,image_stage:"awaiting_source",queue_group:leadSet.has(id)?"pinned_commons_source_lead":waveSet.has(id)?"selected_first_wave":"remaining_backlog",source_status:decisions.get(id)?.disposition==="rejected_subject_focus"?"rejected_visual_review_needs_replacement":leadSet.has(id)?"metadata_checked_binary_unverified":"not_sourced"};});
 return{schema:"cta-affiliate-image-acquisition-queue-v2.3",version:selected.version,sources:selected.source_versions,notice:"Execution order only. It is not a search-demand, CPC, conversion or earnings score.",summary:{active_affiliate_mappings:active.size,revenue_ready:ready,awaiting_source:pending.length,first_wave:remainingSelected.length,source_leads:leads.length,new_formally_promoted:[...decisions.values()].filter(x=>x.disposition==="promoted").length},rows};
}
try{
 const expected=computeQueue(read("public-image-inventory-v2.3.json"),read("affiliate-offers-v2.3.json"),read("public-content-quality-v2.3.json"),read("revenue-priority-policy-v2.3.json"),read("affiliate-image-acquisition-wave6-v2.3.json"));
 const output=path.join(root,"affiliate-image-acquisition-queue-v2.3.json"),contents=JSON.stringify(expected,null,2)+"\n";
 if(process.argv.includes("--write"))fs.writeFileSync(output,contents);
 else if(process.argv.includes("--check")&&(!fs.existsSync(output)||fs.readFileSync(output,"utf8")!==contents))throw Error("published acquisition queue is stale");
 console.log("Construction Atlas image-acquisition wave 6: PASS "+JSON.stringify(expected.summary));
}catch(err){console.error("Construction Atlas image-acquisition wave 6: FAIL "+err.message);process.exit(1)}
