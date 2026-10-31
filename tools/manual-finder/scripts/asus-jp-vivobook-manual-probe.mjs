#!/usr/bin/env node
import fs from 'node:fs/promises';
const apiRecord=JSON.parse(await fs.readFile('manualfinder-asus-probe/asus-official-api-pages.json','utf8'));
const items=apiRecord.results.find(x=>x.size===100)?.items||[];
if(items.length!==35)throw Error('ASUS official 35 product list not locked from complete API');
const picks=[items[0],items[2],items[20],items[23],items[34]];
function clean(s){return String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
const result=[];
await Promise.all(picks.map(async item=>{
 const routes=[item.url,item.url+'helpdesk_manual',item.url+'helpdesk_manual/?model2Name='+encodeURIComponent(item.name.match(/\(([A-Z]\d+[A-Z0-9]*)(?:[,)]|$)/)?.[1]||'')];
 await Promise.all(routes.map(async url=>{
  try{
   const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(24000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
   const h=await r.text(), title=clean(h.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
   const headings=[...h.matchAll(/<h[1-5]\b[^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(x=>clean(x[1])).filter(Boolean).slice(0,10);
   const variant=[...h.matchAll(/(?:S5608|S3607|K3604|E1404|E210)[A-Z0-9]{0,5}/gi)].map(x=>x[0].toUpperCase());
   const supportLinks=[...h.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)].map(x=>({url:x[2],label:clean(x[3])})).filter(x=>/helpdesk_manual|\.pdf|サポート/i.test(x.url+' '+x.label)).slice(0,18);
   const rec={name:item.name,productUrl:item.url,url: r.url,status:r.status,bytes:h.length,title,headings,
    variantList:[...new Set(variant)].slice(0,40),japaneseManual:/User.s Manual for Japanese Edition|Japanese User.s Manual|日本語版.*ユーザーマニュアル/i.test(h),
    englishManual:/User.s Manual for English Edition/i.test(h),isSelectionPage:/Please select your model name|モデル名を選択/i.test(h),supportLinks};
   result.push(rec);
   console.log(JSON.stringify({product:item.name,url:r.url,status:r.status,title,bytes:h.length,variant:rec.variantList.slice(0,8),ja:rec.japaneseManual,en:rec.englishManual,select:rec.isSelectionPage,headings:headings.slice(0,3)}));
  }catch(e){result.push({product:item.name,url,error:String(e)});console.error(String(e))}
 }));
}));
await fs.writeFile('manualfinder-asus-probe/asus-vivobook-manual-samples.json',JSON.stringify(result,null,2)+'\n');
