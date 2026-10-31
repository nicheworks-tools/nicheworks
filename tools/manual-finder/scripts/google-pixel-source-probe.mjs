#!/usr/bin/env node
/* Probe official Google Pixel released-device population, not publication truth. */
import fs from 'node:fs/promises';
const URLS={
  releases:'https://support.google.com/pixelphone/answer/15738422?hl=ja',
  safety:'https://support.google.com/pixelphone/answer/9204905?hl=ja',
  help:'https://support.google.com/pixelphone/?hl=ja'
};
const clean=s=>String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
async function get(url){
 const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
 if(!response.ok||new URL(response.url).hostname!=='support.google.com')throw Error(url+' '+response.status+' '+response.url);
 return {html:await response.text(),status:response.status,url:response.url};
}
const out={sources:{},observedAt:new Date().toISOString()};
for(const [key,url] of Object.entries(URLS)){
 try{
  const {html,status,url:final}=await get(url);
  const tables=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map(x=>x[1]);
  const rows=tables.flatMap((t,i)=>[...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(x=>({table:i,cells:[...x[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(z=>clean(z[1]))})));
  const heads=[...html.matchAll(/<h[1-5]\b[^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(x=>clean(x[1])).filter(Boolean);
  const result={status,finalUrl:final,htmlBytes:html.length,tableCount:tables.length,tableRows:rows.length,
   candidateRows:rows.filter(r=>r.cells.length>1&&r.cells[0].includes('Pixel')&&/20\d\d/.test(r.cells[1])),
   headings:heads.slice(0,100),
   mentions:['Google Pixel 11 Pro Fold','Google Pixel 10a','Google Pixel 9 Pro Fold','Google Pixel 6 Pro','Google Pixel 3a XL','Google Pixel XL'].map(m=>({model:m,present:clean(html).includes(m)}))};
  out.sources[key]=result;
  console.log(JSON.stringify({key,status,bytes:html.length,tables:tables.length,tableRows:rows.length,releaseCandidates:result.candidateRows.length,firstRows:result.candidateRows.slice(0,3),headings:heads.slice(0,5)}));
 }catch(e){out.sources[key]={error:String(e)};console.error(key,String(e))}
}
await fs.mkdir('manualfinder-google-pixel-probe',{recursive:true});
await fs.writeFile('manualfinder-google-pixel-probe/sources.json',JSON.stringify(out,null,2));
if(out.sources.releases?.error||out.sources.safety?.error||out.sources.help?.error)process.exitCode=1;
