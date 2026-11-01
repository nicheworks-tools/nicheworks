#!/usr/bin/env node
import fs from 'node:fs/promises';
const ASSET='https://www.mi.com/sgp/spps_files/store/0.55.71/js/SupportPdfViewer.chunk.js';
const r=await fetch(ASSET,{signal:AbortSignal.timeout(30000)});
if(!r.ok||new URL(r.url).hostname!=='www.mi.com')throw Error('invalid official JS asset');
const t=await r.text(),keys=['user-guide','pdf','PDF','getUser','support','api','download','_pdf','fileUrl','file_url','url','document','manual'];
const result={source:ASSET,bytes:t.length,mentions:{}};
for(const key of keys){
 const re=new RegExp(key,'gi'),hits=[...t.matchAll(re)];
 result.mentions[key]={count:hits.length,samples:hits.slice(0,25).map(m=>t.slice(Math.max(0,m.index-160),Math.min(t.length,m.index+300)))};
}
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
await fs.writeFile('manualfinder-xiaomi-probe/SupportPdfViewer.chunk.js',t);
await fs.writeFile('manualfinder-xiaomi-probe/xiaomi-pdfviewer-code-hints.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:r.status,bytes:t.length,hits:Object.fromEntries(keys.map(k=>[k,result.mentions[k].count]))}));
