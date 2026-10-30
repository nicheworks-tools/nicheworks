#!/usr/bin/env node
/**
 * Secondary official Samsung review of all seven first-pass title exceptions.
 * Exact extra manufacturer table model/variant mapping is mandatory; no guessed URLs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {htmlToText,hostAllowed} from './coverage-pass-lib.mjs';
import {INDEX,exactModelTitle,manufacturerManualEvidence} from './samsung-jp-galaxy-review.mjs';
const samsung='https://www.samsung.com';
const DOCOMO=samsung+'/jp/support/mobile-devices/please-tell-us-about-the-latest-version-of-the-galaxy-device-sold-in-docomo/';
const REPAIR=samsung+'/jp/support/mobile-devices/about-discontinued-products-for-manufacturer-brand-repair/';
const AU=samsung+'/jp/support/mobile-devices/please-tell-us-about-the-latest-version-of-galaxy-terminal-which-is-sold-in-au/';
const config={
 'GALAXY S II':{type:'alternate_exact_manual',url:samsung+'/jp/support/model/SGH-N033RWNDCM/',carrierCode:'SC-02C'},
 'Galaxy Z Flip Thom Browne Edition':{type:'alternate_exact_manual',url:samsung+'/jp/support/model/SM-F700JZPAKDI/',carrierCode:'SM-F700J'},
 'Galaxy A21 シンプル':{type:'manual_variant',carrierCode:'SCV49',additionalUrl:AU,manualMarker:'シンプル'},
 'Galaxy S20 5G':{type:'official_variant_mapping',carrierCode:'SC-51A',additionalUrl:DOCOMO},
 'Galaxy Note3':{type:'official_variant_mapping',carrierCode:'SC-01F',additionalUrl:DOCOMO},
 'Galaxy Note20 Ultra 5G':{type:'official_variant_mapping',carrierCode:'SC-53A',additionalUrl:DOCOMO},
 'Galaxy Z Fold2 5G Thom Browne Edition':{type:'official_variant_mapping',carrierCode:'SM-F916Q',additionalUrl:REPAIR}
};
function normalize(s){return htmlToText(s).normalize('NFKC').replace(/\s+/g,' ').trim()}
function compact(s){return normalize(s).replace(/[^\p{L}\p{N}]/gu,'').toLowerCase()}
function rowHasModelAndCode(html,model,code){
 const terms=[compact(model),compact(code)];
 return [...String(html).matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)]
   .some(m=>terms.every(q=>compact(m[0]).includes(q)));
}
async function get(url) {
 if(!hostAllowed(url,['samsung.com'])||new URL(url).hostname!=='www.samsung.com')throw Error('outside Samsung official JP source');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(18000),headers:{'user-agent':'Mozilla/5.0'}});
 if(!r.ok||new URL(r.url).hostname!=='www.samsung.com'||!/html/i.test(r.headers.get('content-type')||''))throw Error('official fetch failure: '+url+' HTTP '+r.status);
 return {html:await r.text(),url:r.url};
}
export async function secondaryReview(first,fetchOfficial=get) {
 const reviewed=new Map(first.records.map(x=>[x.model,x]));
 if(first.officialPopulation!==89||first.records.length!==89||reviewed.size!==89)throw Error('first pass silently dropped official identities');
 const officialIndex=(await fetchOfficial(INDEX)).html;
 const sourceCache=new Map();
 const getCached=async url=>{
   if(!sourceCache.has(url))sourceCache.set(url,(await fetchOfficial(url)).html);
   return sourceCache.get(url);
 };
 const output=[];
 for(const row of first.records){
   if(row.state!=='held'){output.push(row);continue}
   const configRow=config[row.model];
   if(!configRow)throw Error('unreviewed secondary exception model: '+row.model);
   const checks=[],evidence=[...row.evidenceUrls];
   let resolved=null;
   try{
     if(!rowHasModelAndCode(officialIndex,row.model,configRow.carrierCode))
       throw Error('primary index does not explicitly bind model to carrier code');
     checks.push('official_index_exact_model_carrier_row');
     if(configRow.type==='alternate_exact_manual'){
       const other=await fetchOfficial(configRow.url);
       const title=exactModelTitle(other.html,row.model);
       const normalized=compact(title.title);
       const normalizedModel=compact(row.model);
       const startsWithIdentity=normalized.startsWith(normalizedModel)
         && normalized.includes(compact(configRow.carrierCode));
       if(!title.exact && !startsWithIdentity)throw Error('alternate support title not exact manufacturer model');
       const manuals=manufacturerManualEvidence(other.html);
       if(!manuals.length)throw Error('alternate support page has no verified Japanese manuals');
       resolved={state:'direct',manualUrl:other.url+'#downloads',supportUrl:other.url,
         manualEvidence:manuals.slice(0,8),reviewNote:'Secondary Samsung official site search found an alternate exact model-name support page with Japanese manual download metadata.'};
       evidence.push(other.url);checks.push('alternate_exact_official_model_manual');
     }else if(configRow.type==='manual_variant'){
       const firstUrl=row.attempts[0].url.split('#')[0];
       const doc=await fetchOfficial(firstUrl);
       const manuals=manufacturerManualEvidence(doc.html);
       if(!manuals.some(x=>compact(x.description+' '+x.fileName).includes(compact(configRow.manualMarker))))
         throw Error('manufacturer manual metadata does not explicitly identify variant');
       const second=await getCached(configRow.additionalUrl);
       if(!rowHasModelAndCode(second,row.model,configRow.carrierCode))
         throw Error('secondary official carrier model evidence missing');
       resolved={state:'direct',manualUrl:doc.url+'#downloads',supportUrl:doc.url,
         manualEvidence:manuals.filter(x=>compact(x.description+' '+x.fileName).includes(compact(configRow.manualMarker))).slice(0,8),
         reviewNote:'Manufacturer manual metadata explicitly identifies シンプル variant; official au model table binds exact model to SCV49.'};
       evidence.push(doc.url,configRow.additionalUrl);checks.push('exact_variant_in_official_manual_metadata','secondary_official_carrier_row');
     }else{
       const extra=await getCached(configRow.additionalUrl);
       if(!rowHasModelAndCode(extra,row.model,configRow.carrierCode))
         throw Error('official secondary model/code correspondence missing');
       const firstUrl=row.attempts[0].url.split('#')[0];
       const doc=await fetchOfficial(firstUrl);
       const title=normalize(doc.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
       const productCode=new URL(firstUrl).pathname.match(/\/model\/([^/]+)/)?.[1]||'';
       if(!productCode || !compact(doc.html).includes(compact(productCode.slice(0,Math.max(7,productCode.length-6)))))
         throw Error('product variant identity absent from manufacturer destination');
       if(!title || /^(Samsung|サポート)(?:\s*[|｜]|$)/i.test(title))
         throw Error('generic manufacturer support fallback');
       resolved={state:'support_only',supportUrl:doc.url,
         reviewNote:'Exact model and carrier/product code are explicitly linked in Samsung official manual index and corroborated by a separate manufacturer carrier/service list. The destination title differs, so a deeper manual is not promoted.'};
       evidence.push(doc.url,configRow.additionalUrl);checks.push('secondary_official_model_carrier_row','exact_manufacturer_product_page');
     }
   }catch(e){checks.push('held_after_secondary:'+String(e))}
   const state=resolved?.state||'held';
   output.push({...row,...(resolved||{}),state,secondaryChecks:checks,
     evidenceUrls:[...new Set(evidence)],
     attemptedDiscovery:[...new Set([...row.attemptedDiscovery,'official_alternate_support_search','official_carrier_and_service_lists'])],
     ...(state==='held'?{reason:'Unable to confirm exact official destination after secondary discovery; '+checks.at(-1)}:{})});
 }
 const counts={direct:0,shared:0,support_only:0,held:0};
 output.forEach(x=>counts[x.state]++);
 return {schemaVersion:1,officialPopulation:89,sourceUrl:INDEX,observedAt:new Date().toISOString(),
   counts,records:output,heldModels:output.filter(x=>x.state==='held').map(x=>x.model),
   completionCandidate:output.length===89&&counts.direct+counts.support_only+counts.shared+counts.held===89};
}
async function main(){
 const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1];
 if(!args.includes('--first-pass')||!args.includes('--out'))throw Error('usage --first-pass <file> --out <file>');
 const first=JSON.parse(await fs.readFile(arg('--first-pass'),'utf8'));
 const result=await secondaryReview(first);
 await fs.mkdir(path.dirname(arg('--out')),{recursive:true});
 await fs.writeFile(arg('--out'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({officialPopulation:result.officialPopulation,counts:result.counts,heldModels:result.heldModels}));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  main().catch(e=>{console.error(e);process.exitCode=1});
