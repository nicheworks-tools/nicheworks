#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const mf=new URL('../coverage-passes/oppo/jp-first-nine-mobile-guidepdf-20261105.json',import.meta.url);
export const manifest=JSON.parse(await fs.readFile(mf,'utf8'));
const normalize = s=>String(s||'').normalize('NFKC').replace(/[\s\u3000\u00a0\-\u2010-\u2015]/g,'').toUpperCase();
export function checkPdf(group,bytes,text,finalUrl){
 const source=new URL(group.manualUrl),dest=new URL(finalUrl);
 if(source.protocol!=='https:'||dest.protocol!=='https:')throw Error(group.model+': non-https URL');
 if(!['www.oppojapan.com','oppojapan.com','support.oppo.com'].includes(source.hostname)||!['www.oppojapan.com','oppojapan.com','support.oppo.com'].includes(dest.hostname))throw Error(group.model+': non-OPPO manufacturer host');
 if(source.hostname.endsWith('oppojapan.com')!==dest.hostname.endsWith('oppojapan.com'))throw Error(group.model+': cross-OPPO-domain redirect not vetted');
 if(decodeURIComponent(dest.pathname)!==decodeURIComponent(source.pathname))throw Error(group.model+': PDF path changed to unrelated document '+finalUrl);
 if(!source.pathname.toLowerCase().endsWith('.pdf')||bytes.length<10000||bytes.length>25000000||bytes.subarray(0,5).toString()!=='%PDF-')throw Error(group.model+': actual PDF magic or size mismatch');
 const flat=normalize(text);
 const title=normalize(group.needle);
 if(!flat.includes(title))throw Error(group.model+': exact OPPO model text absent in first 5 PDF pages: '+group.needle);
 if(!/ガイド|初期設定|基本設定|ご利用|取扱説明書|カメラ|使い/.test(text))throw Error(group.model+': Japanese operational guide content not verified');
 return{model:group.model,kind:group.documentType,edition:group.edition,bytes:bytes.length,pdfMagic:bytes.subarray(0,8).toString('latin1'),finalUrl,exactModelVerified:true};
}
export async function probe(groups=manifest.groups,{fetcher=fetch,pdfText}={}){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'oppo-pdf-'));
 const pass=[],failed=[];
 try{
  for(let i=0;i<groups.length;i++){
   const group=groups[i];
   try{
    const response=await fetcher(group.manualUrl,{redirect:'follow',signal:AbortSignal.timeout(45000),headers:{'user-agent':'Mozilla/5.0 (compatible; ManualFinder official documentation verifier)','accept':'application/pdf,*/*'}});
    if(!response.ok)throw Error('HTTP '+response.status+' '+response.url);
    const mime=response.headers.get('content-type')||'';
    if(mime.includes('text/html')||mime.includes('application/json'))throw Error('non-PDF MIME '+mime+' '+response.url);
    const bytes=Buffer.from(await response.arrayBuffer());
    const file=path.join(dir,'oppo-'+i+'.pdf');
    await fs.writeFile(file,bytes);
    const text=pdfText?await pdfText(bytes,group):execFileSync('pdftotext',['-f','1','-l','5','-layout',file,'-'],{timeout:22000,maxBuffer:5000000,encoding:'utf8'});
    const ok=checkPdf(group,bytes,text,response.url);
    pass.push(ok);console.log(JSON.stringify({ok:true,...ok}));
   }catch(error){failed.push({model:group.model,original:group.manualUrl,error:String(error.message||error)});console.log(JSON.stringify({ok:false,...failed.at(-1)}));}
  }
  console.log(JSON.stringify({checked:groups.length,verified:pass.length,failed:failed.length,failedRecords:failed}));
  return{verified:pass,failed};
 }finally{await fs.rm(dir,{recursive:true,force:true})}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await probe();
 if(result.failed.length)process.exitCode=1;
}
