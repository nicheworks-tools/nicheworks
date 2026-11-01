#!/usr/bin/env node
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {validateCoveragePass} from './coverage-pass-lib.mjs';

const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/canon/jp-lens-manual-index-2026.json',import.meta.url),'utf8'));
const v=validateCoveragePass(pass);
if(!v.valid||!v.completionReady)throw Error('Canon source manifest invalid: '+v.errors.join('; '));
const clean=(s)=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/\s+/g,' ').trim();
const groups=pass.universe.sourceUrls;
const read=async (url)=>{
 const r=await fetch(url,{signal:AbortSignal.timeout(24000)});
 if(!r.ok||new URL(r.url).hostname!=='canon.jp')throw Error('Manufacturer index refused '+r.status+' '+r.url);
 return r.text();
};
function parse(html,group,index){
 const items=[];
 for(const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
  const href=m[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
  const label=clean(m[2]);
  if(!label.includes('使用説明書')||label.includes('フィルターの型紙'))continue;
  if(!/^(?:RF-S|RF|EF-S|EF-M|EF|TS-E)[0-9A-Za-z.\-]+/.test(label))continue;
  const model=clean(label.split('使用説明書')[0]);
  if(/[\/／・]/.test(model))continue;
  const manualLink=new URL(href.replace(/&amp;/gi,'&'),index).href;
  const host=new URL(manualLink).hostname;
  if(!['pdisp01.c-wss.com','gdlp01.c-wss.com','cam.start.canon'].includes(host))continue;
  items.push({sourceGroup:group,model,manufacturerLinkUrl:manualLink});
 }
 return items;
}
const observed=[];
await Promise.all(groups.map(async index=>{
 const group=index.split('/').at(-1);
 observed.push(...parse(await read(index),group,index));
}));
observed.sort((a,b)=>a.sourceGroup<b.sourceGroup?-1:a.sourceGroup>b.sourceGroup?1:a.model<b.model?-1:a.model>b.model?1:0);
const expected=pass.records.map(x=>({sourceGroup:x.sourceGroup,model:x.model,manufacturerLinkUrl:x.manufacturerLinkUrl}));
const sortedExpected=[...expected].sort((a,b)=>a.sourceGroup<b.sourceGroup?-1:a.sourceGroup>b.sourceGroup?1:a.model<b.model?-1:a.model>b.model?1:0);
if(JSON.stringify(observed)!==JSON.stringify(sortedExpected))throw Error('Canon manufacturer model -> manual link population drift; do not publish');
const digest=crypto.createHash('sha256').update(observed.map(x=>x.sourceGroup+'|'+x.model+'|'+x.manufacturerLinkUrl).join('\n')).digest('hex');
if(digest!==pass.universe.sourceObservation.officialIndexSha256)throw Error('Canon manufacturer source SHA256 drift '+digest);
const vrModels=pass.records.filter(x=>x.manualUrl==='https://cam.start.canon/ja/V001/').map(x=>x.model);
const vr=await fetch('https://cam.start.canon/ja/V001/',{signal:AbortSignal.timeout(22000)});
if(!vr.ok||new URL(vr.url).hostname!=='cam.start.canon')throw Error('Canon VR manual page not accessible');
const vrHtml=await vr.text();
for(const model of vrModels){
 const normalized=model.replace(/^(RF-S|RF)(?=\d)/,'$1 ');
 if(!vrHtml.includes(model)&&!vrHtml.includes(normalized))throw Error('Canonical VR page no longer names '+model);
}
const pdfRecords=pass.records.filter(x=>x.manualUrl.endsWith('.pdf'));
if(pdfRecords.length!==134||vrModels.length!==3)throw Error('unexpected PDF/VR source count');
let cursor=0;const failures=[],ok=[];
async function verifyOne(row){
 let last='';
 for(let attempt=0;attempt<2;attempt++){
  try{
   const r=await fetch(row.manualUrl,{headers:{range:'bytes=0-63'},signal:AbortSignal.timeout(27000)});
   const host=new URL(r.url).hostname;
   if(![200,206].includes(r.status)||!(host==='gdlp01.c-wss.com'||host.endsWith('.c-wss.com')))throw Error('unexpected PDF host/status '+r.status+' '+host);
   const reader=r.body?.getReader();if(!reader)throw Error('missing PDF body');
   const chunk=await reader.read();await reader.cancel().catch(()=>{});
   const bytes=chunk.value||new Uint8Array();
   if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('not PDF magic');
   return {model:row.model,status:r.status,host,validated:true};
  }catch(e){last=String(e)}
 }
 return {model:row.model,validated:false,error:last};
}
async function worker(){
 while(cursor<pdfRecords.length){
  const row=pdfRecords[cursor++],res=await verifyOne(row);
  (res.validated?ok:failures).push(res);
 }
}
await Promise.all(Array.from({length:12},worker));
const summary={sourceIndexPages:groups.length,officialPopulation:observed.length,direct:v.summary.states.direct,shared:v.summary.states.shared,support_only:v.summary.states.support_only,held:v.summary.states.held,officialPdfVerified:ok.length,officialPdfFailures:failures,officialVrNamedModels:vrModels,sourceDigest:digest};
await fs.mkdir('manualfinder-canon-lens-review',{recursive:true});
await fs.writeFile('manualfinder-canon-lens-review/review.json',JSON.stringify(summary,null,2)+'\n');
console.log('MANUALFINDER_CANON_LENS_REVIEW '+JSON.stringify({...summary,officialPdfFailures:failures.slice(0,5)}));
if(failures.length)throw Error('Canon manufacturer PDF assets failed live verification ('+failures.length+')');
