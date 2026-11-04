#!/usr/bin/env node
/**
 * Acer JP bounded first PDF source gate:
 * fetch six exact Acer-hosted manufacturer PDF URLs and verify PDF magic,
 * final URL host, Japanese title and all model identifiers INSIDE the PDF.
 * Manufacturer search snippets / HTTP 200 / family resemblance are insufficient.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = new URL('../coverage-passes/acer/jp-six-japanese-user-manual-pdf-groups-20261104.json',import.meta.url);
export const source = JSON.parse(await fs.readFile(root,'utf8'));
const normalize = value => String(value||'').replace(/\s+/g,' ').replace(/\s*-\s*/g,'-').normalize('NFKC');
export function verifyExtractedText(group,text){
 const flat=normalize(text).toUpperCase();
 const missing=group.models.filter(m=>!flat.includes(m.toUpperCase()));
 if(missing.length)throw Error(group.group+': model identifier not confirmed in PDF text: '+missing.join(', '));
 if(!/ユーザーマニュアル|ユーザーズマニュアル|USER.S MANUAL|USER MANUAL/i.test(flat))
  throw Error(group.group+': no user manual title in PDF');
 return {group:group.group,models:group.models,documentTitle:group.group,modelCount:group.models.length};
}
export async function checkGroup(group,index,dir,{fetcher=fetch,pdfText}={}){
 const initial=new URL(group.url);
 if(initial.protocol!=='https:'||initial.hostname!=='global-download.acer.com'||!initial.pathname.toLowerCase().endsWith('.pdf'))
  throw Error('source URL is not official Acer PDF: '+group.group);
 const res=await fetcher(group.url,{redirect:'follow',signal:AbortSignal.timeout(55000),headers:{'user-agent':'Mozilla/5.0 (compatible; ManualFinder official document verifier)','accept':'application/pdf,*/*'}});
 const final=new URL(res.url);
 if(!res.ok||final.protocol!=='https:'||final.hostname!=='global-download.acer.com'||!final.pathname.toLowerCase().endsWith('.pdf'))
  throw Error(group.group+': final PDF host/status invalid '+res.status+' '+res.url);
 const contentType=res.headers.get('content-type')||'';
 if(/text\/html|application\/json/.test(contentType))throw Error(group.group+': HTML/JSON instead of official PDF '+contentType);
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length<2048||bytes.length>25000000||bytes.subarray(0,5).toString()!=='%PDF-')
  throw Error(group.group+': invalid PDF magic/size, bytes='+bytes.length);
 const name=path.join(dir,'acer-'+index+'.pdf');
 await fs.writeFile(name,bytes);
 let extracted;
 if(pdfText)extracted=await pdfText(bytes);
 else try{extracted=execFileSync('pdftotext',['-f','1','-l','4','-layout',name,'-'],{timeout:20000,maxBuffer:4000000,encoding:'utf8'});}
 catch(e){throw Error(group.group+': pdftotext failed '+String(e.message).slice(0,250));}
 const verified=verifyExtractedText(group,extracted);
 return {...verified,finalUrl:res.url,bytes:bytes.length,pdfMagic:bytes.subarray(0,8).toString('latin1'),contentType};
}
export async function probe(groups=source.groups,{fetcher=fetch,pdfText}={}){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'acer-manuals-'));
 const result=[];
 try{
  for(let i=0;i<groups.length;i++){
   const item=await checkGroup(groups[i],i,dir,{fetcher,pdfText});
   result.push(item);
   console.log(JSON.stringify(item));
  }
  return{verifiedPdfCount:result.length,verifiedModelCount:result.reduce((n,x)=>n+x.modelCount,0),groups:result};
 }finally{await fs.rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const summary=await probe();
 if(summary.verifiedPdfCount!==5||summary.verifiedModelCount!==16)throw Error('incomplete verified 5-PDF / 16-model scope');
 console.log(JSON.stringify({status:'ACER_PDF_SOURCE_VERIFIED',pdfs:summary.verifiedPdfCount,models:summary.verifiedModelCount}));
}
