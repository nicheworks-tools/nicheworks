#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/huawei/jp-wearables-five-user-guides-20261104.json',import.meta.url),'utf8'));
const faq=pass.universe.sourceObservation.manufacturerHowTo;
export function verifyFaq(text,record){
 const source=String(text||'').replace(/\\\//g,'/').replace(/&amp;/g,'&');
 const label=record.officialTableLabel;
 const i=source.indexOf(label);
 if(i<0)throw Error(record.model+': official FAQ table model missing');
 const segment=source.slice(i,i+3800);
 const normalized=segment.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 const target=record.manualUrl;
 if(!segment.includes(target)&&!segment.includes(target.replaceAll('/','&#47;')))throw Error(record.model+': exact guide download URL not paired to manufacturer table model');
 if(!/〇|○|&#9675;|&#9711;|&#x25cb;/i.test(normalized))throw Error(record.model+': manufacturer FAQ user manual availability marker missing');
 return {model:record.model,listed:true,guideLink:record.manualUrl};
}
export function verifyProduct(html,record){
 const text=String(html||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
 const label=record.officialProductLabel;
 if(!text.includes(label))throw Error(record.model+': product page identity missing: '+label);
 if(!text.includes('ダウンロード'))throw Error(record.model+': manufacturer manual download section absent');
 if(!text.includes('取扱説明書'))throw Error(record.model+': official manual/product page title absent');
 return {model:record.model,product:true};
}
async function get(url){
 const res=await fetch(url,{signal:AbortSignal.timeout(25000),redirect:'follow',headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 const final=new URL(res.url),wanted=new URL(url);
 if(!res.ok||final.protocol!=='https:'||final.hostname!=='consumer.huawei.com'||final.pathname!==wanted.pathname)
   throw Error('Huawei manufacturer origin/status/redirect changed '+url+' → '+res.url+' '+res.status);
 const b=Buffer.from(await res.arrayBuffer());
 if(b.length<1500)throw Error('Huawei HTML response too short '+url);
 return new TextDecoder('utf-8').decode(b);
}
async function run(){
 const page=await get(faq);
 const found=pass.records.map(r=>verifyFaq(page,r));
 const products=await Promise.all(pass.records.map(async record=>verifyProduct(await get(record.manualUrl),record)));
 console.log(JSON.stringify({officialFaq:faq,exactGuideRows:found.length,modelPages:products.length,models:products.map(x=>x.model),allManufacturer:true}));
 if(found.length!==5||products.length!==5)throw Error('Huawei 5-row source not fully verified');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run().catch(e=>{console.error(e);process.exitCode=1});
