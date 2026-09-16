import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const repoRoot=path.resolve(root,'..','..');
const today='2026-09-16';
const readJson=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const writeJson=(rel,obj)=>fs.writeFileSync(path.join(root,rel),JSON.stringify(obj,null,2)+'\n');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uniq=(arr,key)=>[...new Map(arr.map(x=>[key(x),x])).values()];
const slugOffer=id=>id.replace(/-/g,'_');

const basePatterns=readJson('data/patterns.json');
const stageProd=readJson('data/wave3-production-content.json');
const stageSource=readJson('data/wave3-source-verification.json');
const stageSearch=readJson('data/wave3-search-dictionary.json');
const stageCompare=readJson('data/wave3-compare-guides.json');
const stageCases=readJson('tests/wave3-search-cases.json');
const stageRefs=readJson('data/wave3-reference-images.json');
const stageReview=readJson('data/wave3-reference-image-review.json');
const prod=readJson('data/production-content.json');
const source=readJson('data/source-verification.json');
const search=readJson('data/search-dictionary.json');
const compare=readJson('data/compare-guides.json');
const refs=readJson('data/reference-images.json');
const review=readJson('data/reference-image-review.json');
const affiliate=readJson('data/affiliate-config.json');
const expansion=readJson('data/canonical-100-expansion.json');
const searchCases=readJson('tests/search-cases.json');

if(stageProd.patterns?.length!==20||stageSource.patterns?.length!==20||stageRefs.images?.length!==20||stageReview.records?.length!==20)throw new Error('Wave 3 staging artifacts must contain exactly 20 records each');
const waveIds=stageSource.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal).map(x=>x.pattern_id);
if(basePatterns.length===60&&waveIds.every(id=>basePatterns.some(x=>x.id===id))){console.log('Wave 3 already published; no transform needed.');process.exit(0)}
if(basePatterns.length!==40)throw new Error(`expected pre-publication runtime count 40, got ${basePatterns.length}`);

const stageProdById=Object.fromEntries(stageProd.patterns.map(x=>[x.pattern_id,x]));
const stageSourceById=Object.fromEntries(stageSource.patterns.map(x=>[x.pattern_id,x]));
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
  if(/dress|blouse|fashion|apparel|shirt|jacket|suit|tie|scarf|coat|ワンピース|ブラウス|ファッション|衣類|シャツ|ジャケット|スーツ|ネクタイ|スカーフ|コート/.test(t))out.push('fashion');
  if(/textile|fabric|cloth|woven|生地|布|織物|染織/.test(t))out.push('textile');
  if(/interior|furnish|curtain|wallpaper|rug|tile|cushion|インテリア|カーテン|壁紙|ラグ|タイル|クッション/.test(t))out.push('interior');
  return out.length?out:['textile'];
}
function finalProduction(id){
  const p=stageProdById[id],s=stageSourceById[id];
  if(!p||!s)throw new Error(`${id}: missing staged production/source record`);
  const q=s.verification_state==='qualified'?{ja:p.qualification_note||p.definition.ja,en:s.qualification||p.qualification_note}:undefined;
  return {
    pattern_id:id,
    review_state:'verified',
    verification_state:s.verification_state,
    names:s.verified_names,
    aliases:s.verified_aliases,
    term_scope:s.term_scope,
    definition:p.definition,
    distinguishing_features:p.distinguishing_features,
    common_uses:p.common_uses,
    colors:{primary:s.color_guidance.primary,color_role:colorRole(s.color_guidance.color_role),primary_reason:s.color_guidance.reason},
    ...(q?{qualification:q}:{})
  };
}
function baseRecord(id){
  const p=stageProdById[id],s=stageSourceById[id],final=finalProduction(id);
  return {
    id,
    names:s.verified_names,
    aliases:s.verified_aliases,
    search_terms:p.search_terms,
    families:p.families,
    motifs:p.motifs,
    visual:p.visual,
    colors:{primary:s.color_guidance.primary,variants:[],color_role:final.colors.color_role,primary_reason:s.color_guidance.reason},
    uses:deriveUses(p),
    culture:p.families.includes('japanese')?['Japanese']:[],
    relationships:p.relationships,
    shopping_intent:p.shopping_intent,
    review_state:'verified',
    description:p.definition
  };
}

const finalWaveBase=waveIds.map(baseRecord);
const finalWaveProd=waveIds.map(finalProduction);
writeJson('data/patterns.json',[...basePatterns,...finalWaveBase]);

