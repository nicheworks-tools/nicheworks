#!/usr/bin/env node
import fs from 'node:fs/promises';
await fs.mkdir('manualfinder-asus-probe',{recursive:true});
const sources=[
 {name:'vivobook_index',url:'https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook'},
 {name:'vivobook_all_series',url:'https://www.asus.com/jp/laptops/for-home/all-series/filter?Series=Vivobook'},
 {name:'vivobook_page2',url:'https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook&page=2'},
 {name:'vivobook_offset20',url:'https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook&offset=20'},
 {name:'model_manual_global',url:'https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-15-x1504/helpdesk_manual/?model2Name=X1504VAPB'},
 {name:'model_manual_jp',url:'https://www.asus.com/jp/laptops/for-home/vivobook/asus-vivobook-15-x1504/helpdesk_manual/?model2Name=X1504VAPB'}
];
const clean=t=>String(t||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const info=[];
for(const {name,url} of sources){
 try{
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(24000),headers:{'user-agent':'Mozilla/5.0 (compatible; ManualFinderCoveragePass/1.0)','accept':'text/html,application/xhtml+xml'}});
  const html=await r.text();
  if(['vivobook_index','vivobook_page2','vivobook_offset20'].includes(name))await fs.writeFile('manualfinder-asus-probe/'+name+'.html',html);
  const title=clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
  const heads=[...html.matchAll(/<h[1-5]\b[^>]*>([\s\S]*?)<\/h[1-5]>/gi)].map(m=>clean(m[1])).filter(Boolean);
  const anchors=[...html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({href:m[2],text:clean(m[3])})).filter(a=>/vivobook|manual|support|X1504|詳細はこちら/i.test(a.href+' '+a.text));
  const regexModels=[...html.matchAll(/(?:ASUS\s+)?Vivobook[^\n<]{0,110}\(([A-Z]\d{3,5}[A-Z0-9]{0,4})\)/gi)].map(m=>({label:clean(m[0]),sku:m[1]}));
  const structured=[...html.matchAll(/"productName":\s*"([^"]{1,160})"/gi)].map(m=>m[1]).filter(x=>/vivobook/i.test(x));
  const manualCount=(html.match(/User.s Manual for Japanese Edition|ユーザーマニュアル|マニュアルとドキュメント/gi)||[]).length;
  const blocks=[...html.matchAll(/"product.*?":.{0,160}/gi)].slice(0,15).map(x=>x[0]);
  info.push({name,url,final:r.url,status:r.status,bytes:html.length,title,heads:heads.slice(0,30),anchors:anchors.slice(0,150),regexModels:regexModels.slice(0,130),structured:structured.slice(0,100),manualCount,htmlBeginning:html.slice(0,600),blocks});
  console.log(JSON.stringify({name,status:r.status,bytes:html.length,title,headingSample:heads.slice(0,6),anchorCount:anchors.length,modelMatches:regexModels.length,structured:structured.length,manualCount,firstModels:regexModels.slice(0,10),firstLinks:anchors.slice(0,3)}));
 }catch(e){info.push({name,url,error:String(e)});console.error(name,String(e))}
}
await fs.mkdir('manualfinder-asus-probe',{recursive:true});
await fs.writeFile('manualfinder-asus-probe/official-vivobook-source.json',JSON.stringify(info,null,2)+'\n');
if(info.some(x=>x.error)||info.filter(x=>x.status===200).length<2)process.exitCode=1;
