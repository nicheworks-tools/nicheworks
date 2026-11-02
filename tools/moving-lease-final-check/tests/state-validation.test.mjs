import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const injected=source.trimEnd().slice(0,-5)+
 '\n  globalThis.__test = {fmt,ctx,clearChecks,reset};\n})();';
const listeners=new Map();
const nodes=new Map();
const newNode=(id)=>({
 id,value:"",textContent:"",hidden:false,style:{},disabled:false,
 addEventListener(type,fn){listeners.set(id+"/"+type,fn)},
});
const getNode=id=>{
 if(!nodes.has(id))nodes.set(id,newNode(id));
 return nodes.get(id);
};
let onReady;
const local=new Map();
const doc={
 addEventListener(type,fn){if(type==="DOMContentLoaded")onReady=fn},
 getElementById:getNode,
 createElement(tag){return newNode(tag)}
};
const ctx=vm.createContext({
 document:doc,console,window:{print(){}},Blob,URL,
 localStorage:{
  getItem(k){return local.get(k)||null},
  setItem(k,v){local.set(k,String(v))},
  removeItem(k){local.delete(k)}
 },
 setTimeout(){return 1},clearTimeout(){},
});
vm.runInContext(injected,ctx);
const api=ctx.__test;
for(const invalid of ["2026-02-29","2026-02-31","2026-04-31","not-a-date","2026-2-1","2026-00-01","2026-13-01"]){
 assert.equal(api.fmt(invalid),"","invalid date was incorrectly accepted: "+invalid);
}
for(const valid of ["2024-02-29","2026-11-20","2026-12-31"]){
 assert.equal(api.fmt(valid),valid);
}

local.set("nw_moving_final_last_v1",JSON.stringify({dateStr:"2026-11-20",homeType:"rental"}));
const savedKey="nw_moving_final_v1:2026-11-20:rental";
local.set(savedKey,JSON.stringify({r1:true,r2:true}));
onReady();
assert.equal(getNode("moveDate").value,"2026-11-20");
assert.equal(getNode("homeType").value,"rental");
getNode("result").hidden=false;
getNode("taskList").textContent="existing checklist";
getNode("progressText").textContent="2 / 13 完了";

listeners.get("btnDeleteLastData/click")();
assert.equal(local.has(savedKey),false,"delete previous condition must delete its real checkbox state");
assert.equal(local.has("nw_moving_final_last_v1"),false,"last pointer must also be removed");
assert.equal(getNode("result").hidden,true,"stale completed checkmarks must be hidden");
assert.equal(getNode("taskList").textContent,"");
assert.equal(getNode("progressText").textContent,"0 / 0 完了");

// A confirm click for condition A cannot accidentally clear condition B.
getNode("moveDate").value="2026-11-20";
getNode("homeType").value="rental";
local.set(savedKey,'{"r1":true}');
api.clearChecks();
assert.equal(local.has(savedKey),true);
getNode("moveDate").value="2026-11-21";
const other="nw_moving_final_v1:2026-11-21:rental";
local.set(other,'{"r1":true}');
api.clearChecks();
assert.equal(local.has(other),true,"changing the condition requires a fresh confirmation");
assert.equal(local.has(savedKey),true,"another condition must not be deleted");
getNode("moveDate").value="2026-02-31";
assert.equal(api.ctx(),null,"invalid date cannot be used as a saved-state key");
api.reset();
assert.equal(getNode("btnClear").textContent,"チェック全解除");
console.log("PASS: Moving final valid dates, actual saved-state deletion and condition-scoped confirmation");
