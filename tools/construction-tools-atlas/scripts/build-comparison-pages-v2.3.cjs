#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),SITE="https://nicheworks.app/tools/construction-tools-atlas";
const check=process.argv.includes("--check");
function e(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
function getEntry(html,id){function m(re,what){const x=html.match(re);if(!x)throw Error(`${id}: missing ${what}`);return x[1];}return{id,ja:m(/<h1>([^<]+)<\/h1>/,"ja"),en:m(/<p class="englishName" lang="en">([^<]+)<\/p>/,"en"),canonical:m(/<link rel="canonical" href="([^"]+)"/,"canonical"),definition:m(/<h2>これは何？ \/ What is it\?<\/h2>([\s\S]*?)<\/section>/,"definition"),detail:m(/<h2>用途・確認ポイント \/ Uses & key points<\/h2>([\s\S]*?)<\/section>/,"detail"),examples:m(/<h2>よく使われる場面 \/ Examples<\/h2>([\s\S]*?)<\/section>/,"examples"),image:(html.match(/<figure class="heroImage">[\s\S]*?<\/figure>/)||[])[0]||""};}
function validate(p,l,r,offers,manifest){
  if(p.status!=="approved"||p.relationship!=="maintained_comparison"||!/^[-a-z0-9]+$/.test(p.slug)||p.left===p.right)throw Error("unapproved or invalid maintained comparison");
  for(const side of [l,r]){
    if(!manifest.entries.some(x=>x.id===side.id))throw Error("not in published 33 canonical cohort: "+side.id);
    if(side.canonical!==`https://nicheworks.app/tools/construction-tools-atlas/entries/${side.id}/`)throw Error("canonical mismatch: "+side.id);
    if(!side.image||!side.image.includes("figcaption"))throw Error("formal image/attribution missing: "+side.id);
    const o=offers[side.id];if(o?.status!=="active"||!/^https:\/\/(?:www\.)?amazon\.co\.jp\//.test(o.amazon_url)||!/[?&]tag=nicheworks09-22(?:&|$)/.test(o.amazon_url))throw Error("maintained Amazon mapping mismatch: "+side.id);
  }
  const languages=new Set();
  for(const v of p.evidence||[]){
    if(v.entry_id!==r.id||v.field!=="description"||!["ja","en"].includes(v.language)||!r.definition.includes(e(v.exact)))throw Error("missing or stale bilingual comparison evidence");
    languages.add(v.language);
  }
  if(languages.size!==2)throw Error("comparison must have Japanese and English evidence");
}
function render(p,left,right,offers){
 const site="https://nicheworks.app/tools/construction-tools-atlas",url=`${site}/comparisons/${p.slug}/`;
 const name=`${left.ja}と${right.ja}の違い・使い分け`;
 const description=`${left.ja}と${right.ja}の用途・ネジ締め・穴あけの違いを、Construction Tools Atlasの整備済み日英項目から確認できる比較ページです。`;
 const json=[{"@context":"https://schema.org","@type":"WebPage","name":name,"url":url,"description":description,"inLanguage":["ja","en"],"about":[{"@type":"DefinedTerm","name":left.ja,"url":left.canonical},{"@type":"DefinedTerm","name":right.ja,"url":right.canonical}]},{"@context":"https://schema.org","@type":"WebApplication","name":"Construction Tools Atlas","url":site+"/","applicationCategory":"UtilityApplication","operatingSystem":"All","inLanguage":["ja","en"]}];
 function side(x){const o=offers[x.id];return `<section class="comparisonSide"><h2>${x.ja}</h2><p class="englishName" lang="en">${x.en}</p>${x.image}<h3>特徴 / Definition</h3>${x.definition}<h3>用途・注意 / Uses &amp; notes</h3>${x.detail}<h3>使われる場面 / Examples</h3>${x.examples}<p><a href="${e(x.canonical)}">詳しい解説を見る / Read full entry</a></p><section class="compareOffer commerceBox" data-affiliate-entry="${e(x.id)}" data-affiliate-url="${e(o.amazon_url)}" data-affiliate-label="${e(o.label_ja||"Amazonで探す")}"><h3>対応する購入先を探す</h3><p>価格・在庫・評価・適合性を保証するものではありません。</p><div class="affiliateMount"></div></section></section>`;}
 return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${e(name)} | Construction Tools Atlas</title>
  <meta name="description" content="${e(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${e(url)}">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/seo-detail-v2.3.css">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/comparison-v2.3.css">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${e(name)} | Construction Tools Atlas">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${e(url)}">
  <meta property="og:image" content="https://nicheworks.app/assets/ogp.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(name)} | Construction Tools Atlas">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="https://nicheworks.app/assets/ogp.png">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-57QT78M3JB');</script>
  <script type="application/ld+json">${JSON.stringify(json).replaceAll("<","\\u003c")}</script>
</head>
<body>
<header class="detailHeader"><div class="detailHeader__inner"><a href="https://nicheworks.app/">NicheWorks</a><a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a></div></header>
<main class="detailMain">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a><span aria-hidden="true">›</span><span>工具の比較</span></nav>
  <article class="entryArticle">
    <header class="entryHero"><p class="eyebrow">Source-backed comparison</p><h1>${e(name)}</h1><p lang="en">${left.en} vs ${right.en} — uses and differences</p><p>${e(description)}</p></header>
    <section class="entrySection"><h2>比較の根拠 / Evidence</h2>
      <p>ドリルドライバーの既存説明には強い締付け時の使い分けが明記されています。</p>
      <blockquote lang="ja">${e(p.evidence.find(x=>x.language==="ja").exact)}</blockquote>
      <blockquote lang="en">${e(p.evidence.find(x=>x.language==="en").exact)}</blockquote>
      <p><a href="${e(right.canonical)}">参照元 / Original canonical entry</a></p>
    </section>
    <section class="entrySection"><h2>違いを並べて確認 / Side-by-side reference</h2><div class="comparisonGrid">${side(left)}${side(right)}</div></section>
    <section class="entrySection"><h2>選ぶ前に / Before choosing</h2>
      <p>穴あけと軽いねじ締めはドリルドライバーの用途、長いビスなど強い締付けはインパクトドライバーの用途を確認してください。材質やビット規格・締付条件は製品の公式仕様に従ってください。</p>
      <p lang="en">Review the drill driver's drilling and light fastening functions for pilot holes and small screws. Review the impact driver's high-torque fastening use cases for long screws. Consult official product specifications for material, bit and fastening constraints.</p>
    </section>
    <section class="entrySection"><h2>Amazonアソシエイトの開示 / Affiliate disclosure</h2><div id="compareDisclosure" class="affiliateDisclosure"></div><p>管理済みの項目に対応するAmazon検索先だけを表示します。価格・在庫・ランキングの主張は行いません。</p></section>
    <section class="entrySection atlasCta"><h2>他の工具を調べる</h2><a class="primaryAction" href="/tools/construction-tools-atlas/">Atlasで検索する</a><p><a href="/tools/construction-tools-atlas/entries/">33件の公開詳細ページ一覧</a></p></section>
  </article>
</main>
<footer class="detailFooter"><p>© NicheWorks — Small Web Tools for Boring Tasks</p><p>安全基準・法令・メーカー仕様は公式資料をご確認ください。</p></footer>
<script src="/assets/amazon-affiliate.js"></script>
<script src="/tools/construction-tools-atlas/comparison-v2.3.js"></script>
</body>
</html>
`;
}
function sitemapRender(xml,urls,root){
 const clean=xml.replace(/  <url>\n    <loc>https:\/\/nicheworks\.app\/tools\/construction-tools-atlas\/comparisons\/[^<]+<\/loc>\n(?:    <lastmod>[^<]+<\/lastmod>\n)?  <\/url>\n/g,"");
 const anchor=`  <url>\n    <loc>https://nicheworks.app/tools/construction-tools-atlas/entries/</loc>`;
 if(!clean.includes(anchor))throw Error("Atlas entries index anchor missing from sitemap");
 const insertion=urls.map(x=>`  <url>\n    <loc>${e(x)}</loc>\n${root?"    <lastmod>2026-10-31</lastmod>\n":""}  </url>\n`).join("");
 return clean.replace(anchor,insertion+anchor);
}
function main(){
 const ledger=JSON.parse(fs.readFileSync(path.join(DATA,"maintained-comparisons-v2.3.json"),"utf8"));
 if(ledger.schema!=="cta-maintained-comparisons-v2.3"||ledger.pairs?.length!==1)throw Error("first comparison wave requires one approved maintained pair");
 const manifest=JSON.parse(fs.readFileSync(path.join(DATA,"seo-detail-pages-v2.3.json"),"utf8"));
 const active=JSON.parse(fs.readFileSync(path.join(DATA,"affiliate-offers-v2.3.json"),"utf8")).offers;
 const offers=Object.fromEntries(active.filter(x=>x.status==="active").map(x=>[x.entry_id,x]));
 const urls=[], slugs=new Set();
 for(const p of ledger.pairs){
   if(slugs.has(p.slug))throw Error("duplicate maintained pair");
   slugs.add(p.slug);
   const left=getEntry(fs.readFileSync(path.join(ROOT,"entries",p.left,"index.html"),"utf8"),p.left);
   const right=getEntry(fs.readFileSync(path.join(ROOT,"entries",p.right,"index.html"),"utf8"),p.right);
   validate(p,left,right,offers,manifest);
   const html=render(p,left,right,offers);
   const output=path.join(ROOT,"comparisons",p.slug,"index.html");
   const url=SITE+"/comparisons/"+p.slug+"/";urls.push(url);
   if(!fs.readFileSync(path.join(ROOT,"index.html"),"utf8").includes('href="/tools/construction-tools-atlas/comparisons/'+p.slug+'/"'))throw Error("Atlas home missing comparison route");
   if(check){
     if(!fs.existsSync(output)||fs.readFileSync(output,"utf8")!==html)throw Error("missing/stale comparison HTML: "+p.slug);
   }else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);}
 }
 const actual=fs.existsSync(path.join(ROOT,"comparisons"))?fs.readdirSync(path.join(ROOT,"comparisons"),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort():[];
 if(check&&JSON.stringify(actual)!==JSON.stringify([...slugs].sort()))throw Error("unapproved/stale comparison directory");
 for(const [file,isRoot] of [[path.join(ROOT,"sitemap.xml"),false],[path.resolve(ROOT,"..","..","sitemap.xml"),true]]){
   const original=fs.readFileSync(file,"utf8");
   if(check){
     const listed=[...original.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]).filter(x=>x.startsWith(SITE+"/comparisons/"));
     if(JSON.stringify(listed)!==JSON.stringify(urls))throw Error("comparison sitemap parity mismatch "+file);
   }else{fs.writeFileSync(file,sitemapRender(original,urls,isRoot));}
 }
 console.log("Construction Tools Atlas maintained comparison: PASS ("+urls.length+" published)");
}
try{main()}catch(e){console.error("Construction Tools Atlas maintained comparison: FAIL");console.error(e.message);process.exit(1)}
