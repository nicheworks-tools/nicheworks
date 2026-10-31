#!/usr/bin/env node
// Re-run exact official 12-model Motorola lineup and positively verified
// HTML guides. Compare each record to the reviewed publication manifest.
// The one held identity remains in universe and must not be published.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export function reconcile(pass,live) {
 const v=validateCoveragePass(pass),errors=[];
 if(!v.valid||!v.completionReady||pass.status!=='coverage-pass-complete')errors.push(...v.errors,'incomplete pass');
 if(live.officialPhonePopulation!==12||live.sourceProducts!==13||live.records?.length!==12)
  errors.push('manufacturer source count drift');
 if(live.counts?.direct!==11||live.counts?.shared!==0||live.counts?.support_only!==0||live.counts?.held!==1)
  errors.push('manufacturer live review state drift');
 const byModel=new Map(live.records?.map(x=>[x.model,x])||[]);
 if(byModel.size!==12)errors.push('duplicate/missing live model');
 if(JSON.stringify(live.records.map(x=>x.model))!==JSON.stringify(pass.universe.models))
  errors.push('manufacturer model sequence drift');
 for(const row of pass.records){
  const newest=byModel.get(row.model);
  if(!newest){errors.push('silent model omission '+row.model);continue}
  if(newest.state!==row.state)errors.push('state mismatch '+row.model);
  if(row.state==='direct'){
   if(!newest.manualUrl||newest.manualUrl!==row.manualUrl||!row.evidenceUrls.includes(row.manualUrl))
    errors.push('deep exact manual URL missing or mismatched '+row.model);
  }else if(row.state==='held'){
   if(newest.manualUrl||row.manualUrl)errors.push('held model improperly acquired direct URL '+row.model);
   if(!row.reason||row.attemptedDiscovery.length<2)errors.push('weak held evidence '+row.model);
  }
 }
 return{valid:errors.length===0,errors,officialPopulation:12,publicRows:11,held:1};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--live');if(i<0||!args[i+1])throw Error('usage: --live review.json');
 const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/motorola/jp-motobu-2026-smartphone-lineup.json',import.meta.url),'utf8'));
 const live=JSON.parse(await fs.readFile(args[i+1],'utf8'));
 const result=reconcile(pass,live);console.log(JSON.stringify(result));if(!result.valid)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(e=>{console.error(e);process.exitCode=1});
