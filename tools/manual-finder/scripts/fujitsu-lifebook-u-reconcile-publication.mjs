#!/usr/bin/env node
// CI publication gate: compare full live primary-document evidence to the
// completed manifest. Not a one-time count assertion; rejects stale/mislinked PDF.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';
export function compareFinal(pass,live) {
 const v=validateCoveragePass(pass);
 const failures=[];
 if(!v.valid||!v.completionReady||pass.status!=='coverage-pass-complete')failures.push(...v.errors,'pass is not complete');
 if(live.population!==148||pass.universe.models.length!==148||pass.records.length!==148||live.records.length!==148)failures.push('population mismatch');
 if(live.counts.direct!==148||live.counts.shared!==0||live.counts.support_only!==0||live.counts.held!==0)failures.push('live review no longer all direct');
 if(live.checkedPdfDestinations!==78)failures.push('manufacturer PDF document count changed: '+live.checkedPdfDestinations);
 const byModel=new Map(live.records.map(x=>[x.model,x]));
 if(byModel.size!==148)failures.push('duplicate live model');
 for(const r of pass.records){
  const l=byModel.get(r.model);
  if(!l){failures.push('missing live model '+r.model);continue;}
  if(r.state!==l.state)failures.push('state mismatch '+r.model);
  if(r.manualUrl!==l.manualUrl||r.supportUrl!==l.supportUrl)
   failures.push('official exact model manual destination mismatch '+r.model);
  if(r.primaryDocumentUrl!==l.primaryDocumentUrl)
   failures.push('positive manufacturer PDF identity mismatch '+r.model);
  for(const e of [r.manualUrl,r.primaryDocumentUrl])if(!r.evidenceUrls.includes(e))failures.push('evidence missing '+r.model);
 }
 return{valid:failures.length===0,failures,compared:pass.universe.models.length};
}
async function main() {
 const args=process.argv.slice(2),i=args.indexOf('--live');
 if(i===-1||!args[i+1])throw Error('usage --live <review.json>');
 const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/fujitsu/jp-business-lifebook-u-model-manual-index.json',import.meta.url),'utf8'));
 const live=JSON.parse(await fs.readFile(args[i+1],'utf8'));
 const outcome=compareFinal(pass,live);
 console.log(JSON.stringify(outcome));if(!outcome.valid)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
