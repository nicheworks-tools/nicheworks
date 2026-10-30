#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const ENTRIES_DIR = path.join(ROOT, "entries");
const INDEX_PATH = path.join(ENTRIES_DIR, "index.html");
const MANIFEST_PATH = path.join(DATA, "seo-detail-pages-v2.3.json");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const ROOT_SITEMAP_PATH = path.resolve(ROOT, "..", "..", "sitemap.xml");
const SITE_ROOT = "https://nicheworks.app/tools/construction-tools-atlas";
const INDEX_URL = `${SITE_ROOT}/entries/`;
const ROOT_SITEMAP_LASTMOD = "2026-09-19";
const args = new Set(process.argv.slice(2));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function text(value) {
  return typeof value === "string" ? value.trim() : "";
}
function list(value) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
function truncate(value, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, Math.max(1, max - 1)).replace(/[\s、。,.!?！？]+$/u, "") + "…";
}
function publicAsset(relative) {
  const clean = String(relative || "").replace(/^\.\//, "");
  return `/tools/construction-tools-atlas/${clean}`;
}
function canonicalEntryUrl(id) {
  return `${SITE_ROOT}/entries/${encodeURIComponent(id)}/`;
}
function atlasDeepLink(id) {
  return `${SITE_ROOT}/?entry=${encodeURIComponent(id)}`;
}
function pair(entry, key) {
  const value = entry?.[key];
  return {
    ja: text(value?.ja || entry?.[`${key}_ja`]),
    en: text(value?.en || entry?.[`${key}_en`])
  };
}
function arrayPair(entry, key) {
  const value = entry?.[key];
  return {
    ja: list(value?.ja || entry?.[`${key}_ja`]),
    en: list(value?.en || entry?.[`${key}_en`])
  };
}
function extractRelationIds(entry) {
  const candidates = [
    entry?.related, entry?.related_ids, entry?.similar, entry?.similar_ids,
    entry?.used_with, entry?.used_with_ids, entry?.often_confused_with,
    entry?.often_confused_with_ids, entry?.relationships?.related,
    entry?.relationships?.similar, entry?.relationships?.used_with,
    entry?.relationships?.often_confused_with, entry?.meta?.related,
    entry?.meta?.used_with
  ];
  const ids = [];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    for (const item of candidate) {
      const id = typeof item === "string" ? item : text(item?.id || item?.entry_id || item?.target);
      if (id) ids.push(id);
    }
  }
  return unique(ids);
}
function localFileFromRuntimePath(runtimePath) {
  const clean = String(runtimePath || "")
    .replace(/[?#].*$/, "")
    .replace(/^\.\//, "");
  return path.resolve(ROOT, clean);
}

async function loadRuntimeEntries() {
  const source = fs.readFileSync(path.join(DATA, "quality-loader.js"), "utf8");
  const localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const windowObject = { localStorage };
  windowObject.fetch = async (input) => {
    const file = localFileFromRuntimePath(typeof input === "string" ? input : input?.url);
    if (!fs.existsSync(file)) {
      return { ok: false, async json() { return null; } };
    }
    return { ok: true, async json() { return readJson(file); } };
  };
  vm.runInNewContext(source, {
    window: windowObject,
    console: { info() {}, warn() {}, error: console.error },
    Set,
    Map,
    Object,
    Array,
    JSON,
    String
  }, { filename: "quality-loader.js" });
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return {
    entries,
    resolveCanonicalId: windowObject.CTA_DATA_LOADER.resolveCanonicalId
  };
}

function buildImageMap(registry, resolveCanonicalId) {
  const formalStates = new Set(["reviewed", "verified"]);
  const direct = new Map();
  const inherited = [];
  for (const row of Array.isArray(registry?.items) ? registry.items : []) {
    if (!formalStates.has(row?.image_state) || row?.subject_match !== "matched" || row?.migration_state !== "promoted") continue;
    const id = text(row?.entry_id);
    const display = text(row?.primary?.display);
    if (!id || !display) continue;
    const item = {
      id,
      display: publicAsset(display),
      thumbnail: publicAsset(text(row?.primary?.thumbnail) || display),
      alt_ja: text(row?.alt_ja),
      alt_en: text(row?.alt_en),
      source: row?.source || {}
    };
    const resolved = resolveCanonicalId(id);
    if (resolved === id) direct.set(id, item);
    else inherited.push([resolved, item]);
  }
  for (const [resolved, item] of inherited) {
    if (resolved && !direct.has(resolved)) direct.set(resolved, { ...item, id: resolved });
  }
  return direct;
}

function buildOfferMap(affiliate, resolveCanonicalId) {
  const map = new Map();
  for (const offer of Array.isArray(affiliate?.offers) ? affiliate.offers : []) {
    if (offer?.status !== "active") continue;
    const id = resolveCanonicalId(text(offer?.entry_id));
    if (!id || map.has(id)) continue;
    map.set(id, { ...offer, entry_id: id });
  }
  return map;
}

function launchCohort(imageInventory, offerMap) {
  const ids = [];
  for (const row of Array.isArray(imageInventory?.lifecycle?.rows) ? imageInventory.lifecycle.rows : []) {
    const id = text(row?.id);
    if (!id || !offerMap.has(id)) continue;
    if (row?.stage === "promoted" || row?.stage === "not_required") ids.push(id);
  }
  return ids.sort((a, b) => a.localeCompare(b, "en"));
}

function renderList(items, lang) {
  if (!items.length) return "";
  return `<ul class="entryList" lang="${lang}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderAliases(aliases) {
  const ja = aliases.ja.length ? `<p lang="ja"><strong>日本語:</strong> ${aliases.ja.map(escapeHtml).join("、")}</p>` : "";
  const en = aliases.en.length ? `<p lang="en"><strong>English:</strong> ${aliases.en.map(escapeHtml).join(", ")}</p>` : "";
  if (!ja && !en) return "";
  return `<section class="entrySection"><h2>別名・呼び方 / Aliases</h2>${ja}${en}</section>`;
}

function renderRelated(entry, entryById, launchSet, resolveCanonicalId) {
  const ids = extractRelationIds(entry)
    .map(resolveCanonicalId)
    .filter((id) => id && id !== entry.id)
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 12);
  const rows = ids.map((id) => entryById.get(id)).filter(Boolean);
  if (!rows.length) return "";
  const items = rows.map((related) => {
    const ja = text(related?.term?.ja);
    const en = text(related?.term?.en);
    const href = launchSet.has(related.id) ? canonicalEntryUrl(related.id) : atlasDeepLink(related.id);
    return `<li><a href="${escapeHtml(href)}">${escapeHtml(ja || en || related.id)}${ja && en ? ` <span lang="en">/ ${escapeHtml(en)}</span>` : ""}</a></li>`;
  }).join("");
  return `<section class="entrySection"><h2>関連項目 / Related entries</h2><ul class="relatedList">${items}</ul></section>`;
}

function renderImage(image) {
  if (!image) return "";
  const attribution = text(image?.source?.attribution);
  const sourcePage = text(image?.source?.source_page);
  const license = text(image?.source?.license);
  const captionParts = [];
  if (attribution) captionParts.push(escapeHtml(attribution));
  if (license && !attribution.includes(license)) captionParts.push(escapeHtml(license));
  const caption = captionParts.join(" · ");
  const sourceLink = sourcePage
    ? ` <a href="${escapeHtml(sourcePage)}" target="_blank" rel="noopener">source</a>`
    : "";
  return `
    <figure class="heroImage">
      <img src="${escapeHtml(image.display)}" alt="${escapeHtml(image.alt_ja || image.alt_en)}" width="960" height="640" loading="eager" decoding="async">
      ${caption || sourceLink ? `<figcaption>${caption}${sourceLink}</figcaption>` : ""}
    </figure>`;
}

function renderAffiliate(entry, offer) {
  if (!offer) return "";
  return `
    <section class="entrySection commerceBox" aria-labelledby="commerceHeading"
      data-affiliate-entry="${escapeHtml(entry.id)}"
      data-affiliate-url="${escapeHtml(offer.amazon_url)}"
      data-affiliate-label-ja="${escapeHtml(offer.label_ja || "Amazonで探す")}"
      data-affiliate-label-en="${escapeHtml(offer.label_en || "Find on Amazon")}">
      <h2 id="commerceHeading">購入先を探す / Find products</h2>
      <p lang="ja">この項目に対応する管理済みの検索先です。価格・在庫・適合性・評価を保証するものではありません。</p>
      <p lang="en">This is a maintained commercial search destination for the identified canonical item. Price, stock, compatibility and ratings are not asserted here.</p>
      <div class="affiliateMount"></div>
      <div class="affiliateDisclosure"></div>
    </section>`;
}

function renderPage({ entry, image, offer, entryById, launchSet, resolveCanonicalId }) {
  const names = pair(entry, "term");
  const description = pair(entry, "description");
  const summary = pair(entry, "summary");
  const detail = pair(entry, "detail");
  const bullets = arrayPair(entry, "bullets");
  const examples = arrayPair(entry, "examples");
  const aliases = {
    ja: list(entry?.aliases?.ja || entry?.aliases_ja),
    en: list(entry?.aliases?.en || entry?.aliases_en)
  };
  const titleJa = names.ja || names.en || entry.id;
  const titleEn = names.en || names.ja || entry.id;
  const canonical = canonicalEntryUrl(entry.id);
  const atlasUrl = atlasDeepLink(entry.id);
  const primaryDescription = description.ja || summary.ja || description.en || summary.en;
  const metaDescription = truncate(`${titleJa}（${titleEn}）の意味・用途・英語名・関連情報を確認できるConstruction Tools Atlasの項目ページ。 ${primaryDescription}`);
  const socialImage = image
    ? `https://nicheworks.app${image.display}`
    : "https://nicheworks.app/assets/ogp.png";
  const socialTitle = `${titleJa} / ${titleEn} | Construction Tools Atlas`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "@id": canonical,
      "name": titleJa,
      "alternateName": unique([titleEn, ...aliases.ja, ...aliases.en]).slice(0, 20),
      "description": primaryDescription,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Construction Tools Atlas",
        "url": `${SITE_ROOT}/`
      },
      "url": canonical
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Construction Tools Atlas",
      "url": `${SITE_ROOT}/`,
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "All",
      "inLanguage": ["ja", "en"]
    }
  ];

  const taxonomy = unique([
    text(entry?.type),
    ...list(entry?.categories),
    ...list(entry?.tasks)
  ]).slice(0, 12);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${escapeHtml(titleJa)}（${escapeHtml(titleEn)}）とは？用途・英語名 | Construction Tools Atlas</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/seo-detail-v2.3.css">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${escapeHtml(socialTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(socialTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
  <meta name="twitter:image" content="${escapeHtml(socialImage)}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-57QT78M3JB');
  </script>
  <script type="application/ld+json">${escapeJson(jsonLd)}</script>
</head>
<body>
  <header class="detailHeader">
    <div class="detailHeader__inner">
      <a href="https://nicheworks.app/">NicheWorks</a>
      <a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a>
    </div>
  </header>

  <main class="detailMain">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a>
      <span aria-hidden="true">›</span>
      <span>${escapeHtml(titleJa)}</span>
    </nav>

    <article class="entryArticle">
      <header class="entryHero">
        <p class="eyebrow">${escapeHtml(text(entry?.type) || "dictionary entry")}</p>
        <h1>${escapeHtml(titleJa)}</h1>
        <p class="englishName" lang="en">${escapeHtml(titleEn)}</p>
        ${taxonomy.length ? `<div class="taxonomy">${taxonomy.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        <div class="heroActions">
          <a class="primaryAction" href="${escapeHtml(atlasUrl)}">Atlasで開く</a>
          <button type="button" class="copyLink" data-copy-url="${escapeHtml(canonical)}">リンクをコピー</button>
        </div>
      </header>

      ${renderImage(image)}

      <section class="entrySection">
        <h2>これは何？ / What is it?</h2>
        ${description.ja ? `<p lang="ja">${escapeHtml(description.ja)}</p>` : ""}
        ${description.en ? `<p lang="en">${escapeHtml(description.en)}</p>` : ""}
      </section>

      ${detail.ja || detail.en || bullets.ja.length || bullets.en.length ? `
      <section class="entrySection">
        <h2>用途・確認ポイント / Uses & key points</h2>
        ${detail.ja ? `<p lang="ja">${escapeHtml(detail.ja)}</p>` : ""}
        ${detail.en ? `<p lang="en">${escapeHtml(detail.en)}</p>` : ""}
        ${renderList(bullets.ja, "ja")}
        ${renderList(bullets.en, "en")}
      </section>` : ""}

      ${examples.ja.length || examples.en.length ? `
      <section class="entrySection">
        <h2>よく使われる場面 / Examples</h2>
        ${renderList(examples.ja, "ja")}
        ${renderList(examples.en, "en")}
      </section>` : ""}

      ${renderAliases(aliases)}
      ${renderRelated(entry, entryById, launchSet, resolveCanonicalId)}
      ${renderAffiliate(entry, offer)}

      <section class="entrySection atlasCta">
        <h2>名前が分からない工具を探す</h2>
        <p>Construction Tools Atlas本体では、日本語・英語・別名・用途・材料・作業内容から870件の公開canonicalを検索できます。</p>
        <a class="primaryAction" href="/tools/construction-tools-atlas/">Atlasを検索する</a>
      </section>
    </article>
  </main>

  <footer class="detailFooter">
    <p>© NicheWorks — Small Web Tools for Boring Tasks</p>
    <p>安全基準・法令・メーカー仕様は必ず公式資料をご確認ください。</p>
  </footer>

  <script src="/assets/amazon-affiliate.js"></script>
  <script src="/tools/construction-tools-atlas/seo-detail-v2.3.js"></script>
</body>
</html>
`;
}

function renderLaunchIndex(entryById, launchIds) {
  const items = launchIds.map((id) => {
    const entry = entryById.get(id);
    if (!entry) throw new Error(`${id}: missing from launch directory corpus`);
    const names = pair(entry, "term");
    if (!names.ja || !names.en) throw new Error(`${id}: missing bilingual name in launch directory`);
    return { id, ja: names.ja, en: names.en, url: canonicalEntryUrl(id) };
  });
  const heading = `建設工具・現場用語の公開詳細ページ（${items.length}件）`;
  const description = `Construction Tools Atlasで公開中の${items.length}件の工具・材料・現場用語の詳細ページを、日本語名と英語名から探せます。全項目の検索はAtlas本体をご利用ください。`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": heading,
    "url": INDEX_URL,
    "description": description,
    "inLanguage": ["ja", "en"],
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${item.ja} / ${item.en}`,
        "url": item.url
      }))
    }
  };
  const entryLinks = items.map((item) => `        <li><a href="${escapeHtml(item.url)}"><strong lang="ja">${escapeHtml(item.ja)}</strong><span lang="en">${escapeHtml(item.en)}</span></a></li>`).join("\n");
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${escapeHtml(heading)} | Construction Tools Atlas | NicheWorks</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${escapeHtml(INDEX_URL)}">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/seo-detail-v2.3.css">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/seo-index-v2.3.css">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${escapeHtml(heading)} | Construction Tools Atlas">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(INDEX_URL)}">
  <meta property="og:image" content="https://nicheworks.app/assets/ogp.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(heading)} | Construction Tools Atlas">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://nicheworks.app/assets/ogp.png">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-57QT78M3JB');
  </script>
  <script type="application/ld+json">${escapeJson(jsonLd)}</script>
</head>
<body>
  <header class="detailHeader">
    <div class="detailHeader__inner">
      <a href="https://nicheworks.app/">NicheWorks</a>
      <a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a>
    </div>
  </header>
  <main class="detailMain">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/tools/construction-tools-atlas/">Construction Tools Atlas</a>
      <span aria-hidden="true">›</span>
      <span>公開詳細ページ一覧 / Published entries</span>
    </nav>
    <article class="entryArticle">
      <header class="entryHero">
        <h1>${escapeHtml(heading)}</h1>
        <p lang="en">Published construction tool and site terminology entries</p>
      </header>
      <section class="entrySection">
        <p>${escapeHtml(description)}</p>
        <p lang="en">This directory lists the currently published detail pages, not every term in the interactive Atlas. Entries are listed by canonical ID, not by product ranking or recommendation.</p>
        <p><a href="/tools/construction-tools-atlas/">全項目をAtlasで検索 / Search the full Atlas</a></p>
        <ul class="cohortIndex">
${entryLinks}
        </ul>
      </section>
      <section class="entrySection">
        <h2>掲載対象 / Publication criteria</h2>
        <p>内容が日英で整備され、代表画像が検証済み（または明示的に不要）で、管理済みの購入先リンクがあるcanonicalのみ掲載しています。価格、在庫、メーカー適合性、ランキングを保証しません。</p>
        <p lang="en">Every listed entry has bilingual content, a verified representative image or an explicit image-not-required disposition, and a maintained commercial destination. No price, stock, compatibility, or product ranking is claimed.</p>
      </section>
    </article>
    <section class="entrySection supportSection">
      <p>このツールが役立ったら開発継続をご支援ください。</p>
      <p><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">OFUSE</a> / <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">Ko-fi</a></p>
    </section>
  </main>
  <footer class="detailFooter">
    <p>© NicheWorks — Small Web Tools for Boring Tasks</p>
    <p>安全基準・法令・メーカー仕様は公式資料をご確認ください。</p>
  </footer>
</body>
</html>
`;
}

function extractSitemapUrls(xml) {
  return [...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()).filter(Boolean);
}
function renderSitemap(existingXml, launchIds) {
  const retained = extractSitemapUrls(existingXml)
    .filter((url) => !url.startsWith(`${SITE_ROOT}/entries/`));
  const urls = unique([
    ...retained,
    INDEX_URL,
    ...launchIds.map(canonicalEntryUrl)
  ]);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${escapeHtml(url)}</loc>\n  </url>`).join("\n")}\n</urlset>\n`;
}

function renderRootSitemap(existingXml, launchIds) {
  const managedBlock = /\s*<url>\s*<loc>https:\/\/nicheworks\.app\/tools\/construction-tools-atlas\/entries\/[^<]*<\/loc>[\s\S]*?<\/url>\s*/g;
  const retained = String(existingXml || "").replace(managedBlock, "\n");
  const blocks = [
    `  <url>\n    <loc>${escapeHtml(INDEX_URL)}</loc>\n    <lastmod>2026-10-31</lastmod>\n  </url>`,
    ...launchIds.map((id) => `  <url>\n    <loc>${escapeHtml(canonicalEntryUrl(id))}</loc>\n    <lastmod>${ROOT_SITEMAP_LASTMOD}</lastmod>\n  </url>`)
  ].join("\n");
  if (!/<\/urlset>\s*$/.test(retained)) throw new Error("root sitemap is missing closing urlset");
  return retained.replace(/\s*<\/urlset>\s*$/, `\n${blocks}\n</urlset>\n`);
}

function writeOutput(baseDir, pages, indexHtml, manifest, sitemap, rootSitemap) {
  const entriesDir = path.join(baseDir, "entries");
  fs.rmSync(entriesDir, { recursive: true, force: true });
  for (const [id, html] of pages) {
    const dir = path.join(entriesDir, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  }
  fs.writeFileSync(path.join(entriesDir, "index.html"), indexHtml);
  const dataDir = path.join(baseDir, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "seo-detail-pages-v2.3.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(path.join(baseDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(ROOT_SITEMAP_PATH, rootSitemap);
}

function compareFile(expected, actualPath, label, failures) {
  if (!fs.existsSync(actualPath)) {
    failures.push(`${label}: missing`);
    return;
  }
  const actual = fs.readFileSync(actualPath, "utf8");
  if (actual !== expected) failures.push(`${label}: stale`);
}

async function main() {
  const [runtime, imageInventory, registry, affiliate, contentQuality, revenuePolicy] = await Promise.all([
    loadRuntimeEntries(),
    Promise.resolve(readJson(path.join(DATA, "public-image-inventory-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "image-registry-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "affiliate-offers-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "public-content-quality-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "revenue-priority-policy-v2.3.json")))
  ]);

  if (contentQuality?.summary?.public_entries !== runtime.entries.length) {
    throw new Error(`runtime/content-quality count mismatch: ${runtime.entries.length} vs ${contentQuality?.summary?.public_entries}`);
  }
  if (contentQuality?.summary?.runtime_fallback_dependent !== 0) {
    throw new Error("static SEO publication requires zero runtime fallback-dependent entries");
  }
  if (contentQuality?.summary?.fallback_independent_core !== runtime.entries.length ||
      contentQuality?.summary?.missing_core_bilingual_content !== 0) {
    throw new Error("static SEO publication requires fully complete bilingual core content");
  }

  const entryById = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  const offerMap = buildOfferMap(affiliate, runtime.resolveCanonicalId);
  const imageMap = buildImageMap(registry, runtime.resolveCanonicalId);
  const launchIds = launchCohort(imageInventory, offerMap);
  const launchSet = new Set(launchIds);

  const imageStageById = new Map();
  for (const row of imageInventory?.lifecycle?.rows || []) {
    const id = text(row?.id);
    if (!id) continue;
    if (imageStageById.has(id)) throw new Error(`${id}: duplicate public image inventory ID`);
    imageStageById.set(id, row.stage);
  }

  const pages = new Map();
  const titles = new Set();
  const canonicalUrls = new Set();
  for (const id of launchIds) {
    const entry = entryById.get(id);
    if (!entry) throw new Error(`${id}: launch cohort entry missing from runtime corpus`);
    if (runtime.resolveCanonicalId(id) !== id) {
      throw new Error(`${id}: redirect source must not receive a static canonical page`);
    }
    const imageStage = imageStageById.get(id);
    const image = imageMap.get(id) || null;
    if (imageStage === "promoted" && !image) {
      throw new Error(`${id}: promoted entry is missing its verified formal image`);
    }
    if (imageStage !== "promoted" && imageStage !== "not_required") {
      throw new Error(`${id}: not eligible for static SEO publication`);
    }
    for (const field of ["term", "description", "detail"]) {
      const bilingual = pair(entry, field);
      if (!bilingual.ja || !bilingual.en) {
        throw new Error(`${id}: bilingual ${field} is incomplete`);
      }
    }
    for (const field of ["bullets", "examples"]) {
      const bilingual = arrayPair(entry, field);
      if (!bilingual.ja.length || !bilingual.en.length) {
        throw new Error(`${id}: bilingual ${field} is incomplete`);
      }
    }
    const offer = offerMap.get(id);
    if (!offer?.amazon_url) throw new Error(`${id}: active maintained Amazon mapping is missing`);
    let destination;
    try { destination = new URL(offer.amazon_url); }
    catch { throw new Error(`${id}: invalid maintained Amazon destination`); }
    if (destination.protocol !== "https:" ||
        !["amazon.co.jp", "www.amazon.co.jp"].includes(destination.hostname) ||
        destination.searchParams.get("tag") !== "nicheworks09-22") {
      throw new Error(`${id}: Amazon destination violates provider/tracking contract`);
    }

    const html = renderPage({
      entry,
      image,
      offer,
      entryById,
      launchSet,
      resolveCanonicalId: runtime.resolveCanonicalId
    });
    const title = html.split("<title>")[1]?.split("</title>")[0];
    const canonical = canonicalEntryUrl(id);
    if (!title || titles.has(title)) throw new Error(`${id}: missing or duplicated SEO title`);
    if (canonicalUrls.has(canonical)) throw new Error(`${id}: duplicated canonical URL`);
    titles.add(title);
    canonicalUrls.add(canonical);
    pages.set(id, html);
  }

  const manifest = {
    schema: "cta-seo-detail-pages-v2.3",
    version: "2026-09-19-commerce-cohort-1",
    policy: {
      publication_scope: "revenue_ready_only",
      eligibility: "fallback-independent bilingual core + active maintained Amazon mapping + (promoted formal image OR explicit image not_required)",
      thin_mass_generation: false,
      raw_search_text_affiliate_forwarding: false,
      canonical_source: "runtime corpus produced by quality-loader.js"
    },
    sources: {
      revenue_priority_policy_version: revenuePolicy.version,
      public_content_quality_version: contentQuality.version,
      public_image_inventory_version: imageInventory.version,
      image_registry_version: registry.version,
      affiliate_offers_version: affiliate.version
    },
    summary: {
      public_runtime_entries: runtime.entries.length,
      published_static_detail_pages: launchIds.length,
      with_promoted_image: launchIds.filter((id) => imageMap.has(id)).length,
      image_not_required: launchIds.filter((id) => !imageMap.has(id)).length,
      with_active_affiliate_mapping: launchIds.filter((id) => offerMap.has(id)).length
    },
    entries: launchIds.map((id) => ({
      id,
      url: canonicalEntryUrl(id),
      image: imageMap.has(id) ? "promoted" : "not_required",
      affiliate: "active"
    }))
  };

  const indexHtml = renderLaunchIndex(entryById, launchIds);
  const sitemap = renderSitemap(fs.readFileSync(SITEMAP_PATH, "utf8"), launchIds);
  const rootSitemap = renderRootSitemap(fs.readFileSync(ROOT_SITEMAP_PATH, "utf8"), launchIds);

  if (args.has("--check")) {
    const failures = [];
    for (const [id, html] of pages) {
      compareFile(html, path.join(ENTRIES_DIR, id, "index.html"), `entries/${id}/index.html`, failures);
    }
    compareFile(indexHtml, INDEX_PATH, "entries/index.html", failures);
    const atlasHome = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    if (!atlasHome.includes(`href="/tools/construction-tools-atlas/entries/"`)) {
      failures.push("Atlas home is missing the public static entry directory link");
    }
    const actualDirs = fs.existsSync(ENTRIES_DIR)
      ? fs.readdirSync(ENTRIES_DIR, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort()
      : [];
    if (JSON.stringify(actualDirs) !== JSON.stringify(launchIds)) {
      failures.push(`entries directory set mismatch: actual=${actualDirs.length}, expected=${launchIds.length}`);
    }
    compareFile(JSON.stringify(manifest, null, 2) + "\n", MANIFEST_PATH, "data/seo-detail-pages-v2.3.json", failures);
    compareFile(sitemap, SITEMAP_PATH, "sitemap.xml", failures);
    compareFile(rootSitemap, ROOT_SITEMAP_PATH, "../../sitemap.xml", failures);
    if (failures.length) {
      console.error("Construction Tools Atlas static SEO detail pages v2.3: FAIL");
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exit(1);
    }
    console.log(`CTA_SEO_DETAIL_SUMMARY=${JSON.stringify(manifest.summary)}`);
    console.log("Construction Tools Atlas static SEO detail pages v2.3: PASS");
    return;
  }

  writeOutput(ROOT, pages, indexHtml, manifest, sitemap, rootSitemap);
  console.log(`Wrote ${launchIds.length} static SEO detail pages.`);
  console.log(`CTA_SEO_DETAIL_SUMMARY=${JSON.stringify(manifest.summary)}`);
}

main().catch((error) => {
  console.error("Construction Tools Atlas static SEO detail pages v2.3: FAIL");
  console.error(`- ${error.message}`);
  process.exit(1);
});
