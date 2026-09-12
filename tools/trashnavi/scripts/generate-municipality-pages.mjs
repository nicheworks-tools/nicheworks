#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const toolDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(toolDir, "../..");
const dataDir = path.join(toolDir, "data");
const manifestPath = path.join(toolDir, "municipality-page-manifest.json");
const sitemapPath = path.join(repoRoot, "sitemap-trashnavi.xml");
const checkMode = process.argv.includes("--check");

const TYPE_MAP = new Map([
  ["自治体公式ページ", "municipal_home"],
  ["公式サイト", "municipal_home"],
  ["ごみ分別ページ", "waste_sorting"],
  ["収集カレンダー", "collection_calendar"],
  ["粗大ごみ", "bulky_waste"],
  ["検索ページ", "waste_search"]
]);

const TYPE_ORDER = [
  "waste_sorting",
  "waste_search",
  "collection_calendar",
  "bulky_waste",
  "bulky_application",
  "dropoff_facility",
  "waste_app",
  "special_disposal"
];

const TYPE_LABELS = {
  waste_sorting: ["ごみの分別・出し方", "Waste sorting"],
  waste_search: ["ごみ分別検索", "Waste search"],
  collection_calendar: ["収集カレンダー", "Collection calendar"],
  bulky_waste: ["粗大ごみ", "Bulky waste"],
  bulky_application: ["粗大ごみ申込み", "Bulky waste application"],
  dropoff_facility: ["持込施設", "Drop-off facility"],
  waste_app: ["ごみ分別アプリ・Web", "Waste app / web service"],
  special_disposal: ["特別な処分案内", "Special disposal guidance"]
};

const WASTE_TYPES = new Set(TYPE_ORDER);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function canonicalType(row) {
  const explicit = String(row.link_type || "").trim();
  if (explicit) return explicit;
  const legacy = String(row.type || "").trim();
  return TYPE_MAP.get(legacy) || "";
}

