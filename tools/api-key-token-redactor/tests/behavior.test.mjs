import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const nodes=new Map();
const actions=new Map();
let onReady;
let fallbackAllowed=false;
const element=id=>({
 id,value:"",textContent:"",innerHTML:"",hidden:true,checked:true,
 style:{},dataset:{},
 className:"",
 classList:{toggle(){},add(){},remove(){}},
 addEventListener(type,fn){actions.set(id+"/"+type,fn)},
 focus(){},appendChild(){},remove(){},select(){},
 querySelectorAll(){return []},setAttribute(){}
});
const $=id=>{
 if(!nodes.has(id))nodes.set(id,element(id));
 return nodes.get(id);
};
const doc={
 documentElement:{lang:"en",dataset:{proActive:"false"}},
 getElementById:$,
 querySelectorAll(){return []},
 addEventListener(type,fn){if(type==="DOMContentLoaded")onReady=fn},
 dispatchEvent(){},
 createElement:element,
 execCommand(type){assert.equal(type,"copy");return fallbackAllowed},
 body:{appendChild(){}}
};
const winListeners=new Map();
const win={addEventListener(type,fn){winListeners.set(type,fn)}};
let copied=0,downloaded=0;
const ctx=vm.createContext({
 document:doc,window:win,navigator:{language:"en",clipboard:{writeText:async()=>{
  copied++;
  throw Error("Permission denied");
 }}},
 CustomEvent:class {constructor(){}},
 Blob,URL:{createObjectURL(){downloaded++;return "blob:fake"},revokeObjectURL(){}},
 setTimeout(){return 1},clearTimeout(){},console
});
vm.runInContext(source,ctx);
assert.equal(typeof onReady,"function");
$("placeholderStyle").value="[REDACTED]";
$("keepLengthToggle").checked=false;
onReady();
const act=(id,type="click")=>{
 const cb=actions.get(id+"/"+type);
 assert.equal(typeof cb,"function","listener missing: "+id+"/"+type);
 return cb();
};
const original="GITHUB_TOKEN=github_pat_demo_1234567890abcdef123456";
$("inputText").value=original;
act("redactBtn");
assert.notEqual(vm.runInContext("lastResult",ctx),null);
assert.ok($("outputText").value.length>0);
assert.ok($("countTotal").textContent!=="","summary generated");

// Typing a new secret must invalidate the previous masked output and all exports.
$("inputText").value="GITHUB_TOKEN=github_pat_new_1234567890abcdef123456";
act("inputText","input");
assert.equal(vm.runInContext("lastResult",ctx),null);
assert.equal($("outputText").value,"");
assert.equal($("countTotal").textContent,"0");
await act("copyBtn");
assert.equal(copied,0,"stale output must not be copied");
act("downloadBtn");
assert.equal(downloaded,0,"stale output must not be downloaded");

act("redactBtn");
assert.ok($("outputText").value.length>0);
$("modeBearer").checked=false;
act("modeBearer","change");
assert.equal($("outputText").value,"","changing detection settings invalidates redaction");
assert.equal(vm.runInContext("lastResult",ctx),null);
act("redactBtn");
$("placeholderStyle").value="****";
act("placeholderStyle","change");
assert.equal($("outputText").value,"");
act("redactBtn");
winListeners.get("nw-pro-status-change")();
assert.equal($("outputText").value,"","entitlement change invalidates custom-rule analysis");

act("redactBtn");
fallbackAllowed=false;
await act("copyBtn");
assert.equal($("copyToast").textContent,"Could not copy",
 "failed Clipboard API and failed execCommand must not show false success");
fallbackAllowed=true;
await act("copyBtn");
assert.equal($("copyToast").textContent,"Copied redacted text");

act("clearBtn");
assert.equal($("inputText").value,"");
assert.equal($("outputText").value,"");
assert.equal(vm.runInContext("lastResult",ctx),null);
assert.doesNotMatch(source,/fetch\(/,"redaction must remain local");
console.log("PASS: API Key Token Redactor input/option/status change clears stale outputs and honest copy fallback");
