#!/usr/bin/env node
/**
 * Secondary VAIO discovery for every model in a locked official start-guide scope.
 * Exact title/H1 identity is checked to avoid generic support fallback.
 * Links are recommendations for human/positive verification, never publication truth.
 */
import fs from 'node:fs/promises';
import { URL } from 'node:url';
import { hostAllowed, htmlToText } from './coverage-pass-lib.mjs';

const ALLOWED = ['solutions.vaio.com', 'support.vaio.com'];
const REQUIRED_POPULATION = 82;
const normalize = value => htmlToText(value).replace(/\s+/g,' ').trim();
const extractTitle = html => normalize(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
const extractMainHeading = html => normalize(html.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1] ?? '');
const exactModel = (text, model) => new RegExp('(^|[^A-Z0-9])' + model + '(?=[^A-Z0-9]|$)', 'i').test(text);
export function verifyHtmlIdentity({html, model, kind}) {
  const title = extractTitle(html);
  const heading = extractMainHeading(html);
  const titleMatches = exactModel(title,model);
  const headingMatches = exactModel(heading,model);
  if (!titleMatches) return { accepted:false, reason:'exact_model_absent_from_document_title',title,heading };
  if (kind==='manual' && !/マニュアル|manual|guide/i.test(title))
    return { accepted:false,reason:'document_title_not_manual',title,heading };
  if (kind==='support' && !/サポート|support|製品別/i.test(title))
    return { accepted:false,reason:'document_title_not_support',title,heading };
  return {accepted:true,title,heading,titleMatches,headingMatches,method:'exact_model_in_html_title'};
}
async function check(url,model,kind) {
  try {
    if (!hostAllowed(url,ALLOWED)) return {url,accepted:false,reason:'non_official_url'};
    const response = await fetch(url,{redirect:'follow', signal:AbortSignal.timeout(12000),headers:{'user-agent':'ManualFinderCoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)'}});
    const finalUrl = response.url;
    if (!hostAllowed(finalUrl,ALLOWED)) return {url,finalUrl,accepted:false,reason:'redirect_left_official_domains'};
    if (!response.ok) return {url,finalUrl,accepted:false,statusCode:response.status,reason:'http_error'};
    const type = response.headers.get('content-type')||'';
    if (!/html/i.test(type)) {await response.body?.cancel();return {url,finalUrl,accepted:false,contentType:type,reason:'not_html'};}
    const html = await response.text();
    const identity = verifyHtmlIdentity({html,model,kind});
    return {url,finalUrl,statusCode:response.status,contentType:type,...identity};
  } catch(err) {return {url,accepted:false,reason:'fetch_exception',message:String(err)};}
}
export async function secondaryReview(pass, original, probe=check) {
  if (pass.universe.models.length!==REQUIRED_POPULATION || original.lockedPopulation!==REQUIRED_POPULATION)
    throw Error('VAIO official population changed: stop rather than silently discarding models');
  if (new Set(pass.universe.models).size!==REQUIRED_POPULATION)throw Error('duplicate locked population');
  const byModel=new Map(original.candidates.map(x=>[x.model,x]));
  if(byModel.size!==REQUIRED_POPULATION)throw Error('first-pass candidates did not reconcile');
  const output=[];
  for(const model of pass.universe.models) {
    const originalRow=byModel.get(model);
    if(!originalRow) throw Error('missing first-pass model: '+model);
    const officialLinkedGuides=(originalRow.links||[]).filter(x=>x.candidateKind==='html_manual_candidate').map(x=>x.url);
    const manualReview=[];
    for(const url of officialLinkedGuides) manualReview.push(await probe(url,model,'manual'));
    // Manufacturer index explicitly lists 24 HTML guides and the model's official
    // product support pages; inferred userguide paths are deliberately NOT probed.
    const supportUrl='https://support.vaio.com/products/'+encodeURIComponent(model)+'/';
    const supportReview=await probe(supportUrl,model,'support');
    const acceptedManual=manualReview.find(x=>x.accepted);
    const recommended=acceptedManual?'direct':supportReview.accepted?'support_only':'held';
    output.push({model,firstPass:originalRow.candidateStatus,
      manufacturerIndexUrls:(originalRow.links||[]).map(x=>x.url),
      manualReview,supportReview,recommendedState:recommended,
      publicationEligible:false,attemptedDiscovery:['official_start_guide_index','official_exact_model_product_support',...(officialLinkedGuides.length?['official_linked_html_user_guide']:[])],
      note:recommended==='support_only'?'PDF link is access-blocked in this CI; the exact official support page is accessible. Do not imply a manual was disproved.':recommended==='held'?'Official identity cannot yet be positively verified on the probed destinations; continue official secondary discovery.':'Exact VAIO linked HTML user guide has verified model-specific document title.'});
  }
  const counts={direct:0,shared:0,support_only:0,held:0};
  for(const row of output)counts[row.recommendedState]++;
  return {schemaVersion:1,maker:'VAIO',scopeId:pass.scopeId,observedAt:new Date().toISOString(),
    lockedPopulation:REQUIRED_POPULATION,counts,records:output,publicationEligible:false,
    notes:'Suggested reviews only. Complete manifest requires documented held escalation and final reconciliation; do not auto-promote.'};
}
async function main(){
  const args=process.argv.slice(2),flag=x=>args[args.indexOf(x)+1];
  if(!args.includes('--first-pass')||!args.includes('--out')) throw Error('usage: --first-pass <candidate-json> --out <secondary-json>');
  const original=JSON.parse(await fs.readFile(flag('--first-pass'),'utf8'));
  const pass=JSON.parse(await fs.readFile(new URL('../coverage-passes/vaio/jp-pc-start-guide-manual-index.json',import.meta.url),'utf8'));
  const result=await secondaryReview(pass,original);
  await fs.writeFile(flag('--out'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({lockedPopulation:result.lockedPopulation,counts:result.counts,publicationEligible:false}));
}
if(process.argv[1] && import.meta.url===new URL('file://'+process.argv[1]).href)
  main().catch(err=>{console.error(err);process.exitCode=1;});
