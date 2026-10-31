#!/usr/bin/env node
// Probe official Xiaomi Japan User Guide index and exact model guide destinations.
import fs from 'node:fs/promises';
const INDEX='https://www.mi.com/jp/support/user-guide/';
const tidy=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;|&ensp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
async function get(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 const html=await r.text();
 if(!r.ok||new URL(r.url).hostname!=='www.mi.com')throw Error('official fetch invalid '+r.status+' '+r.url);
 return{url:r.url,status:r.status,html};
}
const result={source:INDEX,observedAt:new Date().toISOString(),index:null,samples:[]};
const index=await get(INDEX),html=index.html;
const anchors=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(x=>{
 const href=x[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
 return{href:href.replace(/&amp;/g,'&'),label:tidy(x[2]),outer:x[0].slice(0,260)};
}).filter(x=>/user-guide-pdf/i.test(x.href));
result.index={status:index.status,url:index.url,bytes:html.length,totalGuideLinks:anchors.length,links:anchors,head:tidy(html).slice(0,1500)};
console.log(JSON.stringify({status:index.status,bytes:html.length,totalGuideLinks:anchors.length,first:anchors.slice(0,15),last:anchors.slice(-5)}));
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
const names=['Xiaomi 17T Pro','Xiaomi 15 Ultra','REDMI Note 13 Pro+ 5G','POCO F7','Xiaomi Pad 8'];
await Promise.all(names.map(async name=>{
 const link=anchors.find(x=>x.label.toLowerCase()===name.toLowerCase());
 if(!link){result.samples.push({name,error:'not exact manufacturer index label'});return}
 try{
  const url=new URL(link.href,INDEX),doc=await get(url.href);
  if(['Xiaomi 17T Pro','POCO F7'].includes(name))await fs.writeFile('manualfinder-xiaomi-probe/guide-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.html',doc.html);
  const title=tidy(doc.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const texts=tidy(doc.html),hits=[...doc.html.matchAll(/https?:\/\/[^"'\s<>]+\.pdf(?:\?[^"'\s<>]*)?/gi)].slice(0,20).map(x=>x[0]);
  const modelMatches=doc.html.toLowerCase().split(name.toLowerCase()).length-1;
  const sample={name,sourceLink:link.href,url:doc.url,status:doc.status,bytes:doc.html.length,title,pdfUrls:hits,modelMatches,textSample:texts.slice(-1200),headings:[...doc.html.matchAll(/<h[1-5]\b[^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(x=>tidy(x[1])).slice(0,15),serializedProductLines:doc.html.split(/\n/).filter(x=>x.toLowerCase().includes(name.toLowerCase())||/pdf/i.test(x)).slice(0,8).map(x=>x.slice(0,300))};
  result.samples.push(sample);
  console.log(JSON.stringify({name,url:sample.url,status:sample.status,title,bytes:sample.bytes,modelMatches,pdfCount:hits.length,headings:sample.headings}));
 }catch(e){result.samples.push({name,error:String(e)});console.error(name,String(e))}
}));
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
await fs.writeFile('manualfinder-xiaomi-probe/official-mobile-index.json',JSON.stringify(result,null,2)+'\n');
await fs.writeFile('manualfinder-xiaomi-probe/raw-index.html',html);
