#!/usr/bin/env node
/**
 * Xiaomi JP: manufacturer-owned 306-entry user guide index + CMS source,
 * with a bounded 60-exact-phone/tablet-model Coverage-Pass.
 * Explicit model→PDF binding comes from Xiaomi's own CMS tab-with-table
 * module; verify actual PDF bytes, not HTTP 200/SPA marketing shell.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export const INDEX='https://www.mi.com/jp/support/user-guide/';
export const CMS='https://go.buy.mi.com/jp/v2/cms/page/get?from=web&cacheable=1&path=support%2Fuser-guide';
const PASS=new URL('../coverage-passes/xiaomi/jp-mobile-user-guide-2026.json',import.meta.url);
const PDF_HOSTS=new Set(['gl123.alsgp0.mi-fds.com','alsgp0.fds.api.xiaomi.com','leica-camera.com']);
export const LEICA_DOWNLOADS='https://leica-camera.com/ja-JP/mobile/leitzphone-powered-by-xiaomi/downloads';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;|&ensp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const digest=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
async function sourceGet(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/json'}});
 const u=new URL(r.url);
 if(!r.ok||u.protocol!=='https:'||!['www.mi.com','go.buy.mi.com'].includes(u.hostname))
  throw Error('manufacturer origin/status rejected '+r.status+' '+r.url);
 return{url:r.url,status:r.status,body:await r.text()};
}
export function officialIndex(html){
 const anchors=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(x=>{
  const href=x[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
  return{label:clean(x[2]),href:href.replace(/&amp;/gi,'&')};
 }).filter(x=>/\/jp\/support\/user-guide-pdf\//i.test(x.href));
 return anchors;
}
export function officialCms(json){
 if(json?.errno!==0||json?.data?.pageInfo?.path!=='support/user-guide')throw Error('Xiaomi CMS path and success marker changed');
 const layouts=json.data.layouts;
 if(!Array.isArray(layouts)||layouts.length!==1)throw Error('Xiaomi CMS expected one guide layout');
 const child=layouts[0]?.children?.find(x=>x.name==='tab-with-table');
 if(!child||typeof child.extstr!=='string')throw Error('manufacturer guide model-to-document CMS section unavailable');
 let ext;try{ext=JSON.parse(child.extstr)}catch{throw Error('Xiaomi manufacturer CMS list not valid JSON')}
 if(!Array.isArray(ext.data)||ext.data.length!==6)throw Error('Xiaomi CMS guide categories changed');
 const entries=ext.data.flatMap(g=>Array.isArray(g.content)?g.content:[]);
 if(entries.length!==306||entries.some(e=>!e.text||typeof e.link!=='string'))throw Error('manufacturer guide link population changed '+entries.length);
 return entries;
}
export function officialPopulation(pass,html,cmsJson){
 const anchors=officialIndex(html),pdf=officialCms(cmsJson);
 if(anchors.length!==306||anchors[74]?.label!=='REDMI Buds 5 Pro')throw Error('guide HTML population/bounded device category changed');
 for(let i=0;i<306;i++)if(clean(anchors[i].label)!==clean(pdf[i].text))
  throw Error('Xiaomi HTML-vs-CMS model identity/order mismatch at index '+i);
 if(anchors[41].href!==anchors[44].href||anchors[41].label.toLowerCase()!==anchors[44].label.toLowerCase())
  throw Error('duplicate Redmi Pad 2 4G manufacturer entry changed');
 const excluded=new Set([...pass.universe.sourceObservation.excludedGenericIndexes,
  ...pass.universe.sourceObservation.excludedAccessoryIndexes,pass.universe.sourceObservation.duplicateEntryIndex]);
 if(excluded.size!==14)throw Error('unexpected manufacturer mobile exclusions');
 const unique=anchors.slice(0,74).filter((x,i)=>!excluded.has(i));
 if(unique.length!==60||new Set(unique.map(x=>x.href)).size!==60)throw Error('Xiaomi mobile source not 60 exact unique links');
 const hash=digest(unique.map(x=>x.label+'|'+x.href).join('\n'));
 if(hash!==pass.universe.sourceObservation.officialIndexSha256)throw Error('Xiaomi source identity hash drift '+hash);
 if(JSON.stringify(unique.map(x=>x.label))!==JSON.stringify(pass.universe.models))throw Error('manufacturer model name/order drift');
 for(let i=0;i<60;i++){
  const expected=pass.universe.officialGuideEntries[i],observed=unique[i];
  if(observed.label!==expected.model||observed.href!==expected.officialGuideHref)throw Error('manufacturer model-to-guide href drift '+expected.model);
  const u=new URL(observed.href,INDEX);
  if(u.protocol!=='https:'||u.hostname!=='www.mi.com'||!u.pathname.startsWith('/jp/support/user-guide-pdf/'))
   throw Error('not manufacturer-owned model guide link '+observed.href);
 }
 const offsetPdf=pdf.slice(0,74).filter((x,i)=>!excluded.has(i));
 return{rows:unique.map((x,i)=>({...x,cmsLink:offsetPdf[i].link.trim()})),sourceDigest:hash,htmlCount:anchors.length,cmsCount:pdf.length,categories:6};
}
export async function readPdfStart(url){
 const u=new URL(url);
 if(u.protocol!=='https:'||!PDF_HOSTS.has(u.hostname)||!u.pathname.toLowerCase().endsWith('.pdf'))
  throw Error('non-PDF or non-manufacturer-controlled asset URL '+url);
 const r=await fetch(u.href,{redirect:'follow',signal:AbortSignal.timeout(24000),headers:{'user-agent':'Mozilla/5.0','accept':'application/pdf','range':'bytes=0-8191'}});
 const dest=new URL(r.url);
 if(![200,206].includes(r.status)||dest.protocol!=='https:'||!PDF_HOSTS.has(dest.hostname))
  throw Error('PDF final host/status invalid '+r.status+' '+r.url);
 const ct=r.headers.get('content-type')||'';
 if(/text\/html|application\/json/i.test(ct))throw Error('PDF asset unexpectedly HTML/JSON');
 const reader=r.body?.getReader();
 if(!reader)throw Error('no manufacturer PDF response body');
 let sample=Buffer.alloc(0);
 try{
  while(sample.length<8192){
   const part=await reader.read();if(part.done)break;
   sample=Buffer.concat([sample,Buffer.from(part.value)]);
  }
 }finally{await reader.cancel().catch(()=>{})}
 if(!sample.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('manufacturer document does not contain PDF magic');
 const bytes=Number(r.headers.get('content-range')?.split('/')?.at(-1))||Number(r.headers.get('content-length'))||null;
 return{url:r.url,status:r.status,contentType:ct,pdfVersion:sample.subarray(0,8).toString('latin1'),fileBytes:bytes,verifiedBytes:sample.length};
}
export async function discoverLeicaOfficialPdf(fetcher=async url=>{
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(22000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 if(!r.ok||new URL(r.url).hostname!=='leica-camera.com')throw Error('Leica manufacturer download page could not be positively verified');
 return{url:r.url,html:await r.text()};
}){
 const page=await fetcher(LEICA_DOWNLOADS),html=page.html;
 const target='https://leica-camera.com/sites/default/files/pm-127087-Leica-Leitzphone-powered-by-Xiaomi-Quickstart-guide.pdf';
 if(!/Leica Leitzphone powered by Xiaomi/i.test(html)||!/Quickstart-Guide/i.test(html)||
    !html.includes('pm-127087-Leica-Leitzphone-powered-by-Xiaomi-Quickstart-guide.pdf'))
  throw Error('Leica official product name, quickstart and manufacturer document hyperlink must all be present');
 return{pdfUrl:target,manufacturerPage:page.url};
}
async function pdfWithRetries(url,fetcher){
 let lastError;
 for(let i=0;i<3;i++){
  try{return await fetcher(url)}catch(e){lastError=e;if(i<2)await new Promise(r=>setTimeout(r,400*(i+1)))}
 }
 throw lastError;
}
export async function reviewAll({pass,html,cmsJson,pdfFetcher=readPdfStart,leicaFetcher,concurrency=8}){
 const source=officialPopulation(pass,html,cmsJson),records=new Array(60);let cursor=0;
 async function worker(){
  while(cursor<records.length){
   const i=cursor++,row=source.rows[i];
   const evidence=[INDEX,CMS,new URL(row.href,INDEX).href],result={model:row.label,manufacturerGuidePage:new URL(row.href,INDEX).href,
    verifiedAt:'2026-11-01',evidenceUrls:evidence,
    attemptedDiscovery:['official_Japan_user_guide_category_full_306','manufacturer_exact_model_guide_link','manufacturer_CMS_explicit_exact_model_pdf_link','manufacturer_owned_PDF_magic_and_mime']};
   const dest=row.cmsLink;
   try{
    let pdfUrl=dest,secondSource=null;
    if(row.label==='Leica Leitzphone powered by Xiaomi'&&!new URL(dest).pathname.toLowerCase().endsWith('.pdf')){
      const discovered=await discoverLeicaOfficialPdf(leicaFetcher);
      pdfUrl=discovered.pdfUrl;secondSource=discovered.manufacturerPage;
    }
    if(!PDF_HOSTS.has(new URL(pdfUrl).hostname)||!new URL(pdfUrl).pathname.toLowerCase().endsWith('.pdf'))
      throw Error('Official manufacturer CMS provided no verifiable PDF and secondary maker search unresolved: '+dest);
    const test=await pdfWithRetries(pdfUrl,pdfFetcher);
    if(!PDF_HOSTS.has(new URL(test.url).hostname)||!test.pdfVersion?.startsWith('%PDF-'))throw Error('official PDF verification not positive');
    result.state='direct';result.manualUrl=test.url;result.cmsPdfUrl=dest;result.pdfEvidence=test;
    result.evidenceUrls=[...evidence,...(secondSource?[secondSource]:[]),pdfUrl,test.url];
    result.reviewMethod=secondSource?'secondary_manufacturer_Leica_exact_model_multilingual_quickstart_PDF':'manufacturer_model_named_JP_index_independent_CMS_exact_PDF_mapping_and_live_file_magic';
    result.reviewNote=secondSource?'Leica manufacturer official Japanese downloads explicitly identifies Leitzphone powered by Xiaomi and offers multilingual quick-start PDF including Japanese. Exact PDF verified by HTTPS origin and PDF magic.':'Manufacturer Xiaomi Japan user-guide index explicitly names model and links its CMS record to the verified official PDF file. This is a quick-start/product guide; does not imply a full operating reference manual.';
   }catch(e){
    result.state='held';result.reason='Manufacturer PDF document failed live byte/status/origin verification: '+String(e);
   }
   records[i]=result;
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,60)},worker));
 const counts={direct:0,shared:0,support_only:0,held:0};
 for(const x of records)counts[x.state]++;
 if(records.length!==60||Object.values(counts).reduce((a,b)=>a+b,0)!==60)throw Error('silent drop');
 return{schemaVersion:1,scopeId:pass.scopeId,sourceIndexUrl:INDEX,sourceCmsUrl:CMS,sourceDigest:source.sourceDigest,officialTotalGuideRows:306,
  sourceMobileRawRows:74,officialPopulation:60,observedAt:new Date().toISOString(),counts,records,
  heldModels:records.filter(x=>x.state==='held').map(x=>x.model)};
}
async function main(){
 const pass=JSON.parse(await fs.readFile(PASS,'utf8')),v=validateCoveragePass(pass);
 if(!v.valid)throw Error('invalid Xiaomi model source manifest '+v.errors.join('; '));
 const [html,cms]=await Promise.all([sourceGet(INDEX),sourceGet(CMS)]);
 const result=await reviewAll({pass,html:html.body,cmsJson:JSON.parse(cms.body)});
 const args=process.argv.slice(2),i=args.indexOf('--out'),out=i<0?'manualfinder-xiaomi-review/review.json':args[i+1];
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({source:result.officialTotalGuideRows,officialPopulation:result.officialPopulation,counts:result.counts,
  held:result.heldModels,directPdfModels:result.records.filter(x=>x.state==='direct').map(x=>({model:x.model,manualUrl:x.manualUrl,contentType:x.pdfEvidence?.contentType}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
