#!/usr/bin/env node
// Publication gate: every exact manufacturer-supported Pixel model and
// model-specific destination must match the fresh official live review.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export function reconcile(pass,live){
 const v=validateCoveragePass(pass),errors=[];
 if(!v.valid||!v.completionReady||pass.status!=='coverage-pass-complete')errors.push(...v.errors,'manifest not complete');
 if(live.models!==38||live.releaseRows!==33||live.documentGroups!==24||live.documentFetches!==24||live.records?.length!==38)
  errors.push('manufacturer live population or reviewed-document count changed');
 if(live.counts?.direct!==0||live.counts?.shared!==0||live.counts?.support_only!==38||live.counts?.held!==0)
  errors.push('manufacturer live support-only states changed');
 const byModel=new Map(live.records?.map(x=>[x.model,x])||[]);
 if(byModel.size!==38)errors.push('duplicate or missing live model');
 for(const row of pass.records){
  const latest=byModel.get(row.model);
  if(!latest){errors.push('silent model drop '+row.model);continue}
  if(row.state!==latest.state||row.supportUrl!==latest.supportUrl)
   errors.push('official model support destination mismatch '+row.model);
  if(!row.evidenceUrls.includes(row.supportUrl))errors.push('missing official support evidence '+row.model);
 }
 return{valid:errors.length===0,errors,population:pass.universe.models.length};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--live');if(i<0||!args[i+1])throw Error('usage: --live review.json');
 const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/google/pixel-phone-jp-2016-2026.json',import.meta.url),'utf8'));
 const live=JSON.parse(await fs.readFile(args[i+1],'utf8'));
 const r=reconcile(pass,live);console.log(JSON.stringify(r));if(!r.valid)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
