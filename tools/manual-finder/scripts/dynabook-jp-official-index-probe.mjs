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
// Extract balanced HTML elements. Dynabook embeds per-PDF layout tables inside
// the *outer* product-list table; non-nested <table> regex truncates all but row 1.
function balanced(html,tag){
 const regex=new RegExp('<(/?)'+tag+'\\b[^>]*>','gi'),found=[];
 let depth=0,from=-1,m;
 while((m=regex.exec(html))){
  if(m[1]==='/'){
   if(depth===0)throw Error('unexpected closing '+tag);
   if(--depth===0)found.push(html.slice(from,regex.lastIndex));
  }else{if(depth++===0)from=m.index;}
 }
 if(depth!==0)throw Error('unterminated '+tag+' nested block');
 return found;
}
function rowCells(raw){
 const regex=/<(\/?)(td|th)\b[^>]*>/gi;let depth=0,start=-1,cellTag=null,m,cells=[];
 while((m=regex.exec(raw))){
  if(m[1]==='/'){if(depth===0)continue;if(--depth===0)cells.push({html:raw.slice(start,regex.lastIndex),inner:raw.slice(start, m.index)})}
  else {if(depth++===0){start=regex.lastIndex;cellTag=m[2]}}
 }
 return cells;
}
function inspectYear(html,year,url){
 const tables=balanced(html,'table'),tableResults=[];let rowCount=0;
 for(const [index,table] of tables.entries()){
  const trs=balanced(table,'tr'),rows=[];
  for(const tr of trs){
   const cells=rowCells(tr).map(m=>({text:clean(m.inner),links:links(m.inner,url)}));
   if(cells.length<3)continue;
   const modelCell=cells[0].text;
   const maybeModel=/^(?:dynabook\b|dynaDesk\b|Dynabook Chromebook\b|教育市場向け\s+(?:dynabook|Dynabook))/i.test(modelCell);
   if(!maybeModel)continue;
   const manualCell=cells.at(-1);
   rows.push({name:modelCell,columns:cells.length,release:cells[1]?.text||'',productLinks:cells[0].links,
    manualLinks:manualCell.links,allCellTexts:cells.map(x=>x.text)});
   rowCount++;
  }
  if(rows.length)tableResults.push({index,header:clean(trs[0]||'').slice(0,200),rowCount:rows.length,rows});
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
