"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
(async()=>{
 const runtime=await runPublicLoader();
 const overlay=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","definition-promotions-v2.3.json"),"utf8"));
 assert.equal(overlay.schema,"cta-definition-promotions-v2.3");
 assert.equal(overlay.entries.length,144,"144 individually identified public canonical definitions expected");
 const rows=new Map(overlay.entries.map(row=>[row.id,row]));
 const reviewed=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","reviewed-editorial-five-v2.3.json"),"utf8"));
 assert.equal(reviewed.schema,"cta-reviewed-editorial-five-v2.3");
 assert.equal(reviewed.entries.length,5);
 const allowed=new Map();
 for(const patch of reviewed.entries){
  if(patch.review_state!=="approved_editorial_gsc_20261105")continue;
  assert(!allowed.has(patch.id),"Repeated reviewed editorial ID");
  allowed.set(patch.id,patch);
 }
 assert.equal(allowed.size,5,"All five source-guarded editorial reviews required");

 assert.equal(rows.size,144,"duplicate promoted canonical id");
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
   const newer=allowed.get(id);
   if(newer){
    assert.equal(newer.expected_description.ja,patch.definition_ja,id+": editorial original Japanese source changed");
    assert.equal(newer.expected_description.en,patch.definition_en,id+": editorial original English source changed");
    assert.equal(ja,newer.description.ja,id+": reviewed Japanese source differs");
    assert.equal(en,newer.description.en,id+": reviewed English source differs");
    assert.equal(entry.meta?.reviewed_editorial_version,reviewed.version,id+": editorial provenance lost");
   }else{
    assert.equal(ja,patch.definition_ja,id+": promoted Japanese source differs");
    assert.equal(en,patch.definition_en,id+": promoted English source differs");
   }
   assert(entry.summary?.ja || entry.summary_ja,id+": concise browse summary lost");
   assert.equal(entry.meta?.definition_promotion_version,overlay.version,id+": provenance lost");
   promoted.push(id);
  }
 }
 assert.equal(ids.size,865,"public canonical set must remain 865");
 assert.equal(maintained.length,511,"active compact canonical count changed");
 assert.equal(promoted.length,144,"definition overlay is missing active targets");
 assert.equal(pending.length,0,"still short despite maintained explanatory source: "+pending.join(", "));
 assert.equal(runtime.diagnostics.definitionPromotionsApplied,144,"loader did not apply all definitions");
 assert.equal(runtime.diagnostics.definitionPromotionsSourceDrift,0,"definition source was changed unexpectedly");
 assert.equal(runtime.diagnostics.definitionPromotionsMissingTargets,0,"overlay targets nonpublic id");
 assert.equal(runtime.diagnostics.definitionPromotionsProblems.length,0,"definition overlay reports validation problems: "+runtime.diagnostics.definitionPromotionsProblems.join(", "));
 console.log("Construction Atlas dictionary substantive source: PASS "+JSON.stringify({
  publicCanonicals:ids.size,maintainedCompactCanonicals:maintained.length,
  promotedSourceBackedDefinitions:promoted.length,remainingShortWithRichNotes:pending.length
 }));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
