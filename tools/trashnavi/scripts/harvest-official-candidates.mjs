#!/usr/bin/env node
// Only suggests candidates from official municipal sites. Never edits review ledger.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../data');
const waste=/ごみ|ゴミ|粗大|分別|廃棄物|収集日|カレンダー|資源物|清掃工場|リサイクル/u;
const nav=/暮らし|くらし|生活|環境|衛生|清掃/u;
const decode=s=>String(s||'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'");
export function extract(html,base,host){
  const out=[],seen=new Set();
  for(const m of String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)){
    const attr=m[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if(!attr)continue;
    let u;try{u=new URL(decode(attr[1]??attr[2]??attr[3]),base);}catch{continue;}
    u.hash='';
    if(!/^https?:$/.test(u.protocol)||u.hostname!==host||seen.has(u.href))continue;
    const name=decode(m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')).trim().slice(0,120);
    if(!name)continue;
    seen.add(u.href);
    const label=name+' '+u.pathname;
    out.push({url:u.href,label:name,score:waste.test(label)?3:nav.test(label)?1:0});
  }
  return out;
}
export function pendingSlice(ledger,gov,shard,size){
  const homes=new Map(gov.map(x=>[String(x.lgcode),x.url]));
  return ledger.municipalities.filter(x=>x.coverage_state==='pending_review').slice(shard*size,(shard+1)*size).map(x=>({lgcode:String(x.lgcode),pref:x.pref,municipality:x.municipality,official_home:homes.get(String(x.lgcode))||null}));
}
export function allowed(robots,p){
  const restrictions=[],lines=String(robots||'').split(/\r?\n/);
  let active=false;
  for(const s of lines){
    const m=s.split('#')[0].trim().match(/^([\w-]+)\s*:\s*(.*)$/);if(!m)continue;
    if(m[1].toLowerCase()==='user-agent')active=m[2].trim()==='*';
    if(active&&['disallow','allow'].includes(m[1].toLowerCase())&&m[2].trim())restrictions.push({isAllowed:m[1].toLowerCase()==='allow',prefix:m[2].trim()});
  }
  const matched=restrictions.filter(x=>p.startsWith(x.prefix)).sort((a,b)=>b.prefix.length-a.prefix.length);
  return !matched.length||matched[0].isAllowed;
}
async function get(url,host,follow=0){
  try{
    const u=new URL(url);if(!/^https?:$/.test(u.protocol)||u.hostname!==host)return {error:'cross_host'};
    const r=await fetch(u,{redirect:'manual',headers:{'User-Agent':'NicheWorksTrashNaviResearchBot/1.0','Accept':'text/html,text/plain'},signal:AbortSignal.timeout(7000)});
    if([301,302,303,307,308].includes(r.status)&&follow<2)return get(new URL(r.headers.get('location'),u).href,host,follow+1);
    if(!r.ok)return {error:'http_'+r.status};
    if(!/text\/html|text\/plain/i.test(r.headers.get('content-type')||''))return {error:'not_html'};
    return {html:(await r.text()).slice(0,750000),url:u.href};
  }catch(e){return {error:'fetch_failed'};}
}
async function scan(row){
  const out={...row,status:'not_scanned',candidates:[],note:''};
  if(!row.official_home){out.note='missing_home';return out;}
  let home;try{home=new URL(row.official_home);}catch{out.note='invalid_home';return out;}
  const host=home.hostname;
  const robots=await get(new URL('/robots.txt',home).href,host);
  if(robots.error&&!['http_404','http_410'].includes(robots.error)){out.note='robots_unavailable';return out;}
  const rule=robots.html||'';
  if(!allowed(rule,home.pathname)){out.note='robots_disallow';return out;}
  const page=await get(home.href,host);
  if(!page.html){out.note=page.error;return out;}
  const candidates=new Map();
  const harvest=(html,source,depth)=>{
    const links=extract(html,source,host);
    for(const l of links.filter(x=>x.score===3)){
      if(!allowed(rule,new URL(l.url).pathname)||candidates.has(l.url))continue;
      candidates.set(l.url,{url:l.url,official_link_label:l.label,found_on:source,discovery_depth:depth,verification:'UNVERIFIED'});
      if(candidates.size>=15)break;
    }
    return links;
  };
  const first=harvest(page.html,page.url,1);
  const follow=[...first.filter(x=>x.score===3),...first.filter(x=>x.score===1)].filter(x=>!/\.pdf(?:\?|$)/i.test(x.url)).slice(0,4);
  for(const l of follow){
    if(!allowed(rule,new URL(l.url).pathname))continue;
    const child=await get(l.url,host);
    if(child.html)harvest(child.html,child.url,2);
  }
  out.status='scanned';
  out.candidates=[...candidates.values()];
  out.note=out.candidates.length?'manual_verification_required':'limited_scan_no_candidate_not_proof_of_absence';
  return out;
}
async function main(){
  const argv=process.argv.slice(2),arg=(key,fallback)=>{const i=argv.indexOf(key);return i<0?fallback:argv[i+1];};
  const shard=Number(arg('--shard','0')),size=Number(arg('--size','50')),output=arg('--output','');
  if(!Number.isInteger(shard)||shard<0||!Number.isInteger(size)||size<1||size>100||!output)throw Error('Usage: --shard N --size 1..100 --output path');
  const ledger=JSON.parse(fs.readFileSync(path.join(dir,'municipality-review-ledger.json')));
  const gov=JSON.parse(fs.readFileSync(path.join(dir,'localgovjp-lite.json')));
  const rows=pendingSlice(ledger,gov,shard,size),results=Array(rows.length);let cursor=0;
  await Promise.all(Array.from({length:Math.min(5,rows.length)},async()=>{while(cursor<rows.length){const i=cursor++;results[i]=await scan(rows[i]);console.log('Scanned '+(i+1)+'/'+rows.length+' '+rows[i].municipality+': '+results[i].candidates.length);}}));
  const counts={scanned:results.length,with_candidates:results.filter(r=>r.candidates.length).length,candidate_urls:results.reduce((n,r)=>n+r.candidates.length,0),not_scanned:results.filter(r=>r.status!=='scanned').length};
  const record={schema:1,kind:'UNVERIFIED_OFFICIAL_SITE_LINK_CANDIDATES',generated_at:new Date().toISOString(),shard,size,warning:'Do not mark as reviewed or publish these candidates. Verify target page contents, year, scope and authority. Empty candidates do not mean source absence.',counts,results};
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(counts));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1;});
