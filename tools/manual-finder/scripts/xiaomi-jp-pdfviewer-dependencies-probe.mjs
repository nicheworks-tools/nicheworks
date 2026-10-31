#!/usr/bin/env node
import fs from 'node:fs/promises';
const BASE='https://www.mi.com/sgp/spps_files/store/0.55.71/js/';
const chunks=['11906.chunk.js','2134.chunk.js','62180.chunk.js','jp/index.js','vendor.js','react.js'];
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
const result=[];
for(const chunk of chunks){
 try{
  const r=await fetch(BASE+chunk,{signal:AbortSignal.timeout(30000)});
  if(!r.ok||new URL(r.url).hostname!=='www.mi.com')throw Error('invalid manufacturer asset: '+r.status);
  const text=await r.text();
  const name=chunk.replace(/\//g,'-');
  await fs.writeFile('manualfinder-xiaomi-probe/'+name,text);
  const markers=['76316:function','user-guide-pdf','pdfUrl','getNameAndLink','cmsPath','support-pdf-viewer','fileUrl','getPdf','api','pdfViewer','pdf_url','pdfUrl'];
  const hits=Object.fromEntries(markers.map(m=>[m,{count:text.split(m).length-1,samples:[...text.matchAll(new RegExp(m,'gi'))].slice(0,4).map(x=>text.slice(Math.max(0,x.index-180),Math.min(text.length,x.index+500)))}]));
  console.log(JSON.stringify({chunk,bytes:text.length,module76316:hits['76316:function'].count,pdfViewer:hits.pdfViewer.count,pdf:hits.pdfUrl.count,cms:hits.cmsPath.count}));
  result.push({chunk,bytes:text.length,hits});
 }catch(e){result.push({chunk,error:String(e)});console.error(chunk,String(e))}
}
await fs.writeFile('manualfinder-xiaomi-probe/webpack-pdf-module-hints.json',JSON.stringify(result,null,2)+'\n');
