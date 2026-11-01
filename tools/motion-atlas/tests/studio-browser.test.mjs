import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";

const root=process.cwd();
const chrome=["google-chrome","google-chrome-stable","chromium","chromium-browser"].find(name=>
 (process.env.PATH||"").split(path.delimiter).some(dir=>fs.existsSync(path.join(dir,name))));
if(!chrome)throw Error("Chrome not installed");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,"http://localhost"),target=path.resolve(root,"."+decodeURIComponent(url.pathname));
 let file=target;
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,"index.html");
 if(!fs.existsSync(file)){res.writeHead(404).end();return;}
 const mime=file.endsWith(".js")?"application/javascript":file.endsWith(".css")?"text/css":file.endsWith(".html")?"text/html":"application/octet-stream";
 res.writeHead(200,{"content-type":mime+"; charset=utf-8"}).end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port,profile=fs.mkdtempSync(path.join(os.tmpdir(),"motion-studio-smoke-"));
const child=spawn(chrome,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-background-networking","--no-first-run","--remote-allow-origins=*","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:["ignore","ignore","pipe"]});
let stderr="";
let socket;
try{
 const chromePort=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error("Chrome timeout "+stderr.slice(-250))),15000);
  child.stderr.on("data",chunk=>{
   stderr+=String(chunk);
   const match=stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
   if(match){clearTimeout(timer);resolve(Number(match[1]));}
  });
  child.once("error",reject);child.once("exit",code=>reject(Error("Chrome exited "+code)));
 });
 async function eventually(fn,count=80){
  for(let i=0;i<count;i++){
   try{const result=await fn();if(result)return result;}catch{}
   await sleep(100);
  }
  throw Error("Timeout waiting for condition");
 }
 const pages=await eventually(async()=>{const res=await fetch("http://127.0.0.1:"+chromePort+"/json/list");return res.ok?res.json():null;});
 const tab=pages.find(p=>p.type==="page");
 assert.ok(tab?.webSocketDebuggerUrl);
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{
  socket.addEventListener("open",resolve,{once:true});
  socket.addEventListener("error",reject,{once:true});
 });
 const pending=new Map();let serial=0;
 socket.addEventListener("message",event=>{
  const message=JSON.parse(String(event.data));
  const waiter=pending.get(message.id);if(!waiter)return;
  pending.delete(message.id);clearTimeout(waiter.timer);
  if(message.error)waiter.reject(Error(JSON.stringify(message.error)));else waiter.resolve(message.result);
 });
 function call(method,params={}){
  return new Promise((resolve,reject)=>{
   const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+" timeout"));},30000);
   pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));
  });
 }
 async function evaluate(expression){
  const result=await call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails).slice(0,1300));
  return result.result?.value;
 }
 await call("Page.enable");await call("Runtime.enable");
 async function scenario(){
  const all=q=>Array.from(document.querySelectorAll(q));
  const check=(condition,why)=>{if(!condition)throw Error(why)};
  try{
   check(all(".track").length===2,"Initial tracks not rendered");
   check(document.querySelectorAll(".studio-layer").length===2,"Initial preview layers missing");
   document.querySelector("#add-track").click();
   check(all(".track").length===3,"Add track failed");
   check(document.querySelectorAll(".studio-layer").length===3,"New track preview layer missing");
   const track=all(".track")[0],numbers=track.querySelectorAll("input[type=number]");
   check(numbers.length===2,"Timeline timing inputs missing");
   numbers[0].value="550";numbers[0].dispatchEvent(new Event("change",{bubbles:true}));
   check(document.querySelector("#total-duration").textContent==="1330 ms","Timing edit didn't update total");
   all(".track")[1].querySelector(".track-actions button:first-child").click();
   check(all(".track").length===3,"Reorder lost track");
   document.querySelector("#preset-name").value="Studio QA";
   document.querySelector("#save-preset").click();
   check(Array.from(document.querySelector("#preset-picker").options).some(o=>o.value==="Studio QA"),"Preset save failed");
   document.querySelector("#target-text").value="changed";
   document.querySelector("#load-preset").click();
   check(document.querySelector("#target-text").value==="MOTION","Preset load failed");
   document.querySelector("#preview").click();
   const sequence=all(".studio-layer");
   check(sequence.length===3,"Preview failed to create nested wrappers");
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(reduced)check(sequence.every(node=>node.getAnimations().length===0),"Reduced motion still animates");
   else check(sequence.some(node=>node.getAnimations().length>0),"Motion preview not animating");
   document.querySelector("#stop").click();
   check(document.querySelector(".studio-layer").getAnimations().length===0,"Stop did not cancel");
   document.querySelector("#export").click();
   check(document.querySelector("#export-output").hidden,"Export bypassed purchase check");
   check(document.querySelector("#export-download").hidden,"Download unexpectedly enabled");
   check(document.documentElement.scrollWidth-document.documentElement.clientWidth<=8,"Horizontal overflow");

   // UI-only mock: test buttons/file names. D1 authorization is tested separately in Node.
   const key="nicheworks:billing:session:motion_atlas.studio_v1";
   localStorage.setItem(key,"cs_test_mockBilling");
   const oldFetch=window.fetch;
   window.fetch=async (url,options)=>{
    if(String(url).includes("/api/motion-atlas/studio-export"))
     return {ok:true,status:200,json:async()=>({ok:true,files:[
      {name:"MotionStudio.css",content:"/* test */"},
      {name:"MotionStudioSequence.jsx",content:"export default function Test(){}"},
      {name:"MotionStudioBundle.md",content:"# Test bundle"}
     ]})};
    return oldFetch(url,options);
   };
   document.querySelector("#export").click();
   for(let n=0;n<30&&document.querySelector("#export-files").hidden;n++)await new Promise(resolve=>setTimeout(resolve,25));
   check(!document.querySelector("#export-files").hidden,"Mocked authorized export did not reveal file controls");
   check(all("[data-export-file]").length===2,"Both CSS and React download buttons missing");
   check(!document.querySelector("#export-download").hidden,"Bundle download missing");
   const downloads=[],originalClick=HTMLAnchorElement.prototype.click;
   HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
   try{
    all("[data-export-file]").forEach(button=>button.click());
    document.querySelector("#export-download").click();
   }finally{HTMLAnchorElement.prototype.click=originalClick;}
   check(JSON.stringify(downloads)==='["MotionStudio.css","MotionStudioSequence.jsx","MotionStudioBundle.md"]',"Incorrect file download names: "+JSON.stringify(downloads));
   document.querySelector("#target-text").value="CHANGED";
   document.querySelector("#target-text").dispatchEvent(new Event("input",{bubbles:true}));
   check(document.querySelector("#export-files").hidden,"Stale exported code remained available after editing");
   check(document.querySelector("#export-output").hidden,"Stale readme remained after editing");
   window.fetch=oldFetch;localStorage.removeItem(key);

   return {ok:true,width:window.innerWidth,count:all(".track").length,reduced};
  }catch(error){return {ok:false,error:error.message,width:window.innerWidth};}
 }
 for(const [lang,page,width] of [["en","/tools/motion-atlas/studio/",390],["ja","/tools/motion-atlas/ja/studio/",390],["en","/tools/motion-atlas/studio/",1280],["ja","/tools/motion-atlas/ja/studio/",1280]]){
  await call("Emulation.setDeviceMetricsOverride",{width,height:850,mobile:width<600,screenWidth:width,screenHeight:850,deviceScaleFactor:1});
  await call("Emulation.setTouchEmulationEnabled",{enabled:width<600});
  await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:lang==="ja"?"reduce":"no-preference"}]});
  const url="http://127.0.0.1:"+port+page;
  await call("Page.navigate",{url});
  await eventually(async()=>await evaluate("location.href==="+JSON.stringify(url)+"&&document.querySelectorAll('.track').length===2"));
  const result=await evaluate("("+scenario.toString()+")()");
  assert.equal(result.ok,true,lang+" "+width+": "+JSON.stringify(result));
  assert.equal(result.width,width,lang+" CSS viewport width mismatch");
  console.log("PASS",lang,width+"px",JSON.stringify(result));
 }
 console.log("Motion Atlas Studio browser smoke passed.");
}finally{
 if(socket?.readyState===WebSocket.OPEN)socket.close();
 child.kill("SIGTERM");
 await new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null)resolve();else child.once("close",resolve);});
 fs.rmSync(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200});
 await new Promise(resolve=>server.close(resolve));
}
