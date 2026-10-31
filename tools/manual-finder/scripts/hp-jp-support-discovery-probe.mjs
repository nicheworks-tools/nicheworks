#!/usr/bin/env node
// HP manufacturer guide-site discoverability: URL/content probes only.
import fs from 'node:fs/promises';
const urls=[
 'https://support.hp.com/jp-ja/search?q=HP%20OmniBook%205%2014-he',
 'https://support.hp.com/jp-ja/search?q=OMEN%20by%20HP%2016-wf',
 'https://support.hp.com/jp-ja/product/setup-user-guides/hp-omnibook-5-14-inch-laptop-next-gen-ai-pc-14-he0000',
 'https://support.hp.com/jp-ja/product/setup-user-guides/hp-omnibook-5-14-inch-laptop-next-gen-ai-pc-14-he0000/model/2102945928',
 'https://support.hp.com/jp-ja/product/setup-user-guides/hp-omnibook-5-14-inch-laptop-pc-14-hk0000/2103368890',
 'https://support.hp.com/jp-ja/product/setup-user-guides/omen-by-hp-16-wf0000',
 'https://support.hp.com/jp-ja/product/setup-user-guides/victus-by-hp-16-r0000-laptop-pc',
 'https://support.hp.com/jp-ja/product/setup-user-guides/hp-pavilion-16-af0000-laptop-pc'
];
const clean=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const results=await Promise.all(urls.map(async(url)=>{
 try{const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(22000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}}),html=await r.text();
  const h=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'';
  const t=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  const manual=/マニュアルとガイド|Manuals and Guides/.test(clean(html));
  const user=/ユーザー.?ガイド|User Guide/.test(clean(html));
  const searchLinks=[...html.matchAll(/href\s*=\s*["']([^"']*\/product\/setup-user-guides\/[^"']+)["']/gi)].slice(0,20).map(x=>x[1]);
  const x={url,final:r.url,status:r.status,bytes:html.length,title:clean(t).slice(0,220),h1:clean(h).slice(0,220),manual,user,searchLinks:searchLinks.slice(0,12)};
  console.log(JSON.stringify(x));return x;
 }catch(e){const x={url,error:String(e)};console.log(JSON.stringify(x));return x}
}));
await fs.mkdir('manualfinder-hp-probe',{recursive:true});
await fs.writeFile('manualfinder-hp-probe/support-discovery.json',JSON.stringify(results,null,2)+'\n');
