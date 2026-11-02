import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const nodes=new Map();
const callbacks=new Map();
const ready=[];
const makeNode=id=>({
 id,value:"",textContent:"",innerHTML:"",style:{},disabled:false,dataset:{},
 classList:{toggle(){},add(){},remove(){}},
 addEventListener(type,fn){callbacks.set(id+"/"+type,fn)},
 querySelector(sel){return get(sel.replace(/^#/,""))},
 select(){},setAttribute(){},remove(){},click(){clicks++}
});
const get=id=>{if(!nodes.has(id))nodes.set(id,makeNode(id));return nodes.get(id)};
const root=get("toolRoot");
root.querySelector=sel=>get(sel.slice(1));
let copied="",clicks=0,clipboardFail=false,fallbackWorks=false;
const blobs=[],urls=[];
const sandbox=vm.createContext({
 document:{
  documentElement:{lang:"en"},
  getElementById:get,
  querySelectorAll(){return []},
  addEventListener(type,fn){if(type==="DOMContentLoaded")ready.push(fn)},
  createElement(tag){return makeNode(tag)},
  body:{appendChild(){},removeChild(){}},
  execCommand(){return fallbackWorks}
 },
 window:{},
 navigator:{language:"en-US",clipboard:{writeText:async text=>{
  if(clipboardFail)throw new Error("blocked");
  copied=text;
 }}},
 localStorage:{getItem(){return null},setItem(){}},
 Blob:class{
  constructor(parts,options){blobs.push({text:parts.join(""),type:options.type})}
 },
 URL:{createObjectURL(){urls.push("blob:test");return "blob:test"},revokeObjectURL(){}},
 setTimeout(){return 1},clearTimeout(){},console
});
vm.runInContext(source,sandbox);
ready.forEach(fn=>fn());
const fire=(id,type="click")=>{
 const cb=callbacks.get(id+"/"+type);
 assert.equal(typeof cb,"function",id+"/"+type);
 return cb();
};

assert.ok(get("kitOutput").textContent.includes("【JP】"));
assert.ok(get("kitOutput").textContent.includes("【EN】"));
assert.equal(get("downloadKitBtn").disabled,false);
get("themeInput").value="Production updates";
fire("themeInput","input");
assert.equal(get("kitOutput").textContent,"");
assert.equal(get("copyBtn").disabled,true,"stale kit must not be copied");
assert.equal(get("downloadKitBtn").disabled,true,"stale kit must not be downloaded");
await fire("copyBtn");
fire("downloadKitBtn");
assert.equal(copied,"");
assert.equal(clicks,0);

get("audienceInput").value="Engineers";
get("frequencyInput").value="weekly";
fire("generateBtnEn");
assert.ok(get("kitOutput").textContent.includes("Production updates"));
assert.ok(get("kitOutput").textContent.includes("Engineers"));
assert.ok(get("kitOutput").textContent.includes("【JP】"));
assert.ok(get("kitOutput").textContent.includes("【EN】"));
assert.equal(get("downloadKitBtnEn").disabled,false);
await fire("copyBtnEn");
assert.equal(copied,get("kitOutput").textContent);
fire("downloadKitBtnEn");
assert.equal(blobs.length,1);
assert.equal(blobs[0].text,copied);
assert.equal(blobs[0].type,"text/plain;charset=utf-8");
assert.equal(clicks,1);
get("frequencyInput").value="monthly";
fire("frequencyInput","input");
assert.equal(get("kitOutput").textContent,"");
assert.equal(get("downloadKitBtn").disabled,true);

fire("generateBtn");
clipboardFail=true;
fallbackWorks=false;
await fire("copyBtn");
assert.ok(get("kitStatus").textContent.includes("Copy failed"),
 "browser fallback returning false must not claim copy success");
fallbackWorks=true;
await fire("copyBtn");
assert.equal(get("kitStatus").textContent,"Copied.");
assert.match(source,/document\.execCommand\("copy"\) === true/);
console.log("PASS: bilingual newsletter kit, stale copy/download lock, TXT and truthful clipboard fallback");
