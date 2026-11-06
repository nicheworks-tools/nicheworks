import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {createRequire} from "node:module";
import {generateStudioFiles} from "../../../functions/api/motion-atlas/studio-core.mjs";

const root=process.cwd();
const require=createRequire(path.join(root,".qa-deps","package.json"));
const {chromium,firefox,webkit}=require("playwright");
const React=require("react");
const ReactDOMServer=require("react-dom/server");
const {transformSync}=require("esbuild");
const composition={text:"<script>alert('x')</script> & 🐱",tracks:[
 {effect:"fade-up",delay:0,duration:750,easing:"ease-out"},
 {effect:"overshoot",delay:320,duration:700,easing:"ease-in-out"},
 {effect:"mask-reveal",delay:500,duration:400,easing:"linear"}
]};
const bundle=generateStudioFiles(composition);
const css=bundle.files.find(f=>f.name==="MotionStudio.css").content;
const jsx=bundle.files.find(f=>f.name==="MotionStudioSequence.jsx").content;
const code=transformSync(jsx,{loader:"jsx",format:"cjs",jsx:"transform",target:"es2020"}).code;
const compiled={exports:{}};
new Function("require","module","exports",code)(name=>name==="./MotionStudio.css"?{}:require(name),compiled,compiled.exports);
const markup=ReactDOMServer.renderToStaticMarkup(React.createElement(compiled.exports.default));
assert.equal((markup.match(/nw-studio-layer-/g)||[]).length,3);
assert.ok(markup.includes("&lt;script&gt;")&&!markup.includes("<script>"));
const effectList=["fade-in","slide-in","fade-up","scale-in","overshoot","wiggle","pulse","mask-reveal","squash-stretch","parallax"];
for(const effect of effectList){
 const result=generateStudioFiles({text:"Effect QA",tracks:[{effect,delay:0,duration:300,easing:"linear"}]});
 assert.ok(result.files[0].content.includes("@keyframes nwStudio_0"),effect);
}
const renderedPage='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body>'+markup+'</body></html>';
const server=http.createServer((req,res)=>{
 const uri=new URL(req.url,"http://localhost").pathname;
 if(uri==="/__studio-export"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"}).end(renderedPage);return;}
 let file;
 try{file=path.resolve(root,"."+decodeURIComponent(uri));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{
  if(fs.statSync(file).isDirectory())file=path.join(file,"index.html");
  const mime=file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":file.endsWith(".json")?"application/json":"text/html";
  res.writeHead(200,{"content-type":mime+"; charset=utf-8"}).end(fs.readFileSync(file));
 }catch{res.writeHead(404).end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
let verified=0;
try{
 for(const [engine,launcher] of [["Chromium",chromium],["Firefox",firefox],["WebKit",webkit]]){
  const browser=await launcher.launch({headless:true,args:engine==="Chromium"?["--no-sandbox"]:[]});
  try{
   for(const lang of ["en","ja"]){
    for(const width of [390,1280]){
     const context=await browser.newContext({viewport:{width,height:844},acceptDownloads:true,reducedMotion:"no-preference"});
     const page=await context.newPage(),errors=[];
     page.on("pageerror",err=>errors.push(String(err)));
     try{
      const free=lang==="ja"?"/tools/motion-atlas/ja/":"/tools/motion-atlas/";
      const studio=lang==="ja"?"/tools/motion-atlas/ja/studio/":"/tools/motion-atlas/studio/";
      await page.goto(origin+free);
      await page.locator(".motion-card").first().waitFor();
      assert.equal(await page.locator(".motion-card").count(),42);
      const link=page.locator("a[data-studio-preview]");
      assert.equal(new URL(await link.getAttribute("href"),origin).pathname,studio);
      await link.click();
      await page.waitForURL("**"+studio);
      await page.locator(".track").first().waitFor();
      assert.equal(await page.locator(".track").count(),2);
      await page.locator("#add-track").click();
      assert.equal(await page.locator(".track").count(),3);
      await page.locator("#timeline-scrub").evaluate(el=>{el.value="550";el.dispatchEvent(new Event("input",{bubbles:true}));});
      assert.equal(await page.locator("#timeline-cursor").text(),"550 ms");
      const positions=await page.locator(".studio-layer").evaluateAll(nodes=>nodes.map(el=>el.getAnimations().map(a=>[a.playState,a.currentTime])));
      assert.ok(positions.every(list=>list.length===1&&list[0][0]==="paused"&&Math.abs(list[0][1]-550)<5),engine+": seek failed "+JSON.stringify(positions));
      await page.locator("#target-text").fill("SAVED PROJECT");
      const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#save-project").click()]);
      const data=JSON.parse(await fs.promises.readFile(await download.path(),"utf8"));
      assert.deepEqual(Object.keys(data).sort(),["schema","text","tracks"]);
      assert.equal(data.text,"SAVED PROJECT");
      assert.equal(data.tracks.length,3);
      await page.locator("#import-project").setInputFiles({name:"invalid.json",mimeType:"application/json",buffer:Buffer.from('{"schema":"unknown"}')});
      assert.equal(await page.locator("#target-text").inputValue(),"SAVED PROJECT");
      await page.locator("#import-project").setInputFiles({name:"good.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify({...data,text:"PORTED",sessionId:"NOT_A_REAL_PURCHASE"}))});
      await page.waitForFunction(()=>document.querySelector("#target-text").value==="PORTED");
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert.ok(overflow<=8,engine+" "+lang+" "+width+" overflow "+overflow);
      await page.emulateMedia({reducedMotion:"reduce"});
      await page.locator("#preview").click();
      assert.ok(await page.locator(".studio-layer").evaluateAll(nodes=>nodes.every(n=>n.getAnimations().length===0)));
      assert.deepEqual(errors,[],engine+" "+lang+" JavaScript errors");
      console.log("PASS",engine,lang,width,"free42","seek","portable JSON","reduced motion","overflow="+overflow);
      verified++;
     }finally{await context.close();}
    }
   }
   const page=await browser.newPage({viewport:{width:390,height:800},reducedMotion:"no-preference"});
   await page.goto(origin+"/__studio-export");
   assert.equal(await page.locator(".nw-studio-layer").count(),3);
   assert.equal(await page.locator(".nw-studio-content").innerText(),composition.text);
   const animations=await page.locator(".nw-studio-layer").evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).animationName));
   assert.ok(animations.every(x=>x.startsWith("nwStudio_")),engine+" generated CSS broken "+animations);
   await page.emulateMedia({reducedMotion:"reduce"});
   assert.ok(await page.locator(".nw-studio-layer").evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).animationName==="none")));
   console.log("PASS",engine,"generated React+CSS real browser render");
   await page.close();
  }finally{await browser.close();}
 }
 console.log("PASS",verified,"cross-browser interface scenarios, 3 React/CSS export renders");
}finally{await new Promise(resolve=>server.close(resolve));}
