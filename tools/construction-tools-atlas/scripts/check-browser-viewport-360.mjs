import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";


const ROOT=process.cwd();
const TYPES={".html":"text/html",".js":"application/javascript",".mjs":"application/javascript",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon"};
const server=http.createServer((request,response)=>{
  let target;
  try{
    const url=new URL(request.url,"http://127.0.0.1");
    target=path.resolve(ROOT,"."+decodeURIComponent(url.pathname));
    if(!target.startsWith(ROOT+path.sep)){response.writeHead(403).end();return;}
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,"index.html");
    if(!fs.existsSync(target)||!fs.statSync(target).isFile()){response.writeHead(404).end("Not found");return;}
    const data=fs.readFileSync(target);
    response.writeHead(200,{"Content-Type":(TYPES[path.extname(target)]||"application/octet-stream")+"; charset=utf-8","Cache-Control":"no-store"}).end(data);
  }catch(error){response.writeHead(500).end(String(error.message));}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
server.unref();
const ORIGIN="http://127.0.0.1:"+server.address().port;

const chrome = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"].find(name =>
  (process.env.PATH || "").split(path.delimiter).some(dir => fs.existsSync(path.join(dir, name)))
);
if (!chrome) throw Error("Chrome/Chromium must be installed");
if (typeof WebSocket !== "function") throw Error("Node 22+ WebSocket required");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "construction-atlas-cdp-"));
const child = spawn(chrome, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--no-first-run", "--disable-extensions", "--disable-background-networking",
  "--remote-allow-origins=*", "--remote-debugging-port=0", "--user-data-dir=" + dir,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

let stderr = "";
const port = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(Error("Chrome DevTools did not start: " + stderr.slice(-1000))), 15000);
  child.stderr.on("data", bytes => {
    stderr += String(bytes);
    const m = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
    if (m) { clearTimeout(timer); resolve(Number(m[1])); }
  });
  child.once("error", err => { clearTimeout(timer); reject(err); });
  child.once("exit", code => { clearTimeout(timer); reject(Error("Chrome exited before DevTools: " + code)); });
});

let websocket;
const until = async (predicate, retries = 80) => {
  for (let i = 0; i < retries; i++) {
    const value = await predicate().catch(() => null);
    if (value) return value;
    await sleep(150);
  }
  throw Error("Timed out waiting for browser condition");
};

async function smoke(lang) {
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const query=(selector)=>document.querySelector(selector);
  let candidate="", count="", selected="";
  try{
    for(let i=0;i<150;i++){
      const loaded=query("#loadingState")?.hidden;
      count=query("#resultCount")?.textContent?.trim()||"";
      if(loaded && /870/.test(count) && query("#resultList .resultRow"))break;
      await sleep(120);
    }
    count=query("#resultCount")?.textContent?.trim()||"";
    check(/870/.test(count),"Public canonical catalog did not load 870 entries: "+count+" / "+(query("#loadingState")?.textContent||""));
    check(document.querySelectorAll("#resultList .resultRow").length>=40,"Initial list is missing real dictionary items");
    check(document.querySelectorAll("#dictionaryJumpButtons button").length>=3,"Quick entry navigation missing");
    const mobile=window.innerWidth<=899;
    if(!mobile)check(query("#detailContent")?.hidden===false,"Desktop starts with an empty detail pane");
    const languageButton=query('#langControl [data-lang="'+lang+'"]');
    check(languageButton,"Language toggle missing: "+lang);
    languageButton.click();
    check(document.documentElement.lang===lang,"Language toggle did not update html lang");
    candidate=lang==="ja"?"メガー":"Pipe threading machine";
    selected=lang==="ja"?"q011_insulation_tester":"q017_pipe_threader";
    const input=query("#searchInput");
    check(input&&input.type==="search","Dictionary search box missing");
    input.value=candidate;input.dispatchEvent(new Event("input",{bubbles:true}));
    await sleep(120);
    const row=query('#resultList .resultRow[data-entry-id="'+selected+'"]');
    check(row,"Reviewed bilingual alias did not find its target "+candidate+" → "+selected);
    check(query("#resultList .resultRow")?.dataset.entryId===selected,"Alias search did not rank canonical first: "+candidate);
    row.click();
    await sleep(100);
    check(query("#detailPanel")?.dataset.open==="true","Detail panel failed to open");
    check(query("#detailContent")?.hidden===false,"Detail content is hidden");
    const detailText=query("#detailDefinition")?.textContent||"";
    check(detailText.trim().length>=60,"Definition missing after selecting an entry");
    check(query("#detailAliases")?.textContent.includes(candidate),"Matched term alias is not displayed");
    check(query("#detailImageMissing")?.hidden===true,"Unreviewed image placeholder consumes detail space");
    if(mobile){
      check(query("#mobileBackdrop")?.hidden===false,"Mobile detail backdrop not visible");
      query("#detailClose")?.click();
      check(query("#detailPanel")?.dataset.open==="false","Mobile detail does not close");
      check(query("#mobileBackdrop")?.hidden===true,"Mobile backdrop left active after closing");
      row.click();
      check(query("#detailPanel")?.dataset.open==="true","Mobile detail could not reopen");
    }
    query('#langControl [data-lang="both"]').click();
    check(document.querySelectorAll("#detailDefinition .langTag").length>=2,"Both mode does not show bilingual definitions");
    const viewport=window.innerWidth, clientWidth=document.documentElement.clientWidth;
    const overflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-clientWidth;
    check(overflow<=3,"Page-wide horizontal overflow "+overflow+"px at "+viewport+"px");
    const panel=query("#detailPanel").getBoundingClientRect();
    check(panel.width<=viewport+3,"Detail panel exceeds viewport width: "+panel.width+" / "+viewport);
    return {ok:true,lang,viewport,clientWidth,overflow,catalog:870,alias:candidate,canonical:selected,detailWidth:Math.round(panel.width)};
  }catch(error){return {ok:false,lang,error:error.message,viewport:window.innerWidth,clientWidth:document.documentElement.clientWidth,catalog:count,alias:candidate,canonical:selected};}
}

