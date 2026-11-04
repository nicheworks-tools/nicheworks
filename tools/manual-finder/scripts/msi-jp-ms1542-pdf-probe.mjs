#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const src=new URL('../coverage-passes/msi/jp-ms1542-gp-ge-manual-20261104.json',import.meta.url);
export const pass=JSON.parse(await fs.readFile(src,'utf8'));
export function verifyManual(group,bytes,text,finalUrl){
 const srcUrl=new URL(group.manualUrl),final=new URL(finalUrl);
 if(srcUrl.protocol!=='https:'||srcUrl.hostname!=='download.msi.com'||final.origin!==srcUrl.origin||final.pathname!==srcUrl.pathname)throw Error(group.type+': manufacturer original PDF filename/redirect mismatch');
 if(bytes.length<60000||bytes.length>30000000||bytes.subarray(0,5).toString()!=='%PDF-')throw Error(group.type+': manufacturer file missing PDF magic/expected size');
 if(!/取扱説明書|ユーザーズマニュアル|ユーザーマニュアル/.test(text))throw Error(group.type+': Japanese manual title not present in PDF text');
 if(!/ノートブック|ノートパソコン|ノートPC/.test(text))throw Error(group.type+': Japanese notebook context missing');
 if(!group.manualUrl.includes('MS-1542_v1.0_Japanese_'+group.type+'.pdf'))throw Error('MS-1542 exact platform/type filename mismatch');
 return {type:group.type,models:group.models,fileSize:bytes.length,url:finalUrl,pdfMagic:bytes.subarray(0,8).toString('latin1'),japanese:true};
}
export async function probe(groups=pass.groups,{fetcher=fetch,pdfText}={}){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'msi-pdf-')),results=[];
 try{
  for(let i=0;i<groups.length;i++){
   const g=groups[i],res=await fetcher(g.manualUrl,{redirect:'follow',signal:AbortSignal.timeout(60000),headers:{'user-agent':'Mozilla/5.0','accept':'application/pdf,*/*'}});
   if(!res.ok)throw Error(g.type+': HTTP '+res.status);
   if(/text\/html|application\/json/i.test(res.headers.get('content-type')||''))throw Error(g.type+': returned non-PDF MIME');
   const bytes=Buffer.from(await res.arrayBuffer()),f=path.join(dir,g.type+'.pdf');
   await fs.writeFile(f,bytes);
   let extracted='';
   if(pdfText)extracted=await pdfText(bytes,g);
   else extracted=execFileSync('pdftotext',['-f','1','-l','5','-layout',f,'-'],{encoding:'utf8',timeout:25000,maxBuffer:3500000});
   console.log(JSON.stringify({probe:g.type,status:res.status,original:g.manualUrl,finalUrl:res.url,contentType:res.headers.get('content-type'),bytes:bytes.length,firstBytes:bytes.subarray(0,8).toString('latin1'),japaneseTitle:/取扱説明書|ユーザーズマニュアル|ユーザーマニュアル/.test(extracted)}));
   const record=verifyManual(g,bytes,extracted,res.url);
   console.log(JSON.stringify(record));results.push(record);
  }
  return{verifiedPdfs:results.length,verifiedModels:results.reduce((n,x)=>n+x.models.length,0),results};
 }finally{await fs.rm(dir,{recursive:true,force:true})}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const p=await probe();
 if(p.verifiedPdfs!==2||p.verifiedModels!==6)throw Error('MSI 2 official PDF / 6 candidate models evidence incomplete');
 console.log(JSON.stringify({status:'MSI_MS1542_PDF_GATE_PASS',...p}));
}
