#!/usr/bin/env node
import fs from 'node:fs/promises';
import { hostAllowed, htmlToText } from './coverage-pass-lib.mjs';

function parseArgs(argv){
  const out={};
  for(let i=0;i<argv.length;i+=1){
    if(!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;
  }
  return out;
}

async function fetchText(url,allowedDomains){
  try{
    const response=await fetch(url,{
      redirect:'follow',
      signal:AbortSignal.timeout(15000),
      headers:{'user-agent':'NicheWorks-ManualFinder-CoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)'}
    });
    if(!hostAllowed(response.url,allowedDomains)){
      return {ok:false,status:response.status,finalUrl:response.url,error:'redirect_outside_allowed_domains',text:''};
    }
    return {ok:response.ok,status:response.status,finalUrl:response.url,text:htmlToText(await response.text())};
  }catch(error){
    return {ok:false,status:null,finalUrl:url,error:String(error?.message||error),text:''};
  }
}

function candidateSlug(model){
  const special={
    'GFX 50S II':'gfx50s-ii',
    'GFX 50S':'gfx50s',
    'GFX 50R':'gfx50r'
  };
  if(special[model]) return special[model];
  return model.toLowerCase().replace(/\s+/g,'-');
}

async function mapLimit(items,concurrency,worker){
  const results=new Array(items.length); let next=0;
  async function run(){
    while(true){
      const i=next++;
      if(i>=items.length) return;
      results[i]=await worker(items[i],i);
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},()=>run()));
  return results;
}

const args=parseArgs(process.argv.slice(2));
if(!args.pass){
  console.error('Usage: node fujifilm-gfx-x-review.mjs --pass <manifest.json> [--output <result.json>]');
  process.exit(2);
}
const pass=JSON.parse(await fs.readFile(args.pass,'utf8'));
const allowedDomains=pass.allowedDomains||[];
const scoped=(pass.subscopes||[]).flatMap(scope=>(scope.models||[]).map(model=>({model,scopeId:scope.id,sourceUrl:scope.sourceUrl})));
if(scoped.length!==pass.universe.models.length || new Set(scoped.map(x=>x.model)).size!==pass.universe.models.length){
  throw new Error(`subscope partition mismatch: ${scoped.length} vs universe ${pass.universe.models.length}`);
}

async function reviewOne(entry){
  const candidate=`https://www.fujifilm-x.com/ja-jp/support/manual/detail/${candidateSlug(entry.model)}/`;
  const page=await fetchText(candidate,allowedDomains);
  const normalized=page.text.replace(/\s+/g,' ');
  const exactModelText=normalized.toLowerCase().includes(entry.model.toLowerCase());
  const manualArtifact=/使用説明書|Owner.?s Manual|PDF|ダウンロード|Webマニュアル/i.test(normalized);

  if(page.ok && exactModelText && manualArtifact){
    return {
      model:entry.model,
      scopeId:entry.scopeId,
      candidateState:'direct',
      manualUrl:page.finalUrl,
      supportUrl:page.finalUrl,
      evidenceUrls:[entry.sourceUrl,page.finalUrl],
      verification:{officialHost:true,exactModelText:true,manualArtifactMarker:true}
    };
  }
  return {
    model:entry.model,
    scopeId:entry.scopeId,
    candidateState:'needs_secondary_discovery',
    attemptedDiscovery:['official_manual_detail_candidate','official_manual_index'],
    evidenceUrls:[entry.sourceUrl],
    diagnostics:{status:page.status,finalUrl:page.finalUrl,exactModelText,manualArtifact,error:page.error||null,candidate}
  };
}

const records=await mapLimit(scoped,8,reviewOne);
for(const record of records) console.log('MANUALFINDER_FUJIFILM_REVIEW_RECORD '+JSON.stringify(record));
const counts=records.reduce((a,r)=>((a[r.candidateState]=(a[r.candidateState]||0)+1),a),{});
const result={schemaVersion:1,maker:pass.maker,scopeId:pass.scopeId,reviewedAt:new Date().toISOString(),officialPopulation:pass.universe.models.length,counts,records,publicationReady:false,note:'Generated detail URLs are discovery candidates only. Exact FUJIFILM page identity and manual artifacts are required; failures remain secondary-discovery cases.'};
console.log('MANUALFINDER_FUJIFILM_REVIEW_SUMMARY '+JSON.stringify({officialPopulation:result.officialPopulation,counts}));
if(args.output) await fs.writeFile(args.output,JSON.stringify(result,null,2)+'\n');
