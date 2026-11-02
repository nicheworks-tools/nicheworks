import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const original=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const closing="\n})();";
assert.ok(original.trimEnd().endsWith("})();"));
const script=original.trimEnd().slice(0,-5)+
 '\n  window.__testAudio = {startMic,stopMic,updateControls,isMicRunning, runtime:()=>({starting,micRequestRevision,mediaStream,rafId})};\n})();';

let pendingPermission=[];
let requestFrames=0;
const mockNode=(id)=>({
 id,textContent:"",innerHTML:"",disabled:false,hidden:false,value:"",
 style:{},dataset:{},className:"",
 classList:{add(){},remove(){},toggle(){},contains(){return false}},
 querySelector(){return {textContent:"",style:{}};},
 addEventListener(){},replaceChildren(){},appendChild(){},getBoundingClientRect(){return {width:480,height:240}},
 getContext(){return {clearRect(){},fillRect(){}}}
});
const nodes=new Map();
const doc={
 readyState:"loading",
 documentElement:{lang:"en",dataset:{}},
 addEventListener(){},
 querySelectorAll(){return []},
 getElementById(id){if(!nodes.has(id))nodes.set(id,mockNode(id));return nodes.get(id);},
 createElement(tag){return mockNode(tag)}
};
const makeTrack=()=>({
 readyState:"live",stopped:0,listeners:{},
 stop(){this.readyState="ended";this.stopped++;},
 getSettings(){return {deviceId:"mic-1",echoCancellation:false,noiseSuppression:false,autoGainControl:false}},
 addEventListener(event,cb){this.listeners[event]=cb}
});
const makeStream=()=>{
 const track=makeTrack();
 return {track,getTracks(){return [track]},getAudioTracks(){return [track]}};
};
class MockAudioContext {
 sampleRate=48000;state="running";
 createAnalyser(){return {fftSize:2048,frequencyBinCount:1024,smoothingTimeConstant:0}};
 createMediaStreamSource(){return {connect(){}}}
 close(){this.state="closed";return Promise.resolve()}
}
const browser={
 navigator:{language:"en",mediaDevices:{
  getUserMedia(){
   let resolve,reject;
   const promise=new Promise((res,rej)=>{resolve=res;reject=rej});
   pendingPermission.push({resolve,reject});
   return promise;
  },
  enumerateDevices:async()=>[]
 }},
 window:{
  AudioContext:MockAudioContext,
  devicePixelRatio:1,innerHeight:800,
  addEventListener(){},
  NWAmazonAffiliate:null
 },
 document:doc,localStorage:{getItem(){return null},setItem(){}},
 requestAnimationFrame(){return ++requestFrames},cancelAnimationFrame(){},
 console,performance:{now(){return 0}},Math,Date,Float32Array,Uint8Array
};
const ctx=vm.createContext(browser);
vm.runInContext(script,ctx);
const api=browser.window.__testAudio;

const waiting=api.startMic("mic-1");
assert.equal(api.runtime().starting,true);
assert.equal(nodes.get("stopMicButton").hidden,false,"Stop must show while permission is pending");
assert.equal(nodes.get("stopMicButton").disabled,false);
api.stopMic();
assert.equal(api.runtime().starting,false);
const delayed=makeStream();
pendingPermission.shift().resolve(delayed);
await waiting;
assert.equal(delayed.track.stopped,1,"permission-granted late stream must immediately stop");
assert.equal(api.isMicRunning(),false);
assert.equal(requestFrames,0,"late stream must not schedule sampling");

const liveRequest=api.startMic("mic-1");
const live=makeStream();
pendingPermission.shift().resolve(live);
await liveRequest;
assert.equal(api.isMicRunning(),true);
assert.equal(nodes.get("stopMicButton").hidden,false);
assert.equal(requestFrames,1);

api.stopMic();
assert.equal(live.track.stopped,1);
assert.equal(api.isMicRunning(),false);
assert.equal(nodes.get("stopMicButton").hidden,true);

// An old prompt resolving after a newer recording starts must not displace it.
const first=api.startMic("old");
api.stopMic();
const second=api.startMic("new");
const newer=makeStream();
pendingPermission[1].resolve(newer);
await second;
assert.equal(api.isMicRunning(),true);
const old=makeStream();
pendingPermission[0].resolve(old);
await first;
assert.equal(old.track.stopped,1);
assert.equal(newer.track.stopped,0);
assert.equal(api.isMicRunning(),true);
api.stopMic();
assert.equal(newer.track.stopped,1);

assert.match(original,/window\.addEventListener\("pagehide", \(\) => \{/,
 "unload invalidates pending permission request");
assert.match(original,/revision !== micRequestRevision/,
 "enumeration and late permission callbacks compare request identity");
console.log("PASS: Tiny Audio Meter stop-during-permission, stale stream and clean stop");
