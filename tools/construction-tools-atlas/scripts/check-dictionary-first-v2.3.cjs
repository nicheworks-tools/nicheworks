"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const html=read("index.html"),runtime=read("app.runtime.js"),css=read("style.css");
const loader=read("data/quality-loader.js");
for(const versioned of ["style.css?v=20261101-dictionary-first-1","app.runtime.js?v=20261101-dictionary-first-2","quality-loader.js?v=20261101-reviewed-definitions-15"])
  assert(html.includes(versioned),"production HTML still references a stale cached dictionary asset: "+versioned);
assert(loader.includes('REVIEWED_DEFINITION_SOURCE_VERSION = "20261101-reviewed-definitions-15"'),"quality loader must refresh revised dictionary sources");
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
assert(css.includes(".resultContext")&&css.includes(".dictionaryJump"),"dictionary-first list and topic controls require responsive styling");
assert(/height:auto;min-height:0;margin:10px/.test(css),"missing-image note must not occupy an empty 148px box");
new Function(runtime);
console.log("Construction Atlas dictionary-first main UI: PASS (nonblank desktop, mobile shortcuts, text before photos, category browsing, bilingual usage)");
