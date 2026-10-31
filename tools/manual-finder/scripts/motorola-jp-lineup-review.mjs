#!/usr/bin/env node
/**
 * Motorola JP complete bounded source, live official user-guide review.
 * Exact official product identity in source H4, final HTTPS document identity
 * and real manual content are mandatory. Generated help.php URL is candidate.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlToText,decodeHtml,hostAllowed,validateCoveragePass} from './coverage-pass-lib.mjs';

export const INDEX='https://moto-bu.motorola.co.jp/products/';
const PASS=new URL('../coverage-passes/motorola/jp-motobu-2026-smartphone-lineup.json',import.meta.url);
const SPECIAL={
 'moto g 37 j':{url:'https://jp-jp.support.motorola.com/app/answers/detail/a_id/192333/',titleAlias:'moto g37j'},
 'moto g 66 j':{url:'https://jp-jp.support.motorola.com/app/answers/detail/a_id/187425/',titleAlias:'moto g66j 5G'}
};
const clean=s=>htmlToText(String(s||'')).normalize('NFKC').replace(/\s+/g,' ').trim();
const key=s=>clean(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
const vendor=u=>{try{const h=new URL(u).hostname;return new URL(u).protocol==='https:'&&(h==='help.motorola.com'||h==='jp-jp.support.motorola.com'||h==='moto-bu.motorola.co.jp')}catch{return false}};
const digest=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');

export function extractPopulation(html,pass){
 const heads=[...String(html).matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi)];
 if(heads.length!==13)throw Error('manufacturer product-list heading boundary changed: '+heads.length);
 const entries=[];
 for(const h of heads){
  const alts=[...h[1].matchAll(/\balt\s*=\s*(["'])(.*?)\1/gi)].map(x=>clean(decodeHtml(x[2])));
  if(alts.length!==1)throw Error('not exactly one manufacturer image-model identity in H4');
  entries.push(alts[0]);
 }
 if(entries.at(-1)!=='moto pen ultra'||entries.filter(x=>x==='moto pen ultra').length!==1)
  throw Error('accessory exclusion changed');
 const models=entries.filter(x=>x!=='moto pen ultra');
 if(models.length!==12||new Set(models).size!==12)throw Error('manufacturer phone list not 12 exact unique models');
 if(JSON.stringify(models)!==JSON.stringify(pass.universe.models))throw Error('manufacturer exact model names/order changed');
 if(digest(models.join('\n'))!==pass.universe.sourceObservation.orderedModelSha256)throw Error('manufacturer model-source digest changed');
 return models;
}
async function get(url){
 if(!vendor(url))throw Error('not Motorola-controlled HTTPS');
 const res=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 if(!res.ok||!vendor(res.url)||!/html/i.test(res.headers.get('content-type')||''))throw Error('official HTTP/redirect/type rejection: '+res.status+' '+res.url);
 return{url:res.url,html:await res.text(),status:res.status};
}
export function checkManualHtml(doc,model,{alias=null,regional=false}={}){
 const title=clean(doc.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const text=clean(doc.html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));
 const target=key(alias||model);
 // Exact manufacturer name, not a prefix (edge 60 cannot match edge 60 pro).
 const exact=regional
  ? new RegExp('(^|[^a-z0-9])'+(alias||model).replace(/[.*+?^$()|[\]{}\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(title+' '+text.slice(0,3000))
  : key(title)===target;
 const guideType=regional?/ユーザーガイド|User Guide/i.test(title+' '+text.slice(0,3000))
  : /\/hc\/\d+\/\d+\/(?:global|na)\/[a-z-]+\/index\.html/.test(new URL(doc.url).pathname) &&
   doc.html.length>=15000 && /Home screen|ホーム画面|Get started|Getting started|Settings|設定/i.test(text);
 return{title,exact,guideType,accepted:exact&&guideType,bodyLength:doc.html.length};
}
function candidateModels(model){
 if(model==='moto g 06')return['moto g06','moto g 06'];
 if(model==='moto g 37 j'||model==='moto g 66 j')return[];
 return[model];
}
function guideCandidate(model){
 return 'https://help.motorola.com/hc/help.php?'+new URLSearchParams({c:'',m:model,os:'',product:'',sku:'',type:'html'}).toString();
}
export async function reviewAll({pass,indexHtml,fetcher=get,concurrency=5}){
 const models=extractPopulation(indexHtml,pass),results=new Array(models.length);
 let cursor=0;
 async function worker(){
  while(cursor<models.length){
   const i=cursor++,model=models[i],special=SPECIAL[model],attempts=[];
   let direct=null;
   if(special){
    try{
     const doc=await fetcher(special.url);
     const test=checkManualHtml(doc,model,{alias:special.titleAlias,regional:true});
     attempts.push({url:special.url,finalUrl:doc.url,...test});
     if(test.accepted)direct={url:doc.url,title:test.title,reviewMethod:'exact_Japan_manufacturer_device_specific_HTML_user_guide'};
    }catch(e){attempts.push({url:special.url,error:String(e)});}
   }else{
    for(const name of candidateModels(model)){
     const url=guideCandidate(name);
     try{
      const doc=await fetcher(url);
      const test=checkManualHtml(doc,model,{alias:name});
      attempts.push({url,finalUrl:doc.url,...test});
      if(test.accepted){direct={url:doc.url,title:test.title,reviewMethod:'exact_manufacturer_HTML_guide_with_substantial_operating_topics'};break;}
     }catch(e){attempts.push({url,error:String(e)})}
    }
   }
   const state=direct?'direct':'held';
   results[i]={model,state,...(direct?{manualUrl:direct.url,supportUrl:direct.url,reviewMethod:direct.reviewMethod}:{reason:'All official model-specific operational guide candidates failed exact title or document content verification. Retained for secondary discovery.'}),
    evidenceUrls:[INDEX,...(direct?[direct.url]:[])],attemptedDiscovery:['official_Motorola_Japan_product_lineup','official_Motorola_HTML_user_guide','regional_Motorola_Japan_support_alternate'],
    verifiedAt:'2026-10-31',attempts,reviewNote:direct?'Manufacturer-controlled HTML user guide with exact model identity and operating guidance; no generic model fallback.':'Official model remains in locked population but no accepted model-specific guide destination after review.'};
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,models.length)},worker));
 const counts={direct:0,shared:0,support_only:0,held:0};
 for(const r of results)counts[r.state]++;
 if(results.length!==12||Object.values(counts).reduce((a,b)=>a+b,0)!==12)throw Error('silent population drop');
 return{schemaVersion:1,maker:pass.maker,scopeId:pass.scopeId,sourceProducts:13,officialPhonePopulation:12,excludedAccessory:'moto pen ultra',
  observedAt:new Date().toISOString(),counts,records:results,unresolved:results.filter(x=>x.state==='held').map(x=>x.model)};
}
async function main(){
 const pass=JSON.parse(await fs.readFile(PASS,'utf8'));
 const v=validateCoveragePass(pass);if(!v.valid)throw Error('invalid source manifest '+v.errors.join('; '));
 const src=await get(INDEX);
 const review=await reviewAll({pass,indexHtml:src.html});
 const args=process.argv.slice(2),i=args.indexOf('--out'),out=i>=0?args[i+1]:'manualfinder-motorola-jp-review/review.json';
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(review,null,2)+'\n');
 console.log(JSON.stringify({population:review.officialPhonePopulation,counts:review.counts,held:review.unresolved,
  results:review.records.map(r=>({model:r.model,state:r.state,manualUrl:r.manualUrl,attempts:r.attempts.map(a=>({title:a.title,accepted:a.accepted,error:a.error}))}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
