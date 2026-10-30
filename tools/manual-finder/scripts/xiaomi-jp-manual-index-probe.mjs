#!/usr/bin/env node
import fs from 'node:fs/promises';
const url='https://www.mi.com/jp/support/user-guide/';
const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0 (compatible; ManualFinder source-boundary audit; +https://nicheworks.app/tools/manual-finder/)','accept':'text/html,application/xhtml+xml'}});
const t=await r.text();
const needles=['Xiaomi 17T Pro','Xiaomi 15T','REDMI Note 17 Pro Max 5G','POCO F9 Ultra','Generic User Guide for HyperOS 3','ウェアラブル','Xiaomi Pad 7'];
const segments=Object.fromEntries(needles.map(n=>{let i=t.indexOf(n);return[n,{offset:i,snippet:i>=0?t.slice(Math.max(0,i-1300),Math.min(t.length,i+1600)):null}]}));
const headers=[...t.matchAll(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi)].map(m=>m[0].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()).filter(Boolean);
const out={sourceUrl:url,status:r.status,finalUrl:r.url,contentType:r.headers.get('content-type'),htmlLength:t.length,title:t.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],anchors:[...t.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({href:m[1],label:m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()})).filter(x=>/Xiaomi|REDMI|POCO|Pad/i.test(x.label)).slice(0,200),headers,segments};
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
await fs.writeFile('manualfinder-xiaomi-probe/index-structure.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({status:r.status,finalUrl:r.url,htmlLength:t.length,headers:headers.slice(0,30),needles:Object.fromEntries(Object.entries(segments).map(([k,v])=>[k,v.offset])),anchorCount:out.anchors.length}));
if(!r.ok || !r.url.startsWith('https://www.mi.com/'))process.exitCode=1;
