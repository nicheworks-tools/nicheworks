#!/usr/bin/env node
// Manufacturer-positive final publication gate: a fresh official 35-model
// two-page API review must agree with every previously approved selected-SKU
// manual and actual manual content. This is not a cached HTTP 200 gate.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export function reconcile(pass,live){
 const validation=validateCoveragePass(pass),errors=[];
 if(!validation.valid||!validation.completionReady||pass.status!=='coverage-pass-complete')
  errors.push(...validation.errors,'manifest is not complete');
 const n=pass.universe.models.length;
 if(n!==35||live.officialPopulation!==35||live.records?.length!==35||JSON.stringify(live.manufacturerPageRows)!=='[20,15]')
  errors.push('manufacturer complete population/pagination drift');
 if(live.sourceDigest!==pass.universe.sourceObservation.orderedModelIdUrlSha256)
  errors.push('live manufacturer source identity digest differs from locked source');
 if(live.counts?.direct!==35||live.counts?.shared!==0||live.counts?.support_only!==0||live.counts?.held!==0)
  errors.push('manual live validation states no longer reconcile to 35 direct');
 const byModel=new Map(live.records?.map(x=>[x.model,x])||[]);
 if(byModel.size!==35)errors.push('duplicates or missing live model IDs');
 if(JSON.stringify(live.records?.map(x=>x.model))!==JSON.stringify(pass.universe.models))
  errors.push('live manufacturer model order differs');
 for(const r of pass.records){
  const liveRow=byModel.get(r.model);
  if(!liveRow){errors.push('unreviewed model '+r.model);continue;}
  if(r.state!=='direct'||liveRow.state!=='direct')errors.push('non-direct row '+r.model);
  if(liveRow.manualUrl!==r.manualUrl||liveRow.selectedVariant!==r.selectedVariant)
   errors.push('exact selected manual variant or URL changed '+r.model);
  if(liveRow.productId!==r.productId||liveRow.productUrl!==r.supportUrl)
   errors.push('manufacturer marketed identity/part code changed '+r.model);
  if(!liveRow.manualEvidence?.accepted||!liveRow.manualEvidence?.english)
   errors.push('positive operating manual evidence disappeared '+r.model);
  if(Boolean(liveRow.manualEvidence?.japanese)!==r.manualLanguage.includes('ja'))
   errors.push('document language metadata changed '+r.model);
  if(!r.evidenceUrls.includes(r.manualUrl)||!r.evidenceUrls.includes(r.supportUrl))
   errors.push('official source evidence missing '+r.model);
 }
 return{valid:errors.length===0,errors,models:35,verifiedDirect:35};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--live');if(i<0||!args[i+1])throw Error('usage --live review.json');
 const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/asus/jp-vivobook-official-2026-product-index.json',import.meta.url),'utf8'));
 const live=JSON.parse(await fs.readFile(args[i+1],'utf8'));
 const r=reconcile(pass,live);console.log(JSON.stringify(r));if(!r.valid)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
