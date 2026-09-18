import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const host = '127.0.0.1';
const webPort = 41735;
const driverPort = 9515;
const base = `http://${host}:${webPort}`;
const driverBase = `http://${host}:${driverPort}`;
const tools = ['old-kanji-reference','kanji-modernizer','old-kanji-ocr-scanner','old-document-kanji-highlighter','unicode-kanji-checker','variant-kanji-compare','place-old-kanji-checker','name-old-kanji-checker'];
const viewports = [{name:'mobile',width:375,height:812},{name:'desktop',width:1440,height:1000}];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function staticServer() {
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
  const server=http.createServer((req,res)=>{
    const u=new URL(req.url||'/',base); let p=decodeURIComponent(u.pathname); if(p.endsWith('/'))p+='index.html';
    const f=path.resolve(root,'.'+p), rr=path.resolve(root)+path.sep;
    if(!f.startsWith(rr)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'}); fs.createReadStream(f).pipe(res);
  });
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(webPort,host,()=>resolve(server));});
}

function driverPath() {
  const env=process.env.CHROMEWEBDRIVER;
  if(env){const p=fs.existsSync(env)&&fs.statSync(env).isDirectory()?path.join(env,'chromedriver'):env;if(fs.existsSync(p))return p;}
  for(const n of ['chromedriver','chromium-driver']){const r=spawnSync('which',[n],{encoding:'utf8'});if(r.status===0&&r.stdout.trim())return r.stdout.trim();}
  throw new Error('ChromeDriver not found');
}

