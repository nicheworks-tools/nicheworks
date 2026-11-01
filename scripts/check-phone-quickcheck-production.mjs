import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const url = new URL(process.argv.find(x => x.startsWith('--url='))?.slice(6) || 'https://nicheworks.app/tools/phone-quickcheck/');
assert.ok(['https:', 'http:'].includes(url.protocol), 'HTTP(S) URL only');
const canonicalPayload = JSON.parse(readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const phones = canonicalPayload.phones;
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
  const livePayload = JSON.parse(data['data/phones.json']);
  const live = livePayload.phones;
  assert.equal(live.length,count,'Public JSON count is stale');
  assert.deepEqual(livePayload,canonicalPayload,'Public JSON differs from the canonical GitHub data (including model facts/provenance)');
  assert.ok(live.some(p=>p.id==='fcnt-arrows-alpha2-m10'),'FCNT Alpha backfill missing from public JSON');
  assert.ok(live.some(p=>p.id==='fcnt-arrows-we2-plus-m06'),'FCNT We2 Plus backfill missing from public JSON');
  assert.equal(live.find(p=>p.id==='nothing-phone-3a')?.charging?.wirelessStatus,'not_supported','Nothing 3a source-backed no-wireless status missing');
  assert.equal(live.find(p=>p.id==='fcnt-arrows-alpha-m08')?.included?.adapter,'included','FCNT Alpha bundled charger missing from public data');
  assert.ok(live.some(p=>p.id==='fcnt-arrows-alpha2-m10'),'Existing FCNT Alpha2 missing from public JSON');
  assert.equal(live.find(p=>p.id==='nothing-phone-4b')?.charging?.wirelessStatus,'not_supported','Existing Nothing 4b wireless negative state missing');
  // Wave 18: verify all four added models and SKU-specific charging/package facts in public deployment.
  assert.ok(live.some(p=>p.id==='fcnt-arrows-we2-m07'),'FCNT We2 M07 missing from public JSON');
  assert.equal(live.find(p=>p.id==='fcnt-arrows-we2-m07')?.charging?.battery?.capacityMah,4500,'FCNT We2 M07 battery mismatch');
  assert.equal(live.find(p=>p.id==='nothing-cmf-phone-2-pro')?.charging?.wirelessStatus,'not_supported','CMF Phone 2 Pro unsupported-wireless evidence missing');
  assert.equal(live.find(p=>p.id==='nothing-cmf-phone-2-pro')?.charging?.wiredMaxW,33,'CMF Phone 2 Pro 33W missing');
  assert.equal(live.find(p=>p.id==='nothing-phone-3a-lite')?.charging?.wirelessStatus,'not_supported','Phone 3a Lite no-wireless evidence missing');
  assert.equal(live.find(p=>p.id==='nothing-phone-3a-lite')?.included?.cable,'included','Phone 3a Lite Japan cable mismatch');
  assert.equal(live.find(p=>p.id==='nothing-phone-3')?.charging?.wirelessMaxW,15,'Phone 3 15W wireless mismatch');
  assert.equal(live.find(p=>p.id==='nothing-phone-3')?.included?.cable,'included','Phone 3 Japan A024 cable mismatch');
  // Wave 20: four current Japan-store Nothing models, explicit packaged/wireless/charging/variant facts.
  assert.equal(live.find(p=>p.id==='nothing-phone-4a')?.charging?.wiredMaxW,50,'Phone 4a wired 50W absent from live data');
  assert.equal(live.find(p=>p.id==='nothing-phone-4a')?.included?.cable,'included','Phone 4a JP cable inclusion absent');
  assert.equal(live.find(p=>p.id==='nothing-phone-4a-pro')?.charging?.wirelessStatus,'not_supported','Phone 4a Pro JP wireless negative missing');
  assert.equal(live.find(p=>p.id==='nothing-phone-4a-pro')?.included?.adapter,'not_included','Phone 4a Pro JP charger exclusion missing');
  assert.equal(live.find(p=>p.id==='nothing-phone-2a')?.charging?.wiredMaxW,45,'Phone 2a device 45W not deployed');
  assert.equal(live.find(p=>p.id==='nothing-phone-2a')?.charging?.wirelessStatus,'not_supported','Phone 2a wireless negative missing');
  const cmf1=live.find(p=>p.id==='nothing-cmf-phone-1');
  assert.ok(cmf1,'CMF Phone 1 missing from live JSON');
  assert.equal(cmf1.charging?.wiredMaxW,33,'CMF Phone 1 33W missing');
  assert.equal(cmf1.charging?.pps,'supported','CMF Phone 1 primary-sourced PPS missing');
  assert.deepEqual(cmf1.physicalVariants?.map(v=>[v.depthMm,v.weightG]),[[8,197],[9,202]],'CMF Phone 1 exact variant pair mismatch');
  // FCNT Wave 22: exact-model manufacturer facts, and no invented charging max/adapter wattage.
  const expectedFcnt=[
    ['fcnt-arrows-we3-m09',2026,5000,'USB PD 3.0'],
    ['fcnt-arrows-n-f51c',2023,4600,'USB PD 2.0'],
    ['fcnt-arrows-we-f51b',2021,4000,'USB PD 3.0'],
    ['fcnt-arrows-nx9-f52a',2020,3600,'USB PD 2.0']
  ];
  for(const [id,year,battery,pd] of expectedFcnt){
    const phone=live.find(p=>p.id===id);
    assert.ok(phone,'Public FCNT model missing: '+id);
    assert.equal(phone.releaseYear,year,id+' release year mismatch');
    assert.equal(phone.charging?.battery?.capacityMah,battery,id+' battery mismatch');
    assert.ok(phone.charging?.protocols?.includes(pd),id+' primary-source USB PD revision missing');
    assert.equal(phone.included?.adapter,'not_included',id+' excluded AC adapter mismatch');
    assert.equal(phone.included?.cable,'not_included',id+' excluded cable mismatch');
    assert.equal(phone.charging?.wiredMaxW,null,id+' handset max W must remain unknown');
    assert.equal(phone.charging?.pps,'unknown',id+' PPS must remain unknown');
  }
  // Wave 26 FCNT historic JP models: explicit sources, correct package and charging semantics.
  const wave26Models=[
    ['fcnt-arrows-be4-plus-f41b',2021,3600,null,false],
    ['fcnt-arrows-5g-f51a',2020,4070,'USB PD 2.0',false],
    ['fcnt-arrows-be4-f41a',2020,2780,null,true],
    ['fcnt-arrows-be3-f02l',2019,2780,null,true]
  ];
  for(const [id,year,mah,pd,negativeQi] of wave26Models){
    const p=live.find(item=>item.id===id);
    assert.ok(p,'Wave26 FCNT record missing in public deployment: '+id);
    assert.equal(p.releaseYear,year,id+' JP release year mismatch');
    assert.equal(p.charging?.battery?.capacityMah,mah,id+' manufacturer/carrier battery mismatch');
    assert.deepEqual(p.charging?.protocols,pd?[pd]:[],id+' source-backed PD protocol mismatch');
    assert.equal(p.included?.cable,'not_included',id+' standard package USB cable mismatch');
    assert.equal(p.included?.adapter,'not_included',id+' standard box AC brick mismatch');
    assert.equal(p.charging?.wiredMaxW,null,id+' phone wired max W must stay unknown');
    assert.equal(p.charging?.pps,'unknown',id+' PPS must stay unknown');
    if(negativeQi){
      assert.equal(p.charging?.wirelessStatus,'not_supported',id+' carrier-confirmed Qi negative missing');
      assert.match(p.sources?.wirelessUrl||'',/^https:\/\/www\.docomo\.ne\.jp\//,id+' domestic wireless primary source missing');
    }
  }
  const liveAccessories=JSON.parse(data['data/accessories.json']);
  const localAccessories=JSON.parse(readFileSync('tools/phone-quickcheck/data/accessories.json','utf8'));
  assert.deepEqual(liveAccessories,localAccessories,'Public accessories JSON differs from the canonical GitHub data');
  assert.equal(liveAccessories.accessories.length,22,'Expected 22 published affiliate accessory categories');
  for(const key of ['charger-pd-check-wattage','charger-pd-90w']){
    assert.ok(liveAccessories.accessories.some(x=>x.key===key),'Public accessory category missing: '+key);
  }
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
      // Ensure the real public UI preserves both material-specific CMF Phone 1 thickness/weight pairs.
      const cmfRender=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="CMF Phone 1";input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id=nothing-cmf-phone-1]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,standard:detail.includes("8 mm / 197 g")&&detail.includes("Black / Light Green"),vegan:detail.includes("9 mm / 202 g")&&detail.includes("Orange (vegan leather)")};})()');
      assert.ok(cmfRender.found&&cmfRender.standard&&cmfRender.vegan,width+'px CMF Phone 1 variant pairs not rendered: '+JSON.stringify(cmfRender));
      if(cmfRender.mobile) await evalJs('document.querySelector("#sheetClose").click()');
      // FCNT We3 live user journey: search, select, manufacturer-backed PD revision, mobile close.
      const fcntRender=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="arrows We3 M09";input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id=fcnt-arrows-we3-m09]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,model:detail.includes("arrows We3 M09"),pd:detail.includes("USB PD 3.0")};})()');
      assert.ok(fcntRender.found&&fcntRender.model&&fcntRender.pd,width+'px FCNT We3 M09 search/detail or PD rendering failed: '+JSON.stringify(fcntRender));
      // Verify actually rendered Amazon handoffs, not merely config or JSON placeholders.
      const affiliateExpression='(()=>{const mobile=matchMedia("(max-width: 900px)").matches;const root=document.querySelector(mobile?"#sheetDetail":"#desktopDetail");const links=[...root.querySelectorAll(".affiliate-btn.amazon-cta")].map(a=>({label:a.textContent,href:a.href,rel:a.rel,target:a.target,visible:a.getClientRects().length>0}));return {links,disclosure:root.querySelector(".amazon-disclosure")?.textContent||"",lang:document.documentElement.lang};})()';
      const enOffers=await until(async()=>{const o=await evalJs(affiliateExpression);return o.links.length===3?o:null;},9000);
      assert.equal(enOffers.lang,'en',width+'px: expected English affiliate text');
      assert.ok(enOffers.links.some(a=>a.label.includes('Find USB-PD chargers')&&a.label.includes('verify wattage')),width+'px: missing source-aware generic USB-PD offer');
      assert.ok(enOffers.disclosure.includes('As an Amazon Associate'),width+'px: English Associates disclosure missing');
      for(const link of enOffers.links){
        const u=new URL(link.href);
        assert.equal(u.hostname,'www.amazon.co.jp',width+'px: wrong merchant host');
        assert.equal(u.searchParams.get('tag'),'nicheworks09-22',width+'px: missing Associates tracking tag');
        assert.ok(u.searchParams.get('k')&&!u.searchParams.get('k').includes('arrows We3'),width+'px: destination query must not include phone/user search');
        assert.ok(link.rel.includes('sponsored')&&link.rel.includes('noopener'),width+'px: affiliate rel must be sponsored noopener');
        assert.equal(link.target,'_blank',width+'px: affiliate target should be blank');
        assert.ok(link.visible,width+'px: Amazon CTA is not visible');
      }
      await evalJs('document.querySelector("button[data-lang=ja]").click()');
      const jaOffers=await until(async()=>{const o=await evalJs(affiliateExpression);return o.lang==='ja'&&o.links.length===3&&o.links.some(a=>a.label.includes('AmazonでUSB-PD充電器を探す'))?o:null;},8000);
      assert.ok(jaOffers.disclosure.includes('Amazonのアソシエイトとして'),width+'px: Japanese Associates disclosure missing');
      if(fcntRender.mobile) await evalJs('document.querySelector("#sheetClose").click()');
      const alphaFound=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="arrows Alpha2 M10";input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id=fcnt-arrows-alpha2-m10]");if(!row)return false;row.click();return true;})()');
      assert.ok(alphaFound,width+'px: Alpha2 search row missing');
      const alphaOffers=await until(async()=>{const o=await evalJs(affiliateExpression);return o.links.length===3&&o.links.some(a=>a.label.includes('90W以上'))?o:null;},9000);
      assert.ok(alphaOffers.links.every(a=>new URL(a.href).searchParams.get('tag')==='nicheworks09-22'),width+'px: Alpha2 affiliate tracking tag missing');
      if(fcntRender.mobile) await evalJs('document.querySelector("#sheetClose").click()');
      // New model purchase journey on deployed Chrome UI: a sourced PD charger, and no invented PD on Be3.
      const f51Result=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="arrows 5G F-51A";input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id=fcnt-arrows-5g-f51a]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const text=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,model:text.includes("arrows 5G F-51A"),pd:text.includes("USB PD 2.0")};})()');
      assert.ok(f51Result.found&&f51Result.model&&f51Result.pd,width+'px Wave26 FCNT F-51A detail/PD absent: '+JSON.stringify(f51Result));
      const f51Offers=await until(async()=>{const o=await evalJs(affiliateExpression);return o.links.length===3&&o.links.some(x=>x.label.includes('USB-PD'))?o:null;},8000);
      assert.ok(f51Offers.links.every(x=>new URL(x.href).searchParams.get('tag')==='nicheworks09-22'),width+'px F-51A purchase links untagged');
      if(f51Result.mobile) await evalJs('document.querySelector("#sheetClose").click()');
      const be3Result=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="arrows Be3 F-02L";input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id=fcnt-arrows-be3-f02l]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,model:detail.includes("arrows Be3 F-02L"),wirelessNegative:detail.includes("非対応")};})()');
      assert.ok(be3Result.found&&be3Result.model&&be3Result.wirelessNegative,width+'px Be3 domestic wireless fact/detail missing: '+JSON.stringify(be3Result));
      const be3Offers=await until(async()=>{const o=await evalJs(affiliateExpression);return o.links.length===2?o:null;},8000);
      assert.ok(!be3Offers.links.some(x=>x.label.includes('USB-PD')),width+'px Be3 must not claim unverified USB PD support');
      if(be3Result.mobile) await evalJs('document.querySelector("#sheetClose").click()');
      console.log('Wave26 FCNT PASS: '+width+'px, historic 4 models, F-51A USB PD2.0 + tagged 3 CTAs, Be3 Qi negative and no guessed PD');
      console.log('Affiliate PASS: '+width+'px, live EN/JA tagged links, sponsored rel and disclosure, generic USB-PD, Alpha2 90W');
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
