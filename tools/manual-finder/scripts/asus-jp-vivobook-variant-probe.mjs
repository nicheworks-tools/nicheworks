#!/usr/bin/env node
import fs from 'node:fs/promises';
const products=[
['S3607','https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-s16-s3607/helpdesk_manual/'],
['M1605','https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-16-m1605/helpdesk_manual/'],
['K3604','https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-16x-oled-k3604/helpdesk_manual/'],
['E1404F','https://www.asus.com/laptops/for-home/vivobook/vivobook-go-14-e1404f/helpdesk_manual/'],
['S5608','https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-s16-s5608-qualcomm/helpdesk_manual/'],
['E210','https://www.asus.com/laptops/for-home/vivobook/vivobook-go-12-e210/helpdesk_manual/']
];
const result=await Promise.all(products.map(async ([code,url])=>{
 try{
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
  const html=await r.text();
  if(['S3607','M1605'].includes(code))await fs.writeFile('manualfinder-asus-probe/global-'+code+'.html',html);
  const strip=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const text=strip(html),models=[...html.matchAll(new RegExp(code+'[A-Z0-9]{0,7}','gi'))].map(x=>x[0].toUpperCase());
  const item={code,url,status:r.status,final:r.url,bytes:html.length,title:strip(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),models:[...new Set(models)].slice(0,60),textSnippet:text.slice(0,1200),selectionPrompt:/Please select your model name|モデル名を選択/i.test(text)};
  console.log(JSON.stringify({code,status:item.status,final:item.final,title:item.title,modelSamples:item.models,selectionPrompt:item.selectionPrompt,text:item.textSnippet.slice(0,260)}));
  return item;
 }catch(e){return{code,url,error:String(e)}}
}));
await fs.writeFile('manualfinder-asus-probe/global-variant-selector-probe.json',JSON.stringify(result,null,2)+'\n');
