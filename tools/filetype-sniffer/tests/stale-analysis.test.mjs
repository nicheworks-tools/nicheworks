import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const src=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const nodes=new Map();
const actions=new Map();
const makeNode=(id)=>({
  id,textContent:"",innerHTML:"",value:"",style:{},dataset:{},
  classList:{add(){},remove(){}},
  addEventListener(type,fn){actions.set(id+"/"+type,fn)},
  querySelector(){return {style:{}}},
  appendChild(){},remove(){},setAttribute(){},select(){},
});
const doc={
  documentElement:{lang:"en"},
  getElementById(id){if(!nodes.has(id))nodes.set(id,makeNode(id));return nodes.get(id);},
  querySelector(){return null;},
  createElement(tag){return makeNode(tag)},
  body:{appendChild(){},removeChild(){}},
};
const ctx=vm.createContext({
  document:doc,console,DataView,Uint8Array,ArrayBuffer,
  navigator:{clipboard:null},setTimeout,clearTimeout
});
vm.runInContext(src,ctx,{filename:"filetype-sniffer/app.js"});
const run=(code)=>vm.runInContext(code,ctx);
const flush=()=>new Promise(setImmediate);
const work=[];
const file=(name,bytes)=>({
  name,size:bytes.length,
  slice(a,b){
    assert.equal(a,0);
    assert.equal(b,4096,"must read only leading signature window");
    let resolve,reject;
    const promise=new Promise((res,rej)=>{resolve=res;reject=rej});
    work.push({name,resolve:()=>resolve(Uint8Array.from(bytes).buffer),reject});
    return {arrayBuffer:()=>promise};
  }
});
const png=[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0];
const pdf=[0x25,0x50,0x44,0x46,0x2d,0x31,0x2e,0x37];
ctx.oldFile=file("old.png",png);
ctx.newFile=file("new.pdf",pdf);
run("handleFileSelection(oldFile)");
run("handleFileSelection(newFile)");
assert.equal(nodes.get("jsonOutput").textContent,"","new selection clears stale export");
assert.equal(nodes.get("resultSection").style.display,"none","new selection hides older result");
assert.equal(nodes.get("selectedFileName").textContent,"new.pdf");
work[1].resolve();await flush();
assert.equal(JSON.parse(nodes.get("jsonOutput").textContent).file.name,"new.pdf");
assert.equal(JSON.parse(nodes.get("jsonOutput").textContent).detection.detectedExt,"pdf");
work[0].resolve();await flush();
assert.equal(JSON.parse(nodes.get("jsonOutput").textContent).file.name,"new.pdf",
  "late old file result cannot override current report");
assert.equal(nodes.get("progress").style.display,"none");

ctx.toReset=file("reset.png",png);
run("handleFileSelection(toReset)");
actions.get("resetBtn/click")();
work[2].resolve();await flush();
assert.equal(run("currentFile"),null);
assert.equal(nodes.get("jsonOutput").textContent,"");
assert.equal(nodes.get("resultSection").style.display,"none");
assert.equal(nodes.get("progress").style.display,"none");
assert.equal(run("reportExportPayload('json',jsonOutput.textContent,currentSummaryText)"),null,
  "a reset must never allow report export from a late callback");

// Old errors must not overwrite a later successful read.
ctx.failFile=file("error.pdf",pdf);
ctx.successFile=file("success.png",png);
run("handleFileSelection(failFile)");
run("handleFileSelection(successFile)");
work[4].resolve();await flush();
work[3].reject(new Error("old read failure"));await flush();
assert.equal(JSON.parse(nodes.get("jsonOutput").textContent).file.name,"success.png");
assert.equal(nodes.get("warningBox").style.display,"none");
assert.ok(!src.includes("fetch("),"file bytes are read browser-locally");
console.log("PASS: file sniffer selection/reset/rerun race, bounded slice and stale exports");