function uniqueLinks(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const type = canonicalType(row);
    const url = String(row.url || "").trim();
    if (!WASTE_TYPES.has(type) || !/^https?:\/\//.test(url)) return false;
    const key = `${type}\u0000${url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortLinks(rows) {
  return [...rows].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(canonicalType(a));
    const bi = TYPE_ORDER.indexOf(canonicalType(b));
    if (ai !== bi) return ai - bi;
    return String(a.name || "").localeCompare(String(b.name || ""), "ja");
  });
}

function latestChecked(rows) {
  return rows.map((row) => String(row.last_checked || "").trim()).filter(Boolean).sort().at(-1) || "";
}

function renderLinkCard(row) {
  const type = canonicalType(row);
  const [jaLabel, enLabel] = TYPE_LABELS[type] || [type, type];
  const fiscalYear = String(row.fiscal_year || "").trim();
  const checked = String(row.last_checked || "").trim();
  const meta = [];
  if (fiscalYear) meta.push(`<span data-i18n="ja">対象年度: ${escapeHtml(fiscalYear)}</span><span data-i18n="en">Year: ${escapeHtml(fiscalYear)}</span>`);
  if (checked) meta.push(`<span data-i18n="ja">確認日: ${escapeHtml(checked)}</span><span data-i18n="en">Checked: ${escapeHtml(checked)}</span>`);
  return `
        <article class="official-link-card">
          <span class="result-tag"><span data-i18n="ja">${escapeHtml(jaLabel)}</span><span data-i18n="en">${escapeHtml(enLabel)}</span></span>
          <h3>${escapeHtml(row.name || jaLabel)}</h3>
          ${meta.length ? `<p class="verification-meta">${meta.join(" · ")}</p>` : ""}
          <p class="official-source-note" data-i18n="ja">自治体公式サイトの情報です。最新内容はリンク先で確認してください。</p>
          <p class="official-source-note" data-i18n="en">Official municipal source. Confirm the latest details on the linked page.</p>
          <a class="result-button" href="${escapeHtml(row.url)}" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">公式ページを開く</span><span data-i18n="en">Open official page</span><span class="external-label">外部 / External</span></a>
        </article>`;
}

function renderRelated(entry, manifest, cityByCode) {
  return manifest.filter((item) => item.publish && item.lgcode !== entry.lgcode).map((item) => {
    const city = cityByCode.get(item.lgcode) || item.city_slug;
    return `<a href="/tools/trashnavi/${escapeHtml(item.pref_slug)}/${escapeHtml(item.city_slug)}/">${escapeHtml(city)}</a>`;
  }).join("");
}

function renderPage(entry, rows, manifest, cityByCode) {
  const links = sortLinks(uniqueLinks(rows));
  const distinctTypes = new Set(links.map(canonicalType));
  if (distinctTypes.size < 3) {
    throw new Error(`${entry.lgcode}: preferred readiness lost (${distinctTypes.size} distinct waste types)`);
  }

  const pref = String(rows.find((row) => row.pref)?.pref || "").trim();
  const city = String(rows.find((row) => row.city)?.city || "").trim();
  if (!pref || !city) throw new Error(`${entry.lgcode}: municipality identity missing`);

  const canonical = `https://nicheworks.app/tools/trashnavi/${entry.pref_slug}/${entry.city_slug}/`;
  const title = `${city}のごみ分別・収集カレンダー・粗大ごみ公式情報｜TrashNavi | NicheWorks`;
  const description = `${pref}${city}のごみ分別、収集カレンダー、粗大ごみなどの自治体公式ページをまとめています。TrashNaviは公式情報への案内で、分別ルールの最終判断や申込みは行いません。`;
  const checked = latestChecked(links);
  const currentCalendar = links.find((row) => canonicalType(row) === "collection_calendar" && String(row.fiscal_year || "") === "2026");
  const related = renderRelated(entry, manifest, cityByCode);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonical,
    description,
    isPartOf: { "@type": "WebSite", name: "NicheWorks", url: "https://nicheworks.app/" },
    about: { "@type": "AdministrativeArea", name: `${pref}${city}` }
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "NicheWorks", item: "https://nicheworks.app/" },
      { "@type": "ListItem", position: 2, name: "TrashNavi", item: "https://nicheworks.app/tools/trashnavi/" },
      { "@type": "ListItem", position: 3, name: city, item: canonical }
    ]
  };

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-57QT78M3JB');</script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://nicheworks.app/assets/ogp.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://nicheworks.app/assets/ogp.png">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/tools/trashnavi/style.css">
  <script type="application/ld+json">${escapeJsonForHtml(webPageLd)}</script>
  <script type="application/ld+json">${escapeJsonForHtml(breadcrumbLd)}</script>
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"aeec938336694c99bc864cdf859b5e37"}'></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
</head>
<body>
  <header class="nw-header">
    <div class="nw-header-inner">
      <h1 class="nw-title">${escapeHtml(city)}のごみ情報 | TrashNavi</h1>
      <p class="nw-lead" data-i18n="ja">${escapeHtml(pref)}${escapeHtml(city)}の確認済み自治体公式ごみ情報への入口です。</p>
      <p class="nw-lead" data-i18n="en">Official municipal waste-information links for ${escapeHtml(city)}, ${escapeHtml(pref)}.</p>
      <div class="nw-lang-switch" aria-label="Language switch"><button type="button" data-lang="ja">JP</button> / <button type="button" data-lang="en">EN</button></div>
    </div>
  </header>

  <main class="nw-main municipality-page">
    <nav class="municipality-breadcrumb" aria-label="Breadcrumb"><a href="/tools/trashnavi/">TrashNavi</a><span>›</span><span>${escapeHtml(pref)}</span><span>›</span><span>${escapeHtml(city)}</span></nav>
    <div class="ad-slot ad-top">広告枠</div>

    <section class="municipality-hero">
      <h2 data-i18n="ja">${escapeHtml(city)}の公式ごみ情報</h2>
      <h2 data-i18n="en">Official waste information for ${escapeHtml(city)}</h2>
      <p data-i18n="ja">分別、収集カレンダー、粗大ごみなど、TrashNaviで確認した自治体公式ページをまとめています。具体的な分別方法・料金・収集日は、必ず各公式ページの最新情報を確認してください。</p>
      <p data-i18n="en">Use these verified municipal links for sorting, collection calendars, bulky waste and related information. Always confirm current rules, fees and dates on the official municipal source.</p>
      ${checked ? `<p class="verification-summary"><span data-i18n="ja">最新のリンク確認記録: ${escapeHtml(checked)}</span><span data-i18n="en">Latest recorded link check: ${escapeHtml(checked)}</span></p>` : ""}
    </section>

    ${currentCalendar ? `<section class="current-calendar-callout"><h2 data-i18n="ja">2026年の収集カレンダー</h2><h2 data-i18n="en">2026 collection calendar</h2><p>${escapeHtml(currentCalendar.name)}</p><a class="result-button" href="${escapeHtml(currentCalendar.url)}" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">2026年公式カレンダーを開く</span><span data-i18n="en">Open the official 2026 calendar</span></a></section>` : ""}

    <section class="municipality-links-section">
      <h2 data-i18n="ja">公式リンク</h2><h2 data-i18n="en">Official links</h2>
      <div class="official-link-grid">${links.map(renderLinkCard).join("")}
      </div>
    </section>

    <div class="ad-slot ad-inline">広告枠</div>

    <section class="municipality-guide">
      <h2 data-i18n="ja">このページの使い方</h2><h2 data-i18n="en">How to use this page</h2>
      <ol data-i18n="ja"><li>必要な情報の公式リンクを選びます。</li><li>住所・品目・申込条件などの最新情報を自治体公式ページで確認します。</li><li>粗大ごみの申込みが必要な場合は、公式ページから自治体指定の受付先へ進みます。</li></ol>
      <ol data-i18n="en"><li>Choose the relevant official link.</li><li>Confirm current address-specific rules, items and eligibility on the municipal website.</li><li>For bulky-waste applications, continue only through the municipality's designated official route.</li></ol>
      <p class="official-source-warning" data-i18n="ja">TrashNaviは分別を最終判定せず、粗大ごみの申込みも受け付けません。</p>
      <p class="official-source-warning" data-i18n="en">TrashNavi does not make final sorting decisions or accept bulky-waste applications.</p>
    </section>

    <section class="faq-section">
      <h2 data-i18n="ja">よくある確認</h2><h2 data-i18n="en">Common checks</h2>
      <div class="faq-item"><h3 data-i18n="ja">今日・今週の収集日はどこで確認しますか？</h3><h3 data-i18n="en">Where should I check today's or this week's collection date?</h3><p data-i18n="ja">上の収集カレンダーまたは自治体公式の収集日ページを開き、住所・地域に対応する最新日程を確認してください。</p><p data-i18n="en">Open the official collection calendar above and confirm the current schedule for your address or area.</p></div>
      <div class="faq-item"><h3 data-i18n="ja">粗大ごみの料金や対象品をTrashNaviで確認できますか？</h3><h3 data-i18n="en">Does TrashNavi determine bulky-waste fees or eligible items?</h3><p data-i18n="ja">いいえ。料金や対象品、申込方法は変更されることがあるため、自治体公式の粗大ごみページで確認してください。</p><p data-i18n="en">No. Fees, eligible items and application routes can change, so confirm them on the official municipal bulky-waste page.</p></div>
    </section>

    <section class="report-section">
      <h2 data-i18n="ja">リンク切れ・変更を報告</h2><h2 data-i18n="en">Report a changed or broken link</h2>
      <p data-i18n="ja">自治体公式URLの変更やリンク切れを見つけた場合は、個人情報を書かずにGitHub Issueから報告できます。</p>
      <p data-i18n="en">If an official URL changes or breaks, you can report it through GitHub Issues without including personal information.</p>
      <div class="report-actions"><a href="https://github.com/nicheworks-tools/nicheworks/issues/new?template=trashnavi-link-report.yml" target="_blank" rel="noopener noreferrer"><span data-i18n="ja">リンク情報を報告する</span><span data-i18n="en">Report link information</span></a></div>
    </section>

    <div class="ad-slot ad-bottom">広告枠</div>

    <section class="municipality-related">
      <h2 data-i18n="ja">東京都の関連ページ</h2><h2 data-i18n="en">Related Tokyo pages</h2>
      <div class="municipality-related-links">${related}</div>
      <p><a href="/tools/trashnavi/"><span data-i18n="ja">← TrashNaviでほかの自治体を探す</span><span data-i18n="en">← Search other municipalities in TrashNavi</span></a></p>
    </section>

    <div class="nw-links" aria-label="Related NicheWorks tools"><a href="/tools/jp-postal-lite/">JP Postal Lite</a><a href="/tools/moving-checklist-generator/">Moving Checklist Generator</a><a href="/tools/manual-finder/">ManualFinder</a><a href="/tools/filetype-sniffer/">FileType Sniffer</a></div>
    <div class="nw-donate"><p class="nw-donate-text" data-i18n="ja">このページが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。</p><p class="nw-donate-text" data-i18n="en">If this page helps you, please consider supporting future development.</p><div class="nw-donate-links"><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a><a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a></div></div>
  </main>

  <footer class="nw-footer"><p class="nw-footer-line">© NicheWorks — Small Web Tools for Boring Tasks</p><p class="nw-footer-line">当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。</p><p class="nw-footer-line"><a href="https://nicheworks.app/" target="_blank" rel="noopener">nicheworks.app</a></p></footer>
  <script>(function(){const buttons=document.querySelectorAll('.nw-lang-switch button');const nodes=document.querySelectorAll('[data-i18n]');function apply(lang){document.documentElement.lang=lang;nodes.forEach(n=>n.style.display=n.dataset.i18n===lang?'':'none');buttons.forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));}buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang)));apply((navigator.language||'').toLowerCase().startsWith('ja')?'ja':'en');})();</script>