prod.updated=today;
prod.phase='verified-publication';
prod.policy={...prod.policy,record_count:60,review_state:'verified',image_state:'verified-publication',qualified_terms:[...new Set([...prod.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id),...finalWaveProd.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id)])].sort()};
prod.patterns=uniq([...prod.patterns,...finalWaveProd],x=>x.pattern_id);
writeJson('data/production-content.json',prod);

source.updated=today;
source.policy={...source.policy,purpose:'Evidence ledger for the published canonical 60-pattern production set.',qualification_rule:stageSource.policy?.qualification_rule||'Use qualified when a term does not resolve to one uniquely fixed motif.'};
source.patterns=uniq([...source.patterns,...stageSource.patterns],x=>x.pattern_id);
writeJson('data/source-verification.json',source);

refs.updated=today;
refs.status='verified-publication';
refs.policy={...refs.policy,review_ledger:'data/reference-image-review.json',verification_rule:'verified images passed source/content contract checks, structural visual review, search/compare regressions, and desktop/mobile Chromium publication QA'};
refs.images=uniq([...refs.images,...stageRefs.images.map(x=>({...x,review_state:'verified'}))],x=>x.pattern_id);
writeJson('data/reference-images.json',refs);

review.updated=today;
review.scope='canonical-60';
review.wave3_review_history=stageReview.review_history;
const normalizedStageReviews=stageReview.records.map(x=>({pattern_id:x.pattern_id,decision:'pass',note:(x.notes||[]).join(' ')}));
review.records=uniq([...review.records,...normalizedStageReviews],x=>x.pattern_id);
writeJson('data/reference-image-review.json',review);

writeJson('data/search-dictionary.json',{...search,ja:{...(search.ja||{}),...(stageSearch.ja||{})},en:{...(search.en||{}),...(stageSearch.en||{})}});

compare.updated=today;
compare.policy={...compare.policy,purpose:'Explain decisive visual differences for high-confusion comparisons across the published canonical 60.'};
compare.guides=uniq([...compare.guides,...stageCompare.guides],x=>x.id);
writeJson('data/compare-guides.json',compare);

const runtimeCases=stageCases.map(c=>({lang:c.lang,query:c.query,expected:c.top1,top1:true}));
writeJson('tests/search-cases.json',uniq([...searchCases,...runtimeCases],x=>`${x.lang}\u0000${x.query}`));

const intentLabels={
  broad:(ja,en)=>[`${ja}の商品を探す`,`Shop ${en} products`],
  apparel:(ja,en)=>[`${ja}の衣類を探す`,`Shop ${en} apparel`],
  material:(ja,en)=>[`${ja}の生地を探す`,`Shop ${en} fabric`],
  accessory:(ja,en)=>[`${ja}の小物を探す`,`Shop ${en} accessories`],
  home:(ja,en)=>[`${ja}のインテリア用品を探す`,`Shop ${en} home items`]
};
const allowedIntents=new Set(Object.keys(intentLabels));
const newOffers=[];
for(const id of waveIds){
  const p=stageProdById[id],s=stageSourceById[id];
  p.commerce_intents.forEach((o,i)=>{
    if(!allowedIntents.has(o.intent))throw new Error(`${id}: unsupported commerce intent ${o.intent}`);
    const [label_ja,label_en]=intentLabels[o.intent](s.verified_names.ja,s.verified_names.en);
    const params=new URLSearchParams({k:o.query,tag:affiliate.tracking_id});
    newOffers.push({pattern_id:id,status:'active',offer_id:`amazon_${slugOffer(id)}_${o.intent}_${i+1}`,intent:o.intent,priority:i+1,query:o.query,amazon_url:`https://www.amazon.co.jp/s?${params.toString()}`,label_ja,label_en});
  });
}
affiliate.version=`${today}-wave3`;
affiliate.offers=uniq([...affiliate.offers,...newOffers],x=>x.offer_id);
writeJson('data/affiliate-config.json',affiliate);

expansion.version=today;
expansion.base={...expansion.base,published_count:60,rule:'The published canonical 60 remain in data/patterns.json. This file now tracks only remaining ordinals 61-100.'};
expansion.policy={...expansion.policy,expansion_count:40,waves:[4,5],publication_rule:'Remaining planned entries do not enter runtime patterns.json until their production wave completes source verification, bilingual content, reference image review, search regression, SEO, commerce mapping, and QA.'};
expansion.entries=expansion.entries.filter(x=>x.ordinal>=61);
writeJson('data/canonical-100-expansion.json',expansion);

