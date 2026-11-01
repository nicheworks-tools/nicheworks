"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
(async()=>{
 const runtime=await runPublicLoader();
 const overlay=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","definition-promotions-v2.3.json"),"utf8"));
 assert.equal(overlay.schema,"cta-definition-promotions-v2.3");
 assert.equal(overlay.entries.length,145,"145 individually identified public canonical definitions expected");
 const rows=new Map(overlay.entries.map(row=>[row.id,row]));
 assert.equal(rows.size,145,"duplicate promoted canonical id");
 const ids=new Set(),pending=[],maintained=[],promoted=[];
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
   assert(ja.length>=80,id+": compact source JA definition is superficial");
   assert(en.length>=150,id+": compact source EN definition is superficial");
   assert(detailJa&&detailEn,id+": reviewed explanatory source missing");
  }
  if((ja.length<60&&detailJa.length>=65&&!detailJa.includes(ja))||
     (en.length<135&&detailEn.length>=125&&!detailEn.includes(en)))pending.push(id);
  if(rows.has(id)){
   const patch=rows.get(id);
   assert.equal(ja,patch.definition_ja,id+": promoted Japanese source differs");
   assert.equal(en,patch.definition_en,id+": promoted English source differs");
   assert(entry.summary?.ja || entry.summary_ja,id+": concise browse summary lost");
   assert.equal(entry.meta?.definition_promotion_version,overlay.version,id+": provenance lost");
   promoted.push(id);
  }
 }
 assert.equal(ids.size,870,"public canonical set must remain 870");
 assert.equal(maintained.length,511,"active compact canonical count changed");
 assert.equal(promoted.length,145,"definition overlay is missing active targets");
 assert.equal(pending.length,0,"still short despite maintained explanatory source: "+pending.join(", "));
 assert.equal(runtime.diagnostics.definitionPromotionsApplied,145,"loader did not apply all definitions");
 assert.equal(runtime.diagnostics.definitionPromotionsSourceDrift,0,"definition source was changed unexpectedly");
 assert.equal(runtime.diagnostics.definitionPromotionsMissingTargets,0,"overlay targets nonpublic id");
 assert.equal(runtime.diagnostics.definitionPromotionsProblems.length,0,"definition overlay reports validation problems: "+runtime.diagnostics.definitionPromotionsProblems.join(", "));
 console.log("Construction Atlas dictionary substantive source: PASS "+JSON.stringify({
  publicCanonicals:ids.size,maintainedCompactCanonicals:maintained.length,
  promotedSourceBackedDefinitions:promoted.length,remainingShortWithRichNotes:pending.length
 }));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
