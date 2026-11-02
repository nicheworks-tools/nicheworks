import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const script = source.trimEnd().slice(0,-5) +
  '\n  window.__redactTest = { state, savePng, loadFile, clearAll, addMask, runtime: () => ({ loadGeneration, editRevision }) };\n})();';

const pending=[];
const images=[];
const statuses=[];
const urls=[];
let clicks=0;
const status={
  textContent:"",classList:{add(){},remove(){},toggle(){}}
};
const blankContext={
  canvas:{},drawImage(){},save(){},restore(){},fillRect(){},
  beginPath(){},rect(){},clip(){},setTransform(){},clearRect(){},strokeRect(){}
};
const documentStub = {
  readyState:"loading",documentElement:{lang:"en"},
  addEventListener(){},querySelector(selector){
    if(selector==="#saveStatus") return status;
    return null;
  },
  querySelectorAll(){return [];},
  body:{appendChild(){}},
  createElement(tag){
    if(tag==="canvas")return {
      width:0,height:0,
      getContext(){return blankContext;},
      toBlob(cb,type){pending.push({cb,type});}
    };
    return {
      href:"",download:"",click(){clicks++},remove(){},
      setAttribute(){},style:{},classList:{add(){},remove(){}}
    };
  }
};
const context=vm.createContext({
  document:documentStub,console,
  navigator:{language:"en"},
  window:{innerHeight:700,devicePixelRatio:1,addEventListener(){}},
  URL:{
    createObjectURL(){const url="blob:redacted-"+(urls.length+1);urls.push(url);return url;},
    revokeObjectURL(url){statuses.push("revoked:"+url);}
  },
  Image:class{set src(_value){images.push(this);}},
  setTimeout(){},Math,Date
});
vm.runInContext(script,context);
const api=context.window.__redactTest;
api.state.image={naturalWidth:100,naturalHeight:100};
api.state.w=100;api.state.h=100;
api.state.masks=[{id:"m",type:"solid",strength:16,x:10,y:10,w:24,h:24}];

const priorRevision=api.runtime().editRevision;
api.savePng();
assert.equal(pending.length,1);
assert.equal(pending[0].type,"image/png");
api.addMask({x:50,y:50},{x:78,y:78});
assert.ok(api.runtime().editRevision>priorRevision,"changing masks invalidates the old export");
pending.shift().cb({type:"image/png",size:7});
assert.equal(clicks,0,"stale redacted image must not download");
assert.match(status.textContent,/Image or masks changed during PNG creation/);

api.savePng();
pending.shift().cb({type:"image/jpeg",size:7});
assert.equal(clicks,0,"mislabeled non-PNG output must not download");
assert.match(status.textContent,/PNG creation failed or the browser returned another format/);

api.savePng();
pending.shift().cb({type:"image/png",size:7});
assert.equal(clicks,1,"current correctly encoded redaction may download");

api.loadFile({name:"private.png",type:"image/png"});
assert.equal(images.length,1);
const nextGeneration=api.runtime().loadGeneration;
api.clearAll();
assert.ok(api.runtime().loadGeneration>nextGeneration,"Clear All invalidates pending decode");
images.pop().onload();
assert.equal(api.state.image,null,"late image decode must not resurrect a cleared document");
assert.ok(statuses.some(x=>x.startsWith("revoked:blob:redacted-")),"stale source Blob URL is revoked");

assert.match(source,/revision !== editRevision \|\| imageAtStart !== state.image/);
assert.match(source,/generation !== loadGeneration/);
assert.match(source,/String\(blob.type \|\| ""\).toLowerCase\(\) !== "image\/png"/);
console.log("PASS: Image Redact stale load, mask race and PNG MIME/age safety");
