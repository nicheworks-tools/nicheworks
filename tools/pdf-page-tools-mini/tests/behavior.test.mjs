import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
assert.ok(source.trimEnd().endsWith("})();"));
const injected=source.trimEnd().slice(0,-5)+
 '\n globalThis.__testPdf={parseRangeText,addFiles,state,busy:()=>isBusy};\n})();';
let destroyed=0;
const window={
 pdfjsLib:{getDocument({data}){
  if(data[0]===2) return {promise:Promise.reject(new Error("Corrupt PDF"))};
  return {promise:Promise.resolve({numPages:data[0]===3?1:2,destroy(){destroyed++}})};
 }},
 confirm(){return true}
};
const document={
 documentElement:{lang:"en"},
 querySelector(){return null},querySelectorAll(){return []}
};
const ctx=vm.createContext({
 document,window,navigator:{language:"en-US"},
 console:{error(){},log:console.log},
 Uint8Array,Blob,URL,setTimeout,clearTimeout,Date,
});
vm.runInContext(injected,ctx);
const api=ctx.__testPdf;
const parse=(text,max)=>JSON.parse(JSON.stringify(api.parseRangeText(text,max)));
assert.deepEqual(parse("1-3,5,8-10",10),{ok:true,list:[1,2,3,5,8,9,10]});
assert.deepEqual(parse("2,1,2",3),{ok:true,list:[2,1]});
for(const invalid of ["1,,2",",1","1,","1, ,2","1--2","1-5","2-1","0"]){
 assert.equal(parse(invalid,3).ok,false,"invalid range: "+invalid);
}
const file=(name,n)=>({name,type:"application/pdf",size:10,
 arrayBuffer:async()=>Uint8Array.from([n]).buffer});
await api.addFiles([file("existing.pdf",1)]);
assert.equal(api.state.files.length,1);
assert.equal(api.state.pages.length,2);
const originalIds=api.state.pages.map(p=>p.id).join(",");
await api.addFiles([file("new.pdf",3),file("bad.pdf",2)]);
assert.equal(api.state.files.length,1,"failed batch must not retain its first file");
assert.equal(api.state.pages.length,2,"failed batch must not retain its first pages");
assert.equal(api.state.pages.map(p=>p.id).join(","),originalIds,
 "old page edits must be preserved");
assert.equal(api.busy(),false);
await new Promise(setImmediate);
assert.equal(destroyed,1,"rolled back PDF document must be released");

let unblock;
const pending={name:"pending.pdf",type:"application/pdf",size:5,
 arrayBuffer:()=>new Promise(resolve=>{unblock=resolve})};
const inFlight=api.addFiles([pending]);
assert.equal(api.busy(),true,"editor locks before library/arrayBuffer await");
await api.addFiles([file("concurrent.pdf",3)]);
assert.equal(api.state.files.length,1,"parallel import ignored");
await Promise.resolve();
unblock(Uint8Array.from([3]).buffer);
await inFlight;
assert.equal(api.state.files.length,2);
assert.equal(api.state.files[1].name,"pending.pdf");
assert.equal(api.state.pages.length,3);
assert.equal(api.busy(),false);
console.log("PASS: PDF Page Tools Mini strict range grammar, atomic PDF batches and concurrent import lock");
