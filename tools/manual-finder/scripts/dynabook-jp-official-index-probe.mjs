#!/usr/bin/env node
import fs from 'node:fs/promises';
const YEARS=[
 {year:2024,url:'https://dynabook.com/manual_download/cata2024.html'},
 {year:2025,url:'https://dynabook.com/manual_download/cata2025.html'},
 {year:2026,url:'https://dynabook.com/manual_download/index.html'}
];
function clean(s){return String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#(?:0*39|x0*27);/gi,"'").replace(/\s+/g,' ').trim()}
function links(html,base) {
 const out=[];
 for(const m of html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)){
  try{out.push({url:new URL(m[2].replace(/&amp;/g,'&'),base).href,label:clean(m[3])})}catch{}
 }
 return out;
}
function inspectYear(html,year,url){
 const tables=[...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)];
 const tableResults=[];let rowCount=0;
 for(const [index,t] of tables.entries()){
  const trs=[...t[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const rows=[];
  for(const tr of trs){
   const cells=[...tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m=>({text:clean(m[1]),links:links(m[1],url)}));
   if(!cells.length)continue;
   const modelCell=cells[0].text;
   const maybeModel=/^(?:dynabook|dynaDesk|Dynabook Chromebook|教育市場向け)/i.test(modelCell);
   if(maybeModel){rows.push({name:modelCell,columns:cells.length,release:cells[1]?.text||'',productLinks:cells[0].links,manualLinks:cells.slice(2).flatMap(x=>x.links).filter(x=>!/\[\s*\d+[\d,]*\s*KB\s*\]$/.test(x.label)),lastCellLinks:cells.at(-1)?.links||[],allCellTexts:cells.map(x=>x.text)});rowCount++;}
  }
  if(rows.length)tableResults.push({index,header:clean(trs[0]?.[1]||'').slice(0,200),rowCount:rows.length,rows});
 }
 return{year,url,htmlLength:html.length,tableCount:tables.length,rowCount,tableResults};
}
async function get(url){
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(35000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 if(!r.ok||new URL(r.url).hostname!=='dynabook.com')throw Error(url+' HTTP '+r.status+' redirected '+r.url);
 return r.text();
}
const out=[];
for(const {year,url} of YEARS){
 const html=await get(url);
 const item=inspectYear(html,year,url);
 const duplicateNames=Object.entries(Object.groupBy(item.tableResults.flatMap(x=>x.rows),x=>x.name)).filter(x=>x[1].length>1).map(([name,rows])=>({name,n:rows.length}));
 out.push({...item,duplicateNames,sample:item.tableResults.flatMap(x=>x.rows).slice(0,5)});
 console.log(JSON.stringify({year,bytes:html.length,tables:item.tableCount,products:item.rowCount,sections:item.tableResults.map(t=>({table:t.index,count:t.rowCount})),duplicateNames:duplicateNames.slice(0,10),examples:item.tableResults.flatMap(x=>x.rows).slice(0,3).map(x=>({name:x.name,manuals:x.lastCellLinks.slice(0,3)}))}));
}
await fs.mkdir('manualfinder-dynabook-probe',{recursive:true});
await fs.writeFile('manualfinder-dynabook-probe/official-2024-2026-structure.json',JSON.stringify(out,null,2)+'\n');
if(out.some(x=>!x.rowCount))process.exitCode=1;
