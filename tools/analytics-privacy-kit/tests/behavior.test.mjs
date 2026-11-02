import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const src=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const els=new Map(), handlers=new Map(), timers=new Map();
let ready,serial=0,focuses=0,downloads=0,copies=0;
const el=id=>({
 id,value:"",checked:false,textContent:"",style:{},dataset:{},
 classList:{toggle(){},add(){},remove(){}},
 addEventListener(k,fn){handlers.set(id+"/"+k,fn)},
 focus(){focuses++},click(){downloads++},select(){},remove(){}
});
const get=id=>{if(!els.has(id))els.set(id,el(id));return els.get(id)};
const document={
 documentElement:{lang:"en"},
 getElementById:get,querySelectorAll(){return []},
 addEventListener(k,fn){if(k==="DOMContentLoaded")ready=fn},
 createElement:el,body:{appendChild(){},removeChild(){}},
 execCommand(){copies++;return true}
};
const context=vm.createContext({
 document,URL,Blob,console,
 navigator:{language:"en-US",clipboard:{writeText:async()=>{copies++}}},
 localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,ms});return id},
 clearTimeout(id){timers.delete(id)}
});
vm.runInContext(src,context);
ready();
const fire=(id,event="click")=>{
 const fn=handlers.get(id+"/"+event);
 assert.equal(typeof fn,"function",id+" "+event);
 return fn();
};
const drain=()=>{
 for(const [id,{fn,ms}] of [...timers]){
  if(ms===200){timers.delete(id);fn();}
 }
};
get("langMode").value="en";
get("siteName").value="Example";
get("siteUrl").value="https://example.com";
get("useGA4").checked=true;
fire("generateBtn");
assert.ok(get("outStandard").value.includes("Google Analytics 4"));
get("siteUrl").value="not-a-url";
const initialFocus=focuses;
fire("siteUrl","input");
assert.equal(get("outShort").value,"");
assert.equal(get("outStandard").value,"");
assert.equal(get("outDetailed").value,"");
await fire("copyShortBtn");
assert.equal(copies,0);
fire("downloadBtn");
assert.equal(downloads,0);
drain();
assert.equal(focuses,initialFocus,"silent validation should not steal focus");
get("siteUrl").value="https://new.example";
fire("siteUrl","input");
drain();
assert.ok(get("outStandard").value.includes("new.example"));
get("useGA4").checked=false;
get("useClarity").checked=true;
fire("useClarity","change");
assert.equal(get("outStandard").value,"");
drain();
assert.ok(get("outStandard").value.includes("Microsoft Clarity"));
get("siteName").value="Pending";
fire("siteName","input");
fire("clearBtn");
drain();
assert.equal(get("outStandard").value,"","Reset cancels queued auto-generation");
get("siteUrl").value="bad";
fire("generateBtn");
assert.ok(focuses>initialFocus,"explicit validation can focus the invalid field");
console.log("PASS: Analytics Privacy Kit stale draft, focus and reset cancellation");
