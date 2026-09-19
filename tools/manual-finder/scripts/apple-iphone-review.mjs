#!/usr/bin/env node
import fs from 'node:fs/promises';
import { decodeHtml, hostAllowed, htmlToText } from './coverage-pass-lib.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

async function fetchHtml(url, allowedDomains) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'NicheWorks-ManualFinder-CoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)' }
    });
    if (!hostAllowed(response.url, allowedDomains)) {
      return { ok:false,status:response.status,finalUrl:response.url,error:'redirect_outside_allowed_domains',html:'',text:'' };
    }
    const html = await response.text();
    return { ok:response.ok,status:response.status,finalUrl:response.url,html,text:htmlToText(html) };
  } catch (error) {
    return { ok:false,status:null,finalUrl:url,error:String(error?.message||error),html:'',text:'' };
  }
}

function extractAnchors(html, baseUrl) {
  const out=[];
  const regex=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of String(html||'').matchAll(regex)) {
    const label=htmlToText(match[2]);
    if (!label) continue;
    try {
      out.push({label,href:new URL(decodeHtml(match[1]),baseUrl).href});
    } catch {}
  }
  return out;
}

function labelsFor(pass, model) {
  return [model, ...((pass.sourceLabels||{})[model]||[])];
}

async function mapLimit(items, concurrency, worker) {
  const results=new Array(items.length);
  let next=0;
  async function run() {
    while (true) {
      const i=next++;
      if (i>=items.length) return;
      results[i]=await worker(items[i],i);
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},()=>run()));
  return results;
}

const args=parseArgs(process.argv.slice(2));
if(!args.pass){
  console.error('Usage: node apple-iphone-review.mjs --pass <manifest.json> [--output <result.json>]');
  process.exit(2);
}

const pass=JSON.parse(await fs.readFile(args.pass,'utf8'));
const allowedDomains=pass.allowedDomains||[];
const indexUrl='https://support.apple.com/ja-jp/docs/iphone';
const index=await fetchHtml(indexUrl,allowedDomains);
if(!index.ok) throw new Error(`Apple iPhone manuals index fetch failed: ${index.status} ${index.error||''}`);
const anchors=extractAnchors(index.html,index.finalUrl);

const scoped=(pass.subscopes||[]).flatMap(scope=>(scope.models||[]).map(model=>({model,scopeId:scope.id})));
if(scoped.length!==pass.universe.models.length || new Set(scoped.map(x=>x.model)).size!==pass.universe.models.length){
  throw new Error(`subscope partition mismatch: ${scoped.length} vs universe ${pass.universe.models.length}`);
}

async function reviewOne(entry){
  const acceptedLabels=labelsFor(pass,entry.model);
  const matches=anchors.filter(a=>acceptedLabels.includes(a.label));
  const officialMatches=matches.filter(a=>hostAllowed(a.href,allowedDomains));

  if(officialMatches.length!==1){
    return {
      model:entry.model,
      scopeId:entry.scopeId,
      candidateState:'needs_secondary_discovery',
      attemptedDiscovery:['official_iphone_manuals_index'],
      evidenceUrls:[index.finalUrl],
      diagnostics:{matchingLinks:officialMatches}
    };
  }

  const page=await fetchHtml(officialMatches[0].href,allowedDomains);
  const exactModelText=acceptedLabels.some(label=>page.text.includes(label));
  const hasDocuments=/ドキュメント|Documents/i.test(page.text);
  const hasManualArtifact=/iPhone\s*ユーザガイド|iPhone\s*User\s*Guide|修理マニュアル|Repair\s*Manual/i.test(page.text);

  if(page.ok && exactModelText && hasDocuments && hasManualArtifact){
    return {
      model:entry.model,
      scopeId:entry.scopeId,
      candidateState:'direct',
      manualUrl:page.finalUrl,
      supportUrl:page.finalUrl,
      evidenceUrls:[index.finalUrl,page.finalUrl],
      verification:{officialHost:true,exactModelText:true,documentsSection:true,manualArtifactMarker:true}
    };
  }

  if(page.ok && exactModelText){
    return {
      model:entry.model,
      scopeId:entry.scopeId,
      candidateState:'support_only',
      supportUrl:page.finalUrl,
      evidenceUrls:[index.finalUrl,page.finalUrl],
      attemptedDiscovery:['official_iphone_manuals_index','official_model_docs_page'],
      verification:{officialHost:true,exactModelText:true,documentsSection:hasDocuments,manualArtifactMarker:hasManualArtifact}
    };
  }

  return {
    model:entry.model,
    scopeId:entry.scopeId,
    candidateState:'needs_secondary_discovery',
    attemptedDiscovery:['official_iphone_manuals_index','official_model_docs_page'],
    evidenceUrls:[index.finalUrl],
    diagnostics:{status:page.status,finalUrl:page.finalUrl,exactModelText,error:page.error||null}
  };
}

const records=await mapLimit(scoped,8,reviewOne);
for(const record of records) console.log('MANUALFINDER_APPLE_IPHONE_REVIEW_RECORD '+JSON.stringify(record));
const counts=records.reduce((a,r)=>((a[r.candidateState]=(a[r.candidateState]||0)+1),a),{});
const result={
  schemaVersion:1,
  maker:pass.maker,
  scopeId:pass.scopeId,
  reviewedAt:new Date().toISOString(),
  officialPopulation:pass.universe.models.length,
  counts,
  records,
  publicationReady:false,
  note:'Automated positive-verification candidates only. Secondary discovery and sample validation remain required before final states/publication.'
};
console.log('MANUALFINDER_APPLE_IPHONE_REVIEW_SUMMARY '+JSON.stringify({officialPopulation:result.officialPopulation,counts}));
if(args.output) await fs.writeFile(args.output,JSON.stringify(result,null,2)+'\n');
