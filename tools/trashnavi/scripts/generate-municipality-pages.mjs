#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(toolDir, '../..');
const dataDir = path.join(toolDir, 'data');
const manifestPath = path.join(toolDir, 'municipality-page-manifest.json');
const sitemapPath = path.join(repoRoot, 'sitemap-trashnavi.xml');
const rootSitemapPath = path.join(repoRoot, 'sitemap.xml');
const checkMode = process.argv.includes('--check');

const TYPE_MAP = new Map([
  ['自治体公式ページ', 'municipal_home'], ['公式サイト', 'municipal_home'],
  ['ごみ分別ページ', 'waste_sorting'], ['収集カレンダー', 'collection_calendar'],
  ['粗大ごみ', 'bulky_waste'], ['粗大ごみ申込み', 'bulky_application'],
  ['検索ページ', 'waste_search'], ['持込施設', 'dropoff_facility'],
  ['ごみ分別アプリ', 'waste_app']
]);
const TYPE_ORDER = ['waste_sorting','waste_search','collection_calendar','bulky_waste','bulky_application','dropoff_facility','waste_app','special_disposal'];
const TYPE_LABELS = {
  waste_sorting:['ごみの分別・出し方','Waste sorting'], waste_search:['ごみ分別検索','Waste search'],
  collection_calendar:['収集カレンダー','Collection calendar'], bulky_waste:['粗大ごみ','Bulky waste'],
  bulky_application:['粗大ごみ申込み','Bulky waste application'], dropoff_facility:['持込施設','Drop-off facility'],
  waste_app:['ごみ分別アプリ・Web','Waste app / web service'], special_disposal:['特別な処分案内','Special disposal guidance']
};
const WASTE_TYPES = new Set(TYPE_ORDER);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const esc = (v) => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const canonicalType = (row) => String(row.link_type || '').trim() || TYPE_MAP.get(String(row.type || '').trim()) || '';

