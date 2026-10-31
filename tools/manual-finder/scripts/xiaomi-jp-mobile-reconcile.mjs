#!/usr/bin/env node
/**
 * Xiaomi JP: block publication if the live official manufacturer CMS/guide
 * evidence differs from any of the 60 completed review states or PDF URLs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export function reconcile(pass,live){
 const v=validateCoveragePass(pass),errors=[];
 if(!v.valid||!v.completionReady||pass.status!=='coverage-pass-complete')errors.push(...v.errors,'manifest incomplete');
 if(live.sourceDigest!==pass.universe.sourceObservation.officialIndexSha256)errors.push('source exact-model-name-and-guide-link digest drift');
 if(live.officialPopulation!==60||live.officialTotalGuideRows!==306||live.sourceMobileRawRows!==74||live.records?.length!==60)errors.push('manufacturer index/pagination scope drift');
 if(live.counts?.direct!==59||live.counts?.shared!==0||live.counts?.support_only!==0||live.counts?.held!==1)errors.push('manufacturer live direct/held final count changed');
 if(JSON.stringify(live.records?.map(x=>x.model))!==JSON.stringify(pass.universe.models))errors.push('manufacturer model population/order changed');
 const byModel=new Map(live.records?.map(x=>[x.model,x])||[]);
 if(byModel.size!==60)errors.push('duplicate or silent model omission in live result');
 for(const r of pass.records){
  const cur=byModel.get(r.model);
  if(!cur){errors.push('missing model '+r.model);continue}
  if(r.state!==cur.state)errors.push('review final state drift '+r.model);
  if(r.state==='direct'){
   if(!cur.pdfEvidence?.pdfVersion?.startsWith('%PDF-')||!cur.pdfEvidence?.url||!cur.manualUrl||cur.manualUrl!==r.manualUrl)
    errors.push('manufacturer direct PDF bytes or URL not verified '+r.model);
   if(!r.evidenceUrls?.includes(r.manualUrl))errors.push('published PDF not evidenced '+r.model);
   if(!r.manualUrl.startsWith('https://'))errors.push('non-HTTPS PDF source '+r.model);
  }else if(r.state==='held'){
   if(r.model!=='Leica Leitzphone powered by Xiaomi'||r.manualUrl||cur.manualUrl)errors.push('Leica held model incorrectly published '+r.model);
   if(!r.reason||r.reason.length<80||r.attemptedDiscovery.length<5)errors.push('Leica exception secondary evidence weak');
  }else errors.push('unexpected final status '+r.model);
 }
 return{valid:errors.length===0,errors,officialSourceRows:306,models:60,publishedDirect:59,held:1};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--live');if(i<0||!args[i+1])throw Error('usage: --live live-review.json');
 const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/xiaomi/jp-mobile-user-guide-2026.json',import.meta.url),'utf8'));
 const live=JSON.parse(await fs.readFile(args[i+1],'utf8'));
 const out=reconcile(pass,live);console.log(JSON.stringify(out));if(!out.valid)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
