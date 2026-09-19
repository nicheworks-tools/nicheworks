#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const COMPARE_DIR = path.join(ROOT, "compare");
const MANIFEST_PATH = path.join(DATA, "comparison-pages-v2.3.json");
const TOOL_SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const ROOT_SITEMAP_PATH = path.resolve(ROOT, "..", "..", "sitemap.xml");
const SITE_ROOT = "https://nicheworks.app/tools/construction-tools-atlas";
const ROOT_SITEMAP_LASTMOD = "2026-09-19";
const args = new Set(process.argv.slice(2));

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function text(value) { return typeof value === "string" ? value.trim() : ""; }
function list(value) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeJson(value) { return JSON.stringify(value).replaceAll("<", "\\u003c"); }
function truncate(value, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, Math.max(1, max - 1)).replace(/[\s、。,.!?！？]+$/u, "") + "…";
}
function publicAsset(relative) {
  const clean = String(relative || "").replace(/^\.\//, "");
  return `/tools/construction-tools-atlas/${clean}`;
}
function comparisonUrl(id) {
  return `${SITE_ROOT}/compare/${encodeURIComponent(id)}/`;
}
function entryUrl(id) {
  return `${SITE_ROOT}/entries/${encodeURIComponent(id)}/`;
}
function atlasDeepLink(id) {
  return `${SITE_ROOT}/?entry=${encodeURIComponent(id)}`;
}
function localFileFromRuntimePath(runtimePath) {
  const clean = String(runtimePath || "").replace(/[?#].*$/, "").replace(/^\.\//, "");
  return path.resolve(ROOT, clean);
}

async function loadRuntimeEntries() {
  const source = fs.readFileSync(path.join(DATA, "quality-loader.js"), "utf8");
  const windowObject = {
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
  };
  windowObject.fetch = async (input) => {
    const file = localFileFromRuntimePath(typeof input === "string" ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  vm.runInNewContext(source, {
    window: windowObject,
    console: { info() {}, warn() {}, error: console.error },
    Set, Map, Object, Array, JSON, String
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

function canonicalPair(pair, resolveCanonicalId) {
  return {
    ...pair,
    left_id: resolveCanonicalId(text(pair?.left_id)),
    right_id: resolveCanonicalId(text(pair?.right_id))
  };
}

function renderImage(image, entryName) {
  if (!image) return `<div class="detailImageMissing">Reviewed image not available.</div>`;
  return `<img src="${escapeHtml(image.display)}" alt="${escapeHtml(image.alt_ja || image.alt_en || entryName)}" width="720" height="540" loading="eager" decoding="async">`;
}

function renderAffiliate(entry, offer, side) {
  return `
    <section class="entrySection commerceBox"
      data-affiliate-entry="${escapeHtml(entry.id)}"
      data-affiliate-url="${escapeHtml(offer.amazon_url)}"
      data-affiliate-label-ja="${escapeHtml(offer.label_ja || "Amazonで探す")}"
      data-affiliate-label-en="${escapeHtml(offer.label_en || "Find on Amazon")}"
      data-affiliate-placement="comparison_${escapeHtml(side)}">
      <h2>${escapeHtml(text(entry?.term?.ja) || entry.id)}を探す</h2>
      <p lang="ja">このcanonicalに対応する管理済みAmazon検索先です。価格・在庫・適合性・評価を保証するものではありません。</p>
      <p lang="en">This is the maintained Amazon search destination for this canonical. Price, stock, compatibility, and ratings are not asserted here.</p>
      <div class="affiliateMount"></div>
      <div class="affiliateDisclosure"></div>
    </section>`;
}

function renderPage({ pair, left, right, leftImage, rightImage, leftOffer, rightOffer }) {
  const canonical = comparisonUrl(pair.id);
  const titleJa = text(pair.title_ja);
  const titleEn = text(pair.title_en);
  const summaryJa = text(pair.summary_ja);
  const summaryEn = text(pair.summary_en);
  const metaDescription = truncate(`${titleJa}。Construction Tools Atlasのreviewed canonical本文に基づき、用途・力の出し方・代表的な使用場面を比較。 ${summaryJa}`);
  const socialImage = leftImage ? `https://nicheworks.app${leftImage.display}` : "https://nicheworks.app/assets/ogp.png";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical,
      "url": canonical,
      "name": titleJa,
      "description": summaryJa,
      "inLanguage": ["ja", "en"]
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

  const dimensions = Array.isArray(pair.dimensions) ? pair.dimensions : [];
  const rows = dimensions.map((dimension) => `
      <tr>
        <th scope="row">${escapeHtml(dimension.label_ja)}<br><span lang="en">${escapeHtml(dimension.label_en)}</span></th>
        <td><p lang="ja">${escapeHtml(dimension.left_ja)}</p><p lang="en">${escapeHtml(dimension.left_en)}</p></td>
        <td><p lang="ja">${escapeHtml(dimension.right_ja)}</p><p lang="en">${escapeHtml(dimension.right_en)}</p></td>
      </tr>`).join("");

  const leftJa = text(left?.term?.ja) || left.id;
  const leftEn = text(left?.term?.en);
  const rightJa = text(right?.term?.ja) || right.id;
  const rightEn = text(right?.term?.en);
  const leftDesc = text(left?.description?.ja || left?.description_ja || left?.summary?.ja || left?.summary_ja);
  const rightDesc = text(right?.description?.ja || right?.description_ja || right?.summary?.ja || right?.summary_ja);
  const leftDescEn = text(left?.description?.en || left?.description_en || left?.summary?.en || left?.summary_en);
  const rightDescEn = text(right?.description?.en || right?.description_en || right?.summary?.en || right?.summary_en);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${escapeHtml(titleJa)} | Construction Tools Atlas</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="/tools/construction-tools-atlas/seo-detail-v2.3.css">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${escapeHtml(titleJa)} / ${escapeHtml(titleEn)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(titleJa)} / ${escapeHtml(titleEn)}">
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
      <span>比較</span>
      <span aria-hidden="true">›</span>
      <span>${escapeHtml(titleJa)}</span>
    </nav>

    <article class="entryArticle">
      <header class="entryHero">
        <p class="eyebrow">reviewed comparison</p>
        <h1>${escapeHtml(titleJa)}</h1>
        <p class="englishName" lang="en">${escapeHtml(titleEn)}</p>
        <p lang="ja">${escapeHtml(summaryJa)}</p>
        <p lang="en">${escapeHtml(summaryEn)}</p>
      </header>

      <section class="entrySection">
        <h2>2つのcanonical / Canonical entries</h2>
        <div class="compareGrid">
          <article class="compareCard">
            ${renderImage(leftImage, leftJa)}
            <div class="compareCard__body">
              <h2>${escapeHtml(leftJa)}</h2>
              <p lang="en">${escapeHtml(leftEn)}</p>
              <p lang="ja">${escapeHtml(leftDesc)}</p>
              <p lang="en">${escapeHtml(leftDescEn)}</p>
              <div class="compareLinks">
                <a class="compareLink" href="${escapeHtml(entryUrl(left.id))}">詳細ページ</a>
                <a class="compareLink" href="${escapeHtml(atlasDeepLink(left.id))}">Atlasで開く</a>
              </div>
            </div>
          </article>
          <article class="compareCard">
            ${renderImage(rightImage, rightJa)}
            <div class="compareCard__body">
              <h2>${escapeHtml(rightJa)}</h2>
              <p lang="en">${escapeHtml(rightEn)}</p>
              <p lang="ja">${escapeHtml(rightDesc)}</p>
              <p lang="en">${escapeHtml(rightDescEn)}</p>
              <div class="compareLinks">
                <a class="compareLink" href="${escapeHtml(entryUrl(right.id))}">詳細ページ</a>
                <a class="compareLink" href="${escapeHtml(atlasDeepLink(right.id))}">Atlasで開く</a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="entrySection">
        <h2>違いを項目別に見る / Side-by-side differences</h2>
        <div class="compareTableWrap">
          <table class="compareTable">
            <thead>
              <tr>
                <th>比較項目 / Dimension</th>
                <th>${escapeHtml(leftJa)}<br><span lang="en">${escapeHtml(leftEn)}</span></th>
                <th>${escapeHtml(rightJa)}<br><span lang="en">${escapeHtml(rightEn)}</span></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>

      <section class="entrySection">
        <h2>比較の根拠 / Evidence basis</h2>
        <p lang="ja">この比較はConstruction Tools Atlasのreviewed pair ledgerと、現在の各canonical本文に基づきます。商品ランキング、価格、在庫、互換性の判断は行いません。</p>
        <p lang="en">This comparison is based on the reviewed pair ledger and the current canonical content. It does not rank products or assert price, stock, or compatibility.</p>
      </section>

      ${renderAffiliate(left, leftOffer, "left")}
      ${renderAffiliate(right, rightOffer, "right")}

      <section class="entrySection atlasCta">
        <h2>Atlasで他の工具も探す</h2>
        <p>Construction Tools Atlasでは、日本語・英語・別名・用途・材料・作業内容から870件の公開canonicalを検索できます。</p>
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

function extractSitemapUrls(xml) {
  return [...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()).filter(Boolean);
}
function renderToolSitemap(existingXml, pairIds) {
  const retained = extractSitemapUrls(existingXml)
    .filter((url) => !url.startsWith(`${SITE_ROOT}/compare/`));
  const urls = unique([...retained, ...pairIds.map(comparisonUrl)]);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${escapeHtml(url)}</loc>\n  </url>`).join("\n")}\n</urlset>\n`;
}
function renderRootSitemap(existingXml, pairIds) {
  const managedBlock = /\s*<url>\s*<loc>https:\/\/nicheworks\.app\/tools\/construction-tools-atlas\/compare\/[^<]+<\/loc>[\s\S]*?<\/url>\s*/g;
  const retained = String(existingXml || "").replace(managedBlock, "\n");
  const blocks = pairIds.map((id) => `  <url>\n    <loc>${escapeHtml(comparisonUrl(id))}</loc>\n    <lastmod>${ROOT_SITEMAP_LASTMOD}</lastmod>\n  </url>`).join("\n");
  if (!/<\/urlset>\s*$/.test(retained)) throw new Error("root sitemap is missing closing urlset");
  return retained.replace(/\s*<\/urlset>\s*$/, `\n${blocks}\n</urlset>\n`);
}
function compareFile(expected, actualPath, label, failures) {
  if (!fs.existsSync(actualPath)) { failures.push(`${label}: missing`); return; }
  const actual = fs.readFileSync(actualPath, "utf8");
  if (actual !== expected) failures.push(`${label}: stale`);
}

async function main() {
  const [runtime, ledger, detailManifest, registry, affiliate] = await Promise.all([
    loadRuntimeEntries(),
    Promise.resolve(readJson(path.join(DATA, "comparison-pairs-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "seo-detail-pages-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "image-registry-v2.3.json"))),
    Promise.resolve(readJson(path.join(DATA, "affiliate-offers-v2.3.json")))
  ]);

  if (ledger?.schema !== "cta-comparison-pairs-v2.3") throw new Error("unexpected comparison pair schema");
  const entryById = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  const detailReady = new Set((detailManifest?.entries || []).map((row) => text(row?.id)));
  const imageMap = buildImageMap(registry, runtime.resolveCanonicalId);
  const offerMap = buildOfferMap(affiliate, runtime.resolveCanonicalId);

  const pairs = [];
  const seenPairIds = new Set();
  const seenUnordered = new Set();
  for (const raw of Array.isArray(ledger?.pairs) ? ledger.pairs : []) {
    if (raw?.state !== "reviewed") continue;
    const pair = canonicalPair(raw, runtime.resolveCanonicalId);
    if (!pair.id || !pair.left_id || !pair.right_id || pair.left_id === pair.right_id) throw new Error("invalid reviewed comparison pair");
    if (seenPairIds.has(pair.id)) throw new Error(`${pair.id}: duplicate pair id`);
    seenPairIds.add(pair.id);
    const unordered = [pair.left_id, pair.right_id].sort().join("::");
    if (seenUnordered.has(unordered)) throw new Error(`${pair.id}: duplicate unordered canonical pair`);
    seenUnordered.add(unordered);

    for (const id of [pair.left_id, pair.right_id]) {
      if (!entryById.has(id)) throw new Error(`${pair.id}: missing canonical ${id}`);
      if (!detailReady.has(id)) throw new Error(`${pair.id}: comparison requires published static detail page for ${id}`);
      if (!imageMap.has(id)) throw new Error(`${pair.id}: comparison requires promoted formal image for ${id}`);
      if (!offerMap.has(id)) throw new Error(`${pair.id}: comparison requires active maintained affiliate mapping for ${id}`);
    }
    if (!Array.isArray(pair.dimensions) || pair.dimensions.length < 3) throw new Error(`${pair.id}: at least 3 reviewed comparison dimensions are required`);
    pairs.push(pair);
  }
  pairs.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const pages = new Map();
  for (const pair of pairs) {
    pages.set(pair.id, renderPage({
      pair,
      left: entryById.get(pair.left_id),
      right: entryById.get(pair.right_id),
      leftImage: imageMap.get(pair.left_id),
      rightImage: imageMap.get(pair.right_id),
      leftOffer: offerMap.get(pair.left_id),
      rightOffer: offerMap.get(pair.right_id)
    }));
  }

  const pairIds = pairs.map((pair) => pair.id);
  const manifest = {
    schema: "cta-comparison-pages-v2.3",
    version: "2026-09-19-reviewed-pairs-1",
    policy: {
      publication: "explicit reviewed pairs only",
      source: "comparison-pairs-v2.3.json + current canonical runtime corpus",
      arbitrary_all_to_all: false,
      commercial_ranking_claims: false,
      raw_search_text_affiliate_forwarding: false
    },
    summary: {
      reviewed_pairs: pairs.length,
      published_comparison_pages: pages.size,
      canonicals_in_pairs: new Set(pairs.flatMap((pair) => [pair.left_id, pair.right_id])).size
    },
    pages: pairs.map((pair) => ({
      id: pair.id,
      left_id: pair.left_id,
      right_id: pair.right_id,
      url: comparisonUrl(pair.id)
    }))
  };

  const toolSitemap = renderToolSitemap(fs.readFileSync(TOOL_SITEMAP_PATH, "utf8"), pairIds);
  const rootSitemap = renderRootSitemap(fs.readFileSync(ROOT_SITEMAP_PATH, "utf8"), pairIds);

  if (args.has("--check")) {
    const failures = [];
    for (const [id, html] of pages) compareFile(html, path.join(COMPARE_DIR, id, "index.html"), `compare/${id}/index.html`, failures);
    const actualDirs = fs.existsSync(COMPARE_DIR)
      ? fs.readdirSync(COMPARE_DIR, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort()
      : [];
    if (JSON.stringify(actualDirs) !== JSON.stringify(pairIds)) failures.push(`compare directory set mismatch: actual=${actualDirs.length}, expected=${pairIds.length}`);
    compareFile(JSON.stringify(manifest, null, 2) + "\n", MANIFEST_PATH, "data/comparison-pages-v2.3.json", failures);
    compareFile(toolSitemap, TOOL_SITEMAP_PATH, "sitemap.xml", failures);
    compareFile(rootSitemap, ROOT_SITEMAP_PATH, "../../sitemap.xml", failures);
    if (failures.length) {
      console.error("Construction Tools Atlas comparison pages v2.3: FAIL");
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exit(1);
    }
    console.log(`CTA_COMPARISON_SUMMARY=${JSON.stringify(manifest.summary)}`);
    console.log("Construction Tools Atlas comparison pages v2.3: PASS");
    return;
  }

  fs.rmSync(COMPARE_DIR, { recursive: true, force: true });
  for (const [id, html] of pages) {
    const dir = path.join(COMPARE_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(TOOL_SITEMAP_PATH, toolSitemap);
  fs.writeFileSync(ROOT_SITEMAP_PATH, rootSitemap);
  console.log(`Wrote ${pages.size} reviewed comparison pages.`);
  console.log(`CTA_COMPARISON_SUMMARY=${JSON.stringify(manifest.summary)}`);
}

main().catch((error) => {
  console.error("Construction Tools Atlas comparison pages v2.3: FAIL");
  console.error(`- ${error.message}`);
  process.exit(1);
});
