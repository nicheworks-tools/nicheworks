import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const code=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const el=(id)=>({
 id,textContent:"",value:"",src:"",complete:true,naturalWidth:60,
 style:{display:"none"},dataset:{},checked:false,children:[],
 classList:{add(){},remove(){},toggle(){}},
 addEventListener(){},appendChild(c){this.children.push(c)},
 removeChild(c){this.children.splice(this.children.indexOf(c),1)},
 get firstChild(){return this.children[0]||null},
 removeAttribute(name){if(name==="src")this.src="";}
});
const nodes=new Map();
const $=id=>{if(!nodes.has(id))nodes.set(id,el(id));return nodes.get(id)};
const urls=[];const revoked=[];const pending=[];
let urlCounter=0;
const context=vm.createContext({
 document:{
  documentElement:{lang:"en"},
  getElementById:$,
  querySelectorAll(){return []},
  addEventListener(){},
  createElement(tag){return el(tag)},
  body:{appendChild(){},removeChild(){}}
 },
 console,Blob,navigator:{language:"en",clipboard:null},
 localStorage:{getItem(){return null},setItem(){}},
 window:{SYMBOLS:[{id:"wash-test",cat:"wash",jis:"111"}],addEventListener(){}},
 URL:{
  createObjectURL(){const url="blob:photo-"+(++urlCounter);urls.push(url);return url;},
  revokeObjectURL(url){revoked.push(url)}
 },
 pending,
});
vm.runInContext(code,context);
const run=src=>vm.runInContext(src,context);
run('preprocessToBWCanvas=()=>({})');
run('mseCanvas=()=>5');
run('svgToCanvas=()=>new Promise(resolve=>pending.push(resolve))');
run('createSymbolSvgElement=()=>document.createElement("svg")');
run('getSymbolText=()=>({summary:"Test label"})');

$("ocrPreviewImg").src="blob:initial";
const outdated=run("runPhotoCandidates()");
assert.equal(pending.length,1);
run('handleImageFile({type:"image/png",size:500,name:"new.png"})');
assert.equal($("ocrCandidatesGrid").children.length,0);
pending.shift()({});
await outdated;
assert.equal($("ocrCandidatesGrid").children.length,0,"old comparison must not display after file change");
const loaded=$("ocrPreviewImg").onload;
assert.equal(typeof loaded,"function");
loaded();
assert.equal($("ocrPreviewImg").style.display,"block","latest image should show preview");

const active=run("runPhotoCandidates()");
assert.equal(pending.length,1);
pending.shift()({});
await active;
assert.equal($("ocrCandidatesGrid").children.length,1);
assert.match($("ocrStatus").textContent,/Candidates are from/);

// Clearing cancels an in-flight comparison and revokes a selected file.
const cleared=run("runPhotoCandidates()");
assert.equal(pending.length,1);
run("clearPhotoCandidateState()");
pending.shift()({});
await cleared;
assert.equal($("ocrCandidatesGrid").children.length,0);
assert.equal($("ocrPreviewImg").src,"");
assert.equal($("ocrStatus").textContent,"");

// Older photo event callbacks cannot revive another photo.
run('handleImageFile({type:"image/png",size:400,name:"one.png"})');
const firstOnLoad=$("ocrPreviewImg").onload;
const firstOnError=$("ocrPreviewImg").onerror;
run('handleImageFile({type:"image/png",size:400,name:"two.png"})');
const twoUrl=$("ocrPreviewImg").src;
firstOnLoad();firstOnError();
assert.equal($("ocrPreviewImg").style.display,"none");
assert.equal($("ocrPreviewImg").src,twoUrl,"stale image callbacks do not clear the current selection");
$("ocrPreviewImg").onload();
assert.equal($("ocrPreviewImg").style.display,"block");
assert.ok(revoked.includes(urls[urls.length-2]),"old file object URL released");
assert.ok(revoked.includes(urls[urls.length-1]),"latest file object URL released after decode");

assert.match(code,/compareId !== comparisonRevision/);
assert.match(code,/photoId !== photoRevision/);
assert.match(code,/ocrAllEl\?\.addEventListener\("change"/);
assert.ok(!code.includes("fetch("),"image matching remains browser local");
console.log("PASS: Laundry Code Decode stale photo/matching callbacks and clear handling");
