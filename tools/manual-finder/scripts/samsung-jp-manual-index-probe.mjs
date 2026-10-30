#!/usr/bin/env node
import fs from 'node:fs/promises';
const url='https://www.samsung.com/jp/support/mobile-devices/how-to-check-galaxy-online-manual/';
const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
const html=await r.text();
const text=v=>v.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const terms=['Galaxy A シリーズ','Galaxy S シリーズ','Galaxy Note シリーズ','Galaxy Z Fold','Galaxy Z Flip','Galaxy S26 Ultra','Galaxy A57 5G','Galaxy A8','Galaxy Tab'];
const pieces=Object.fromEntries(terms.map(n=>{const i=html.indexOf(n);return[n,{index:i,near:i<0?null:html.slice(Math.max(0,i-800),i+2800)}]}));
const tables=[...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map(m=>({
	length:m[0].length,
	rows:[...m[0].matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(row=>{
		const cells=[...row[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>({text:text(x[1]),links:[...x[1].matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)].map(z=>({href:z[2],label:text(z[3])}))}));
		return cells;
	})
}));
const links=[...html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)]
.map(m=>({href:m[2],label:text(m[3])})).filter(x=>x.href.includes('/jp/support/model/')).slice(0,25);
const out={sourceUrl:url,status:r.status,finalUrl:r.url,contentType:r.headers.get('content-type'),htmlLength:html.length,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],
foundTerms:Object.fromEntries(Object.entries(pieces).map(([k,x])=>[k,x.index])),
pieces,tables,officialModelLinks:links,modelAnchorCount:(html.match(/\/jp\/support\/model\//g)||[]).length};
await fs.mkdir('manualfinder-samsung-probe',{recursive:true});
await fs.writeFile('manualfinder-samsung-probe/index-structure.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({status:r.status,finalUrl:r.url,htmlLength:html.length,tableCount:tables.length,modelAnchorCount:out.modelAnchorCount,rowsPerTable:tables.map(t=>t.rows.length),foundTerms:out.foundTerms}));
if(!r.ok || !new URL(r.url).hostname.endsWith('samsung.com'))process.exitCode=1;
