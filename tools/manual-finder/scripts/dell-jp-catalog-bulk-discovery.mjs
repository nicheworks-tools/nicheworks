#!/usr/bin/env node
/**
 * Dell Japan bounded official product-index discovery. Candidate-only output.
 * The official catalog HTML must contain explicit product-detail links.
 * No slug generation, search-engine results or guessed manual URLs.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {hostAllowed} from './coverage-pass-lib.mjs';

const OFFICIAL=['dell.com'];
const ENTITY={'amp':'&','quot':'"','#39':"'",'lt':'<','gt':'>'};
const decode=s=>String(s).replace(/&(?:amp|quot|#39|lt|gt);/g,x=>ENTITY[x.slice(1,-1)]||x);
export function extractDellCatalog(html,{sourceUrl,minModels=50}={}){
 if(!hostAllowed(sourceUrl,OFFICIAL))throw Error('catalog source must be Dell-owned HTTPS');
 const byUrl=new Map(), rejected=[];
 for(const match of String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
  const attrs=match[1], href=attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
  if(!href)continue;
  let u;try{u=new URL(decode(href),sourceUrl)}catch{continue}
  if(!hostAllowed(u.href,OFFICIAL)||!/\/support\/product-details\/ja-jp\/product\/[^/]+\/resources\/manuals\/?$/i.test(u.pathname))continue;
  u.hash='';u.search='';
  const title=decode(match[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
  if(!title||title.length<3){rejected.push({url:u.href,reason:'missing model name'});continue}
  const key=u.href.toLowerCase();
  if(byUrl.has(key)&&byUrl.get(key).model!==title)throw Error('conflicting catalog model label '+u.href);
  byUrl.set(key,{model:title,officialManualIndex:u.href});
 }
 const rows=[...byUrl.values()].sort((a,b)=>a.officialManualIndex.localeCompare(b.officialManualIndex));
 const digest=crypto.createHash('sha256').update(rows.map(x=>x.model+'|'+x.officialManualIndex).join('\n')).digest('hex');
 return {schemaVersion:1,maker:'Dell',region:'JP',status:'candidate-only',sourceUrl,
  capturedPopulation:rows.length,minimumPopulation:minModels,thresholdMet:rows.length>=minModels,
  sourceDigestSha256:digest,records:rows,rejected,
  publicationReady:false,note:'No model can be published until a manufacturer-defined complete population and each exact model manual content are positively verified.'};
}
export async function verifyDellManualIndex(row,{fetcher=fetch,timeoutMs=18000}={}){
 const u=row.officialManualIndex;
 if(!hostAllowed(u,OFFICIAL))throw Error('unofficial candidate');
 const r=await fetcher(u,{redirect:'follow',signal:AbortSignal.timeout(timeoutMs),headers:{'user-agent':'NicheWorks-ManualFinder/1.0'}});
 if(!r.ok||!hostAllowed(r.url,OFFICIAL))throw Error('manufacturer manual index status/redirect invalid '+r.status);
 const html=await r.text(), title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]*>/g,' ').trim()||'';
 const normalized=s=>String(s).toLowerCase().replace(/\s+/g,' ').trim();
 const name=normalized(row.model);
 const titleMatch=normalized(title).includes(name);
 const manualSection=/マニュアルおよび文書|Manuals and Documents/i.test(html);
 const manualNamed=/(オーナーズ\s*マニュアル|サービス\s*マニュアル|Owner.s Manual|Service Manual|ユーザー.?ガイド)/i.test(html);
 return {model:row.model,url:r.url,sourceStatus:r.status,title,titleMatch,manualSection,manualNamed,
  state:'held',reason:(!titleMatch?'model title mismatch; ': '')+(!manualSection?'manual section absent; ':'')+(!manualNamed?'operational document not observed; ':'')+'exact manual document destination and substantive content not yet verified',
  publicationReady:false};
}
export async function runDellReview({sourceUrl,html,fetcher=fetch,concurrency=8,minModels=50}){
 const discovery=extractDellCatalog(html,{sourceUrl,minModels});
 if(!discovery.thresholdMet)throw Error('official catalog did not establish >= '+minModels+' exact linked models; found '+discovery.capturedPopulation);
 const results=new Array(discovery.records.length);let next=0;
 await Promise.all(Array.from({length:Math.min(concurrency,results.length)},async()=>{
  while(next<results.length){const i=next++;
   try{results[i]=await verifyDellManualIndex(discovery.records[i],{fetcher})}
   catch(e){results[i]={model:discovery.records[i].model,state:'held',reason:String(e),publicationReady:false}}
  }
 }));
 return {...discovery,reviewed:results.length,states:{direct:0,shared:0,support_only:0,held:results.length},
  review:results,publicationReady:false};
}
async function main(){
 const argv=process.argv.slice(2),arg=k=>{const i=argv.indexOf(k);return i<0?null:argv[i+1]};
 const sourceUrl=arg('--source-url'),snapshot=arg('--snapshot'),out=arg('--out');
 if(!sourceUrl||!snapshot||!out)throw Error('usage: --source-url https://www.dell.com/... --snapshot official-catalog.html --out audit.json');
 const html=await fs.readFile(snapshot,'utf8');
 const report=await runDellReview({sourceUrl,html});
 await fs.writeFile(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({population:report.capturedPopulation,states:report.states,publicationReady:false}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e);process.exitCode=1});
