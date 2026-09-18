import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const toolRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const patterns=JSON.parse(fs.readFileSync(path.join(toolRoot,'data','patterns.json'),'utf8'));
const origin='https://nicheworks.app';
const toolPath='/tools/pattern-dictionary/';
const sitemapUrl=`${origin}/sitemap.xml`;
const reportPath=process.env.PATTERN_DICTIONARY_PRODUCTION_SEO_REPORT||path.join(os.tmpdir(),'pattern-dictionary-production-seo-report.json');
const concurrency=Math.max(1,Math.min(16,Number(process.env.PATTERN_DICTIONARY_PRODUCTION_SEO_CONCURRENCY||8)));
const timeoutMs=Math.max(5000,Number(process.env.PATTERN_DICTIONARY_PRODUCTION_SEO_TIMEOUT_MS||20000));
const retries=Math.max(0,Math.min(3,Number(process.env.PATTERN_DICTIONARY_PRODUCTION_SEO_RETRIES||2)));

if(patterns.length!==100)throw new Error(`Expected canonical 100 patterns, got ${patterns.length}`);

const detailTargets=patterns.flatMap(({id})=>[
  {id,lang:'ja',url:`${origin}${toolPath}patterns/${encodeURIComponent(id)}/`},
  {id,lang:'en',url:`${origin}${toolPath}en/patterns/${encodeURIComponent(id)}/`}
]);

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function attr(tag,name){
  const match=tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`,'i'));
  return match?.[2]?.trim()||'';
}

function linkTags(html){return html.match(/<link\b[^>]*>/gi)||[];}
function metaTags(html){return html.match(/<meta\b[^>]*>/gi)||[];}

function analyzeHtml(html,target){
  const links=linkTags(html);
  const canonicals=links.filter(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('canonical')).map(tag=>attr(tag,'href')).filter(Boolean);
  const alternates=links.filter(tag=>attr(tag,'rel').toLowerCase().split(/\s+/).includes('alternate')).map(tag=>({hreflang:attr(tag,'hreflang').toLowerCase(),href:attr(tag,'href')})).filter(x=>x.hreflang&&x.href);
  const robots=metaTags(html).filter(tag=>attr(tag,'name').toLowerCase()==='robots').map(tag=>attr(tag,'content').toLowerCase()).filter(Boolean);
  const ja=`${origin}${toolPath}patterns/${encodeURIComponent(target.id)}/`;
  const en=`${origin}${toolPath}en/patterns/${encodeURIComponent(target.id)}/`;
  const issues=[];

  if(canonicals.length!==1)issues.push(`canonical-count:${canonicals.length}`);
  if(canonicals[0]!==target.url)issues.push(`canonical-mismatch:${canonicals[0]||'(missing)'}`);
  if(!robots.length)issues.push('robots-meta-missing');
  if(robots.some(value=>value.includes('noindex')))issues.push(`robots-noindex:${robots.join('|')}`);
  if(!robots.some(value=>value.includes('index')&&value.includes('follow')))issues.push(`robots-not-index-follow:${robots.join('|')||'(missing)'}`);
  const jaAlt=alternates.find(x=>x.hreflang==='ja');
  const enAlt=alternates.find(x=>x.hreflang==='en');
  if(jaAlt?.href!==ja)issues.push(`hreflang-ja:${jaAlt?.href||'(missing)'}`);
  if(enAlt?.href!==en)issues.push(`hreflang-en:${enAlt?.href||'(missing)'}`);

  return {canonicals,robots,alternates,issues};
}

async function fetchOnce(url,accept){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    return await fetch(url,{
      redirect:'manual',
      signal:controller.signal,
      headers:{
        'accept':accept,
        'user-agent':'NicheWorks-PatternDictionary-Production-SEO-Audit/1.0 (+https://nicheworks.app/)'
      }
    });
  }finally{clearTimeout(timer);}
}

async function fetchWithRetry(url,accept){
  let lastError;
  for(let attempt=0;attempt<=retries;attempt++){
    try{
      const response=await fetchOnce(url,accept);
      if(response.status>=500&&attempt<retries){await response.arrayBuffer();await sleep(300*(attempt+1));continue;}
      return {response,attempts:attempt+1};
    }catch(error){
      lastError=error;
      if(attempt<retries){await sleep(300*(attempt+1));continue;}
    }
  }
  throw lastError;
}

async function auditDetail(target,sitemapLocs){
  const started=Date.now();
  try{
    const {response,attempts}=await fetchWithRetry(target.url,'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1');
    const body=await response.text();
    const contentType=response.headers.get('content-type')||'';
    const xRobots=response.headers.get('x-robots-tag')||'';
    const html=analyzeHtml(body,target);
    const issues=[...html.issues];
    if(response.status!==200)issues.push(`http-status:${response.status}`);
    if(response.status>=300&&response.status<400)issues.push(`redirect-location:${response.headers.get('location')||'(missing)'}`);
    if(!contentType.toLowerCase().includes('text/html'))issues.push(`content-type:${contentType||'(missing)'}`);
    if(xRobots.toLowerCase().includes('noindex'))issues.push(`x-robots-noindex:${xRobots}`);
    if(!sitemapLocs.has(target.url))issues.push('missing-from-production-sitemap');
    return {
      ...target,
      status:response.status,
      contentType,
      xRobotsTag:xRobots,
      attempts,
      durationMs:Date.now()-started,
      canonical:html.canonicals[0]||null,
      robots:html.robots,
      hreflang:Object.fromEntries(html.alternates.filter(x=>['ja','en','x-default'].includes(x.hreflang)).map(x=>[x.hreflang,x.href])),
      inSitemap:sitemapLocs.has(target.url),
      ok:issues.length===0,
      issues
    };
  }catch(error){
    return {...target,status:null,attempts:retries+1,durationMs:Date.now()-started,canonical:null,robots:[],hreflang:{},inSitemap:sitemapLocs.has(target.url),ok:false,issues:[`fetch-error:${error?.name||'Error'}:${error?.message||String(error)}`]};
  }
}

async function mapLimit(items,limit,fn){
  const results=new Array(items.length);
  let next=0;
  async function worker(){
    while(true){
      const index=next++;
      if(index>=items.length)return;
      results[index]=await fn(items[index],index);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>worker()));
  return results;
}

const startedAt=new Date().toISOString();
let sitemap={url:sitemapUrl,status:null,contentType:'',attempts:0,locCount:0,patternDetailLocCount:0,ok:false,issues:[]};
let sitemapLocs=new Set();
try{
  const fetched=await fetchWithRetry(sitemapUrl,'application/xml,text/xml;q=0.9,text/plain;q=0.5,*/*;q=0.1');
  const body=await fetched.response.text();
  const contentType=fetched.response.headers.get('content-type')||'';
  sitemap.status=fetched.response.status;
  sitemap.contentType=contentType;
  sitemap.attempts=fetched.attempts;
  const locs=[...body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(match=>match[1].trim());
  sitemapLocs=new Set(locs);
  const patternPrefix=`${origin}${toolPath}`;
  sitemap.locCount=locs.length;
  sitemap.patternDetailLocCount=locs.filter(url=>url.startsWith(`${patternPrefix}patterns/`)||url.startsWith(`${patternPrefix}en/patterns/`)).length;
  if(fetched.response.status!==200)sitemap.issues.push(`http-status:${fetched.response.status}`);
  if(fetched.response.status>=300&&fetched.response.status<400)sitemap.issues.push(`redirect-location:${fetched.response.headers.get('location')||'(missing)'}`);
  if(!/xml/i.test(contentType))sitemap.issues.push(`content-type:${contentType||'(missing)'}`);
  if(sitemap.patternDetailLocCount!==200)sitemap.issues.push(`pattern-detail-loc-count:${sitemap.patternDetailLocCount}`);
  sitemap.ok=sitemap.issues.length===0;
}catch(error){
  sitemap.issues.push(`fetch-error:${error?.name||'Error'}:${error?.message||String(error)}`);
}

const details=await mapLimit(detailTargets,concurrency,target=>auditDetail(target,sitemapLocs));
const failed=details.filter(x=>!x.ok);
const summary={
  expectedDetailUrls:detailTargets.length,
  auditedDetailUrls:details.length,
  http200:details.filter(x=>x.status===200).length,
  canonicalExact:details.filter(x=>x.canonical===x.url).length,
  reciprocalHreflang:details.filter(x=>x.hreflang.ja===`${origin}${toolPath}patterns/${encodeURIComponent(x.id)}/`&&x.hreflang.en===`${origin}${toolPath}en/patterns/${encodeURIComponent(x.id)}/`).length,
  indexFollow:details.filter(x=>x.robots.some(value=>value.includes('index')&&value.includes('follow'))&&!x.robots.some(value=>value.includes('noindex'))).length,
  inProductionSitemap:details.filter(x=>x.inSitemap).length,
  passed:details.filter(x=>x.ok).length,
  failed:failed.length
};
const report={schemaVersion:1,startedAt,finishedAt:new Date().toISOString(),origin,sitemap,settings:{concurrency,timeoutMs,retries},summary,failures:failed,details};
fs.mkdirSync(path.dirname(path.resolve(reportPath)),{recursive:true});
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sitemap,summary,reportPath:path.resolve(reportPath)},null,2));
if(!sitemap.ok||failed.length){
  console.error(`Production SEO audit failed: sitemapOk=${sitemap.ok}, detailFailures=${failed.length}`);
  process.exitCode=1;
}else{
  console.log('OK: production sitemap is healthy and all 200 Pattern Dictionary detail URLs return direct HTTP 200 with exact canonical, index/follow, reciprocal JA/EN hreflang, and sitemap coverage.');
}
