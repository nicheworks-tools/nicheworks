import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const callbacks = new Map();
const elements = new Map();
const readers = [];
const images = [];
const pendingFrames = [];
let clicks = 0;
let pngData = "data:image/png;base64,AA";
let time = 0;

function node(id) {
  return {
    id, value:"", textContent:"", disabled:false,
    style:{}, classList:{add(){}, remove(){},toggle(){}},
    addEventListener(kind, fn){ callbacks.set(id + "/" + kind, fn); },
    getAttribute(){ return null; }, getBoundingClientRect(){return {left:0,top:0,width:2,height:2}},
    click(){ clicks++; },
  };
}
function canvas(id) {
  const n = node(id);
  n.width = 0;
  n.height = 0;
  const context = {
    clearRect(){}, drawImage(){}, putImageData(output){n.lastOutput = output},
    getImageData(){
      const data = [];
      for (let i = 0; i < 4; i++) data.push(255, 0, 0, 255);
      return {width:2,height:2,data:new Uint8ClampedArray(data)};
    },
  };
  n.getContext = () => context;
  n.toDataURL = () => pngData;
  return n;
}
const byId=id=>{
  if(!elements.has(id)) elements.set(id, id.startsWith("canvas") ? canvas(id) : node(id));
  return elements.get(id);
};
class Reader {
  readAsDataURL(file){ this.file = file; readers.push(this); }
}
class MockImage {
  naturalWidth=2;
  naturalHeight=2;
  set src(value){ this.url = value; images.push(this); }
}
class FakeImageData {
  constructor(data,width,height){this.data=data;this.width=width;this.height=height}
}
const document = {
  documentElement:{lang:"ja"},
  getElementById:byId,
  querySelectorAll(){return [];},
  createElement(tag){return tag === "canvas" ? canvas("source") : node(tag)},
};
const context = vm.createContext({
  document,
  navigator:{language:"en-US"},
  FileReader:Reader,Image:MockImage,ImageData:FakeImageData,
  performance:{now(){time+=20;return time}},
  requestAnimationFrame(fn){pendingFrames.push(fn);return pendingFrames.length},
  window:{setTimeout(){return 1},clearTimeout(){}},
  console,Math,Uint8ClampedArray
});
vm.runInContext(src,context,{filename:"color-replace/app.js"});
const run = code=>vm.runInContext(code,context);
const fire=(id,kind)=> {
  const fn=callbacks.get(id + "/" + kind);
  assert.equal(typeof fn,"function",id+"/"+kind);
  fn({target:byId(id)});
};
const load=file=>{context.selected=file;run("loadImage(selected)");};
const readerSuccess=reader=>reader.onload({target:{result:"data:image/png;base64,AAAA"}});
const drain=()=>{let steps=0;while(pendingFrames.length){assert.ok(++steps<30,"infinite frame loop");pendingFrames.shift()();}};

load({type:"image/png",name:"old.png"});
load({type:"image/jpeg",name:"latest.jpg"});
assert.equal(readers.length,2);
readerSuccess(readers[1]);
assert.equal(images.length,1,"latest decoder started");
images[0].onload();
assert.equal(run("baseImageData.width"),2);
readerSuccess(readers[0]);
assert.equal(images.length,1,"obsolete file must never decode or replace current image");
assert.equal(run("processing"),false);

// Reset must prevent a late image onload from reviving cleared pixels.
load({type:"image/webp",name:"pending.webp"});
readerSuccess(readers[2]);
const staleImage=images[1];
fire("resetBtn","click");
staleImage.onload();
assert.equal(run("baseImageData"),null);
assert.equal(run("hasResult"),false);
assert.equal(byId("canvasBefore").width,0);

// An error from an old FileReader must not interrupt a newer selected image.
load({type:"image/png",name:"bad-old.png"});
load({type:"image/png",name:"good-new.png"});
readerSuccess(readers[4]);
images[2].onload();
const beforeWidth=byId("canvasBefore").width;
readers[3].onerror();
assert.equal(byId("canvasBefore").width,beforeWidth);
assert.equal(run("baseImageData.width"),2);

// A still-pending frame from an older Apply must not draw after reset.
fire("applyBtn","click");
assert.ok(pendingFrames.length>0);
fire("resetBtn","click");
drain();
assert.equal(byId("canvasAfter").width,0);
assert.equal(run("hasResult"),false);

// Editing the source color mid-conversion aborts queued work.
load({type:"image/png",name:"work.png"});
readerSuccess(readers[5]);
images[3].onload();
fire("applyBtn","click");
byId("srcColor").value="#00ff00";
fire("srcColor","input");
drain();
assert.equal(run("hasResult"),false);
assert.match(byId("resultSummary").textContent,/Settings changed/);

// A fresh apply succeeds; browser output MUST really be PNG.
byId("srcColor").value="#ff0000";
fire("applyBtn","click");
drain();
assert.equal(run("hasResult"),true);
pngData="data:image/jpeg;base64,AA";
fire("downloadBtn","click");
assert.equal(clicks,0,"incorrect Canvas encoder format must not be saved as .png");
assert.match(byId("toast").textContent,/Could not export/);
pngData="data:image/png;base64,AA";
fire("downloadBtn","click");
assert.equal(clicks,1);
byId("tolerance").value="0";
fire("tolerance","input");
assert.equal(run("hasResult"),false,"settings changes invalidate completed export");
fire("downloadBtn","click");
assert.equal(clicks,1,"stale preview must never be downloadable");
assert.ok(src.includes("revision !== operationRevision"));
console.log("PASS: Color Replace stale FileReader/Image/rAF, reset, settings and PNG MIME safety");
