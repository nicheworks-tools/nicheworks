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

// 2026-11-01 GSC-informed snippet changes: keep visible SERP metadata,
// Open Graph, Twitter cards and structured WebPage data synchronized.
const intentTargets=[
  {file:'patterns/honeycomb/index.html',title:['蜂の巣柄','六角形'],desc:['ハニカム','亀甲文様']},
  {file:'en/patterns/pinstripe/index.html',title:['Pinstripe Pattern','Meaning'],desc:['pinstripe','chalk stripe']},
  {file:'patterns/diamond/index.html',title:['ダイヤ柄','アーガイル'],desc:['菱形','ハーレクイン']},
  {file:'patterns/tattersall/index.html',title:['タッターソールチェック','格子柄'],desc:['ウィンドウペーン','ギンガム']},
  {file:'en/patterns/windowpane-check/index.html',title:['Windowpane Check Pattern','Identify'],desc:['Tattersall','Glen check']}
];
function intentTag(s,attr,value){
  return s.match(new RegExp('<meta\\s+'+attr+'="'+value+'"\\s+content="([^"]*)"'))?.[1]||null;
}
for(const target of intentTargets){
  const s=fs.readFileSync(path.join(root,target.file),'utf8');
  const title=s.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc=intentTag(s,'name','description');
  if(!title||!desc)throw new Error(target.file+': missing title or description');
  if(!target.title.every(term=>title.includes(term)))throw new Error(target.file+': missing search-intent title term');
  if(!target.desc.every(term=>desc.includes(term)))throw new Error(target.file+': missing supported description term');
  for(const [attr,name,want] of [['property','og:title',title],['property','og:description',desc],['name','twitter:title',title],['name','twitter:description',desc]]){
    if(intentTag(s,attr,name)!==want)throw new Error(target.file+': '+name+' drifted from title/description');
  }
  const raw=s.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  if(!raw)throw new Error(target.file+': missing JSON-LD');
  const data=JSON.parse(raw);
  const webPage=(data['@graph']||[]).find(node=>node['@type']==='WebPage');
  if(!webPage||webPage.name!==title||webPage.description!==desc)throw new Error(target.file+': WebPage JSON-LD drifted');
}
console.log('OK: 5 GSC-priority snippets carry intent-specific copy with synchronized OG/Twitter/JSON-LD.');

console.log('OK: 200/200 JA+EN Pattern Dictionary detail pages carry canonical social, language, icon, and structured-data publication metadata.');
