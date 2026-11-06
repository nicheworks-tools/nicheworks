#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const manifest=JSON.parse(await fs.readFile(new URL('../coverage-passes/oneplus/global-english-twelve-20261106.json',import.meta.url),'utf8'));
const compact=s=>String(s||'').normalize('NFKC').replace(/[\s\u00a0\-‐‑–—]/g,'').toUpperCase();
export function verifyPdf(x,bytes,text,finalUrl){
 const from=new URL(x.url),to=new URL(finalUrl);
 if(!['www.oneplus.com','service.oneplus.com'].includes(from.hostname)||!['www.oneplus.com','service.oneplus.com'].includes(to.hostname)||to.protocol!=='https:')throw Error(x.model+': manufacturer origin changed: '+to.href);
 if(from.hostname!==to.hostname||decodeURIComponent(from.pathname)!==decodeURIComponent(to.pathname))throw Error(x.model+': manufacturer filename/path redirect mismatch: '+to.href);
 if(bytes.length<10000||bytes.length>30000000||bytes.subarray(0,5).toString()!=='%PDF-')throw Error(x.model+': invalid PDF signature or size '+bytes.length);
 const t=compact(text);
 if(!t.includes(compact(x.needle)))throw Error(x.model+': printed identity '+x.needle+' absent in PDF first five pages');
 if(!/user manual|quick guide|getting started|setting up|welcome|battery|safety|安全|guide/i.test(text))throw Error(x.model+': no user guide content');
 return{model:x.model,kind:x.kind,needle:x.needle,bytes:bytes.length,finalUrl,verified:true};
}
export async function check(groups=manifest.groups,{fetcher=fetch,pdfText}={}){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'oneplus-'));
 const good=[],bad=[];
 try{
  for(let i=0;i<groups.length;i++){
   const x=groups[i];
   try{
    const response=await fetcher(x.url,{redirect:'follow',signal:AbortSignal.timeout(38000),headers:{'user-agent':'Mozilla/5.0','accept':'application/pdf,*/*'}});
    if(!response.ok)throw Error('HTTP '+response.status+' '+response.url);
    const bytes=Buffer.from(await response.arrayBuffer());
    const target=path.join(dir,i+'.pdf');await fs.writeFile(target,bytes);
    const txt=pdfText?await pdfText(bytes,x):execFileSync('pdftotext',['-f','1','-l','5','-layout',target,'-'],{encoding:'utf8',timeout:25000,maxBuffer:5000000});
    const value=verifyPdf(x,bytes,txt,response.url);
    good.push(value);console.log(JSON.stringify({ok:true,...value}));
   }catch(e){const value={model:x.model,kind:x.kind,url:x.url,error:String(e.message||e)};bad.push(value);console.log(JSON.stringify({ok:false,...value}));}
  }
  console.log(JSON.stringify({checked:groups.length,valid:good.length,held:bad.length,heldModels:bad.map(x=>x.model)}));
  return{good,bad};
 }finally{await fs.rm(dir,{recursive:true,force:true})}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await check();
 if(result.bad.length)process.exitCode=1;
}
