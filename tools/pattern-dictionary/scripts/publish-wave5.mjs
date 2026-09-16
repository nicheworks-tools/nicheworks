#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const repoRoot=path.resolve(root,'..','..');
const today='2026-09-16';
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const write=(rel,obj)=>fs.writeFileSync(path.join(root,rel),JSON.stringify(obj,null,2)+'\n');
const uniq=(arr,key)=>[...new Map(arr.map(x=>[key(x),x])).values()];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugOffer=id=>id.replace(/-/g,'_');

const base=read('data/patterns.json');
const stageProd=read('data/wave5-production-content.json');
const stageSource=read('data/wave5-source-verification.json');
const stageSearch=read('data/wave5-search-dictionary.json');
const stageCompare=read('data/wave5-compare-guides.json');
const stageCases=read('tests/wave5-search-cases.json');
const stageRefs=read('data/wave5-reference-images.json');
const stageReview=read('data/wave5-reference-image-review.json');
const prod=read('data/production-content.json');
const source=read('data/source-verification.json');
const search=read('data/search-dictionary.json');
const compare=read('data/compare-guides.json');
const refs=read('data/reference-images.json');
const review=read('data/reference-image-review.json');
const affiliate=read('data/affiliate-config.json');
const expansion=read('data/canonical-100-expansion.json');
const searchCases=read('tests/search-cases.json');

if(stageProd.patterns?.length!==20||stageSource.patterns?.length!==20||stageRefs.images?.length!==20||stageReview.records?.length!==20)throw new Error('Wave 5 staging artifacts must contain exactly 20 records each');
if(stageReview.status!=='structural-review-complete'||stageReview.records.some(x=>x.status!=='accepted'))throw new Error('Wave 5 structural review must be accepted before publication');
const waveRows=[...stageSource.patterns].sort((a,b)=>a.ordinal-b.ordinal);
const waveIds=waveRows.map(x=>x.pattern_id);
if(JSON.stringify(waveRows.map(x=>x.ordinal))!==JSON.stringify(Array.from({length:20},(_,i)=>81+i)))throw new Error('Wave 5 ordinals must be 81..100');
if(base.length===100&&waveIds.every(id=>base.some(x=>x.id===id))){console.log('Wave 5 already published; no transform needed.');process.exit(0)}
if(base.length!==80)throw new Error(`expected pre-publication runtime count 80, got ${base.length}`);

const pById=Object.fromEntries(stageProd.patterns.map(x=>[x.pattern_id,x]));
const sById=Object.fromEntries(stageSource.patterns.map(x=>[x.pattern_id,x]));
const allowedColorRoles=new Set(['non-essential','traditional','identity-relevant','variable']);
function colorRole(role=''){
  if(allowedColorRoles.has(role))return role;
  const r=role.toLowerCase();
  if(r.includes('identity'))return'identity-relevant';
  if(r.includes('variable'))return'variable';
  if(r.includes('traditional')||r.includes('convention')||r.includes('family'))return'traditional';
  return'non-essential';
}
function deriveUses(p){
  const t=[...(p.common_uses?.ja||[]),...(p.common_uses?.en||[])].join(' ').toLowerCase();
  const out=[];
  if(/apparel|dress|kimono|sari|sarong|shawl|clothing|衣料|着物|サリー|サロン|ショール/.test(t))out.push('fashion');
  if(/textile|fabric|cloth|silk|ribbon|embroidery|upholstery|生地|布|シルク|刺繍|絞り|小紋/.test(t))out.push('textile');
  if(/interior|wallpaper|cushion|furnish|tapestr|wall hanging|壁紙|クッション|タペストリー|壁掛け|家具/.test(t))out.push('interior');
  return out.length?out:['textile'];
}
function finalProduction(id){
  const p=pById[id],s=sById[id];
  if(!p||!s)throw new Error(`${id}: missing staged production/source record`);
  if((p.distinguishing_features?.ja||[]).length<3||(p.distinguishing_features?.en||[]).length<3)throw new Error(`${id}: publication requires 3+ distinguishing features in JA/EN`);
  const q=s.verification_state==='qualified'?{ja:p.qualification_note||p.definition.ja,en:s.qualification||p.qualification_note}:undefined;
  return {pattern_id:id,review_state:'verified',verification_state:s.verification_state,names:s.verified_names,aliases:s.verified_aliases,term_scope:s.term_scope,definition:p.definition,distinguishing_features:p.distinguishing_features,common_uses:p.common_uses,colors:{primary:s.color_guidance.primary,color_role:colorRole(s.color_guidance.color_role),primary_reason:s.color_guidance.reason},...(q?{qualification:q}:{})};
}
function runtimeRecord(id){
  const p=pById[id],s=sById[id],f=finalProduction(id);
  return {id,names:s.verified_names,aliases:s.verified_aliases,search_terms:p.search_terms,families:p.families,motifs:p.motifs,visual:p.visual,colors:{primary:s.color_guidance.primary,variants:[],color_role:f.colors.color_role,primary_reason:s.color_guidance.reason},uses:deriveUses(p),culture:p.families.includes('japanese')?['Japanese']:[],relationships:p.relationships,shopping_intent:p.shopping_intent,review_state:'verified',description:p.definition};
}
const waveRuntime=waveIds.map(runtimeRecord),waveProd=waveIds.map(finalProduction);
write('data/patterns.json',[...base,...waveRuntime]);

