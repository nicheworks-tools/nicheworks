chrome.action.onClicked.addListener(() => chrome.tabs.create({url:chrome.runtime.getURL("collector.html")}));
const safeUrl = raw => { const u = new URL(raw); if(!["http:","https:"].includes(u.protocol)) throw Error("Only HTTP(S) URLs are supported"); return u; };
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function send(id,method,params={}) { return chrome.debugger.sendCommand({tabId:id},method,params); }
async function withTarget(url,run) {
  const u=safeUrl(url), origin=u.origin+"/*";
  if(!await chrome.permissions.contains({origins:[origin]})) throw Error("Site permission not granted: "+u.origin);
  const tab=await chrome.tabs.create({url:u.href,active:true});
  try {
    await waitTab(tab.id,25000);
    const current=await chrome.tabs.get(tab.id);
    if(!current.url || new URL(current.url).origin!==u.origin) throw Error("Navigation redirected outside the authorized origin");
    return await run(tab.id);
  } finally { await chrome.tabs.remove(tab.id).catch(()=>{}); }
}
function waitTab(id,timeout) { return new Promise((resolve,reject)=>{
  let done=false;
  const clear=()=>{chrome.tabs.onUpdated.removeListener(onUpdate);chrome.tabs.onRemoved.removeListener(onRemove);clearTimeout(timer);};
  const finish=e=>{if(done)return;done=true;clear();e?reject(e):resolve();};
  const onUpdate=(tabId,change)=>{if(tabId===id && change.status==="complete")finish();};
  const onRemove=tabId=>{if(tabId===id)finish(Error("Capture tab closed"));};
  const timer=setTimeout(()=>finish(Error("Navigation timeout")),timeout);
  chrome.tabs.onUpdated.addListener(onUpdate);chrome.tabs.onRemoved.addListener(onRemove);
  chrome.tabs.get(id).then(t=>{if(t.status==="complete")finish();}).catch(finish);
}); }
async function pageInfo(id) {
  const result=await chrome.scripting.executeScript({target:{tabId:id},func:()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,viewportWidth:innerWidth,viewportHeight:innerHeight,dpr:devicePixelRatio})});
  return result[0].result;
}
async function warmLazy(id) {
  await chrome.scripting.executeScript({target:{tabId:id},func:async()=>{
    await document.fonts.ready;
    const nap=ms=>new Promise(r=>setTimeout(r,ms));
    let steps=0;
    while(steps<40){ const bottom=Math.max(0,document.documentElement.scrollHeight-innerHeight); const next=Math.min(bottom,window.scrollY+Math.max(200,Math.floor(innerHeight*.75))); window.scrollTo(0,next); await nap(170); steps++; if(next>=bottom)break; }
    window.scrollTo(0,0); await nap(350);
  }});
}
async function cdpCapture(id){
  // Recheck the final origin immediately before invoking privileged capture.
  const tab=await chrome.tabs.get(id);
  if(!tab.url || !["http:","https:"].includes(new URL(tab.url).protocol))throw Error("Unsafe capture target");
  await chrome.debugger.attach({tabId:id},"1.3");
  try {
    await send(id,"Page.enable");
    const metrics=await send(id,"Page.getLayoutMetrics");
    const rect=metrics.cssContentSize||metrics.contentSize;
    const w=Math.ceil(rect.width),h=Math.ceil(rect.height);
    if(w<=0||h<=0||w>16000||h>30000) throw Error("Document dimensions outside PoC bounds: "+w+"x"+h);
    const result=await send(id,"Page.captureScreenshot",{format:"png",captureBeyondViewport:true,fromSurface:true,clip:{x:0,y:0,width:w,height:h,scale:1}});
    return {dataUrl:"data:image/png;base64,"+result.data,width:w,height:h,method:"cdp"};
  } finally { await chrome.debugger.detach({tabId:id}).catch(()=>{}); }
}
async function scrollCapture(id){
  const info=await pageInfo(id);
  if(info.width>info.viewportWidth) throw Error("Horizontal overflow: scroll stitch unsupported in this PoC");
  const count=Math.ceil(info.height/info.viewportHeight);
  if(count>35 || info.height>24000)throw Error("Too many viewport segments for PoC");
  const chunks=[];
  for(let i=0;i<count;i++){
    const y=Math.min(i*info.viewportHeight,Math.max(0,info.height-info.viewportHeight));
    await chrome.scripting.executeScript({target:{tabId:id},func:pos=>window.scrollTo(0,pos),args:[y]});
    await sleep(650);
    const t=await chrome.tabs.get(id);
    if(!t.active)throw Error("Capture tab is not active");
    const dataUrl=await chrome.tabs.captureVisibleTab(t.windowId,{format:"png"});
    chunks.push({y,dataUrl});
  }
  return {chunks,info,method:"scroll",warning:"Visible-tab permission and sticky/fixed-element seams require visual QA"};
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(msg?.type!=="CAPTURE_POC")return;
  (async()=>{
    const url=safeUrl(msg.url).href;
    if(!sender.url?.startsWith(chrome.runtime.getURL("collector.html")))throw Error("Unexpected message sender");
    const result=await withTarget(url,async id=>{
      await warmLazy(id);
      if(msg.engine==="cdp")return await cdpCapture(id);
      if(msg.engine==="scroll")return await scrollCapture(id);
      throw Error("Unknown capture engine");
    });
    reply({ok:true,result});
  })().catch(e=>reply({ok:false,error:String(e.message||e)}));
  return true;
});
