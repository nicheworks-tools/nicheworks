import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const script=source.trimEnd().slice(0,-5)+
 '\n  globalThis.__cameraTest = {state,startCamera,stopCamera,hardStopCamera,revision:()=>cameraRevision};\n})();';

const pending=[];
const nodes=new Map();
const node=id=>({
 id,hidden:false,disabled:false,value:"",textContent:"",style:{},dataset:{},
 classList:{add(){},remove(){},toggle(){}},
 setAttribute(){},removeAttribute(){},load(){},
 play:async()=>{},querySelector(){return null},querySelectorAll(){return []},
});
const element=id=>{
 if(!nodes.has(id))nodes.set(id,node(id));
 return nodes.get(id);
};
const doc={
 readyState:"loading",documentElement:{lang:"en"},
 getElementById:element,
 querySelectorAll(){return []},
 addEventListener(){},
 body:{setAttribute(){}}
};
const stream=()=>({
 stopped:0,
 getTracks(){return [{stop:()=>{this.stopped++}}]}
});
let frameCount=0;
const ctx=vm.createContext({
 document:doc,
 window:{addEventListener(){},devicePixelRatio:1,innerHeight:800},
 navigator:{language:"en",mediaDevices:{
  getUserMedia(){
   let resolve,reject;
   const p=new Promise((res,rej)=>{resolve=res;reject=rej});
   pending.push({resolve,reject});
   return p;
  }
 }},
 localStorage:{getItem(){return null},setItem(){}},
 requestAnimationFrame(){return ++frameCount},cancelAnimationFrame(){},
 console,setTimeout,clearTimeout
});
vm.runInContext(script,ctx);
const api=ctx.__cameraTest;
const flush=()=>new Promise(setImmediate);

// Stop must work even when the browser permission prompt has not completed.
const first=api.startCamera();
assert.equal(element("btnStop").hidden,false);
assert.equal(element("btnStop").disabled,false);
api.stopCamera();
const late=stream();
pending.shift().resolve(late);
await first;
assert.equal(late.stopped,1,"late permission success must immediately stop tracks");
assert.equal(api.state.running,false);
assert.equal(api.state.busy,false);
assert.equal(frameCount,0);

// Stop must also invalidate an in-flight video.play() promise.
let finishPlay;
element("video").play=()=>new Promise(resolve=>{finishPlay=resolve});
const second=api.startCamera();
const loading=stream();
pending.shift().resolve(loading);
await flush();
assert.equal(typeof finishPlay,"function");
api.stopCamera();
assert.equal(loading.stopped>0,true);
finishPlay();
await second;
assert.equal(api.state.running,false,"late play() resolution cannot restart camera");
assert.equal(frameCount,0);

// Fresh starts continue to work after canceled operations.
element("video").play=async()=>{};
const third=api.startCamera();
const live=stream();
pending.shift().resolve(live);
await third;
assert.equal(api.state.running,true);
assert.equal(frameCount,1);
api.stopCamera();
assert.equal(api.state.running,false);
assert.equal(live.stopped>0,true);
assert.equal(element("btnStop").hidden,true);

assert.match(source,/revision !== cameraRevision/);
assert.match(source,/window\.addEventListener\("pagehide", \(\) => \{ hardStopCamera\(\);/);
assert.match(source,/window\.addEventListener\("beforeunload", \(\) => \{ hardStopCamera\(\);/);
console.log("PASS: Light Check camera permission/play cancel, late tracks and fresh restart");
