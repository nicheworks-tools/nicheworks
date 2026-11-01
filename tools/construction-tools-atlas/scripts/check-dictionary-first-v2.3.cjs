"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const html=read("index.html"),runtime=read("app.runtime.js"),css=read("style.css");
const loader=read("data/quality-loader.js");
for(const versioned of ["style.css?v=20261101-dictionary-ux-2","app.runtime.js?v=20261101-curated-definitions-1","quality-loader.js?v=20261102-reviewed-aliases-1"])
  assert(html.includes(versioned),"production HTML still references a stale cached dictionary asset: "+versioned);
assert(loader.includes('DEFINITION_PROMOTIONS_VERSION = "20261101-source-backed-145-1"') && loader.includes('REVIEWED_DEFINITION_SOURCE_VERSION = "20261102-reviewed-aliases-1"'),"quality loader must refresh revised dictionary sources");
assert(loader.includes("REVIEWED_DEFINITION_PACKS.has(baseName)"),"original compact definition source packs need versioned fetches");

const before=(token)=>html.indexOf(token);
assert(before('id="dictionaryJumpButtons"')>0,"quick access to actual dictionary entries must be on main page");
assert(before('id="detailDefinition"')<before('id="detailImage"'),"dictionary definition must precede any image");
assert(before('id="detailNotes"')<before('id="detailImage"'),"real tool notes must precede optional imagery");
assert(runtime.includes('else if (!isMobile())')&&runtime.includes('openDetail(starter, "none")'),"desktop must start with a real dictionary entry, without changing deep links");
assert(runtime.includes('function browseInSameContext(entry)')&&runtime.includes('inferred ? browseInSameContext(entry) : maintained'),"unlinked entries need explicitly identified category/task browsing");
assert(runtime.includes('function renderQuickStart()')&&runtime.includes('state.entryById.get(id)'),"example topics must resolve to actual loaded canonical IDs");
assert(!runtime.includes('"No image" : "画像なし"'),"do not fill most dictionary rows with a missing-photo billboard");
assert(runtime.includes('resultContext')&&runtime.includes('primaryPair(entry.detail)'),"dictionary list must show existing subject-specific notes");
assert(runtime.includes('function composeDefinition(entry)')&&runtime.includes('notes[language] = ""'),"short definitions must display existing substantive notes without duplicating them");
assert(runtime.includes('const [code, items] of [["JA", value.ja], ["EN", value.en]]'),"bilingual examples must retain language labels");
assert(runtime.includes('const reviewedNotes = preferredItems(entry.bullets)')&&runtime.includes('resultExample')&&runtime.includes('resultAliases'),"dictionary list must expose actual notes, usage examples, and aliases");
assert(runtime.includes('row.classList.add("resultRow--no-image")')&&runtime.includes('els.detailImageMissing.hidden = true'),"unreviewed images must not occupy empty thumbnail or detail slots");
assert(css.includes('.resultRow--no-image')&&css.includes('.resultSummary{display:-webkit-box;'),"image-free rows and 360px definitions must remain readable");
assert(css.includes(".resultContext")&&css.includes(".dictionaryJump"),"dictionary-first list and topic controls require responsive styling");
assert(/height:auto;min-height:0;margin:10px/.test(css),"missing-image note must not occupy an empty 148px box");

const qualityRows = [11,12,13,14,15,16,17].flatMap((batch)=>{
  const doc=JSON.parse(read("data/tools.quality-"+String(batch).padStart(3,"0")+".json"));
  assert.equal(doc.schema,"cta-compact-v1","compact pack format should be preserved");
  return doc.rows;
});
const deeplyDefined = qualityRows.filter(row=>row.dj.length>=80 && row.de.length>=150);
const explicitAliases = qualityRows.filter(row=>(row.aj||[]).length || (row.ae||[]).length);
assert(deeplyDefined.length>=450,"reviewed bilingual definitions should now be substantive in at least 450 compact entries");
assert(explicitAliases.length>=90,"subject-specific JA/EN aliases should be searchable on at least 90 compact entries");
assert(runtime.includes("if (context && lead.includes(context))"),"promoted content should not be repeated as notes");
new Function(runtime);
console.log("Construction Atlas dictionary-first main UI: PASS (nonblank desktop, mobile shortcuts, text before photos, category browsing, bilingual usage)");