prod.updated=today;prod.phase='verified-publication';
prod.policy={...prod.policy,record_count:100,review_state:'verified',image_state:'verified-publication',qualified_terms:[...new Set([...prod.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id),...waveProd.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id)])].sort()};
prod.patterns=uniq([...prod.patterns,...waveProd],x=>x.pattern_id);write('data/production-content.json',prod);

source.updated=today;source.policy={...source.policy,purpose:'Evidence ledger for the published canonical 100-pattern production set.',qualification_rule:stageSource.policy?.qualification_rule||'Use qualified when a term does not resolve to one uniquely fixed motif.'};
source.patterns=uniq([...source.patterns,...stageSource.patterns],x=>x.pattern_id);write('data/source-verification.json',source);

refs.updated=today;refs.status='verified-publication';refs.policy={...refs.policy,review_ledger:'data/reference-image-review.json',verification_rule:'verified images passed source/content contract checks, structural visual review, search/compare regressions, and desktop/mobile Chromium publication QA'};
refs.images=uniq([...refs.images,...stageRefs.images.map(x=>({...x,review_state:'verified'}))],x=>x.pattern_id);write('data/reference-images.json',refs);

review.updated=today;review.scope='canonical-100';review.wave5_review_history=stageReview.review_history;
review.records=uniq([...review.records,...stageReview.records.map(x=>({pattern_id:x.pattern_id,decision:'pass',note:(x.notes||[]).join(' ')}))],x=>x.pattern_id);write('data/reference-image-review.json',review);

write('data/search-dictionary.json',{...search,ja:{...(search.ja||{}),...(stageSearch.ja||{})},en:{...(search.en||{}),...(stageSearch.en||{})}});
compare.updated=today;compare.policy={...compare.policy,purpose:'Explain decisive visual differences for high-confusion comparisons across the published canonical 100.'};compare.guides=uniq([...compare.guides,...stageCompare.guides],x=>x.id);write('data/compare-guides.json',compare);
write('tests/search-cases.json',uniq([...searchCases,...stageCases.map(c=>({lang:c.lang,query:c.query,expected:c.top1,top1:true}))],x=>`${x.lang}\u0000${x.query}`));

const labels={broad:(ja,en)=>[`${ja}の商品を探す`,`Shop ${en} products`],apparel:(ja,en)=>[`${ja}の衣類を探す`,`Shop ${en} apparel`],material:(ja,en)=>[`${ja}の生地を探す`,`Shop ${en} fabric`],accessory:(ja,en)=>[`${ja}の小物を探す`,`Shop ${en} accessories`],home:(ja,en)=>[`${ja}のインテリア用品を探す`,`Shop ${en} home items`]};
const offers=[];
for(const id of waveIds){const p=pById[id],s=sById[id];if(p.commerce_intents?.length!==3)throw new Error(`${id}: exactly 3 commerce intents required`);p.commerce_intents.forEach((o,i)=>{if(!labels[o.intent])throw new Error(`${id}: unsupported commerce intent ${o.intent}`);const [label_ja,label_en]=labels[o.intent](s.verified_names.ja,s.verified_names.en);const params=new URLSearchParams({k:o.query,tag:affiliate.tracking_id});offers.push({pattern_id:id,status:'active',offer_id:`amazon_${slugOffer(id)}_${o.intent}_${i+1}`,intent:o.intent,priority:i+1,query:o.query,amazon_url:`https://www.amazon.co.jp/s?${params.toString()}`,label_ja,label_en});});}
affiliate.version=`${today}-wave4`;affiliate.offers=uniq([...affiliate.offers,...offers],x=>x.offer_id);write('data/affiliate-config.json',affiliate);

