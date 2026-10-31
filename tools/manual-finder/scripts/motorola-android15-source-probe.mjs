#!/usr/bin/env node
import fs from 'node:fs/promises';
const INDEX='https://en-us.support.motorola.com/app/answers/detail/a_id/186612/~/android-15-phones/';
const clean=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<\/(?:td|tr|p|div|li|br)>/gi,'\n').replace(/<br\b[^>]*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();
async function get(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(23000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 const buf=await r.arrayBuffer(),html=new TextDecoder().decode(buf);
 return {status:r.status,url:r.url,contentType:r.headers.get('content-type'),html};
}
const root=await get(INDEX);
const headings=[...root.html.matchAll(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(x=>clean(x[1]));
const tables=[...root.html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map(x=>x[0]);
const top=clean(root.html);
const at=top.indexOf('Android 15 Phones');
const index={index:INDEX,status:root.status,finalUrl:root.url,bytes:root.html.length,title:clean(root.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),headings,tables:tables.map(t=>({bytes:t.length,text:clean(t).slice(0,10000),cells:[...t.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>clean(x[1]))})),excerpt:top.slice(at,at+8500),probes:[]};
const names=['moto g - 2025','motorola edge 60','motorola razr 50 ultra','moto g54 5G'];
for(const name of names){
 for(const type of ['html','pdf']){
  const u='https://help.motorola.com/hc/help.php?c=&m='+encodeURIComponent(name)+'&os=&product=&sku=&type='+type;
  try{const v=await get(u);const txt=clean(v.html);index.probes.push({model:name,type,status:v.status,url:v.url,contentType:v.contentType,bytes:v.html.length,title:clean(v.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),excerpt:txt.slice(0,700),modelMention:txt.toLowerCase().includes(name.toLowerCase())});}catch(e){index.probes.push({model:name,type,error:String(e)})}
 }
}
await fs.mkdir('manualfinder-motorola-probe',{recursive:true});
await fs.writeFile('manualfinder-motorola-probe/official-index-and-guides.json',JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({status:index.status,bytes:index.bytes,title:index.title,headings:index.headings.slice(0,10),tables:index.tables.map(t=>({bytes:t.bytes,cells:t.cells.length,first:t.cells.slice(0,4)})),excerpt:index.excerpt.slice(0,1600),probes:index.probes.map(p=>({model:p.model,type:p.type,status:p.status,contentType:p.contentType,title:p.title,modelMention:p.modelMention,bytes:p.bytes,error:p.error}))}));
if(root.status!==200)process.exitCode=1;