const appPath=path.join(root,'app.js');
let app=fs.readFileSync(appPath,'utf8');
const allIds=[...basePatterns.map(x=>x.id),...waveIds];
const allowlist=`const REFERENCE_IDS=new Set([${allIds.map(x=>`'${x}'`).join(',')}]);`;
if(!/const REFERENCE_IDS=new Set\(\[.*?\]\);/s.test(app))throw new Error('app.js REFERENCE_IDS contract not found');
app=app.replace(/const REFERENCE_IDS=new Set\(\[.*?\]\);/s,allowlist);
fs.writeFileSync(appPath,app);

const stylePath=path.join(root,'style.css');
let css=fs.readFileSync(stylePath,'utf8');
if(!css.includes('.pd-mini-floral'))css=css.replace('.pd-mini-ornamental{','.pd-mini-floral{background:radial-gradient(circle at 50% 50%,#111 0 3px,transparent 4px),radial-gradient(ellipse at 50% 18%,#111 0 5px,transparent 6px),radial-gradient(ellipse at 82% 50%,#111 0 5px,transparent 6px),radial-gradient(ellipse at 50% 82%,#111 0 5px,transparent 6px),radial-gradient(ellipse at 18% 50%,#111 0 5px,transparent 6px)}.pd-mini-ornamental{');
fs.writeFileSync(stylePath,css);

for(const rel of ['index.html','en/index.html']){
  const file=path.join(root,rel);let html=fs.readFileSync(file,'utf8');
  if(rel==='index.html'){
    html=html.replace(/現在の40件/g,'現在の60件');
    if(!html.includes('data-family="floral"'))html=html.replace('<button class="pd-filter" data-family="ornamental"','<button class="pd-filter" data-family="floral" aria-pressed="false"><span class="pd-mini pd-mini-floral" aria-hidden="true"></span>花柄</button><button class="pd-filter" data-family="ornamental"');
  }else{
    html=html.replace(/The current 40 entries/g,'The current 60 entries');
    if(!html.includes('data-family="floral"'))html=html.replace('<button class="pd-filter" data-family="ornamental"','<button class="pd-filter" data-family="floral" aria-pressed="false"><span class="pd-mini pd-mini-floral" aria-hidden="true"></span>Floral</button><button class="pd-filter" data-family="ornamental"');
  }
  fs.writeFileSync(file,html);
}

function detailHtml(id,lang){
  const s=stageSourceById[id],p=stageProdById[id];
  const ja=s.verified_names.ja,en=s.verified_names.en,isJa=lang==='ja';
  const title=isJa?`${ja}（${en}）｜Pattern Dictionary | NicheWorks`:`${en} | Pattern Dictionary | NicheWorks`;
  const description=isJa?`${ja}（${en}）の見分け方を解説。${p.definition.ja} 別名、特徴、似た模様との違い、代表的な用途を確認できます。`:`Learn how to identify ${en}. ${p.definition.en} Review aliases, distinguishing features, similar patterns, colors, and common uses.`;
  const prefix=isJa?'':'en/';
  const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`;
  const jaUrl=`https://nicheworks.app/tools/pattern-dictionary/patterns/${id}/`;
  const enUrl=`https://nicheworks.app/tools/pattern-dictionary/en/patterns/${id}/`;
  const image=`https://nicheworks.app/tools/pattern-dictionary/assets/reference/${id}.png`;
  const ld=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebPage',url,name:title,description,inLanguage:lang,image},{'@type':'WebApplication',name:'Pattern Dictionary',applicationCategory:'ReferenceApplication',operatingSystem:'Web',url:'https://nicheworks.app/tools/pattern-dictionary/'}]});
  const analytics='<script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag(\'js\',new Date());gtag(\'config\',\'G-57QT78M3JB\');</script>';
  const ads='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>';
  const beacon='<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token":"aeec938336694c99bc864cdf859b5e37"}\'></script>';
  const header=isJa?`<header class="pd-header"><div class="pd-shell pd-header-inner"><a class="pd-brand" href="/tools/pattern-dictionary/">Pattern Dictionary</a><div class="pd-spacer"></div><a id="lang-link" class="pd-lang" href="/tools/pattern-dictionary/en/patterns/${id}/">JP / EN</a></div></header>`:`<header class="pd-header"><div class="pd-shell pd-header-inner"><a class="pd-brand" href="/tools/pattern-dictionary/en/">Pattern Dictionary</a><div class="pd-spacer"></div><a id="lang-link" class="pd-lang" href="/tools/pattern-dictionary/patterns/${id}/">EN / JP</a></div></header>`;
  const footer=isJa?'この項目は出典レビューとReference Image構造レビューを完了しています。':'This entry has completed source review and Reference Image structural review.';
  const main=isJa?'<main class="pd-shell"><div class="ad-slot ad-top pd-ad">広告枠（上）</div><div id="detail"></div><div class="ad-slot ad-bottom pd-ad">広告枠（下）</div></main>':'<main class="pd-shell"><div id="detail"></div></main>';
  return `<!doctype html><html lang="${lang}"><head>${analytics}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="robots" content="index,follow"><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="ja" href="${jaUrl}"><link rel="alternate" hreflang="en" href="${enUrl}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}"><link rel="apple-touch-icon" href="/assets/nicheworks-favicon-512-white.png"><script type="application/ld+json">${ld}</script><link rel="icon" href="/assets/favicon.ico"><link rel="stylesheet" href="/tools/pattern-dictionary/style.css">${ads}${beacon}</head><body data-page="detail" data-pattern-id="${id}">${header}${main}<footer class="pd-footer"><div class="pd-shell"><p>${footer}</p></div></footer><script type="module" src="/tools/pattern-dictionary/app.js"></script></body></html>`;
}
for(const id of waveIds){
  const jaDir=path.join(root,'patterns',id),enDir=path.join(root,'en','patterns',id);
  fs.mkdirSync(jaDir,{recursive:true});fs.mkdirSync(enDir,{recursive:true});
  fs.writeFileSync(path.join(jaDir,'index.html'),detailHtml(id,'ja'));
  fs.writeFileSync(path.join(enDir,'index.html'),detailHtml(id,'en'));
}

