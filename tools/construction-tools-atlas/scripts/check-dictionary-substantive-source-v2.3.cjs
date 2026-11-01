"use strict";
const assert=require("node:assert/strict");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
(async()=>{
 const runtime=await runPublicLoader();
 const ids=new Set(),pending=[],maintained=[];
 for(const entry of runtime.entries){
  const id=entry.id;
  assert(id&&!ids.has(id),"duplicate/invalid public canonical "+id);
  ids.add(id);
  const ja=entry.description?.ja||entry.description_ja||"";
  const en=entry.description?.en||entry.description_en||"";
  const detailJa=entry.detail_ja||entry.detail?.ja||"";
  const detailEn=entry.detail_en||entry.detail?.en||"";
  if(/^q0(?:11|12|13|14|15|16|17)_/.test(id)){
   maintained.push(id);
   assert(ja.length>=80,id+": active compact source JA definition is still superficial");
   assert(en.length>=150,id+": active compact source EN definition is still superficial");
   assert(detailJa&&detailEn,id+": reviewed explanatory source missing");
  }else if((ja.length<60&&detailJa.length>=65&&!detailJa.includes(ja))||
           (en.length<135&&detailEn.length>=125&&!detailEn.includes(en))){
   pending.push({id, ja, en, detailJa, detailEn, nameJa:entry.term?.ja||"", nameEn:entry.term?.en||""});
  }
 }
 assert.equal(ids.size,870,"published-canonical count must stay fixed during definition work");
 assert.equal(maintained.length,511,"active q011-q017 canonical count changed");

 if(true){
   for(let i=0;i<pending.length;i+=8){
     console.log("CTA_PENDING_SOURCE_"+String(Math.floor(i/8)).padStart(2,"0")+"="+JSON.stringify(pending.slice(i,i+8)));
   }
 }
 console.log("Construction Atlas dictionary substantive source: PASS "+JSON.stringify({
  publicCanonicals:ids.size,maintainedCompactCanonicals:maintained.length,
  compactCanonicalsWithSubstantiveBilingualDefinitions:maintained.length,
  otherCanonicalsWithShortDefinitionsAndRichNotes:pending.length
 }));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
