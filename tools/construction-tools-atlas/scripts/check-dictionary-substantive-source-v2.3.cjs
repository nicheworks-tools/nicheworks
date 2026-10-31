"use strict";
const assert=require("node:assert/strict");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
(async()=>{
 const runtime=await runPublicLoader();
 const ids=new Set(),sample=[],byType={},targets=[];
 for(const entry of runtime.entries){
  const id=entry.id;assert(id&&!ids.has(id),"duplicate/invalid public canonical "+id);ids.add(id);
  const lead=entry.description?.ja||entry.description_ja||"";
  const extended=entry.detail_ja||entry.detail?.ja||"";
  const enLead=entry.description?.en||entry.description_en||"";
  const enDetail=entry.detail_en||entry.detail?.en||"";
  const ja=lead.length>0&&lead.length<60&&extended.length>=65&&!extended.includes(lead);
  const en=enLead.length>0&&enLead.length<135&&enDetail.length>=125&&!enDetail.includes(enLead);
  if(ja||en){targets.push(id);const type=entry.type||"unknown";byType[type]=(byType[type]||0)+1;if(sample.length<8)sample.push({id,ja,en});}
 }
 assert.equal(ids.size,870,"published-canonical count changed during dictionary-only presentation work");
 assert(targets.length>=200,"the existing reviewed explanatory corpus must support a material dictionary-wide improvement");
 console.log("Construction Atlas dictionary substantive source content: PASS "+JSON.stringify({publicCanonicals:ids.size,entriesWithExistingDetailToExpose:targets.length,sample}));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
