"use strict";
const assert=require("node:assert/strict");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
(async()=>{
  const {entries}=await runPublicLoader();
  assert.equal(entries.length,865,"Public canonical catalog must have 865 distinct entries after five reviewed redirects");
  const missing=entries.filter(e=>!(e.aliases?.ja?.length&&e.aliases?.en?.length));
  const flat=missing.map(e=>({
    id:e.id,ja:e.term?.ja,en:e.term?.en,
    aliases_ja:e.aliases?.ja||[],aliases_en:e.aliases?.en||[],
    type:e.type||"",
    description_ja:String(e.description?.ja||"").slice(0,105),
    description_en:String(e.description?.en||"").slice(0,105)
  })).sort((a,b)=>a.id.localeCompare(b.id));
  const summary={public_entries:entries.length,runtime_bilingual_aliases:entries.length-missing.length,missing_bilingual:missing.length};
  console.log("CTA_ALIAS_GAPS_SUMMARY="+JSON.stringify(summary));
  if(process.argv.includes("--verbose")) for(const e of flat)console.log("CTA_ALIAS_GAP="+JSON.stringify(e));
})().catch(error=>{console.error(error.stack);process.exitCode=1});
