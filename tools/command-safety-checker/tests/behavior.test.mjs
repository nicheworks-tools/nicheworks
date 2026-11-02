import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const actions = new Map();
const nodes = new Map();
const makeNode = (id) => ({
  id, value:"", textContent:"", innerHTML:"", hidden:false, className:"",
  style:{}, dataset:{},
  classList:{add(){},remove(){},toggle(){}},
  addEventListener(type,fn){actions.set(id+"/"+type,fn)},
  appendChild(){}, removeChild(){}, setAttribute(){}, select(){},
  remove(){}, focus(){}, querySelector(){return null},
});
const getNode = id => {
  if(!nodes.has(id)) nodes.set(id,makeNode(id));
  return nodes.get(id);
};
let copyCalls=0;
let fallbackWorks=false;
const document = {
  head:{appendChild(){}},
  body:{appendChild(){},removeChild(){}},
  getElementById:getNode,
  createElement:makeNode,
  querySelector(){return null},
  querySelectorAll(){return []},
  addEventListener(type,fn){actions.set("document/"+type,fn)},
  execCommand(cmd){assert.equal(cmd,"copy"); return fallbackWorks}
};
const window = {__nw_lastResult:null};
const navigator = {
  language:"en",
  clipboard:{writeText:async()=>{copyCalls++;throw Error("clipboard blocked")}}
};
const sandbox={document,window,navigator,console,setTimeout:()=>1,clearTimeout(){}};
vm.runInNewContext(source,sandbox,{filename:"command-safety-checker/app.js"});
const fire=(id,type)=>{const fn=actions.get(id+"/"+type);assert.equal(typeof fn,"function",id+"/"+type);return fn()};
const input=getNode("cmdInput");
getNode("osSelect").value="unix";
input.value="sudo rm -rf /";
fire("analyzeBtn","click");
assert.ok(window.__nw_lastResult,"initial analysis exists");
assert.equal(window.__nw_lastResult.os,"unix");
assert.equal(getNode("resultSection").hidden,false);
assert.equal(getNode("riskLevel").textContent,"HIGH");

input.value="ls -la";
fire("cmdInput","input");
assert.equal(window.__nw_lastResult,null,"any edit invalidates result and clipboard source");
assert.equal(getNode("resultSection").hidden,true);
assert.equal(getNode("riskLevel").textContent,"");
assert.equal(getNode("normalizedCmd").textContent,"");
await fire("copyBtn","click");
assert.equal(copyCalls,0,"stale result may not reach clipboard");
assert.equal(getNode("toast").textContent,"Run a check first");

fire("analyzeBtn","click");
assert.equal(window.__nw_lastResult.normalized,"ls -la");
getNode("osSelect").value="powershell";
fire("osSelect","change");
assert.equal(window.__nw_lastResult,null,"OS switch invalidates prior Unix check");

fire("analyzeBtn","click");
assert.equal(window.__nw_lastResult.os,"powershell");
const sample={dataset:{preset:"Remove-Item -Recurse -Force ./data",os:"powershell"}};
actions.get("document/click")({target:{closest(){return sample}}});
assert.equal(input.value,sample.dataset.preset);
assert.equal(window.__nw_lastResult,null,"sample selection invalidates previous result");

fire("analyzeBtn","click");
fallbackWorks=false;
await fire("copyBtn","click");
assert.equal(getNode("toast").textContent,"Copy failed","legacy fallback must not claim success on false");
fallbackWorks=true;
await fire("copyBtn","click");
assert.equal(getNode("toast").textContent,"Copied");

input.value=" ";
fire("analyzeBtn","click");
assert.equal(window.__nw_lastResult,null,"invalid empty re-analysis must not keep earlier badge");
assert.equal(getNode("resultSection").hidden,true);
fire("clearBtn","click");
assert.equal(input.value,"");
assert.equal(window.__nw_lastResult,null);
console.log("PASS: Command Safety Checker report invalidation on edits/OS/sample/empty and truthful copy fallback");
