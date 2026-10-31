#!/usr/bin/env node
// Probe only: manufacturer source HTML and per-device guide endpoints.
// Official source owns the population; URL parameter candidates are NOT evidence.
import fs from 'node:fs/promises';
const INDEX='https://moto-bu.motorola.co.jp/products/';
const expected=['motorola razr fold','motorola razr 60 ultra','motorola razr 60','motorola razr 50 ultra','motorola razr 50','motorola edge 60 pro','motorola edge 60','moto g37j','moto g66j'];
const clean=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function get(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(18000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 const t=await r.text();
 return{status:r.status,url:r.url,type:r.headers.get('content-type'),text:t};
}
const data={source:INDEX,observedAt:new Date().toISOString(),official:null,guideCandidates:[]};
try{
 const r=await get(INDEX);
 const blocks=[...r.text.matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi)].map(x=>({raw:x[1].slice(0,1200),text:clean(x[1]),alts:[...x[1].matchAll(/\balt\s*=\s*(["'])(.*?)\1/gi)].map(v=>v[2])}));
 const heads=[...r.text.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(x=>clean(x[1])).filter(Boolean);
 const items=[...r.text.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)].map(x=>({href:x[2],label:clean(x[3]),alt:[...x[3].matchAll(/\balt\s*=\s*(["'])(.*?)\1/gi)].map(v=>v[2])})).filter(x=>x.alt.some(t=>/moto|motorola/i.test(t))||/moto|motorola/i.test(x.label)).slice(0,90);
 data.official={status:r.status,url:r.url,bytes:r.text.length,h4:blocks,headings:heads,links:items,expectedMatches:expected.map(n=>({name:n,htmlPresent:r.text.toLowerCase().replace(/\s+/g,'').includes(n.replace(/\s+/g,''))}))};
 console.log(JSON.stringify({official:{status:r.status,bytes:r.text.length,h4:blocks.length,headings:heads.slice(0,28),items:items.slice(0,12).map(x=>({label:x.label,alt:x.alt,href:x.href})),expectedMatches:data.official.expectedMatches}}));
}catch(e){data.official={error:String(e)}}
await Promise.all(expected.map(async model=>{
 const url='https://help.motorola.com/hc/help.php?'+new URLSearchParams({c:'',m:model,os:'',product:'',sku:'',type:'html'}).toString();
 try{const r=await get(url);const title=clean(r.text.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const heads=[...r.text.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(x=>clean(x[1])).filter(Boolean);
 const item={model,status:r.status,url:r.url,bytes:r.text.length,type:r.type,title,heads:heads.slice(0,7),mentions:clean(r.text).toLowerCase().includes(model.toLowerCase()),hasManualContent:/Getting started|Get started|目次|はじめに|Learn how|Home screen|ホーム画面/i.test(r.text),snippet:clean(r.text).slice(0,320)};
 data.guideCandidates.push(item);
 }catch(e){data.guideCandidates.push({model,error:String(e)})}
}));
data.guideCandidates.sort((a,b)=>expected.indexOf(a.model)-expected.indexOf(b.model));
await fs.mkdir('manualfinder-motorola-jp-probe',{recursive:true});
await fs.writeFile('manualfinder-motorola-jp-probe/official-product-and-guides.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({guides:data.guideCandidates.map(x=>({model:x.model,status:x.status,url:x.url,title:x.title,heads:x.heads,mentions:x.mentions,hasManualContent:x.hasManualContent,error:x.error}))}));
if(data.official.error||data.official.status!==200)process.exitCode=1;
