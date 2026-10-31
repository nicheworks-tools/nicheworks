#!/usr/bin/env node
/**
 * Bounded official manufacturer U-series population extractor (candidate only).
 * It intentionally fails when source table structure or scope boundaries drift.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const INDEX='https://www.fmworld.net/biz/fmv/support/fmvmanual/lifebook2.html';
export function strip(value) {
 return String(value||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
}
export function anchoredLinks(html,base=INDEX) {
 const all=[];
 for(const m of String(html).matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)){
  let u;try{u=new URL(m[2].replaceAll('&amp;','&'),base)}catch{continue}
  all.push({name:strip(m[3]),url:u.href});
 }
 return all;
}
export function extractUSeries(html) {
 const rows=[...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(x=>x[0]);
 const target=rows.filter(row=>/Uシリーズ/.test(strip(row)) && /LIFEBOOK\s+U[0-9]/i.test(strip(row)));
 if(target.length!==1)throw Error('official LIFEBOOK U-series source table drift: '+target.length+' matching rows');
 const entry=target[0];
 const matches=anchoredLinks(entry).filter(x=>/^LIFEBOOK U(?:\d|[A-Z])[\w/-]+$/i.test(x.name));
 const bad=anchoredLinks(entry).filter(x=>/^LIFEBOOK\b/i.test(x.name) && !matches.some(y=>y.url===x.url));
 if(bad.length)throw Error('unexpected official U-series link name: '+JSON.stringify(bad.slice(0,10)));
 if(!matches.length)throw Error('empty manufacturer model population');
 const seen=new Set();
 for(const item of matches) {
  if(seen.has(item.name))throw Error('duplicate model '+item.name);
  seen.add(item.name);
  const url=new URL(item.url);
  if(url.protocol!=='https:'||url.hostname!=='www.fmworld.net'||!url.pathname.startsWith('/biz/fmv/support/fmvmanual/lifebook2/'))
   throw Error('untrusted or out-of-scope official candidate '+item.url);
 }
 return {models:matches.map(x=>x.name),candidates:matches,sourceRowCount:matches.length};
}
export async function fetchIndex(){
 const r=await fetch(INDEX,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 if(!r.ok||new URL(r.url).hostname!=='www.fmworld.net')throw Error('official source fetch failed '+r.status+' '+r.url);
 return r.text();
}
async function main(){
 const result=extractUSeries(await fetchIndex());
 const out='manualfinder-fujitsu-probe/u-series-candidates.json';
 await fs.mkdir(path.dirname(out),{recursive:true});
 await fs.writeFile(out,JSON.stringify({sourceUrl:INDEX,observedAt:new Date().toISOString(),...result},null,2)+'\n');
 console.log(JSON.stringify({population:result.models.length,first:result.models.slice(0,8),last:result.models.slice(-8),urlSample:result.candidates.slice(0,3)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
