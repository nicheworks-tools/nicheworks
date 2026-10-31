#!/usr/bin/env node
// Coverage-Pass: official full universe first, positive PDF/identity evidence second.
// Shared manuals require identical PDFs explicitly mapped in each manufacturer's row.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectYear,fetchOfficialIndex,YEARS} from './dynabook-jp-official-index-probe.mjs';
import {hostAllowed,htmlToText,validateCoveragePass} from './coverage-pass-lib.mjs';
const PASS_FILE=new URL('../coverage-passes/dynabook/jp-announced-pc-2024-2026-official-manual-index.json',import.meta.url);
const hostOK=url=>{try{return hostAllowed(url,['dynabook.com'])&&new URL(url).hostname==='dynabook.com'}catch{return false}};
const sha=values=>crypto.createHash('sha256').update(values.join('\n'),'utf8').digest('hex');
const score=l=>/取扱説明書/.test(l)?100:/dynabook\s*ガイド|Chromebook\s*ガイド|ユーザーガイド/.test(l)?95:/活用編/.test(l)?80:/スタートアップガイド/.test(l)?65:/準備編|困ったときは/.test(l)?45:/BIOS/.test(l)?20:/安心して/.test(l)?10:5;
export function reconcileOfficialRows(pages,pass){
 if(pass.subscopes?.length!==3||pass.universe.models.length!==177)throw Error('locked universe mutated');
 const grouped=new Map(),sourceAudits=[];
 for(let i=0;i<3;i++){
  const obj=pages[i],scope=pass.subscopes[i],rows=obj.tableResults.flatMap(t=>t.rows);
  if(obj.year!==Number(scope.id.slice(-4)))throw Error('wrong year');
  if(rows.length!==scope.sourceRowCount)throw Error('source row count drift '+obj.year);
  const digest=sha(rows.map(r=>r.name));
  if(digest!==scope.orderedSourceRowSha256)throw Error('source model order drift '+obj.year+' '+digest);
  const unique=[...new Set(rows.map(r=>r.name))];
  if(JSON.stringify(unique)!==JSON.stringify(scope.models))throw Error('locked model identities differ '+obj.year);
  for(const r of rows){if(!grouped.has(r.name))grouped.set(r.name,[]);grouped.get(r.name).push({...r,year:obj.year,indexUrl:obj.url});}
  sourceAudits.push({year:obj.year,sourceRows:rows.length,canonicalModels:unique.length,digest});
 }
 if(grouped.size!==177||[...grouped.values()].reduce((n,x)=>n+x.length,0)!==178)throw Error('official model population incomplete');
 if(JSON.stringify([...grouped.keys()])!==JSON.stringify(pass.universe.models))throw Error('silent canonical model drop');
 const duplicates=[...grouped].filter(([,rows])=>rows.length>1);
 if(duplicates.length!==1||duplicates[0][0]!=='dynabook B86/PA'||duplicates[0][1].length!==2)throw Error('duplicate identity exception drift');
 if(duplicates[0][1][0].manualLinks.map(x=>x.url).join('|')!==duplicates[0][1][1].manualLinks.map(x=>x.url).join('|'))
   throw Error('duplicate announcement model has different manual targets; do not coalesce');
 return{grouped,sourceAudits,duplicateSourceRows:duplicates.map(([model,rows])=>({model,releases:rows.map(r=>r.release)}))};
}
export async function officialPdfProbe(url) {
 if(!hostOK(url))throw Error('untrusted PDF source');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'Range':'bytes=0-1023','Accept':'application/pdf','user-agent':'ManualFinder Coverage-Pass/1.0'}});
 if(!hostOK(r.url)||!r.ok)throw Error('official PDF fetch/redirect rejected '+r.status+' '+r.url);
 const reader=r.body?.getReader();
 if(!reader)throw Error('PDF response has no body');
 const first=await reader.read();await reader.cancel();
 const magic=new TextDecoder().decode((first.value||new Uint8Array()).subarray(0,5));
 if(magic!=='%PDF-')throw Error('official destination has no PDF signature: '+magic);
 return {valid:true,finalUrl:r.url,statusCode:r.status,contentType:r.headers.get('content-type')||''};
}
export async function officialProductProbe(url,model) {
 if(!hostOK(url))throw Error('untrusted product URL');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(16000),headers:{'user-agent':'ManualFinder Coverage-Pass/1.0'}});
 if(!hostOK(r.url)||!r.ok||!/html/i.test(r.headers.get('content-type')||''))throw Error('not an official HTML product destination');
 const html=await r.text();
 const title=htmlToText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const body=htmlToText(html);
 const escaped=model.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
 const exact=new RegExp('(^|[^A-Za-z0-9])'+escaped+'(?=[^A-Za-z0-9]|$)','i');
 if(!exact.test(title)&&!exact.test(body))throw Error('manufacturer exact model text not present');
 return {valid:true,finalUrl:r.url,title};
}
export async function review({pages,pass,pdfProbe=officialPdfProbe,productProbe=officialProductProbe,concurrency=7}){
 const {grouped,sourceAudits,duplicateSourceRows}=reconcileOfficialRows(pages,pass);
 const verified=new Map();
 const check=url=>{
  if(!verified.has(url))verified.set(url,Promise.resolve().then(()=>pdfProbe(url)).catch(e=>({valid:false,error:String(e)})));
  return verified.get(url);
 };
 const results=new Array(177);let cursor=0;
 async function worker(){
  while(cursor<177){
   const index=cursor++,model=pass.universe.models[index],source=grouped.get(model),first=source[0];
   const candidates=[...new Map(source.flatMap(r=>r.manualLinks).filter(x=>hostOK(x.url)&&/\.pdf(?:[?#]|$)/i.test(x.url)).map(x=>[x.url,x])).values()]
    .sort((a,b)=>score(b.label)-score(a.label));
   const attempts=[];let chosen=null,support=null;
   for(const candidate of candidates){
    const outcome=await check(candidate.url);
    attempts.push({url:candidate.url,label:candidate.label,score:score(candidate.label),...outcome});
    if(outcome.valid){chosen={url:outcome.finalUrl,label:candidate.label};break;}
   }
   if(!chosen){
    const products=[...new Map(source.flatMap(r=>r.productLinks).filter(x=>hostOK(x.url)).map(x=>[x.url,x])).values()];
    for(const x of products){
     try{support=await productProbe(x.url,model);if(support.valid)break;}
     catch(e){attempts.push({url:x.url,kind:'secondary_official_product',valid:false,error:String(e)});}
    }
   }
   const state=chosen?'direct':support?.valid?'support_only':'held';
   results[index]={model,state,year:first.year,sourceRowCount:source.length,releaseDates:source.map(x=>x.release),
    indexUrl:first.indexUrl,...(chosen?{manualUrl:chosen.url,supportUrl:chosen.url,manualLabel:chosen.label}:{}),
    ...(!chosen&&support?.valid?{supportUrl:support.finalUrl}:{}),
    ...(state==='held'?{reason:'Manufacturer product identity present in locked official index, but no accepted PDF or exact official product support after alternate document and product search'}:{}),
    evidenceUrls:[first.indexUrl,...(chosen?[chosen.url]:support?.valid?[support.finalUrl]:[])],
    attemptedDiscovery:['manufacturer_year_manual_index','all_explicit_official_manual_PDF_links','official_product_link_exact_model','manufacturer_cross_year_index'],
    verifiedAt:'2026-10-31',reviewMethod:chosen?'live_manufacturer_model_to_pdf_and_pdf_magic':'secondary_official_exact_product_page',
    reviewNote:chosen?'Official annual model table explicitly maps this model to a manufacturer-controlled, signature-verified PDF.':'No manual link promoted without official document evidence.',
    attempts};
  }
 }
 await Promise.all(Array.from({length:concurrency},()=>worker()));
 const byPdf=new Map();
 for(const row of results.filter(x=>x.state==='direct')){const arr=byPdf.get(row.manualUrl)||[];arr.push(row.model);byPdf.set(row.manualUrl,arr);}
 for(const row of results.filter(x=>x.state==='direct')){const group=byPdf.get(row.manualUrl);if(group.length>1){row.state='shared';row.sharedWith=group.filter(m=>m!==row.model);}}
 const counts={direct:0,shared:0,support_only:0,held:0};results.forEach(r=>counts[r.state]++);
 if(Object.values(counts).reduce((a,b)=>a+b,0)!==177)throw Error('final classification dropped models');
 return{schemaVersion:1,maker:'dynabook',scopeId:pass.scopeId,sourceRows:178,officialPopulation:177,observedAt:new Date().toISOString(),
 sourceAudits,duplicateSourceRows,checkedPdfCount:verified.size,counts,records:results,heldModels:results.filter(x=>x.state==='held').map(x=>x.model)};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--out'),out=i<0?'manualfinder-dynabook-review/review.json':args[i+1];
 const pass=JSON.parse(await fs.readFile(PASS_FILE,'utf8'));
 const v=validateCoveragePass(pass);if(!v.valid)throw Error(v.errors.join('; '));
 const pages=[];for(const item of YEARS)pages.push(inspectYear(await fetchOfficialIndex(item.url),item.year,item.url));
 const result=await review({pages,pass});
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({population:result.officialPopulation,sourceRows:result.sourceRows,pdfChecks:result.checkedPdfCount,counts:result.counts,heldModels:result.heldModels}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(e=>{console.error(e);process.exitCode=1});