async function wd(method,route,body){
  const res=await fetch(driverBase+route,{method,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const j=await res.json().catch(()=>({})); if(!res.ok||j?.value?.error)throw new Error(`${method} ${route}: ${JSON.stringify(j)}`); return j.value;
}

async function waitDriver(){for(let i=0;i<80;i++){try{const s=await wd('GET','/status');if(s?.ready!==false)return;}catch{}await sleep(200);}throw new Error('ChromeDriver timeout');}

async function session(){return wd('POST','/session',{capabilities:{alwaysMatch:{browserName:'chrome',pageLoadStrategy:'eager','goog:chromeOptions':{args:['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-background-networking','--no-first-run','--host-resolver-rules=MAP pagead2.googlesyndication.com 127.0.0.1, MAP www.googletagmanager.com 127.0.0.1, MAP static.cloudflareinsights.com 127.0.0.1, MAP cdn.jsdelivr.net 127.0.0.1']}}}});}

function client(id){const p=`/session/${id}`;return{
  nav:(url)=>wd('POST',p+'/url',{url}), rect:(w,h)=>wd('POST',p+'/window/rect',{x:0,y:0,width:w,height:h}),
  js:(script,args=[])=>wd('POST',p+'/execute/sync',{script,args}),
  tab:()=>wd('POST',p+'/actions',{actions:[{type:'key',id:'k',actions:[{type:'keyDown',value:'\uE004'},{type:'keyUp',value:'\uE004'}]}]}).then(()=>wd('DELETE',p+'/actions')),
  close:()=>wd('DELETE',p)
};}

const scanScript=String.raw`
const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
const btn=[...document.querySelectorAll('button')].filter(vis),fld=[...document.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(vis);
const unlabel=fld.filter(e=>{const id=e.id,l=id&&document.querySelector('label[for="'+CSS.escape(id)+'"]');return !l&&!e.closest('label')&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')&&!e.getAttribute('title')}).map(e=>e.id||e.tagName);
const unnamed=btn.filter(e=>!(e.innerText||e.textContent||'').trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('title')).map(e=>e.id||e.className||'button');
const pos=[...document.querySelectorAll('[tabindex]')].filter(e=>Number(e.getAttribute('tabindex'))>0).map(e=>e.id||e.tagName);
const warns=[...document.querySelectorAll('[class*="warn" i],[class*="caution" i],[class*="risk" i],[class*="error" i]')].filter(vis).map(e=>parseFloat(getComputedStyle(e).fontSize||'0'));
return {lang:document.documentElement.lang||'',h1:[...document.querySelectorAll('h1')].filter(vis).length,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),unnamed,unlabel,pos,minWarn:warns.length?Math.min(...warns):null,en:[...document.querySelectorAll('[data-lang="en"],#langEn')].some(vis),ja:[...document.querySelectorAll('[data-lang="ja"],#langJa')].some(vis)};
`;

function check(label,s,fail){if(s.h1!==1)fail.push(`${label}: h1=${s.h1}`);if(s.overflow>2)fail.push(`${label}: horizontal overflow ${s.overflow}px`);if(s.unnamed.length)fail.push(`${label}: unnamed buttons ${JSON.stringify(s.unnamed)}`);if(s.unlabel.length)fail.push(`${label}: unlabeled fields ${JSON.stringify(s.unlabel)}`);if(s.pos.length)fail.push(`${label}: positive tabindex ${JSON.stringify(s.pos)}`);if(s.minWarn!==null&&s.minWarn<11)fail.push(`${label}: warning text ${s.minWarn}px`);}

async function clickLang(c,lang){return c.js(String.raw`const l=arguments[0],v=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const e=[...document.querySelectorAll('[data-lang="'+l+'"],#lang'+(l==='en'?'En':'Ja'))].find(v);if(!e)return false;e.click();return true;`,[lang]);}
async function fill(c,value){return c.js(String.raw`const v=arguments[0],ok=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const e=[...document.querySelectorAll('textarea,input[type=text],input[type=search]')].find(ok);if(!e)return false;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;`,[value]);}
async function action(c){return c.js(String.raw`const v=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const b=[...document.querySelectorAll('button')].filter(e=>v(e)&&!e.disabled).find(e=>/(analy|compare|check|convert|search|detect|scan|\u78BA\u8A8D|\u6BD4\u8F03|\u5909\u63DB|\u691C\u7D22|\u5224\u5B9A)/i.test((e.id||'')+' '+(e.textContent||'')));if(!b)return false;b.click();return true;`);}

async function main(){
  const server=await staticServer(),proc=spawn(driverPath(),[`--port=${driverPort}`],{stdio:'ignore'});let c;const fail=[];
  try{
    await waitDriver();const s=await session(),id=s.sessionId;if(!id)throw new Error('No session id');c=client(id);await wd('POST',`/session/${id}/timeouts`,{implicit:0,pageLoad:15000,script:10000});
    for(const vp of viewports){await c.rect(vp.width,vp.height);for(const tool of tools){const label=`${tool}/${vp.name}`;console.log('==> '+label);await c.nav(`${base}/tools/${tool}/`);await sleep(500);await c.js(`window.__w15=[];addEventListener('error',e=>__w15.push(String(e.message||e.error)));addEventListener('unhandledrejection',e=>__w15.push(String(e.reason)));`);
      let sc=await c.js(scanScript);check(label+'/initial',sc,fail);if(!sc.en||!sc.ja)fail.push(label+': JP/EN controls missing');else{await clickLang(c,'en');await sleep(80);let l=await c.js('return document.documentElement.lang||""');if(!String(l).toLowerCase().startsWith('en'))fail.push(label+': EN switch failed');await clickLang(c,'ja');await sleep(80);l=await c.js('return document.documentElement.lang||""');if(!String(l).toLowerCase().startsWith('ja'))fail.push(label+': JP switch failed');}
      await c.js(`document.body.tabIndex=-1;document.body.focus()`);const focus=new Set();for(let i=0;i<8;i++){await c.tab();const a=await c.js(`const e=document.activeElement,r=e&&e.getBoundingClientRect();return e?{k:e.tagName+'#'+(e.id||'')+':'+((e.innerText||e.value||'').trim().slice(0,40)),v:!!r&&r.width>0&&r.height>0}:null`);if(a?.k&&a.k!=='BODY#:')focus.add(a.k);if(a&&!a.v)fail.push(label+': hidden focus target '+a.k);}if(focus.size<3)fail.push(label+`: only ${focus.size} tab targets`);await c.js(`document.body.removeAttribute('tabindex')`);
      if(await fill(c,('\u820A\u5B78\u9AD4'.repeat(120))+'\n'+('\u{20BB7}\uFA11'.repeat(80)))){await action(c);await sleep(180);sc=await c.js(scanScript);check(label+'/long',sc,fail);}await fill(c,'');await action(c);await sleep(100);check(label+'/empty',await c.js(scanScript),fail);
      if(await fill(c,'\u820A\u5B78\u9AD4\u{20BB7}\uFA11')){await action(c);await sleep(120);await c.js(`try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}})}catch{}`);const copied=await c.js(String.raw`const v=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};const b=[...document.querySelectorAll('button')].filter(e=>v(e)&&!e.disabled).find(e=>/(copy|\u30B3\u30D4\u30FC)/i.test((e.id||'')+' '+(e.textContent||'')));if(!b)return false;b.click();return true;`);if(copied){await sleep(70);const fb=await c.js(String.raw`const v=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};return [...document.querySelectorAll('[aria-live],[role=status]')].filter(v).some(e=>(e.textContent||'').trim())`);if(!fb)fail.push(label+': no visible copy feedback');}}
      const errs=await c.js('return window.__w15||[]');if(errs.length)fail.push(label+': runtime errors '+JSON.stringify(errs));check(label+'/final',await c.js(scanScript),fail);
    }}
    if(fail.length){console.error(`Old Kanji browser UX audit failed: ${fail.length}`);for(const x of fail)console.error('- '+x);process.exitCode=1;}else console.log(`Old Kanji browser UX audit passed: ${tools.length} tools x ${viewports.length} viewports.`);
  }finally{if(c)await c.close().catch(()=>{});proc.kill('SIGTERM');server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