function linksFor(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const type = canonicalType(row), url = String(row.url || '').trim();
    if (!WASTE_TYPES.has(type) || !/^https?:\/\//.test(url)) return false;
    const key = `${type}\u0000${url}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a,b) => TYPE_ORDER.indexOf(canonicalType(a)) - TYPE_ORDER.indexOf(canonicalType(b)) || String(a.name || '').localeCompare(String(b.name || ''),'ja'));
}

function card(row) {
  const type = canonicalType(row), labels = TYPE_LABELS[type] || [type,type];
  const meta = [];
  if (row.fiscal_year) meta.push(`<span data-i18n="ja">対象年度: ${esc(row.fiscal_year)}</span><span data-i18n="en">Year: ${esc(row.fiscal_year)}</span>`);
  if (row.last_checked) meta.push(`<span data-i18n="ja">確認日: ${esc(row.last_checked)}</span><span data-i18n="en">Checked: ${esc(row.last_checked)}</span>`);
  return `<article class="official-link-card"><span class="result-tag"><span data-i18n="ja">${esc(labels[0])}</span><span data-i18n="en">${esc(labels[1])}</span></span><h3>${esc(row.name || labels[0])}</h3>${meta.length ? `<p class="verification-meta">${meta.join(' · ')}</p>` : ''}<p class="official-source-note" data-i18n="ja">自治体公式サイトの情報です。最新内容はリンク先で確認してください。</p><p class="official-source-note" data-i18n="en">Official municipal source. Confirm the latest details on the linked page.</p><a class="result-button" href="${esc(row.url)}" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">公式ページを開く</span><span data-i18n="en">Open official page</span><span class="external-label">外部 / External</span></a></article>`;
}

function page(entry, rows, manifest, names) {
  const links = linksFor(rows), types = new Set(links.map(canonicalType));
  if (types.size < 3) throw new Error(`${entry.lgcode}: preferred readiness lost (${types.size})`);
  const pref = String(rows.find(r=>r.pref)?.pref || '').trim(), city = String(rows.find(r=>r.city)?.city || '').trim();
  if (!pref || !city) throw new Error(`${entry.lgcode}: identity missing`);
  const canonical = `https://nicheworks.app/tools/trashnavi/${entry.pref_slug}/${entry.city_slug}/`;
  const title = `${city}のごみ分別・収集カレンダー・粗大ごみ公式情報｜TrashNavi | NicheWorks`;
  const desc = `${pref}${city}のごみ分別、収集カレンダー、粗大ごみなどの自治体公式ページをまとめています。TrashNaviは公式情報への案内で、分別ルールの最終判断や申込みは行いません。`;
  const calendar = links.find(r=>canonicalType(r)==='collection_calendar' && String(r.fiscal_year || '')==='2026');
  const checked = links.map(r=>String(r.last_checked || '').trim()).filter(Boolean).sort().at(-1) || '';
  const related = manifest.filter(m=>m.publish && m.lgcode!==entry.lgcode).slice(0,9).map(m=>`<a href="/tools/trashnavi/${esc(m.pref_slug)}/${esc(m.city_slug)}/">${esc(names.get(m.lgcode) || m.city_slug)}</a>`).join('');
  const ld = JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:title,url:canonical,description:desc,isPartOf:{'@type':'WebSite',name:'NicheWorks',url:'https://nicheworks.app/'},about:{'@type':'AdministrativeArea',name:`${pref}${city}`}}).replaceAll('<','\\u003c');
  const crumbs = JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'NicheWorks',item:'https://nicheworks.app/'},{'@type':'ListItem',position:2,name:'TrashNavi',item:'https://nicheworks.app/tools/trashnavi/'},{'@type':'ListItem',position:3,name:city,item:canonical}]}).replaceAll('<','\\u003c');
  return `<!DOCTYPE html>
<html lang="ja"><head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-57QT78M3JB');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:site_name" content="NicheWorks"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://nicheworks.app/assets/ogp.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="https://nicheworks.app/assets/ogp.png">
<link rel="icon" href="/assets/favicon.ico"><link rel="apple-touch-icon" href="/assets/favicon.ico"><link rel="stylesheet" href="/tools/trashnavi/style.css">
<script type="application/ld+json">${ld}</script><script type="application/ld+json">${crumbs}</script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"aeec938336694c99bc864cdf859b5e37"}'></script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
</head><body>
<header class="nw-header"><div class="nw-header-inner"><h1 class="nw-title">${esc(city)}のごみ情報 | TrashNavi</h1><p class="nw-lead" data-i18n="ja">${esc(pref)}${esc(city)}の確認済み自治体公式ごみ情報への入口です。</p><p class="nw-lead" data-i18n="en">Official municipal waste-information links for ${esc(city)}, ${esc(pref)}.</p><div class="nw-lang-switch" aria-label="Language switch"><button type="button" data-lang="ja">JP</button> / <button type="button" data-lang="en">EN</button></div></div></header>
<main class="nw-main municipality-page"><nav class="municipality-breadcrumb" aria-label="Breadcrumb"><a href="/tools/trashnavi/">TrashNavi</a><span>›</span><span>${esc(pref)}</span><span>›</span><span>${esc(city)}</span></nav><div class="ad-slot ad-top">広告枠</div>
<section class="municipality-hero"><h2 data-i18n="ja">${esc(city)}の公式ごみ情報</h2><h2 data-i18n="en">Official waste information for ${esc(city)}</h2><p data-i18n="ja">分別、収集カレンダー、粗大ごみなど、確認済みの自治体公式ページをまとめています。具体的な分別方法・料金・収集日は、必ず各公式ページの最新情報を確認してください。</p><p data-i18n="en">Use these verified municipal links for sorting, collection calendars and bulky waste. Confirm current rules, fees and dates on the official source.</p>${checked?`<p class="verification-summary"><span data-i18n="ja">最新のリンク確認記録: ${esc(checked)}</span><span data-i18n="en">Latest recorded link check: ${esc(checked)}</span></p>`:''}</section>
${calendar?`<section class="current-calendar-callout"><h2 data-i18n="ja">2026年の収集カレンダー</h2><h2 data-i18n="en">2026 collection calendar</h2><p>${esc(calendar.name)}</p><a class="result-button" href="${esc(calendar.url)}" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">2026年公式カレンダーを開く</span><span data-i18n="en">Open the official 2026 calendar</span></a></section>`:''}
<section class="municipality-links-section"><h2 data-i18n="ja">公式リンク</h2><h2 data-i18n="en">Official links</h2><div class="official-link-grid">${links.map(card).join('')}</div></section><div class="ad-slot ad-inline">広告枠</div>
<section class="municipality-guide"><h2 data-i18n="ja">このページの使い方</h2><h2 data-i18n="en">How to use this page</h2><ol data-i18n="ja"><li>必要な情報の公式リンクを選びます。</li><li>住所・品目・申込条件などの最新情報を自治体公式ページで確認します。</li><li>粗大ごみの申込みが必要な場合は自治体指定の受付先へ進みます。</li></ol><ol data-i18n="en"><li>Choose the relevant official link.</li><li>Confirm current address-specific rules and eligibility on the municipal website.</li><li>For bulky waste, continue through the municipality's official route.</li></ol><p class="official-source-warning" data-i18n="ja">TrashNaviは分別を最終判定せず、粗大ごみの申込みも受け付けません。</p><p class="official-source-warning" data-i18n="en">TrashNavi does not make final sorting decisions or accept bulky-waste applications.</p></section>
<section class="faq-section"><h2 data-i18n="ja">よくある確認</h2><h2 data-i18n="en">Common checks</h2><div class="faq-item"><h3 data-i18n="ja">今日・今週の収集日はどこで確認しますか？</h3><h3 data-i18n="en">Where should I check today's collection date?</h3><p data-i18n="ja">上の収集カレンダーを開き、住所・地域に対応する最新日程を確認してください。</p><p data-i18n="en">Open the official collection calendar and confirm the current schedule for your area.</p></div><div class="faq-item"><h3 data-i18n="ja">粗大ごみの料金や対象品をTrashNaviで確認できますか？</h3><h3 data-i18n="en">Does TrashNavi determine bulky-waste fees?</h3><p data-i18n="ja">いいえ。料金・対象品・申込方法は自治体公式の粗大ごみページで確認してください。</p><p data-i18n="en">No. Confirm fees, eligible items and application routes on the official municipal page.</p></div></section>
<section class="report-section"><h2 data-i18n="ja">リンク切れ・変更を報告</h2><h2 data-i18n="en">Report a changed or broken link</h2><p data-i18n="ja">自治体公式URLの変更やリンク切れを見つけた場合は、個人情報を書かずにGitHub Issueから報告できます。</p><p data-i18n="en">If an official URL changes or breaks, report it through GitHub Issues without personal information.</p><div class="report-actions"><a href="https://github.com/nicheworks-tools/nicheworks/issues/new?template=trashnavi-link-report.yml" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">リンク情報を報告する</span><span data-i18n="en">Report link information</span></a></div></section><div class="ad-slot ad-bottom">広告枠</div>
<section class="municipality-related"><h2 data-i18n="ja">関連する自治体ページ</h2><h2 data-i18n="en">Related municipality pages</h2><div class="municipality-related-links">${related}</div><p><a href="/tools/trashnavi/"><span data-i18n="ja">← TrashNaviでほかの自治体を探す</span><span data-i18n="en">← Search other municipalities in TrashNavi</span></a></p></section>
<div class="nw-links" aria-label="Related NicheWorks tools"><a href="/tools/jp-postal-lite/">JP Postal Lite</a><a href="/tools/moving-checklist-generator/">Moving Checklist Generator</a><a href="/tools/manual-finder/">ManualFinder</a><a href="/tools/filetype-sniffer/">FileType Sniffer</a></div><div class="nw-donate"><p class="nw-donate-text" data-i18n="ja">このページが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。</p><p class="nw-donate-text" data-i18n="en">If this page helps you, please consider supporting future development.</p><div class="nw-donate-links"><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a><a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a></div></div></main>
<footer class="nw-footer"><p class="nw-footer-line">© NicheWorks — Small Web Tools for Boring Tasks</p><p class="nw-footer-line">当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。</p><p class="nw-footer-line"><a href="https://nicheworks.app/" target="_blank" rel="noopener">nicheworks.app</a></p></footer>
<script>(function(){const b=document.querySelectorAll('.nw-lang-switch button'),n=document.querySelectorAll('[data-i18n]');function a(l){document.documentElement.lang=l;n.forEach(x=>x.style.display=x.dataset.i18n===l?'':'none');b.forEach(x=>x.classList.toggle('active',x.dataset.lang===l));}b.forEach(x=>x.addEventListener('click',()=>a(x.dataset.lang)));a((navigator.language||'').toLowerCase().startsWith('ja')?'ja':'en');})();</script></body></html>
`;
}

const manifest = readJson(manifestPath);
const files = fs.readdirSync(dataDir).filter(n=>/^direct-waste-links.*\.json$/.test(n)).sort();
const rows = files.flatMap(n=>readJson(path.join(dataDir,n)));
const by = new Map(), names = new Map();
for (const row of rows) { const code=String(row.lgcode||'').trim(); if(!code) continue; if(!by.has(code)) by.set(code,[]); by.get(code).push(row); if(row.city) names.set(code,String(row.city).trim()); }
const outputs=[];
for(const entry of manifest.filter(x=>x.publish)) { const html=page(entry,by.get(entry.lgcode)||[],manifest,names); const relative=path.join('tools','trashnavi',entry.pref_slug,entry.city_slug,'index.html'); outputs.push({relative,absolute:path.join(repoRoot,relative),content:html,url:`https://nicheworks.app/tools/trashnavi/${entry.pref_slug}/${entry.city_slug}/`}); }
if(outputs.length!==13) throw new Error(`municipality page count must be 13; got ${outputs.length}`);
const lastmod=rows.map(r=>String(r.last_checked||'').trim()).filter(Boolean).sort().at(-1)||'';
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['https://nicheworks.app/tools/trashnavi/',...outputs.map(o=>o.url)].map(u=>`  <url>\n    <loc>${u}</loc>${lastmod?`\n    <lastmod>${lastmod}</lastmod>`:''}\n  </url>`).join('\n')}\n</urlset>\n`;
const drift=[];
function sync(file,content,label){ if(checkMode){ if(!fs.existsSync(file)) return drift.push(`${label}: missing`); if(fs.readFileSync(file,'utf8')!==content) drift.push(`${label}: out of date`); } else { fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,content,'utf8'); } }
outputs.forEach(o=>sync(o.absolute,o.content,o.relative));
sync(sitemapPath,sitemap,'sitemap-trashnavi.xml');
if (checkMode) {
  if (!fs.existsSync(rootSitemapPath)) {
    drift.push('sitemap.xml: missing');
  } else {
    const rootSitemap = fs.readFileSync(rootSitemapPath, 'utf8');
    for (const output of outputs) {
      const needle = `<loc>${output.url}</loc>`;
      const count = rootSitemap.split(needle).length - 1;
      if (count !== 1) drift.push(`sitemap.xml: ${output.url} must appear exactly once; found ${count}`);
    }
  }
}
if(checkMode&&drift.length){console.error('TrashNavi municipality page generation drift:');drift.forEach(x=>console.error(`- ${x}`));process.exit(1);}
console.log(`TrashNavi municipality pages: ${outputs.length} ${checkMode?'verified':'generated'}`);console.log(`Direct datasets read: ${files.length}`);console.log(`Sitemap: ${path.relative(repoRoot,sitemapPath)}`);
