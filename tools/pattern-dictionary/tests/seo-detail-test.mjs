import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ids=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8')).map(x=>x.id);
if(ids.length!==100)throw new Error(`expected 100 published patterns, got ${ids.length}`);
function count(s,re){return [...s.matchAll(re)].length}
for(const id of ids){
  const ja=`https://nicheworks.app/tools/pattern-dictionary/patterns/${id}/`;
  const en=`https://nicheworks.app/tools/pattern-dictionary/en/patterns/${id}/`;
  for(const [prefix,lang,url] of [['','ja',ja],['en/','en',en]]){
    const file=path.join(root,prefix,'patterns',id,'index.html');
    const s=fs.readFileSync(file,'utf8');
    if(!s.includes('<meta name="robots" content="index,follow">'))throw new Error(`${prefix}${id}: not indexable`);
    const required=[
      [/<meta\b[^>]*property="og:title"[^>]*>/g,'og:title'],
      [/<meta\b[^>]*property="og:description"[^>]*>/g,'og:description'],
      [/<meta\b[^>]*property="og:url"[^>]*>/g,'og:url'],
      [/<meta\b[^>]*property="og:image"[^>]*>/g,'og:image'],
      [/<meta\b[^>]*name="twitter:card"[^>]*>/g,'twitter:card'],
      [/<meta\b[^>]*name="twitter:title"[^>]*>/g,'twitter:title'],
      [/<meta\b[^>]*name="twitter:description"[^>]*>/g,'twitter:description'],
      [/<meta\b[^>]*name="twitter:image"[^>]*>/g,'twitter:image'],
      [/<script\b[^>]*type="application\/ld\+json"[^>]*>/g,'JSON-LD']
    ];
    for(const [re,label] of required)if(count(s,re)!==1)throw new Error(`${prefix}${id}: expected one ${label}`);
    if(!s.includes(`property="og:url" content="${url}"`))throw new Error(`${prefix}${id}: og:url mismatch`);
    if(!s.includes(`hreflang="ja" href="${ja}"`)||!s.includes(`hreflang="en" href="${en}"`))throw new Error(`${prefix}${id}: reciprocal language links missing`);
    if(!s.includes('rel="apple-touch-icon"'))throw new Error(`${prefix}${id}: apple-touch-icon missing`);
    if(!s.includes('"@type":"WebPage"')||!s.includes('"@type":"WebApplication"'))throw new Error(`${prefix}${id}: structured-data types missing`);
    if(!s.includes(`"url":"${url}"`))throw new Error(`${prefix}${id}: WebPage JSON-LD URL mismatch`);
    if(!s.includes(`"inLanguage":"${lang}"`))throw new Error(`${prefix}${id}: JSON-LD language mismatch`);
  }
}
console.log('OK: 200/200 JA+EN Pattern Dictionary detail pages carry canonical social, language, icon, and structured-data publication metadata.');
