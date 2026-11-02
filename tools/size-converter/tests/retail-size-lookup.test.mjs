import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const injected=source.trimEnd().slice(0,-5)+
  '\n  globalThis.__test = { normalizeSize, parseSizeEntry, findSizeIndex, rows, els };\n})();';
const elements=new Map();
const doc={
 readyState:"loading",documentElement:{lang:"en"},
 addEventListener(){},
 getElementById(id){
  if(!elements.has(id)) elements.set(id,{value:"",style:{},dataset:{},
    appendChild(){},replaceChildren(){},addEventListener(){},
    classList:{toggle(){},add(){},remove(){}}});
  return elements.get(id);
 },
 querySelectorAll(){return []},
};
const ctx=vm.createContext({document:doc,navigator:{language:"en"},localStorage:{getItem(){return null},setItem(){}},console});
vm.runInContext(injected,ctx);
const {normalizeSize,parseSizeEntry,findSizeIndex,els,rows}=ctx.__test;

for(const literal of ["8 1/2","8-1/2","8½","８ １／２","８．５","8,5","8.5"]){
 assert.equal(normalizeSize(literal),"8.5","normalization: "+literal);
}
assert.equal(normalizeSize("2–4"),"2-4","displayed women's size ranges retained");
assert.equal(normalizeSize("26.5 cm"),"26.5");
assert.equal(normalizeSize("3XL"),"3XL");
assert.equal(normalizeSize("8 3/4"),"83/4","unsupported fraction must not be invented");
assert.equal(parseSizeEntry("ＵＳ ８½").system,"us");
assert.equal(normalizeSize(parseSizeEntry("ＵＳ ８½").value),"8.5");
assert.equal(parseSizeEntry("EU: 42").system,"eu");

els.category.value="shoes";els.gender.value="men";els.base.value="us";
assert.equal(findSizeIndex("us","8 1/2"),9);
assert.equal(findSizeIndex("us","８½"),9);
assert.equal(findSizeIndex("jp","26.5"),9);
assert.equal(findSizeIndex("us","8 3/4"),-1,"never interpolate a missing shoe size");
assert.equal(findSizeIndex("eu","42"),9);

els.category.value="clothing";els.gender.value="women";
assert.equal(rows().length,6);
for(const n of ["2","3","4"])assert.equal(findSizeIndex("us",n),1);
for(const n of ["34","35","36"])assert.equal(findSizeIndex("eu",n),1);
assert.equal(findSizeIndex("us","17"),-1);
assert.equal(findSizeIndex("eu","54"),-1);
assert.equal(findSizeIndex("us","3.5"),-1,"ranges only accept displayed whole size inputs");
assert.equal(findSizeIndex("us","0"),0,"exact rows remain exact");

els.category.value="clothing";els.gender.value="men";
assert.equal(findSizeIndex("us","4"),-1,"men's alpha clothing does not inherit women's numeric ranges");
els.category.value="shoes";els.gender.value="men";
assert.equal(findSizeIndex("us","4"),0,"men's shoe US 4 stays chart-specific");
els.gender.value="women";
assert.equal(findSizeIndex("us","4"),0,"women's shoe US 4 stays chart-specific");
assert.equal(findSizeIndex("zzz","8.5"),-1);

assert.doesNotMatch(source,/fetch\(/,"size normalization remains local");
console.log("PASS: Size Converter half-size retail text, women's displayed numeric ranges, and strict chart boundaries");
