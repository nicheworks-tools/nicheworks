#!/usr/bin/env node
/**
 * Strict 148-model manufacturer-index Coverage-Pass reviewer for Fujitsu LIFEBOOK U.
 * A successful HTTP status never suffices: exact manual-page H1, official source
 * linkage and positively verified PDF bytes are all required for direct status.
 * No invented model identifiers, URL paths or shared model equivalence.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {INDEX,strip,anchoredLinks,extractUSeries,fetchIndex} from './fujitsu-lifebook-u-index-probe.mjs';
import {hostAllowed,validateCoveragePass} from './coverage-pass-lib.mjs';

const MANIFEST=new URL('../coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json',import.meta.url);
const ALLOWED=['fmworld.net','fujitsu.com'];
const getHash=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const official=u=>hostAllowed(u,ALLOWED);
const exactHost=url=>{const x=new URL(url);return x.hostname==='www.fmworld.net'||x.hostname.endsWith('.fmworld.net')||x.hostname.endsWith('.fujitsu.com')};
const kind=x=>/取扱説明書|製品ガイド|ハードウェアガイド|ユーザーガイド|マニュアル/.test(x);

export function reconcilePopulation(pass,index) {
 const live=extractUSeries(index);
 const names=live.models;
 if(names.length!==148||pass.universe.models.length!==148)throw Error('manufacturer U series population changed');
 if(JSON.stringify(names)!==JSON.stringify(pass.universe.models))throw Error('manufacturer U series exact model list/order drift');
 const source=pass.universe.sourceObservation;
 const modelHash=getHash(names.join('\n'));
 const urlHash=getHash(live.candidates.map(x=>x.name+'|'+x.url).join('\n'));
 if(source.orderedModelSha256!==modelHash||source.orderedModelUrlSha256!==urlHash)
  throw Error('official manufacturer name/url links changed, candidates must be re-locked');
 return live.candidates;
}
export function analyzeManualPage(html,model,pageUrl) {
 const heading=strip(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
 if(heading!==(model+' マニュアル一覧'))return {identity:false,heading,reason:'exact_model_H1_mismatch'};
 const bodyRows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(x=>x[1]);
 const docs=[];
 for(const row of bodyRows) {
  const text=strip(row);
  if(!kind(text)||!(/本体マニュアル|製品ガイド|取扱説明書|ハードウェアガイド|スタートガイド/.test(text)))continue;
  const links=anchoredLinks(row,pageUrl).filter(x=>official(x.url)&&exactHost(x.url)&&/\.pdf(?:\?|#|$)/i.test(x.url));
  for(const x of links) docs.push({url:x.url,label:text.slice(0,220)});
 }
 const distinct=[...new Map(docs.map(x=>[x.url,x])).values()];
 return {identity:true,heading,docs:distinct,documentCount:distinct.length};
}
export async function fetchOfficialManualPage(url){
 if(!official(url)||!exactHost(url))throw Error('initial source outside vendor');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),
 headers:{'user-agent':'ManualFinderCoveragePass/1.0','accept':'text/html,application/xhtml+xml'}});
 if(!r.ok||!official(r.url)||!exactHost(r.url))throw Error('bad official page status/redirect '+r.status+' '+r.url);
 if(!/html/i.test(r.headers.get('content-type')||''))throw Error('unexpected manual page destination type');
 return {html:await r.text(),url:r.url,statusCode:r.status};
}
export async function verifyPdf(url){
 if(!official(url)||!exactHost(url))throw Error('nonofficial candidate');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(22000),
 headers:{'Range':'bytes=0-1023','accept':'application/pdf','user-agent':'ManualFinderCoveragePass/1.0'}});
 if(!r.ok||!official(r.url)||!exactHost(r.url))throw Error('pdf redirect or HTTP error '+r.status);
 const reader=r.body?.getReader();if(!reader)throw Error('PDF body unavailable');
 const first=await reader.read();await reader.cancel();
 const magic=new TextDecoder().decode((first.value||new Uint8Array()).subarray(0,5));
 if(magic!=='%PDF-')throw Error('not PDF magic: '+magic);
 return {valid:true,finalUrl:r.url,statusCode:r.status};
}
export async function reviewAll({pass,indexHtml,pageFetch=fetchOfficialManualPage,pdfFetch=verifyPdf,concurrency=9}) {
 const candidates=reconcilePopulation(pass,indexHtml);
 const reviewed=new Array(candidates.length);
 const pdfCache=new Map();let cursor=0;
 const onePdf=url=>{
  if(!pdfCache.has(url))pdfCache.set(url,Promise.resolve().then(()=>pdfFetch(url)).catch(e=>({valid:false,error:String(e)})));
  return pdfCache.get(url);
 };
 async function worker(){
  while(cursor<candidates.length){
   const i=cursor++,candidate=candidates[i],model=candidate.name;
   let out={model,indexUrl:INDEX,sourceUrl:candidate.url,attemptedDiscovery:['official_U_series_model_index','official_exact_model_manual_landing','official_manual_document_candidates','official_pdf_signature'],verifiedAt:'2026-10-31'};
   try{
    const destination=await pageFetch(candidate.url);
    const result=analyzeManualPage(destination.html,model,destination.url);
    out={...out,checkedPageUrl:destination.url,heading:result.heading,manualCount:result.documentCount||0};
    if(!result.identity)throw Error(result.reason+' '+result.heading);
    out.evidenceUrls=[INDEX,destination.url];
    const attempted=[];
    for(const doc of result.docs){
     const check=await onePdf(doc.url);
     attempted.push({url:doc.url,label:doc.label,valid:check.valid===true,reason:check.error||null});
     if(check.valid){out.state='direct';out.manualUrl=destination.url;out.supportUrl=destination.url;out.primaryDocumentUrl=check.finalUrl;out.manualKind='manual-index';
      out.evidenceUrls.push(check.finalUrl);
      out.reviewMethod='exact_manual_index_heading_and_explicit_valid_pdf_document';
      out.reviewNote='Manufacturer index links this exact model to a dedicated manual page; page lists a manufacturer PDF document whose HTTP body and PDF signature were verified.';break;}
    }
    out.documentAttempts=attempted;
    if(!out.state){
     out.state='support_only';out.supportUrl=destination.url;
     out.reviewMethod='exact_official_model_manual_index_but_no_pdf_document_verified';
     out.reviewNote='Exact model manual index exists, but linked PDF verification failed or no document was found; no deeper manual URL promoted.';
    }
   }catch(e){out.state='held';out.reason='Exact manufacturer source-linked manual destination could not be positively verified: '+String(e);
     out.evidenceUrls=[INDEX,candidate.url];out.attemptedDiscovery.push('official_archived_business_manual_index');}
   reviewed[i]=out;
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,candidates.length)},worker));
 const counts={direct:0,shared:0,support_only:0,held:0};
 for(const r of reviewed)counts[r.state]++;
 return {schemaVersion:1,scopeId:pass.scopeId,population:148,manufacturerSource:INDEX,observedAt:new Date().toISOString(),
  checkedPdfDestinations:pdfCache.size,counts,records:reviewed,
  unresolved:reviewed.filter(x=>x.state==='held'||x.state==='support_only').map(x=>({model:x.model,state:x.state,reason:x.reason||x.reviewNote})),publicationReady:counts.held===0};
}
async function main() {
 const pass=JSON.parse(await fs.readFile(MANIFEST,'utf8'));
 const valid=validateCoveragePass(pass);if(!valid.valid)throw Error('invalid manifest '+valid.errors.join('; '));
 const args=process.argv.slice(2),i=args.indexOf('--out'),out=i>=0?args[i+1]:'manualfinder-fujitsu-review/review.json';
 const results=await reviewAll({pass,indexHtml:await fetchIndex()});
 await fs.mkdir(path.dirname(out),{recursive:true});
 await fs.writeFile(out,JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({population:results.population,checkedPdfDestinations:results.checkedPdfDestinations,
  counts:results.counts,unresolved:results.unresolved}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(e=>{console.error(e);process.exitCode=1});
