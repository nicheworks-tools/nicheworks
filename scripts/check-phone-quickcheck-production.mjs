import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const url = new URL(process.argv.find(x => x.startsWith('--url='))?.slice(6) || 'https://nicheworks.app/tools/phone-quickcheck/');
assert.ok(['https:', 'http:'].includes(url.protocol), 'HTTP(S) URL only');
const phones = JSON.parse(readFileSync('tools/phone-quickcheck/data/phones.json','utf8')).phones;
const count = phones.length;
const artifacts = 'artifacts/phone-quickcheck-production';
mkdirSync(artifacts,{recursive:true});
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const req = async endpoint => fetch(new URL(endpoint,url), {
  headers:{'Cache-Control':'no-cache','Pragma':'no-cache'},
  signal:AbortSignal.timeout(15000)
});
async function httpSmoke(){
  const names = ['','app.js','style.css','data/phones.json','data/accessories.json'];
  const entries = await Promise.all(names.map(async name => {
    const response = await req(name);
    assert.equal(response.status,200,(name||'index')+' status '+response.status);
    assert.equal(new URL(response.url).origin,url.origin,'Unexpected redirect on '+name);
    return [name,await response.text()];
  }));
  const data = Object.fromEntries(entries);
  assert.ok(data[''].includes(count+'機種'),'HTML count is stale');
  assert.ok(data[''].includes('id="phoneList"'),'HTML list missing');
  assert.ok(data['app.js'].includes("wirelessStatus === 'not_supported'"),'Live JS is stale');
  assert.ok(data['style.css'].includes('.bottom-sheet'),'Live CSS missing');
  assert.ok(data['style.css'].includes('.bottom-sheet .detail-title{padding-right:46px}'),'Live CSS missing mobile close-button collision fix');
  const live = JSON.parse(data['data/phones.json']).phones;
  assert.equal(live.length,count,'Public JSON count is stale');
  assert.ok(live.some(p=>p.id==='fcnt-arrows-alpha2-m10'),'FCNT missing from public JSON');
  assert.equal(live.find(p=>p.id==='nothing-phone-4b')?.charging?.wirelessStatus,'not_supported','Nothing wireless negative state missing');
  assert.ok(Array.isArray(JSON.parse(data['data/accessories.json']).accessories),'Accessories JSON missing');
  console.log('HTTP PASS: '+count+' verified public phones, assets and latest records');
}
async function until(check,ms){
  const deadline=Date.now()+ms;let last;
  while(Date.now()<deadline){
    try {const value=await check();if(value)return value;}catch(error){last=error;}
    await sleep(180);
  }
  throw last||new Error('Timed out after '+ms+'ms');
}
async function cdp(wsUrl){
  const socket=new WebSocket(wsUrl);const pending=new Map();let id=0;
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    const entry=pending.get(message.id);if(!entry)return;
    pending.delete(message.id);
    if(message.error)entry.reject(new Error('CDP '+message.error.message));
    else entry.resolve(message.result);
  });
  await Promise.race([
    new Promise((resolve,reject)=>{
      socket.addEventListener('open',resolve,{once:true});
      socket.addEventListener('error',reject,{once:true});
    }),
    sleep(12000).then(()=>{throw new Error('Chrome WebSocket timed out');})
  ]);
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const n=++id;
    const timer=setTimeout(()=>{pending.delete(n);reject(new Error('CDP timeout: '+method));},12000);
    pending.set(n,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});
    socket.send(JSON.stringify({id:n,method,params}));
  });
  return {send,close:()=>socket.close()};
}
async function browserSmoke(){
  const dir=mkdtempSync(path.join(os.tmpdir(),'phone-smoke-'));
  const binary=process.env.CHROME_BIN||'google-chrome';
  const child=spawn(binary,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--disable-extensions','--no-first-run','--no-default-browser-check',
    '--disable-background-networking','--remote-allow-origins=*',
    '--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'
  ],{stdio:['ignore','ignore','pipe']});
  let startupError;let errors='';
  child.on('error',error=>startupError=error);
  child.stderr.on('data',bytes=>{errors=(errors+bytes.toString()).slice(-2000);});
  let client;
  try{
    const debugFile=path.join(dir,'DevToolsActivePort');
    await until(()=>{
      if(startupError)throw startupError;
      if(child.exitCode!==null)throw new Error('Chrome exited '+child.exitCode+': '+errors);
      return existsSync(debugFile);
    },20000);
    const port=Number(readFileSync(debugFile,'utf8').split('\n')[0]);
    const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();
    const tab=tabs.find(t=>t.type==='page');
    assert.ok(tab?.webSocketDebuggerUrl,'Chrome target missing');
    client=await cdp(tab.webSocketDebuggerUrl);
    const send=client.send;
    await send('Page.enable');await send('Runtime.enable');
    async function evalJs(expression){
      const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(response.exceptionDetails)throw new Error('Browser JS exception: '+JSON.stringify(response.exceptionDetails).slice(0,700));
      return response.result.value;
    }
    for(const width of [320,390,414,768,1280]){
      const height=width<=414?812:900;
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=900});
      const navigate=await send('Page.navigate',{url:url.href});
      if(navigate.errorText)throw new Error(width+'px navigation: '+navigate.errorText);
      await until(async()=>{
        const value=await evalJs('document.querySelector("#dataState")?.textContent||""');
        if(/読込エラー|load error/i.test(value))throw new Error('Data loading failed at '+width+'px');
        return value===count+'機種'||value===count+' models';
      },25000);
      await evalJs('document.querySelector("button[data-lang=ja]").click()');
      const layout=await evalJs('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,rows:document.querySelectorAll(".phone-row").length})');
      assert.ok(layout.rows>0,width+'px: no rows');
      assert.ok(layout.scroll<=layout.width+1,width+'px horizontal overflow '+layout.scroll+' > '+layout.width);
      await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="Phone (4b)";input.dispatchEvent(new Event("input",{bubbles:true}));})()');
      await until(()=>evalJs('document.querySelectorAll(".phone-row[data-phone-id=nothing-phone-4b]").length===1'),8000);
      const jp=await evalJs('(()=>{document.querySelector(".phone-row[data-phone-id=nothing-phone-4b]").click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail");const ok=[...detail.querySelectorAll(".kv")].some(x=>x.querySelector("span")?.textContent==="ワイヤレス"&&x.querySelector("b")?.textContent==="非対応");return {mobile,open:!document.querySelector("#mobileSheet").hidden,ok};})()');
      assert.ok(jp.ok,width+'px: JP wireless negative state not rendered');
      assert.equal(jp.open,jp.mobile,width+'px: bottom sheet state mismatch');
      if(jp.mobile){
        const rects=await evalJs('(()=>{const badge=document.querySelector("#mobileSheet .status-badge").getBoundingClientRect();const close=document.querySelector("#sheetClose").getBoundingClientRect();return {badge:{left:badge.left,right:badge.right,top:badge.top,bottom:badge.bottom},close:{left:close.left,right:close.right,top:close.top,bottom:close.bottom,width:close.width,height:close.height},overlap:badge.left<close.right&&badge.right>close.left&&badge.top<close.bottom&&badge.bottom>close.top};})()');
        assert.ok(rects.close.width>=32&&rects.close.height>=32,width+'px: close button tap area shrank');
        assert.equal(rects.overlap,false,width+'px: Quick Check badge overlaps close button: '+JSON.stringify(rects));
      }
      const en=await evalJs('(()=>{document.querySelector("button[data-lang=en]").click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail");return {ok:[...detail.querySelectorAll(".kv")].some(x=>x.querySelector("span")?.textContent==="Wireless"&&x.querySelector("b")?.textContent==="Not supported"),lang:document.documentElement.lang,count:document.querySelector("#dataState")?.textContent};})()');
      assert.ok(en.ok&&en.lang==='en'&&en.count===count+' models',width+'px: EN detail or counter incorrect: '+JSON.stringify(en));
      const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      writeFileSync(path.join(artifacts,'phone-quickcheck-'+width+'px.png'),Buffer.from(screenshot.data,'base64'));
      if(jp.mobile){
        const closed=await evalJs('(()=>{document.querySelector("#sheetClose").click();return document.querySelector("#mobileSheet").hidden&&document.body.style.overflow==="";})()');
        assert.equal(closed,true,width+'px: bottom sheet fails to close');
      }
      console.log('Chrome PASS: '+width+'px, no overflow, search, JP/EN, '+(jp.mobile?'mobile sheet':'desktop detail'));
    }
  }finally{
    client?.close();child.kill('SIGTERM');await sleep(300);
    rmSync(dir,{recursive:true,force:true});
  }
}
const attempts=Math.max(1,Number(process.env.PHONE_SMOKE_RETRIES||8));
const retryMs=Math.max(0,Number(process.env.PHONE_SMOKE_RETRY_DELAY_MS||15000));
let successful=false;
for(let attempt=1;attempt<=attempts;attempt++){
  try{await httpSmoke();successful=true;break;}
  catch(error){
    console.error('Public HTTP attempt '+attempt+'/'+attempts+' failed: '+error.message);
    if(attempt<attempts)await sleep(retryMs);
  }
}
assert.ok(successful,'Public HTTP smoke failed after '+attempts+' attempts at '+url.href);
await browserSmoke();
console.log('Production Phone QuickCheck PASS: '+count+' models, all 5 viewport browser checks');
