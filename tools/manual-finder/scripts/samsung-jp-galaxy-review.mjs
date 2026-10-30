#!/usr/bin/env node
/**
 * Fail-closed Samsung JP Galaxy smartphone Coverage-Pass live review.
 * The official article table (not an inferred support URL pattern) is source truth.
 * Marketing-model rows are the population; carrier support links remain evidence candidates.
 * No publication output is emitted unless the locked universe exactly reconciles.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hostAllowed, htmlToText, decodeHtml, validateCoveragePass} from './coverage-pass-lib.mjs';

export const INDEX='https://www.samsung.com/jp/support/mobile-devices/how-to-check-galaxy-online-manual/';
const DOMAIN=['samsung.com','downloadcenter.samsung.com'];
const scopePath=new URL('../coverage-passes/samsung/jp-galaxy-smartphone-online-manual-index.json',import.meta.url);
const normalizeText=s=>htmlToText(s).normalize('NFKC').replace(/\s+/g,' ').trim();
function findLinks(html,base) {
  const urls=[];
  for(const m of String(html).matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    let u; try {u=new URL(decodeHtml(m[2]),base)}catch{continue}
    if(u.protocol!=='https:'||u.hostname!=='www.samsung.com'||!/^\/jp\/support\/model\/[^/]+\/?$/i.test(u.pathname))continue;
    if(!u.hash.startsWith('#downloads'))continue;
    urls.push({url:u.href,carrier:normalizeText(m[3]),supportUrl:u.href.split('#')[0]});
  }
  return [...new Map(urls.map(x=>[x.url,x])).values()];
}
export function discoverOfficialPopulation(html) {
  const tables=[...String(html).matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map(x=>x[0]);
  if(tables.length!==6)throw Error('manufacturer index table boundary drift: expected 5 smartphone + 1 tablet, got '+tables.length);
  const phoneGroups=[];
  for(const [i,table] of tables.entries()){
    const rows=[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(x=>x[1]);
    if(!rows.length||!normalizeText(rows[0]).includes('機種名')) throw Error('unexpected official table header '+i);
    const out=[];
    for(const row of rows.slice(1)){
      const cells=[...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>x[1]);
      if(cells.length!==2) throw Error('unexpected row structure in table '+i);
      const model=normalizeText(cells[0]),candidates=findLinks(cells[1],INDEX);
      if(!model)throw Error('silent blank model in official table '+i);
      out.push({model,candidates,tableIndex:i});
    }
    phoneGroups.push(out);
  }
  return {groups:phoneGroups.slice(0,5),excludedTabletModels:phoneGroups[5].map(r=>r.model),
    tabletCount:phoneGroups[5].length,allTableCount:tables.length};
}
function normalizeIdentity(s) {
  return String(s||'').normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
}
export function exactModelTitle(html,model){
  const title=normalizeText(String(html).match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const heading=normalizeText(String(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
  const left=title.split(/[|｜]/)[0].trim();
  // Samsung adds "（キャリア販売モデル）", "(SIMフリー)", carrier codes to the title;
  // these are not new smartphone models. Do not accept a partial family prefix.
  const stripped=left.replace(/\s*[（(][^()（）]*[)）].*$/,'').trim();
  const variants=[stripped,stripped.replace(/\s+(?:SC[-A-Z0-9]+|SM[-A-Z0-9]+|SCV[0-9]+|SCG[0-9]+|SCL[0-9]+|ISW[0-9A-Z]+|[0-9]{3}SC)\s*$/i,'').trim()];
  return {title,heading,exact:variants.some(x=>normalizeIdentity(x)===normalizeIdentity(model))};
}
function jsonArrayAt(source,start) {
  if(source[start]!=='[')return null;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<source.length;i++){
    const ch=source[i];
    if(quoted){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')quoted=false;continue}
    if(ch==='"'){quoted=true;continue}
    if(ch==='[')depth++;
    if(ch===']'&&--depth===0){try{return JSON.parse(source.slice(start,i+1))}catch{return null}}
  }
  return null;
}
export function manufacturerManualEvidence(html) {
  const matches=[];
  for(const m of String(html).matchAll(/"manuals"\s*:\s*\[/g)){
    const open=m.index+m[0].lastIndexOf('[');
    const array=jsonArrayAt(html,open);
    if(!Array.isArray(array))continue;
    for(const row of array){
      if(!row||typeof row!=='object')continue;
      if(!['UM','EM'].includes(row.contentsTypeCode))continue;
      if(!hostAllowed(row.downloadUrl,DOMAIN))continue;
      if(!Array.isArray(row.languageList)||!row.languageList.some(x=>x.code==='JA'||x.orgCode==='JA'))continue;
      matches.push({description:String(row.description||''),downloadUrl:row.downloadUrl,kind:row.contentsTypeCode,fileName:String(row.fileName||'')});
    }
  }
  return [...new Map(matches.map(x=>[x.downloadUrl,x])).values()];
}
async function officialGet(url) {
  if(!hostAllowed(url,DOMAIN))throw Error('candidate outside manufacturer domain');
  const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(16000),
    headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
  if(!hostAllowed(response.url,DOMAIN)||new URL(response.url).hostname!=='www.samsung.com')
    throw Error('redirect outside Samsung JP support domain');
  if(!response.ok)throw Error('HTTP '+response.status);
  if(!/html/i.test(response.headers.get('content-type')||''))throw Error('not HTML');
  return {html:await response.text(),finalUrl:response.url,statusCode:response.status};
}
export async function reviewIndex({html,pass,probe=officialGet,concurrency=5}) {
  const discovery=discoverOfficialPopulation(html);
  if(pass.universe.models.length!==89)throw Error('locked population length mismatch');
  const expectedGroups=pass.subscopes;
  if(expectedGroups.length!==5)throw Error('locked subscopes not five');
  for(let i=0;i<5;i++){
    const actual=discovery.groups[i].map(x=>x.model),expected=expectedGroups[i].models;
    if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('official source population drift: '+expectedGroups[i].id+' expected '+expected.length+' found '+actual.length);
    if(actual.some((x,j)=>actual.indexOf(x)!==j))throw Error('duplicate manufacturer model in group '+i);
  }
  const rows=discovery.groups.flat();
  if(rows.length!==89||new Set(rows.map(x=>x.model)).size!==89)throw Error('manufacturer universe reconciliation failed');
  if(discovery.excludedTabletModels.length!==34)throw Error('tablet boundary drift');
  const results=new Array(rows.length);
  let cursor=0;
  async function worker(){
    while(cursor<rows.length){
      const i=cursor++,entry=rows[i];
      const attempts=[],supportCandidates=[],directCandidates=[];
      for(const c of entry.candidates){
        const attempt={url:c.url,carrier:c.carrier};
        try{
          const destination=await probe(c.supportUrl);
          const identity=exactModelTitle(destination.html,entry.model);
          const manuals=manufacturerManualEvidence(destination.html);
          Object.assign(attempt,{result:identity.exact?'exact_official_model':'model_title_mismatch',
            statusCode:destination.statusCode,finalUrl:destination.finalUrl,title:identity.title,manualCount:manuals.length});
          if(identity.exact){
            supportCandidates.push({supportUrl:destination.finalUrl,sourceUrl:c.url});
            if(manuals.length)directCandidates.push({manualUrl:destination.finalUrl+'#downloads',supportUrl:destination.finalUrl,manuals:manuals.slice(0,8)});
          }
        }catch(e){attempt.result='fetch_exception';attempt.reason=String(e)}
        attempts.push(attempt);
        // A deeper positive official model manual index is sufficient for this marketing-model row.
        if(directCandidates.length)break;
      }
      const manual=directCandidates[0],support=supportCandidates[0];
      let state,review;
      if(manual){state='direct';review={manualUrl:manual.manualUrl,supportUrl:manual.supportUrl,manualEvidence:manual.manuals}}
      else if(support){state='support_only';review={supportUrl:support.supportUrl}}
      else{state='held';review={reason:'no exact manufacturer model title verified on linked official support pages'}}
      results[i]={model:entry.model,group:expectedGroups[entry.tableIndex].id,state,...review,
        attemptedDiscovery:['official_galaxy_manual_index','index_linked_samsung_model_support','manufacturer_download_metadata'],
        evidenceUrls:[INDEX,...attempts.map(a=>a.finalUrl||a.url).filter(x=>hostAllowed(x,DOMAIN))],
        reviewedAt:'2026-10-31',attempts,
        reviewNote:state==='direct'?'Exact Samsung model title and Japanese manufacturer download metadata verified; link to model manual-download section.':
          state==='support_only'?'Exact Samsung model support title verified, but no accepted Japanese manual metadata from reviewed official destinations.':
          'Official index model retained; linked official candidates did not prove exact identity. Secondary discovery required before completion.'};
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,rows.length)},()=>worker()));
  const counts={direct:0,shared:0,support_only:0,held:0};
  for(const result of results)counts[result.state]++;
  return {schemaVersion:1,sourceUrl:INDEX,observedAt:new Date().toISOString(),
    officialPopulation:89,groupCounts:discovery.groups.map(g=>g.length),tabletExcluded:34,
    counts,records:results,reviewedCount:results.length,
    candidateCount:rows.reduce((n,x)=>n+x.candidates.length,0),
    identityFailures:results.flatMap(x=>x.attempts||[]).filter(x=>x.result==='model_title_mismatch').length,
    exceptions:results.filter(x=>x.state==='held').map(x=>x.model),
    publicationReady:counts.held===0 && results.length===89};
}
async function main(){
  const pass=JSON.parse(await fs.readFile(scopePath,'utf8'));
  const p=validateCoveragePass(pass);
  if(!p.valid)throw Error('invalid manifest '+p.errors.join('; '));
  const args=process.argv.slice(2),outIdx=args.indexOf('--out');
  const output=outIdx>=0?args[outIdx+1]:'manualfinder-samsung-review.json';
  const html=(await officialGet(INDEX)).html;
  const result=await reviewIndex({html,pass});
  await fs.mkdir(path.dirname(output),{recursive:true});
  await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({officialPopulation:result.officialPopulation,groupCounts:result.groupCounts,
    candidateCount:result.candidateCount,counts:result.counts,identityFailures:result.identityFailures,
    heldModels:result.exceptions}));
  // Held is a valid first-pass exception routed to secondary discovery, not a CI success claim.
  // Publication remains gated by the final manifest and publication test.
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  main().catch(e=>{console.error(e);process.exitCode=1});
