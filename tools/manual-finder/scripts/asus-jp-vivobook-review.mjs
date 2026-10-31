#!/usr/bin/env node
// Fail-closed ASUS JP Vivobook 35-model coverage-pass live reviewer.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCoveragePass,hostAllowed} from './coverage-pass-lib.mjs';
export const INDEX='https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook';
const PASS=new URL('../coverage-passes/asus/jp-vivobook-official-2026-product-index.json',import.meta.url);
const clean=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const hash=x=>crypto.createHash('sha256').update(x,'utf8').digest('hex');
const official=url=>{try{return hostAllowed(url,['asus.com'])&&new URL(url).protocol==='https:'}catch{return false}};
export async function getOfficial(url){
 if(!official(url))throw Error('not ASUS official HTTPS');
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/json'}});
 if(!r.ok||!official(r.url))throw Error('untrusted final destination or HTTP '+r.status+' '+r.url);
 return{url:r.url,status:r.status,type:r.headers.get('content-type')||'',text:await r.text()};
}
function entries(body){
 const json=JSON.parse(body.text),data=json.Result;
 if(![200,'200'].includes(json.Status)||!Number.isInteger(data?.TotalCount)||!Array.isArray(data?.ProductList))throw Error('manufacturer API schema/status changed');
 return{total:data.TotalCount,rows:data.ProductList.map(p=>({model:clean(p.Name),productId:String(p.ProductID||''),productUrl:p.ProductURL||p.ProductCardURL||''}))};
}
export async function lockedPopulation({pass,indexHtml,apiFetch=getOfficial}){
 const m=indexHtml.match(/https:\/\/odinapi\.asus\.com\/recent-data\/apiv2\/SeriesFilterResult\?[^"<]+/i);
 if(!m)throw Error('ASUS official page does not identify its official list API');
 const root=new URL(m[0].replace(/&amp;/g,'&'));
 if(root.hostname!=='odinapi.asus.com')throw Error('official API host changed');
 const get=(page,size)=>{const u=new URL(root.href);u.searchParams.set('PageIndex',String(page));u.searchParams.set('PageSize',String(size));return apiFetch(u.href).then(entries)};
 const [a,b,all]=await Promise.all([get(1,20),get(2,20),get(1,100)]);
 if(a.total!==35||b.total!==35||all.total!==35||a.rows.length!==20||b.rows.length!==15||all.rows.length!==35)
  throw Error('official full 35 model API pagination did not reconcile');
 const items=[...a.rows,...b.rows];
 if(JSON.stringify(items)!==JSON.stringify(all.rows))throw Error('official pagination is inconsistent with full API');
 if(new Set(items.map(x=>x.productId)).size!==35||new Set(items.map(x=>x.productUrl)).size!==35)throw Error('manufacturer product identity duplicate');
 const signature=hash(items.map(x=>x.model+'|'+x.productUrl+'|'+x.productId).join('\n'));
 if(signature!==pass.universe.sourceObservation.orderedModelIdUrlSha256)throw Error('manufacturer model/url/ID fingerprint drift '+signature);
 if(JSON.stringify(items.map(x=>x.model))!==JSON.stringify(pass.universe.models))throw Error('manufacturer model list differs from locked source');
 for(let i=0;i<35;i++){
  const x=items[i],p=pass.universe.officialProducts[i],u=new URL(x.productUrl);
  if(x.model!==p.model||x.productId!==p.productId||x.productUrl!==p.productUrl)throw Error('source mapping changed for '+x.model);
  if(u.hostname!=='www.asus.com'||!/^\/jp\/laptops\/for-(?:home|creators)\/vivobook\/[^/]+\/$/.test(u.pathname))throw Error('unexpected official source product URL '+u.href);
 }
 return{items,signature};
}
export function familyCode(model){
 const m=model.match(/\(([A-Z]\d{3,5}[A-Z0-9]*)(?:[,)]|$)/);
 if(!m)throw Error('manufacturer exact code absent: '+model);
 return m[1];
}
export function inspectManual(doc,product){
 const code=familyCode(product.model);
 const title=clean(doc.text.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const heads=[...doc.text.matchAll(/<h[1-5]\b[^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(m=>clean(m[1])).filter(Boolean);
 const url=new URL(doc.url),variant=url.searchParams.get('model2Name')||'';
 const exactFamily=title.toUpperCase().includes('('+code+')')||title.toUpperCase().includes('('+code+',');
 const officialVariant=variant.toUpperCase().includes(code)&&variant.length<100;
 const section=heads.some(x=>/^(Manual|マニュアル)$/i.test(x))||/Manual & Document|マニュアルとドキュメント/i.test(doc.text);
 const japanese=/User.s Manual for Japanese Edition|Japanese User.s Manual|日本語版.{0,100}(?:ユーザーマニュアル|取扱説明書)/i.test(doc.text);
 const english=/User.s Manual for English Edition|English User.s Manual/i.test(doc.text);
 const version=/Version|バージョン|SUPPORTTABS_VERSION/i.test(doc.text);
 const download=/ダウンロード|Download/i.test(doc.text);
 const accepted=doc.status===200&&url.hostname==='www.asus.com'&&/\/helpdesk_manual\/?$/.test(url.pathname)&&exactFamily&&officialVariant&&section&&(japanese||english)&&version&&download;
 return{code,title,variant,exactFamily,officialVariant,section,japanese,english,version,download,accepted};
}
export async function reviewAll({pass,indexHtml,apiFetch=getOfficial,pageFetch=getOfficial,concurrency=8}){
 const pop=await lockedPopulation({pass,indexHtml,apiFetch}),records=new Array(35);
 let cursor=0;
 async function worker(){
  while(cursor<records.length){
   const i=cursor++,item=pop.items[i],code=familyCode(item.model);
   const candidate=item.productUrl+'helpdesk_manual/?model2Name='+encodeURIComponent(code);
   const row={model:item.model,productId:item.productId,productUrl:item.productUrl,verifiedAt:'2026-10-31',
    attemptedDiscovery:['official_complete_Vivobook_API','exact_official_product_page','official_model_variant_manual_index','official_user_manual_language_version_listing'],candidateUrl:candidate};
   try{
    const doc=await pageFetch(candidate),tested=inspectManual(doc,item);
    row.checkedUrl=doc.url;row.manualEvidence=tested;
    if(tested.accepted){
     row.state='direct';row.manualUrl=doc.url;row.supportUrl=item.productUrl;row.selectedVariant=tested.variant;
     row.evidenceUrls=[INDEX,item.productUrl,doc.url];row.reviewMethod='manufacturer_locked_product_and_positive_model_variant_manual_page';
     row.reviewNote='Exact ASUS product family and manufacturer-selected variant with Japanese or English User Manual entry and version/download metadata. Other variants are not assumed interchangeable.';
    }else{
     row.state='held';row.reason='Manufacturer manual candidate failed positive exact product code, variant, or operational manual metadata: '+JSON.stringify(tested);
     row.evidenceUrls=[INDEX,item.productUrl];
    }
   }catch(e){row.state='held';row.reason='Official model-specific manual destination unresolved: '+String(e);row.evidenceUrls=[INDEX,item.productUrl];}
   records[i]=row;
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,records.length)},worker));
 const counts={direct:0,shared:0,support_only:0,held:0};records.forEach(x=>counts[x.state]++);
 if(Object.values(counts).reduce((a,b)=>a+b,0)!==35)throw Error('silent model population drop');
 return{maker:pass.maker,scopeId:pass.scopeId,officialPopulation:35,manufacturerPageRows:[20,15],sourceDigest:pop.signature,
  observedAt:new Date().toISOString(),counts,records,heldModels:records.filter(x=>x.state==='held').map(x=>x.model)};
}
async function main(){
 const pass=JSON.parse(await fs.readFile(PASS,'utf8'));const valid=validateCoveragePass(pass);
 if(!valid.valid)throw Error('invalid manifest '+valid.errors.join('; '));
 const source=await getOfficial(INDEX),result=await reviewAll({pass,indexHtml:source.text});
 const args=process.argv.slice(2),i=args.indexOf('--out'),output=i<0?'manualfinder-asus-review/review.json':args[i+1];
 await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({officialPopulation:result.officialPopulation,counts:result.counts,heldModels:result.heldModels,
  audit:result.records.map(x=>({model:x.model,state:x.state,manualUrl:x.manualUrl,reason:x.reason?.slice(0,160)}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
