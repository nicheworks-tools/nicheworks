#!/usr/bin/env node
// Google Pixel: lock 33 official release rows -> 38 models; review the exact
// manufacturer-named regulatory/support document for each model. Safety
// information is SUPPORT_ONLY, never mislabeled as a user manual.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlToText,decodeHtml,hostAllowed,validateCoveragePass} from './coverage-pass-lib.mjs';

export const RELEASES='https://support.google.com/pixelphone/answer/15738422?hl=ja';
export const SAFETY='https://support.google.com/pixelphone/answer/9204905?hl=ja';
const manifest=new URL('../coverage-passes/google/pixel-phone-jp-2016-2026.json',import.meta.url);
const clean=s=>htmlToText(s).normalize('NFKC').replace(/\s+/g,' ').trim();
const official=u=>{try{return hostAllowed(u,['support.google.com'])&&new URL(u).hostname==='support.google.com'}catch{return false}};
export async function officialGet(url) {
 if(!official(url))throw Error('nonofficial URL');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 if(!r.ok||!official(r.url)||!/html/i.test(r.headers.get('content-type')||''))throw Error('official fetch/status/type '+r.status+' '+r.url);
 return{html:await r.text(),url:r.url,status:r.status};
}
function expand(s){
 if(!s.includes(' | '))return[s];
 const parts=s.split(' | ');
 if(parts.length!==2||!parts[0].startsWith('Google Pixel'))throw Error('unexpected manufacturer grouped model '+s);
 return[parts[0],parts[1].startsWith('Google Pixel')?parts[1]:'Google Pixel '+parts[1]];
}
export function extractReleased(html){
 const tables=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
 if(tables.length!==1)throw Error('release tables changed: '+tables.length);
 const rows=[...tables[0][1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
 .map(x=>[...x[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>clean(c[1])))
 .filter(c=>c.length>1&&c[0].startsWith('Google Pixel')&&/20\d\d/.test(c[1]));
 if(rows.length!==33)throw Error('official population rows changed '+rows.length);
 const models=rows.flatMap(r=>expand(r[0]));
 if(models.length!==38||new Set(models).size!==38)throw Error('invalid grouped Pixel 38-model population '+models.length);
 return{rows,models};
}
export function extractOfficialSupportIndex(html){
 const sections=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
 const sectionIndex=sections.findIndex(x=>clean(x[1])==='安全と規制に関する情報');
 if(sectionIndex<0||!sections[sectionIndex+1]||clean(sections[sectionIndex+1][1])!=='RFE 情報')
  throw Error('manufacturer safety section boundary drift');
 const scoped=html.slice(sections[sectionIndex].index,sections[sectionIndex+1].index);
 const entries=[];
 for(const m of scoped.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)){
  const label=clean(m[3]);
  if(!/^Google Pixel(?:\b|\s|、)/i.test(label)||!/\s*\(20(?:1[6-9]|2\d)\)$/.test(label))continue;
  let url;try{url=new URL(decodeHtml(m[2]),SAFETY)}catch{continue}
  if(!official(url.href)||!/^\/pixelphone\/answer\/\d+\/?$/.test(url.pathname)||url.hash)continue;
  const names=label.replace(/\s*\(20(?:1[6-9]|2\d)\)$/,'').split(/\s*(?:、|\s+と\s+)\s*/).map(x=>x.trim()).filter(Boolean);
  if(!names.length||names.some(x=>!x.startsWith('Google Pixel')))continue;
  entries.push({models:names,url:url.href.split('?')[0]+'?hl=ja',label});
 }
 const deduped=new Map();for(const x of entries){const k=x.models.join('|');if(!deduped.has(k))deduped.set(k,x);}
 const groups=[...deduped.values()];
 if(groups.length!==24||groups.flatMap(x=>x.models).length!==38||new Set(groups.flatMap(x=>x.models)).size!==38)
  throw Error('official support groups changed '+groups.length);
 return groups;
}
export function reconcileSources(releaseHtml,safetyHtml,pass){
 const rel=extractReleased(releaseHtml);
 if(JSON.stringify(rel.models)!==JSON.stringify(pass.universe.models))throw Error('official 38-model universe differs from locked model list');
 const groups=extractOfficialSupportIndex(safetyHtml),modelMap=new Map();
 for(const group of groups)for(const model of group.models){
  if(modelMap.has(model))throw Error('duplicate official document mapping '+model);
  modelMap.set(model,{url:group.url,label:group.label,related:group.models.filter(x=>x!==model)});
 }
 if(modelMap.size!==38||rel.models.some(m=>!modelMap.has(m)))throw Error('official safety index does not reconcile exact 38 release models');
 return{models:rel.models,groups,modelMap};
}
function exactModel(s,model){
 // Preserve exact model boundary, including sibling Pro/XL/5G variants.
 const esc=model.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&');
 return new RegExp('(?:^|[^\\p{L}\\p{N}])'+esc+'(?=$|[^\\p{L}\\p{N}])(?!\\s+(?!20\\d\\d\\b)[A-Za-z0-9])','iu').test(s);
}
export function inspectDocument(html,model){
 const title=clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const headings=[...html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(x=>clean(x[1]));
 const body=clean(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').slice(0,250000));
 const exact=exactModel(title,model)||exactModel(title,model.replace(/^Google /,'')); // Manufacturer's 2016-2019 article titles sometimes omit the Google prefix; evidence is still an exact title token.
 const kind=/安全|規制|Safety|Regulatory/i.test([title,...headings].join(' '));
 return{accepted:exact&&kind,exact,kind,title,headings:headings.slice(0,8)};
}
export async function reviewAll({pass,releaseHtml,safetyHtml,probe=officialGet,concurrency=6}){
 const src=reconcileSources(releaseHtml,safetyHtml,pass),records=new Array(38),cache=new Map();
 const get=url=>{if(!cache.has(url))cache.set(url,Promise.resolve().then(()=>probe(url)).catch(e=>({error:String(e)})));return cache.get(url)};
 let cursor=0;
 async function worker(){
  while(cursor<38){
   const i=cursor++,model=src.models[i],map=src.modelMap.get(model);
   const row={model,documentUrl:map.url,sourceLabel:map.label,officialCoListedModels:map.related,
    evidenceUrls:[RELEASES,SAFETY,map.url],
    attemptedDiscovery:['official_model_release_table','official_model_named_safety_index','exact_manufacturer_support_article','official_pixel_help_topics'],
    verifiedAt:'2026-10-31'};
   const doc=await get(map.url);
   if(doc.error){row.state='held';row.reason='Official exact-document fetch failed: '+doc.error;}
   else{
    const check=inspectDocument(doc.html,model);
    row.documentTitle=check.title;row.documentHeadings=check.headings;
    if(check.accepted){
     row.state='support_only';row.supportUrl=doc.url;row.reviewMethod='exact_model_named_manufacturer_safety_regulatory_support';
     row.reviewNote='Official Google Pixel safety/regulatory support document with exact device identity. This is not an operational user manual and must not be promoted to direct/shared.';
    }else{
     row.state='held';row.reason='Regulatory document failed exact identity or type verification: '+JSON.stringify({model,exact:check.exact,kind:check.kind,title:check.title});
    }
   }
   records[i]=row;
  }
 }
 await Promise.all(Array.from({length:concurrency},worker));
 const counts={direct:0,shared:0,support_only:0,held:0};for(const row of records)counts[row.state]++;
 if(Object.values(counts).reduce((a,b)=>a+b,0)!==38)throw Error('silent population drop');
 return{schemaVersion:1,manufacturer:'Google Pixel',scopeId:pass.scopeId,releaseRows:33,models:38,documentGroups:24,
  documentFetches:cache.size,observedAt:new Date().toISOString(),counts,records,
  heldModels:records.filter(x=>x.state==='held').map(x=>x.model)};
}
async function main(){
 const pass=JSON.parse(await fs.readFile(manifest,'utf8'));
 const v=validateCoveragePass(pass);if(!v.valid)throw Error(v.errors.join('; '));
 const [releases,safety]=await Promise.all([officialGet(RELEASES),officialGet(SAFETY)]);
 const result=await reviewAll({pass,releaseHtml:releases.html,safetyHtml:safety.html});
 const args=process.argv.slice(2),i=args.indexOf('--out'),out=i<0?'manualfinder-pixel-review/review.json':args[i+1];
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({releaseRows:result.releaseRows,models:result.models,documentGroups:result.documentGroups,documentFetches:result.documentFetches,counts:result.counts,held:result.heldModels}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(e=>{console.error(e);process.exitCode=1});
