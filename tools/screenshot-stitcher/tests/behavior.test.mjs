import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const injected = source.trimEnd().slice(0, -5) + "\n  globalThis.__test = { state, canvasToBlob, handlePreview, handleSplitZip, invalidateRender, clearAll, runtime: () => ({ renderRevision, clearGeneration }) };\n})();";

const pending = [];
const elements = new Map();
const makeCanvas = () => ({
  width:6, height:6, clientWidth:6, clientHeight:6, style:{},
  getContext() { return {
    clearRect() {}, fillRect() {}, drawImage() {},
    getImageData() { return {data:new Uint8ClampedArray(6*6*4).fill(255)}; }
  }; },
  toBlob(cb,mime){pending.push({cb,mime});}
});
const makeElement = () => ({
  value:"",checked:false,textContent:"",innerHTML:"",disabled:false,
  className:"",style:{},classList:{add(){},remove(){},toggle(){}},
  addEventListener(){},remove(){},setAttribute(){},
  querySelector(){return null;},querySelectorAll(){return [];}
});
const inputs = {fitMode:"max",customWidth:"1080",trimThreshold:"12",gap:"0",
  background:"white",format:"png",quality:"0.92",splitHeight:"3"};
const dom = {
  readyState:"loading",documentElement:{lang:"ja"},
  addEventListener(){},querySelectorAll(){return []},
  getElementById(id) {
    if(!elements.has(id)){
      const node=id==="previewCanvas"?makeCanvas():makeElement();
      if(Object.hasOwn(inputs,id))node.value=inputs[id];
      elements.set(id,node);
    }
    return elements.get(id);
  },
  createElement(tag){return tag==="canvas"?makeCanvas():makeElement();},
  body:{appendChild(){}}
};
const sandbox={document:dom,console,navigator:{language:"ja"},Blob,
  Uint8Array,Uint8ClampedArray,Uint32Array,DataView,TextEncoder,
  URL:{createObjectURL(){return "blob:test";},revokeObjectURL(){}},
  window:{addEventListener(){}},setTimeout(){return 1},clearTimeout(){}};
const ctx=vm.createContext(sandbox);
vm.runInContext(injected,ctx);
const api=ctx.__test;

const good=api.canvasToBlob(makeCanvas(),"webp",0.9);
const goodReq=pending.shift();
assert.equal(goodReq.mime,"image/webp");
goodReq.cb(new Blob(["webp"],{type:"image/webp"}));
await good;
const wrong=api.canvasToBlob(makeCanvas(),"webp",0.9);
pending.shift().cb(new Blob(["png"],{type:"image/png"}));
await assert.rejects(wrong,error=>error.code==="ENCODING_FALLBACK");

api.state.items.push({id:"one",name:"one.png",w:6,h:6,img:{},url:"blob:source"});
const stale=api.handlePreview();
await Promise.resolve();
assert.equal(pending.length,1,"preview queues Canvas export");
api.invalidateRender();
pending.shift().cb(new Blob(["valid"],{type:"image/png"}));
await stale;
assert.equal(api.state.renderedBlob,null,"late callback must not revive download");

const fresh=api.handlePreview();
await Promise.resolve();
pending.shift().cb(new Blob(["new"],{type:"image/png"}));
await fresh;
assert.equal(api.state.renderedBlob.type,"image/png");
assert.equal(elements.get("downloadBtn").disabled,false);

const split=api.handleSplitZip();
assert.equal(pending.length,1,"split ZIP first segment awaits encoding");
api.invalidateRender();
pending.shift().cb(new Blob(["part"],{type:"image/png"}));
await split;
assert.equal(api.state.renderedBlob,null);
assert.equal(elements.get("splitBtn").disabled,true);
api.clearAll();
assert.equal(api.state.items.length,0);
assert.ok(api.runtime().clearGeneration>=1);

assert.match(page,/data-i18n="encodingNotice"/);
assert.match(source,/revision !== renderRevision/);
assert.match(source,/generation !== clearGeneration/);
assert.match(source,/error.code = "ENCODING_FALLBACK"/);
assert.match(source,/setStatus\(text\(err\?\.code === "ENCODING_FALLBACK"/);
console.log("PASS: Stitcher encoder MIME, stale preview/ZIP, and clear guards");