expansion.version=today;
expansion.base={...expansion.base,published_count:100,rule:'The full frozen canonical 100 is published in data/patterns.json; no planned canonical entries remain.'};
expansion.policy={...expansion.policy,expansion_count:0,waves:[],publication_rule:'Canonical 100 publication is complete. Any future growth requires a new explicitly versioned expansion plan rather than silently extending this frozen set.'};
expansion.entries=[];write('data/canonical-100-expansion.json',expansion);

const appPath=path.join(root,'app.js');let app=fs.readFileSync(appPath,'utf8');const ids100=[...base.map(x=>x.id),...waveIds];
if(!/const REFERENCE_IDS=new Set\(\[.*?\]\);/s.test(app))throw new Error('app.js REFERENCE_IDS contract not found');
app=app.replace(/const REFERENCE_IDS=new Set\(\[.*?\]\);/s,`const REFERENCE_IDS=new Set([${ids100.map(x=>`'${x}'`).join(',')}]);`);fs.writeFileSync(appPath,app);

const stylePath=path.join(root,'style.css');let css=fs.readFileSync(stylePath,'utf8');
if(!css.includes('.pd-mini-global-textile'))css+='\n.pd-mini-global-textile{background:repeating-linear-gradient(45deg,#111 0 2px,transparent 2px 8px),repeating-linear-gradient(-45deg,#111 0 2px,transparent 2px 8px)}\n';
fs.writeFileSync(stylePath,css);
for(const rel of ['index.html','en/index.html']){
  const file=path.join(root,rel);let html=fs.readFileSync(file,'utf8');
  if(rel==='index.html'){
    html=html.replace(/現在の80件/g,'現在の100件');
    if(!html.includes('data-family="global-textile"'))html=html.replace('<button class="pd-filter" data-family="ornamental"','<button class="pd-filter" data-family="global-textile" aria-pressed="false"><span class="pd-mini pd-mini-global-textile" aria-hidden="true"></span>世界の染織</button><button class="pd-filter" data-family="ornamental"');
  }else{
    html=html.replace(/The current 80 entries/g,'The current 100 entries');
    if(!html.includes('data-family="global-textile"'))html=html.replace('<button class="pd-filter" data-family="ornamental"','<button class="pd-filter" data-family="global-textile" aria-pressed="false"><span class="pd-mini pd-mini-global-textile" aria-hidden="true"></span>Global textile</button><button class="pd-filter" data-family="ornamental"');
  }
  fs.writeFileSync(file,html);
}

for(const rel of ['search.html','en/search.html']){const file=path.join(root,rel);let html=fs.readFileSync(file,'utf8');html=html.replace(/80件の検証済みデータ/g,'100件の検証済みデータ').replace(/80-record verified dataset/g,'100-record verified dataset');fs.writeFileSync(file,html);}

