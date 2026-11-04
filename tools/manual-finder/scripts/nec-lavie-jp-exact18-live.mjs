#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/nec-lavie/jp-archived-exact18-manual-index-20261104.json',import.meta.url),'utf8'));
export function verifyOfficialHtml(record,html){
 const source=String(html||'');
 const text=source.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
 if(!text.includes(record.model))throw Error(record.model+': exact PC SKU absent');
 if(!text.includes(record.shortModel))throw Error(record.model+': short model absent');
 const wanted='標準モデル';
 const pos=text.indexOf(wanted);
 if(pos<0||!text.slice(pos,pos+110).includes(record.standardModel))throw Error(record.model+': explicit standard model association absent');
 if(!text.includes('添付マニュアル')||!text.includes('読み替え'))throw Error(record.model+': manual and amendment links absent');
 if(!source.includes('href'))throw Error(record.model+': no manual navigation links');
 return{model:record.model,base:record.standardModel,verified:true};
}
async function fetchOne(record){
 const r=await fetch(record.manualUrl,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 const u=new URL(r.url);
 if(!r.ok||u.hostname!=='support.nec-lavie.jp'||u.pathname!==new URL(record.manualUrl).pathname)throw Error(record.model+': official destination changed '+r.status+' '+r.url);
 const b=Buffer.from(await r.arrayBuffer());
 let lastError;
 for(const encoding of ['utf-8','shift_jis']){
  try{return verifyOfficialHtml(record,new TextDecoder(encoding).decode(b))}catch(e){lastError=e}
 }
 throw lastError;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const results=await Promise.allSettled(pass.records.map(fetchOne));
 const failed=results.flatMap((x,i)=>x.status==='rejected'?[{model:pass.records[i].model,error:String(x.reason)}]:[]);
 console.log(JSON.stringify({checked:pass.records.length,passed:results.length-failed.length,failed}));
 if(failed.length)process.exitCode=1;
}