try {
  const page = await until(async () => {
    const response = await fetch("http://127.0.0.1:" + port + "/json/list");
    if (!response.ok) return null;
    const list = await response.json();
    return list.find(entry => entry.type === "page" && entry.webSocketDebuggerUrl);
  });
  websocket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    websocket.addEventListener("open", resolve, { once: true });
    websocket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  websocket.addEventListener("message", event => {
    const value = JSON.parse(String(event.data));
    const resolver = pending.get(value.id);
    if (!resolver) return;
    pending.delete(value.id);
    clearTimeout(resolver.timer);
    if (value.error) resolver.reject(Error(JSON.stringify(value.error)));
    else resolver.resolve(value.result);
  });
  function call(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(Error(method + " timeout")); }, 45000);
      pending.set(id, { resolve, reject, timer });
      websocket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const out = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (out.exceptionDetails) throw Error(JSON.stringify(out.exceptionDetails).slice(0,1000));
    return out.result?.value;
  }
  await call("Page.enable");
  await call("Runtime.enable");
  const tests = [
    ["ja", "/tools/construction-tools-atlas/", 360, 800, true],
    ["en", "/tools/construction-tools-atlas/", 360, 800, true],
    ["ja", "/tools/construction-tools-atlas/", 390, 844, true],
    ["en", "/tools/construction-tools-atlas/", 390, 844, true],
    ["ja", "/tools/construction-tools-atlas/", 1280, 900, false],
    ["en", "/tools/construction-tools-atlas/", 1280, 900, false]
  ];
  for (const [lang, route, width, height, mobile] of tests) {
    await call("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height
    });
    await call("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    await call("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }]
    });
    const url = ORIGIN + route;
    await call("Page.navigate", { url });
    await until(async () => (await evaluate("location.href")).startsWith(url));
    const result = await evaluate("(" + smoke.toString() + ")(" + JSON.stringify(lang) + ")");
    const screenshot=await call("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
    const outDir=path.join(process.cwd(),"artifacts","construction-atlas-viewport");
    fs.mkdirSync(outDir,{recursive:true});
    fs.writeFileSync(path.join(outDir,lang+"-"+width+".png"),Buffer.from(screenshot.data,"base64"));
    assert.ok(result.ok, lang + " " + width + ": " + JSON.stringify(result));
    assert.equal(result.width, width, "Incorrect CSS viewport width");
    assert.ok(result.clientWidth <= width && result.clientWidth >= width - (mobile ? 0 : 24), "Incorrect layout viewport width; allow native desktop scrollbar");
    console.log("PASS", lang, width + "px", JSON.stringify(result));
  }
  console.log("Construction Tools Atlas local Chromium PASS: actual 360px/390px mobile and 1280px desktop, JA/EN, 870 entries, aliases, detail sheet and no horizontal overflow.");
} finally {
  if (websocket?.readyState === WebSocket.OPEN) websocket.close();
  child.kill("SIGTERM");
  await new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) resolve();
    else child.once("close", resolve);
  });
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
  await new Promise(resolve=>server.close(resolve));
}
