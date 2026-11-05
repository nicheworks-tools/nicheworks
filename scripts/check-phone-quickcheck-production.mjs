import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const url = new URL(process.argv.find(x => x.startsWith('--url='))?.slice(6) || 'https://nicheworks.app/tools/phone-quickcheck/');
assert.ok(['https:', 'http:'].includes(url.protocol), 'HTTP(S) URL only');
const canonicalPayload = JSON.parse(readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const growthPayload = JSON.parse(readFileSync('tools/phone-quickcheck/data/phones-growth-20261103.json','utf8'));
const phones = [...canonicalPayload.phones, ...growthPayload.phones];
const count = phones.length;
const artifacts = 'artifacts/phone-quickcheck-production';
mkdirSync(artifacts,{recursive:true});
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const req = async endpoint => fetch(new URL(endpoint,url), {
  headers:{'Cache-Control':'no-cache','Pragma':'no-cache'},
  signal:AbortSignal.timeout(15000)
});
async function httpSmoke(){
  const names = ['','app.js','style.css','data/phones.json','data/phones-growth-20261103.json','data/accessories.json'];
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
  assert.ok(data['app.js'].includes("const deepPhone ="),'Live JS lacks the exact-model deep-link deployment');
  assert.ok(data['app.js'].includes('phones-growth-20261103.json'),'Live JS lacks curated phone growth loader');
  assert.ok(data['style.css'].includes('.bottom-sheet'),'Live CSS missing');
  assert.ok(data['style.css'].includes('.bottom-sheet .detail-title{padding-right:46px}'),'Live CSS missing mobile close-button collision fix');
  const livePayload = JSON.parse(data['data/phones.json']);
  const liveGrowth = JSON.parse(data['data/phones-growth-20261103.json']);
  assert.deepEqual(liveGrowth,growthPayload,'Public growth JSON differs from reviewed official-source pack');
  const live = [...livePayload.phones,...liveGrowth.phones];
  assert.equal(live.length,count,'Public combined phone count is stale');
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
  // Wave 28: five distinct Japan-marketed FCNT models, including exact source-backed box variance.
  const wave28=[
    ['fcnt-arrows-be-f04k',2018,2580,'not_included'],
    ['fcnt-arrows-u-801fj',2019,2880,'not_included'],
    ['fcnt-arrows-j-901fj',2019,2880,'not_included'],
    ['fcnt-arrows-rx',2019,2880,'included'],
    ['fcnt-arrows-m05',2019,2880,'not_included']
  ];
  for(const [id,year,mah,cable] of wave28){
    const p=live.find(item=>item.id===id);
    assert.ok(p,'Wave28 FCNT Japan marketed model missing from public data: '+id);
    assert.equal(p.releaseYear,year,id+' release year mismatch');
    assert.equal(p.charging?.battery?.capacityMah,mah,id+' battery mismatch');
    assert.equal(p.included?.cable,cable,id+' standard-box cable inclusion mismatch');
    assert.equal(p.included?.adapter,'not_included',id+' excluded wall adapter mismatch');
    assert.deepEqual(p.charging?.protocols,[],id+' must not assert an unknown PD protocol');
    assert.equal(p.charging?.wiredMaxW,null,id+' must not invent max charging watts');
    assert.equal(p.charging?.pps,'unknown',id+' must not invent PPS');
    assert.equal(p.waterRating,'IPX5/IPX8 / IP6X',id+' official water and dust mismatched');
  }
  const rx=live.find(x=>x.id==='fcnt-arrows-rx');
  assert.equal(rx?.charging?.wirelessStatus,'not_supported','Rakuten-supported RX no-wireless fact missing');
  assert.match(rx?.sources?.wirelessUrl||'',/^https:\/\/network\.mobile\.rakuten\.co\.jp\//,'RX negative wireless source must be the domestic carrier');
  // Wave31 original Japan-market variants; check package/protocol and provenance beyond the total count.
  const wave31=[
    ['samsung-galaxy-s23-ultra-sc52d',2023,5000,'included','not_included'],
    ['sony-xperia-1-j9110',2020,3330,'not_included','not_included'],
    ['sharp-aquos-sense-plus-shm07',2018,3100,'included','included'],
    ['sharp-aquos-sense3-shm12',2019,4000,'not_included','included'],
    ['sharp-aquos-sense3-plus-shm11',2019,4000,'not_included','included']
  ];
  for(const [id,year,battery,cable,adapter] of wave31){
    const p=live.find(x=>x.id===id);
    assert.ok(p,'Wave31 public domestic handset missing: '+id);
    assert.equal(p.releaseYear,year,id+' release year mismatch');
    assert.equal(p.charging?.battery?.capacityMah,battery,id+' manufacturer mAh mismatch');
    assert.equal(p.included?.cable,cable,id+' bundle cable mismatch');
    assert.equal(p.included?.adapter,adapter,id+' bundle adapter mismatch');
    assert.equal(p.charging?.wiredMaxW,null,id+' no invented handset maximum watts');
  }
  const s23=live.find(x=>x.id==='samsung-galaxy-s23-ultra-sc52d');
  assert.equal(s23?.charging?.pps,'supported','Samsung source-backed PPS support lost');
  assert.ok(s23?.charging?.protocols?.some(x=>String(x).includes('3.1')),'Samsung carrier-verified PD3.1 lost');
  assert.equal(s23?.charging?.wirelessStandard,'Qi','Samsung docomo verified Qi lost');
  assert.equal(live.find(x=>x.id==='sony-xperia-1-j9110')?.charging?.wirelessStatus,'not_supported','Sony manufacturer no-wireless statement missing');
  const liveAccessories=JSON.parse(data['data/accessories.json']);
  const localAccessories=JSON.parse(readFileSync('tools/phone-quickcheck/data/accessories.json','utf8'));
  assert.deepEqual(liveAccessories,localAccessories,'Public accessories JSON differs from the canonical GitHub data');
  assert.equal(liveAccessories.accessories.length,27,'Expected 27 published affiliate accessory categories');
  for(const key of ['charger-pd-check-wattage','charger-pd-90w']){
    assert.ok(liveAccessories.accessories.some(x=>x.key===key),'Public accessory category missing: '+key);
  }
  // Validate deployed crawlable commercial SEO pages, not only dynamic JS assets.
  for (const [page,indicator] of [['models/','data-phone-id='],['charging-guide/','適格販売により収入を得ています']]) {
    const response = await req(page);
    assert.equal(response.status,200,'SEO landing '+page+' HTTP '+response.status);
    const html = await response.text();
    assert.ok(html.includes(indicator),'SEO landing '+page+' is stale or absent');
    assert.ok(html.includes('<link rel="canonical"'),'SEO landing '+page+' must have canonical');
    if (page === 'models/') assert.equal((html.match(/data-phone-id=/g)||[]).length,count,'SEO model index count differs from maintained phone data');
  }
  const indexResponse = await req('models/');
  assert.equal(indexResponse.status,200,'Model index HTTP status');
  const indexHtml = await indexResponse.text();
  assert.ok(indexHtml.includes('id="modelSearch"'),'Live model index filter missing');
  assert.ok(indexHtml.includes('./model-index.js'),'Live model index script not linked');
  const indexScriptResponse = await req('models/model-index.js');
  assert.equal(indexScriptResponse.status,200,'Model index filtering script HTTP status');
  assert.ok((await indexScriptResponse.text()).includes('phone_index_model_click'),'Live model index maker click event missing');
  const guideTrackerResponse = await req('charging-guide/affiliate-guide-tracking.js');
  assert.equal(guideTrackerResponse.status,200,'Guide click tracker must be deployed');
  assert.ok((await guideTrackerResponse.text()).includes('affiliate_outbound'),'Live buying guide tracker is missing');
  const guideHtmlResponse = await req('charging-guide/');
  assert.equal((await guideHtmlResponse.text()).match(/data-offer-key=/g)?.length,9,'Nine categorized outbound links required');
  // Curated Japan-only Galaxy model pages must be live and internally linked.
  const profileScript = await req('models/model-profile-affiliate.js');
  assert.equal(profileScript.status,200,'Galaxy model affiliate tracker status');
  assert.ok((await profileScript.text()).includes('affiliate_outbound'),'Galaxy model tracker missing');
  const recentGalaxy = growthPayload.phones.slice(-5);
  for (const galaxy of recentGalaxy) {
    assert.equal(galaxy.manufacturer,'Samsung','Last five growth records must be Japan Galaxy devices');
    const target = 'models/' + galaxy.id + '/';
    const response = await req(target);
    assert.equal(response.status,200,'Model SEO landing '+target+' status');
    const html = await response.text();
    assert.ok(html.includes('<h1>'+galaxy.model+'の充電器・USB-Cケーブルは？</h1>'),'Model page title missing '+target);
    assert.ok(html.includes('href="https://nicheworks.app/tools/phone-quickcheck/'+target+'"'),'Model canonical missing '+target);
    assert.equal((html.match(/data-offer-key=/g)||[]).length,2,'Model affiliate handoffs must be verified '+target);
    assert.ok(html.includes('適格販売により収入を得ています'),'Model ad disclosure missing '+target);
  }

  // Newly added pages are checked locally in PR CI and only required on deployed main.
  if (process.env.PHONE_SMOKE_REQUIRE_CROSS_MAKER === 'true') {
  // Four additional Japanese manufacturer guides must deploy as static SEO pages
  // with exact deep links, source citations and sponsored Amazon search referrals.
  for (const [slug,model] of [
    ['google-pixel-9a','Pixel 9a'],
    ['sharp-aquos-sense9','AQUOS sense9'],
    ['sony-xperia-1-vii','Xperia 1 VII'],
    ['oppo-reno14-5g','OPPO Reno14 5G']
  ]) {
    const endpoint='models/'+slug+'/';
    const response=await req(endpoint);
    assert.equal(response.status,200,'New SEO guide HTTP status '+endpoint);
    const html=await response.text();
    assert.ok(html.includes('<link rel="canonical" href="'+url.origin+url.pathname+endpoint+'">'),
      'New SEO guide canonical missing '+slug);
    assert.ok(html.includes('href="/tools/phone-quickcheck/?model='+encodeURIComponent(model)+'"'),
      'New SEO guide exact-model application link missing '+slug);
    assert.ok(html.includes('適格販売により収入を得ています'),
      'New SEO guide Amazon Associates disclosure missing '+slug);
    assert.equal((html.match(/class="amazon" data-offer-key=/g)||[]).length,2,
      'New SEO guide must have two maintained Amazon search referrals '+slug);
  }
  const enrichedIndex=await (await req('models/')).text();
  for(const slug of ['google-pixel-9a','sharp-aquos-sense9','sony-xperia-1-vii','oppo-reno14-5g']) {
    assert.ok(enrichedIndex.includes('href="./'+slug+'/">充電器・サイズの個別ガイド'),
      'Static model directory missing new SEO guide referral '+slug);
  }
  console.log('Cross-maker SEO HTTP PASS: four new JP phone profiles, catalog inbound links and sponsored searches');

  }

  // Verify representative new pages on main deployment only; PR runs against prior production.
  if (process.env.PHONE_SMOKE_REQUIRE_CROSS_MAKER === 'true') {
    for(const slug of ["google-pixel-3a","google-pixel-4-xl","sharp-aquos-sense2-shm08","xiaomi-redmi-14c","motorola-moto-g05","apple-iphone-17","samsung-galaxy-s26","sony-xperia-10-vii","oppo-find-x9","fcnt-arrows-alpha-m08","nothing-phone-3a","zte-nubia-flip-2"]) {
      const endpoint='models/'+slug+'/';
      const response=await req(endpoint);
      assert.equal(response.status,200,'New profile HTTP '+endpoint);
      const html=await response.text();
      assert.ok(html.includes('<link rel="canonical" href="'+url.origin+url.pathname+endpoint+'">'),'New canonical '+slug);
      assert.equal((html.match(/class="amazon" data-offer-key=/g)||[]).length,4,'Four sponsored referrals '+slug);
      assert.ok(html.includes('適格販売により収入を得ています'),'Amazon disclosure '+slug);
    }
    const directory=await (await req('models/')).text();
    assert.equal((directory.match(/data-phone-id=/g)||[]).length,265,'265 static index rows in production');
    console.log('265 listings and 12 source-backed affiliate profiles HTTP PASS');
  }

  // Verify both ManualFinder locales really deploy the exact-SKU Samsung funnel
  // and that the current app passes manufacturer manual evidence into matcher.
  const manualMatcherResponse = await req('../manual-finder/phone-quickcheck-match.js');
  assert.equal(manualMatcherResponse.status,200,'ManualFinder Galaxy matcher must be deployed');
  const manualMatcher = await manualMatcherResponse.text();
  assert.ok(manualMatcher.includes('SM-A233DZKDDCM'),'Live ManualFinder has no exact A23 DCM SKU');
  assert.ok(manualMatcher.includes('SM-A223DZKADCM'),'Live ManualFinder has no exact A22 DCM SKU');
  assert.ok(manualMatcher.includes('SM-A102DZRJDCM'),'Live ManualFinder has no exact A21 DCM SKU');
  assert.ok(manualMatcher.includes('SM-A102DZRADCM'),'Live ManualFinder has no exact A20 DCM SKU');
  const manualAppResponse = await req('../manual-finder/app.paged.js');
  assert.equal(manualAppResponse.status,200,'ManualFinder JS must be deployed');
  assert.ok((await manualAppResponse.text()).includes('linkFor(x.maker, x.model, x.manualUrl)'),
    'Live ManualFinder is missing the required exact-source argument');
  for (const locale of ['../manual-finder/','../manual-finder/en/']) {
    const page = await req(locale);
    assert.equal(page.status,200,'ManualFinder locale unavailable: '+locale);
    assert.ok((await page.text()).includes('mf-galaxy-sku-20261104a'),
      'ManualFinder has stale JS cache version: '+locale);
  }
  console.log('ManualFinder Galaxy referral HTTP PASS: 4 exact JP DCM SKU deep links, JP/EN scripts');
  console.log('Galaxy SEO HTTP PASS: 5 source-backed model guides and shared sponsored click tracker');
  console.log('SEO HTTP PASS: '+count+' crawlable phone entries, commercial charging guide');
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
      // Smoke-test the real event handler without a network GA4 event or Amazon navigation.
      const clickEvent=await evalJs('(()=>{const mobile=matchMedia("(max-width: 900px)").matches;const root=document.querySelector(mobile?"#sheetDetail":"#desktopDetail");const link=root.querySelector(".affiliate-btn.amazon-cta");if(!link)return null;const original=window.gtag;const captured=[];try{window.gtag=(...args)=>captured.push(args);link.addEventListener("click",e=>e.preventDefault(),{once:true});link.click();}finally{window.gtag=original;}const event=captured.find(args=>args[0]==="event"&&args[1]==="affiliate_outbound");return event?event[2]:null;})()');
      assert.ok(clickEvent,width+'px: shared helper did not emit affiliate_outbound');
      assert.equal(clickEvent.tool_slug,'phone-quickcheck',width+'px: wrong affiliate tool');
      assert.match(clickEvent.affiliate_id,/^phone_fcnt_[a-z0-9-]+$/,width+'px: missing coarse brand/offer ID');
      assert.ok(['cable','wired_charger','wireless_charger','power_bank'].includes(clickEvent.destination_key),width+'px: invalid affiliate destination key');
      assert.equal(clickEvent.placement,width<=900?'mobile_sheet':'desktop_detail',width+'px: wrong affiliate placement');
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
      // Wave 28 actual rendered phone selection and Amazon CTAs, including RX bundled USB-C cable.
      const wave28Cases=[
        ['fcnt-arrows-be-f04k','arrows Be F-04K','2580 mAh'],
        ['fcnt-arrows-u-801fj','arrows U','2880 mAh'],
        ['fcnt-arrows-j-901fj','arrows J','2880 mAh'],
        ['fcnt-arrows-rx','arrows RX','2880 mAh'],
        ['fcnt-arrows-m05','arrows M05','2880 mAh']
      ];
      for(const [modelId,modelName,batteryLabel] of wave28Cases){
        const result=await evalJs('(()=>{const id='+JSON.stringify(modelId)+';const q='+JSON.stringify(modelName)+';const input=document.querySelector("#searchInput");input.value=q;input.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id="+id+"]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const details=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,name:details.includes(q),battery:details.includes('+JSON.stringify(batteryLabel)+'),negativeQi:details.includes("非対応")};})()');
        assert.ok(result.found&&result.name&&result.battery,width+'px Wave28 model search/details not rendered: '+modelId+' '+JSON.stringify(result));
        if(modelId==='fcnt-arrows-rx')assert.ok(result.negativeQi,width+'px RX carrier-proven no-wireless fact not displayed');
        const offer=await until(async()=>{const o=await evalJs(affiliateExpression);return o.links.length===2?o:null;},8000);
        assert.ok(offer.links.every(x=>new URL(x.href).searchParams.get('tag')==='nicheworks09-22'),width+'px '+modelId+' Amazon Associates tagged handoffs missing');
        assert.ok(!offer.links.some(x=>x.label.includes('USB-PD')),width+'px '+modelId+' unsupported PD offer incorrectly displayed');
        if(result.mobile)await evalJs('document.querySelector("#sheetClose").click()');
      }
      // Wave30 — four additional domestically marketed models, source-backed battery and live affiliate destinations.
      const wave30Cases=[
        ['sony-xperia-5-j9260','Xperia 5 (J9260)','3140 mAh'],
        ['sharp-aquos-sense4-lite','AQUOS sense4 lite','4570 mAh'],
        ['sharp-aquos-sense4-plus-shm16','AQUOS sense4 plus (SH-M16)','4120 mAh'],
        ['samsung-galaxy-a25-5g-au','Galaxy A25 5G (au)','5000 mAh']
      ];
      for(const [id,name,battery] of wave30Cases){
        const s=await evalJs('(()=>{const id='+JSON.stringify(id)+';const q='+JSON.stringify(name)+';const i=document.querySelector("#searchInput");i.value=q;i.dispatchEvent(new Event("input",{bubbles:true}));const r=document.querySelector(".phone-row[data-phone-id="+id+"]");if(!r)return {found:false};r.click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,name:detail.includes(q),battery:detail.includes('+JSON.stringify(battery)+')};})()');
        assert.ok(s.found&&s.name&&s.battery,width+'px Wave30 model content not rendered: '+id+' '+JSON.stringify(s));
        const o=await until(async()=>{const v=await evalJs(affiliateExpression);return v.links.length>0?v:null;},8000);
        assert.ok(o.links.every(x=>new URL(x.href).searchParams.get('tag')==='nicheworks09-22'),width+'px Wave30 Amazon tag invalid: '+id);
        if(s.mobile)await evalJs('document.querySelector("#sheetClose").click()');
      }
      // Wave31: validate the new live domestic phones and exact charging/package evidence.
      const wave31Cases=[
        ['samsung-galaxy-s23-ultra-sc52d','Galaxy S23 Ultra (SC-52D)','5000 mAh'],
        ['sony-xperia-1-j9110','Xperia 1 (J9110)','3330 mAh'],
        ['sharp-aquos-sense-plus-shm07','AQUOS sense plus (SH-M07)','3100 mAh'],
        ['sharp-aquos-sense3-shm12','AQUOS sense3 (SH-M12)','4000 mAh'],
        ['sharp-aquos-sense3-plus-shm11','AQUOS sense3 plus (SH-M11)','4000 mAh']
      ];
      for(const [id,name,battery] of wave31Cases){
        const s=await evalJs('(()=>{const id='+JSON.stringify(id)+';const name='+JSON.stringify(name)+';const inp=document.querySelector("#searchInput");inp.value=name;inp.dispatchEvent(new Event("input",{bubbles:true}));const row=document.querySelector(".phone-row[data-phone-id="+id+"]");if(!row)return {found:false};row.click();const mobile=matchMedia("(max-width: 900px)").matches;const detail=document.querySelector(mobile?"#sheetDetail":"#desktopDetail").textContent;return {found:true,mobile,name:detail.includes(name),battery:detail.includes('+JSON.stringify(battery)+'),pd:detail.includes("PD"),pps:detail.includes("PPS"),wirelessNegative:detail.includes("非対応")};})()');
        assert.ok(s.found&&s.name&&s.battery,width+'px Wave31 missing live model/battery: '+id+' '+JSON.stringify(s));
        if(id==='samsung-galaxy-s23-ultra-sc52d')assert.ok(s.pd&&s.pps,width+'px Samsung verified PD/PPS not rendered');
        if(id==='sony-xperia-1-j9110')assert.ok(s.wirelessNegative,width+'px Sony no-wireless fact not shown');
        const offers=await until(async()=>{const v=await evalJs(affiliateExpression);return v.links.length?v:null;},8000);
        assert.ok(offers.links.every(x=>new URL(x.href).searchParams.get('tag')==='nicheworks09-22'),width+'px Wave31 affiliate tracking tag invalid: '+id);
        if(s.mobile)await evalJs('document.querySelector("#sheetClose").click()');
      }
      // Verify a real exact-model inbound link works on the public URL without a thin model page.
      await send('Page.navigate',{url:url.origin+url.pathname+'?model=iPhone%2011'});
      const deepLink=await until(async()=>{const s=await evalJs('(()=>{const input=document.querySelector("#searchInput");const row=document.querySelector(".phone-row[data-phone-id=apple-iphone-11]");const detail=document.querySelector("#desktopDetail");const rows=document.querySelectorAll(".phone-row").length;return {href:location.href,search:input?.value||"",rows,hasRow:!!row,ready:input?.value==="iPhone 11"&&!!row&&row.classList.contains("active")&&rows>=1,detail:!!detail?.textContent.includes("iPhone 11")};})()');if(!s?.ready||!s?.detail)throw new Error('ManualFinder model deep-link diagnostics: '+JSON.stringify(s));return s;},9000);
      assert.ok(deepLink.ready&&deepLink.detail,width+'px ManualFinder exact-model landing did not preselect the iPhone');
      console.log('ManualFinder deep-link PASS: '+width+'px, canonical iPhone 11 preselection');
      console.log('Wave31 JP PASS: '+width+'px, five new phones and tagged accessory CTA');
      console.log('Wave30 JP PASS: '+width+'px, four phones and tagged accessory search links');
      console.log('Wave28 FCNT PASS: '+width+'px, five 2018/2019 Japanese models and two tagged links each');
      console.log('Affiliate PASS: '+width+'px, live EN/JA tagged links, sponsored rel and disclosure, generic USB-PD, Alpha2 90W');
      console.log('Chrome PASS: '+width+'px, no overflow, search, JP/EN, '+(jp.mobile?'mobile sheet':'desktop detail'));
    }

    // Public browser-level verification of the existing exact-source Galaxy
    // referral. This is deliberately separate from static source/HTTP checks.
    const docomoGalaxy = [
      ['Galaxy A23 5G','SM-A233DZKDDCM','samsung-galaxy-a23-5g-sc56c'],
      ['Galaxy A22 5G','SM-A223DZKADCM','samsung-galaxy-a22-5g-sc56b'],
      ['Galaxy A21','SM-A102DZRJDCM','samsung-galaxy-a21-sc42a'],
      ['Galaxy A20','SM-A102DZRADCM','samsung-galaxy-a20-sc02m']
    ];
    await send('Emulation.setDeviceMetricsOverride',
      {width:390,height:844,deviceScaleFactor:1,mobile:true});
    for (const locale of ['ja','en']) {
      const manualUrl=new URL(locale==='ja'?'../manual-finder/':'../manual-finder/en/',url);
      const nav=await send('Page.navigate',{url:manualUrl.href});
      if(nav.errorText)throw new Error('ManualFinder '+locale+' navigation: '+nav.errorText);
      await until(async()=>{
        const status=await evalJs('({loaded:document.querySelectorAll("#results .card").length>0,matcher:typeof window.MANUALFINDER_QC?.linkFor==="function",count:document.querySelector("#resultCount")?.textContent||""})');
        return status.loaded&&status.matcher&&status.count&&!/読み込み中|Loading/i.test(status.count);
      },60000);
      for (const [model,sku,slug] of docomoGalaxy) {
        const card=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value='+JSON.stringify(sku)+';input.dispatchEvent(new Event("input",{bubbles:true}));const c=[...document.querySelectorAll("#results .card")].find(x=>x.dataset.maker==="Samsung Mobile"&&x.dataset.model==='+JSON.stringify(model)+');const link=c?.querySelector(".phone-quickcheck-link");return {card:!!c,href:link?.getAttribute("href")||null,visible:!!link&&getComputedStyle(link).display!=="none"};})()');
        assert.ok(card.card,locale+' ManualFinder public result missing exact SKU '+sku);
        assert.equal(card.href,'/tools/phone-quickcheck/models/'+slug+'/',
          locale+' ManualFinder rendered wrong Galaxy SKU referral for '+model);
        assert.ok(card.visible,locale+' ManualFinder Galaxy referral is hidden for '+model);
      }
      const excluded=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="Galaxy S24 FE";input.dispatchEvent(new Event("input",{bubbles:true}));const cards=[...document.querySelectorAll("#results .card")].filter(x=>x.dataset.maker==="Samsung Mobile"&&x.dataset.model==="Galaxy S24 FE");return {found:cards.length,referral:cards.some(x=>!!x.querySelector(".phone-quickcheck-link"))};})()');
      assert.ok(excluded.found>0,locale+' ManualFinder S24 FE result missing');
      assert.equal(excluded.referral,false,locale+' ManualFinder must not confuse S24 FE SKU variants');

      // Click the real generated anchor, observe the synchronous privacy-safe
      // delegated GA4 event, then validate navigation to the published guide.
      const clicked=await evalJs('(()=>{const input=document.querySelector("#searchInput");input.value="SM-A233DZKDDCM";input.dispatchEvent(new Event("input",{bubbles:true}));const c=[...document.querySelectorAll("#results .card")].find(x=>x.dataset.maker==="Samsung Mobile"&&x.dataset.model==="Galaxy A23 5G");const a=c?.querySelector(".phone-quickcheck-link");if(!a)return {clicked:false};const seen=[];const prior=window.gtag;window.gtag=(...args)=>seen.push(args);const href=a.getAttribute("href");a.click();const event=seen.find(x=>x[0]==="event"&&x[1]==="manualfinder_phone_quickcheck_click");window.gtag=prior;return {clicked:true,href,event:event?{name:event[1],params:event[2]}:null};})()');
      assert.ok(clicked.clicked,locale+' A23 quick-check link was not clickable');
      assert.ok(clicked.event,locale+' ManualFinder affiliate funnel GA4 click event missing');
      assert.equal(clicked.event.params.maker,'Samsung Mobile',
        locale+' ManualFinder funnel GA4 maker bucket mismatch');
      assert.equal(clicked.event.params.category,'PC・スマホ',
        locale+' ManualFinder funnel GA4 category mismatch');
      for(const forbidden of ['model','sku','manualUrl','search_query','search_term','device_id']){
        assert.ok(!(forbidden in clicked.event.params),
          locale+' ManualFinder GA4 must not transmit '+forbidden);
      }
      await until(async()=>{
        const state=await evalJs('({path:location.pathname,heading:document.querySelector("h1")?.textContent||""})');
        return state.path==='/tools/phone-quickcheck/models/samsung-galaxy-a23-5g-sc56c/' &&
          state.heading.includes('Galaxy A23 5G');
      },25000);
      console.log('ManualFinder '+locale+' public Chrome PASS: 4 DCM Galaxy referrals, S24 FE blocked, A23 real navigation and privacy-safe event');
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