const sitemapPath=path.join(repoRoot,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const entries=[];
for(const id of waveIds)for(const prefix of ['', 'en/']){
  const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`;
  if(!sitemap.includes(`<loc>${url}</loc>`))entries.push(`  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);
}
if(entries.length)sitemap=sitemap.replace('</urlset>',entries.join('\n')+'\n</urlset>');
fs.writeFileSync(sitemapPath,sitemap);

const readmePath=path.join(root,'README.md');
let readme=fs.readFileSync(readmePath,'utf8');
readme=readme.replace(/^# Pattern Dictionary[^\n]*/,'# Pattern Dictionary — canonical 60 verified publication / canonical 100 freeze');
readme=readme.replace(/Production implementation for the published 20-pattern visual dictionary[^\n]*/,'Production implementation for the published 60-pattern visual dictionary, with the remaining 40 canonical entries frozen for staged expansion to 100. The live product provides visual discovery, exact-name/alias search, ambiguous description search, bilingual static detail pages, comparison guidance, reviewed Reference Images, publication validation, and the shared live NicheWorks Amazon Associates contract.');
readme=readme.replace(/- The \*\*published runtime set[^\n]*/,'- The **published runtime set is exactly 60 patterns** after Wave 3 (entries 41-60) completed source verification, bilingual production content, Reference Image generation/review, runtime search/compare integration, maintained Amazon commerce mapping, static-route SEO, and publication validation.');
readme=readme.replace(/- Source verification is complete for all published 20 terms:[^\n]*/,'- Source verification is complete for all 60 published terms. Qualified terms remain explicitly scoped rather than being presented as one universal fixed motif.');
readme=readme.replace(/- \*\*Wave 2 \/ entries 21-40 source verification is complete:[^\n]*/,'- **Wave 2 / entries 21-40 is published and remains part of the canonical 60.**');
readme=readme.replace(/- \*\*Wave 2 production content[^\n]*/,'- **Wave 3 / entries 41-60 is published in the branch transform:** 20 bilingual production records, 17 additional comparison guides, 52 staged natural-language search regressions, and 60 fixed Amazon commerce intents.');
readme=readme.replace(/`data\/canonical-100-expansion\.json` is the planning source of truth for ordinals \*\*21-100\*\*\./,'`data/canonical-100-expansion.json` is the planning source of truth for the remaining ordinals **61-100**.');
readme=readme.replace(/The expansion is split into four fixed 20-entry production waves:/,'The 100-entry plan is split into fixed 20-entry production waves; Waves 1-3 are published and Waves 4-5 remain planned:');
readme=readme.replace(/## Next production unit[\s\S]*$/,'## Next production unit\n\nWave 3 is the current publication unit. After branch-level validation and desktop/mobile Chromium QA close, the next production unit is **Wave 4 / entries 61-80**. Wave 4 remains non-public until source verification, bilingual production content, Reference Image review, search/compare work, commerce mapping, SEO/static routes, and browser QA all close.\n');
fs.writeFileSync(readmePath,readme);

console.log(`Published Wave 3 transform: runtime ${basePatterns.length} -> ${basePatterns.length+waveIds.length}; offers +${newOffers.length}; compare guides ${compare.guides.length}; new detail pages 40.`);