</body>
</html>
`;
}

function renderSitemap(pages, lastmod) {
  const urls = ["https://nicheworks.app/tools/trashnavi/", ...pages.map((page) => page.url)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${url}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`).join("\n")}\n</urlset>\n`;
}

const manifest = readJson(manifestPath);
if (!Array.isArray(manifest)) throw new Error("municipality-page-manifest.json must be an array");

const directFiles = fs.readdirSync(dataDir).filter((name) => /^direct-waste-links.*\.json$/.test(name)).sort();
const allRows = directFiles.flatMap((name) => {
  const rows = readJson(path.join(dataDir, name));
  if (!Array.isArray(rows)) throw new Error(`${name}: root value must be an array`);
  return rows;
});

const byLgcode = new Map();
const cityByCode = new Map();
for (const row of allRows) {
  const lgcode = String(row.lgcode || "").trim();
  if (!lgcode) continue;
  if (!byLgcode.has(lgcode)) byLgcode.set(lgcode, []);
  byLgcode.get(lgcode).push(row);
  if (row.city) cityByCode.set(lgcode, String(row.city).trim());
}

const outputs = [];
for (const entry of manifest.filter((item) => item.publish)) {
  const rows = byLgcode.get(String(entry.lgcode)) || [];
  if (!rows.length) throw new Error(`${entry.lgcode}: no direct-link data found`);
  const html = renderPage(entry, rows, manifest, cityByCode);
  const relativePath = path.join("tools", "trashnavi", entry.pref_slug, entry.city_slug, "index.html");
  const absolutePath = path.join(repoRoot, relativePath);
  outputs.push({ relativePath, absolutePath, content: html, url: `https://nicheworks.app/tools/trashnavi/${entry.pref_slug}/${entry.city_slug}/` });
}

if (outputs.length !== 7) throw new Error(`pilot page count must be 7; got ${outputs.length}`);

const allChecked = allRows.map((row) => String(row.last_checked || "").trim()).filter(Boolean).sort();
const sitemap = renderSitemap(outputs, allChecked.at(-1) || "");

const drift = [];
function verifyOrWrite(filePath, content, label) {
  if (checkMode) {
    if (!fs.existsSync(filePath)) {
      drift.push(`${label}: missing`);
      return;
    }
    const actual = fs.readFileSync(filePath, "utf8");
    if (actual !== content) drift.push(`${label}: out of date`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

for (const output of outputs) verifyOrWrite(output.absolutePath, output.content, output.relativePath);
verifyOrWrite(sitemapPath, sitemap, "sitemap-trashnavi.xml");

if (checkMode && drift.length) {
  console.error("TrashNavi municipality page generation drift:");
  drift.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`TrashNavi municipality pages: ${outputs.length} ${checkMode ? "verified" : "generated"}`);
console.log(`Direct datasets read: ${directFiles.length}`);
console.log(`Sitemap: ${path.relative(repoRoot, sitemapPath)}`);