function detailHtml(id,lang){
  const s=sById[id],p=pById[id],isJa=lang==='ja',ja=s.verified_names.ja,en=s.verified_names.en,prefix=isJa?'':'en/';
  const title=isJa?`${ja}（${en}）｜Pattern Dictionary | NicheWorks`:`${en} | Pattern Dictionary | NicheWorks`;
  const description=isJa?`${ja}（${en}）の見分け方を解説。${p.definition.ja} 別名、特徴、似た模様との違い、代表的な用途を確認できます。`:`Learn how to identify ${en}. ${p.definition.en} Review aliases, distinguishing features, similar patterns, colors, and common uses.`;
  const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`,jaUrl=`https://nicheworks.app/tools/pattern-dictionary/patterns/${id}/`,enUrl=`https://nicheworks.app/tools/pattern-dictionary/en/patterns/${id}/`,image=`https://nicheworks.app/tools/pattern-dictionary/assets/reference/${id}.png`;
  const ld=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebPage',url,name:title,description,inLanguage:lang,image},{'@type':'WebApplication',name:'Pattern Dictionary',applicationCategory:'ReferenceApplication',operatingSystem:'Web',url:'https://nicheworks.app/tools/pattern-dictionary/'}]});
  const analytics='<script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag(\'js\',new Date());gtag(\'config\',\'G-57QT78M3JB\');</script>';
  const ads='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>',beacon='<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token":"aeec938336694c99bc864cdf859b5e37"}\'></script>';
  const header=isJa?`<header class="pd-header"><div class="pd-shell pd-header-inner"><a class="pd-brand" href="/tools/pattern-dictionary/">Pattern Dictionary</a><div class="pd-spacer"></div><a id="lang-link" class="pd-lang" href="/tools/pattern-dictionary/en/patterns/${id}/">JP / EN</a></div></header>`:`<header class="pd-header"><div class="pd-shell pd-header-inner"><a class="pd-brand" href="/tools/pattern-dictionary/en/">Pattern Dictionary</a><div class="pd-spacer"></div><a id="lang-link" class="pd-lang" href="/tools/pattern-dictionary/patterns/${id}/">EN / JP</a></div></header>`;
  const main=isJa?'<main class="pd-shell"><div class="ad-slot ad-top pd-ad">広告枠（上）</div><div id="detail"></div><div class="ad-slot ad-bottom pd-ad">広告枠（下）</div></main>':'<main class="pd-shell"><div id="detail"></div></main>';
  const footer=isJa?'この項目は出典レビューとReference Image構造レビューを完了しています。':'This entry has completed source review and Reference Image structural review.';
  return `<!doctype html><html lang="${lang}"><head>${analytics}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="robots" content="index,follow"><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="ja" href="${jaUrl}"><link rel="alternate" hreflang="en" href="${enUrl}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}"><link rel="apple-touch-icon" href="/assets/nicheworks-favicon-512-white.png"><script type="application/ld+json">${ld}</script><link rel="icon" href="/assets/favicon.ico"><link rel="stylesheet" href="/tools/pattern-dictionary/style.css">${ads}${beacon}</head><body data-page="detail" data-pattern-id="${id}">${header}${main}<footer class="pd-footer"><div class="pd-shell"><p>${footer}</p></div></footer><script type="module" src="/tools/pattern-dictionary/app.js"></script></body></html>`;
}
for(const id of waveIds){const jaDir=path.join(root,'patterns',id),enDir=path.join(root,'en','patterns',id);fs.mkdirSync(jaDir,{recursive:true});fs.mkdirSync(enDir,{recursive:true});fs.writeFileSync(path.join(jaDir,'index.html'),detailHtml(id,'ja'));fs.writeFileSync(path.join(enDir,'index.html'),detailHtml(id,'en'));}

const sitemapPath=path.join(repoRoot,'sitemap.xml');let sitemap=fs.readFileSync(sitemapPath,'utf8'),sitemapEntries=[];
for(const id of waveIds)for(const prefix of ['', 'en/']){const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`;if(!sitemap.includes(`<loc>${url}</loc>`))sitemapEntries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);}
if(sitemapEntries.length)sitemap=sitemap.replace('</urlset>',sitemapEntries.join('\n')+'\n</urlset>');fs.writeFileSync(sitemapPath,sitemap);

const readmePath=path.join(root,'README.md');let readme=fs.readFileSync(readmePath,'utf8');
readme=readme.replace(/^# Pattern Dictionary[^\n]*/,'# Pattern Dictionary — canonical 100 verified publication');
readme=readme.replace(/published 80-pattern visual dictionary/g,'published 100-pattern visual dictionary');
readme=readme.replace(/remaining 20 canonical entries/g,'no remaining canonical entries');
readme=readme.replace(/published runtime set is exactly 80 patterns/g,'published runtime set is exactly 100 patterns');
readme=readme.replace(/all 80 published terms/g,'all 100 published terms');
readme=readme.replace(/remaining ordinals \*\*81-100\*\*/g,'no remaining ordinals in the frozen canonical 100');
if(!readme.includes('Wave 5 / entries 81-100 is published'))readme+='\n- **Wave 5 / entries 81-100 is published:** the frozen canonical 100 is now complete. Wave 5 adds 20 source-reviewed records, 20 three-pass reviewed deterministic Reference Images, high-confusion compare guides, search regressions, and 60 fixed Amazon commerce intents.\n';
fs.writeFileSync(readmePath,readme);

console.log(`Published Wave 5 transform: runtime 80 -> 100; offers +${offers.length}; compare guides ${compare.guides.length}; new detail pages 40; remaining canonical expansion ${expansion.entries.length}.`);
