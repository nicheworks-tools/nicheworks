#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const LOADER = path.join(DATA, "quality-loader.js");
const COHORT = path.join(DATA, "seo-launch-cohort-v2.3.json");
const REGISTRY = path.join(DATA, "image-registry-v2.3.json");
const PUBLIC_IMAGE = path.join(DATA, "public-image-inventory-v2.3.json");
const AFFILIATE = path.join(DATA, "affiliate-offers-v2.3.json");
const CONTENT_QUALITY = path.join(DATA, "public-content-quality-v2.3.json");
const GLOSSARY = path.join(ROOT, "glossary");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const ROOT_SITEMAP = path.resolve(ROOT, "..", "..", "sitemap.xml");
const args = new Set(process.argv.slice(2));

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function text(v) { return typeof v === "string" ? v.trim() : ""; }
function list(v) { return Array.isArray(v) ? v.map(String).map(x => x.trim()).filter(Boolean) : []; }
function uniq(v) { return [...new Set(v.filter(Boolean))]; }
function esc(v) { return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function jsonEsc(v) { return JSON.stringify(v).replace(/</g, "\\u003c"); }
function localFile(runtimePath) {
  const clean = String(runtimePath || "").replace(/[?#].*$/, "").replace(/^\.\//, "");
  return path.resolve(ROOT, clean);
}
function requireValue(condition, message) { if (!condition) throw new Error(message); }
function trimDescription(value, max = 155) {
  const flat = String(value || "").replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : flat.slice(0, max - 1).trimEnd() + "…";
}
function relationIds(raw) {
  const candidates = [
    raw?.related, raw?.related_ids, raw?.similar, raw?.similar_ids, raw?.used_with, raw?.used_with_ids,
    raw?.often_confused_with, raw?.often_confused_with_ids,
    raw?.relationships?.related, raw?.relationships?.similar, raw?.relationships?.used_with,
    raw?.relationships?.often_confused_with, raw?.meta?.related, raw?.meta?.used_with
  ];
  const ids = [];
  for (const c of candidates) if (Array.isArray(c)) for (const item of c) {
    const id = typeof item === "string" ? item : text(item?.id || item?.entry_id || item?.target);
    if (id) ids.push(id);
  }
  return uniq(ids);
}

async function loadRuntimeEntries() {
  const source = fs.readFileSync(LOADER, "utf8");
  const windowObject = {
    localStorage: { getItem() { return null; }, setItem() {} }
  };
  windowObject.fetch = async (input) => {
    const file = localFile(typeof input === "string" ? input : input?.url);
    if (!fs.existsSync(file)) return { ok:false, async json(){ return null; } };
    return { ok:true, async json(){ return readJson(file); } };
  };
  const documentStub = {
    addEventListener() {}, getElementById(){ return null; }, querySelector(){ return null; },
    createElement(){ return { setAttribute(){}, defer:false, src:"" }; }, head:{ appendChild(){} }
  };
  vm.runInNewContext(source, {
    window: windowObject, document: documentStub,
    console:{ info(){}, warn(){}, error:console.error }, Set, Map
  }, { filename:"quality-loader.js" });
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return {
    entries,
    resolveId: (id) => windowObject.CTA_DATA_LOADER.resolveCanonicalId(id)
  };
}

function buildImageMap(registry, publicImage) {
  const map = new Map();
  for (const item of Array.isArray(registry?.items) ? registry.items : []) map.set(text(item.entry_id), item);
  for (const row of Array.isArray(publicImage?.inherited_formal_images) ? publicImage.inherited_formal_images : []) {
    const from = text(row?.from), to = text(row?.to);
    if (from && to && !map.has(to) && map.has(from)) map.set(to, map.get(from));
  }
  return map;
}

function pairSection(title, ja, en) {
  if (!text(ja) && !text(en)) return "";
  return `<section class="section">
    <h2>${esc(title)}</h2>
    ${text(ja) ? `<div class="langBlock" lang="ja"><span class="langLabel">日本語</span><p>${esc(ja)}</p></div>` : ""}
    ${text(en) ? `<div class="langBlock" lang="en"><span class="langLabel">English</span><p>${esc(en)}</p></div>` : ""}
  </section>`;
}
function listSection(title, jaItems, enItems) {
  const ja = list(jaItems), en = list(enItems);
  if (!ja.length && !en.length) return "";
  const render = (items, lang, label) => items.length ? `<div class="langBlock" lang="${lang}"><span class="langLabel">${label}</span><ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
  return `<section class="section"><h2>${esc(title)}</h2>${render(ja,"ja","日本語")}${render(en,"en","English")}</section>`;
}

function pageHtml({entry, slug, image, offer, related, slugById}) {
  const ja = text(entry?.term?.ja || entry?.ja);
  const en = text(entry?.term?.en || entry?.en);
  const summaryJa = text(entry?.summary?.ja || entry?.summary_ja || entry?.description?.ja || entry?.description_ja);
  const summaryEn = text(entry?.summary?.en || entry?.summary_en || entry?.description?.en || entry?.description_en);
  const detailJa = text(entry?.detail_ja || entry?.detail?.ja);
  const detailEn = text(entry?.detail_en || entry?.detail?.en);
  const bulletsJa = list(entry?.bullets_ja || entry?.bullets?.ja);
  const bulletsEn = list(entry?.bullets_en || entry?.bullets?.en);
  const examplesJa = list(entry?.examples?.ja || entry?.examples_ja);
  const examplesEn = list(entry?.examples?.en || entry?.examples_en);
  const aliasesJa = list(entry?.aliases?.ja || entry?.aliases_ja);
  const aliasesEn = list(entry?.aliases?.en || entry?.aliases_en);
  const categories = uniq([...list(entry?.categories), ...list(entry?.tasks)]).slice(0,10);
  const url = `https://nicheworks.app/tools/construction-tools-atlas/glossary/${slug}/`;
  const atlasUrl = `https://nicheworks.app/tools/construction-tools-atlas/?entry=${encodeURIComponent(entry.id)}`;
  const title = `${ja}とは？用途・英語名｜${en} | NicheWorks`;
  const description = trimDescription(`${ja}（${en}）の意味・用途・現場での使い方を建設工具・現場用語辞典で確認。 ${summaryJa}`);
  const imageUrl = image?.primary?.display ? `https://nicheworks.app/tools/construction-tools-atlas/${String(image.primary.display).replace(/^\.\//,"")}` : "";
  const relatedHtml = related.length ? `<section class="section"><h2>関連項目 / Related</h2><div class="relatedList">${related.map(item=>{
    const rs = slugById.get(item.id);
    const href = rs ? `../${rs}/` : `../../?entry=${encodeURIComponent(item.id)}`;
    return `<a href="${esc(href)}">${esc(text(item.term?.ja))} <span lang="en">/ ${esc(text(item.term?.en))}</span></a>`;
  }).join("")}</div></section>` : "";
  const aliases = (aliasesJa.length || aliasesEn.length) ? `<section class="section"><h2>別名・呼び方 / Aliases</h2>
    ${aliasesJa.length ? `<div class="langBlock" lang="ja"><span class="langLabel">日本語</span><div class="chips">${aliasesJa.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div></div>` : ""}
    ${aliasesEn.length ? `<div class="langBlock" lang="en"><span class="langLabel">English</span><div class="chips">${aliasesEn.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div></div>` : ""}
  </section>` : "";
  const heroImage = imageUrl ? `<figure class="heroImage"><img src="${esc(imageUrl)}" alt="${esc(image.alt_ja || ja)}" width="960" loading="eager" decoding="async"><figcaption>${esc(image.source?.attribution || "")}</figcaption></figure>` : "";
  const schema = {
    "@context":"https://schema.org",
    "@type":"DefinedTerm",
    name:ja,
    alternateName:en,
    description:summaryJa,
    url,
    inDefinedTermSet:{
      "@type":"DefinedTermSet",
      name:"Construction Tools Atlas",
      url:"https://nicheworks.app/tools/construction-tools-atlas/"
    }
  };
  if (imageUrl) schema.image = imageUrl;
  const affiliateScript = `<script src="/assets/amazon-affiliate.js"></script>
<script>
(() => {
  const helper = window.NWAmazonAffiliate;
  const mount = document.getElementById("affiliateMount");
  const disclosure = document.getElementById("affiliateDisclosure");
  if (!helper || !mount) return;
  helper.configure({ enabled:true, tool:"construction-tools-atlas", targets:{ ${jsonEsc(entry.id)}:${jsonEsc(offer.amazon_url)} } });
  helper.mount({ container:mount, target:${jsonEsc(entry.id)}, label:${jsonEsc(offer.label_ja)}, placement:"seo_detail", destinationKey:${jsonEsc(entry.id)} });
  helper.renderDisclosure(disclosure, { includeEnglish:true });
})();
<\/script>`;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <link rel="icon" href="/assets/favicon.ico">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  ${imageUrl ? `<meta property="og:image" content="${esc(imageUrl)}">` : `<meta property="og:image" content="https://nicheworks.app/assets/ogp.png">`}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(imageUrl || "https://nicheworks.app/assets/ogp.png")}">
  <link rel="stylesheet" href="../../seo-detail-v2.3.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-57QT78M3JB");<\/script>
  <script type="application/ld+json">${jsonEsc(schema)}<\/script>
</head>
<body>
  <!-- generated by build-seo-detail-pages-v2.3.cjs; do not edit directly -->
  <header class="glossaryHeader"><div class="glossaryHeader__inner"><a class="brand" href="https://nicheworks.app/">NicheWorks</a><a class="atlasLink" href="../../">Construction Tools Atlas</a></div></header>
  <main class="glossaryMain">
    <p class="breadcrumbs"><a href="../../">建設工具・現場用語辞典</a> / ${esc(ja)}</p>
    <article>
      <section class="hero ${imageUrl ? "" : "noImage"}">
        <div>
          <p class="eyebrow">${esc(text(entry.type) || "dictionary entry")}</p>
          <h1 lang="ja">${esc(ja)}</h1>
          <p class="enName" lang="en">${esc(en)}</p>
          <p class="summary" lang="ja">${esc(summaryJa)}</p>
          ${summaryEn ? `<p class="summary" lang="en">${esc(summaryEn)}</p>` : ""}
          ${categories.length ? `<div class="chips">${categories.map(x=>`<span class="chip">${esc(x)}</span>`).join("")}</div>` : ""}
        </div>
        ${heroImage}
      </section>
      <div class="contentGrid">
        <div class="mainColumn">
          ${pairSection("これは何？ / What is it?", detailJa || summaryJa, detailEn || summaryEn)}
          ${listSection("主なポイント / Key points", bulletsJa, bulletsEn)}
          ${listSection("よく使われる場面 / Examples", examplesJa, examplesEn)}
          ${aliases}
          ${relatedHtml}
        </div>
        <aside class="sideColumn">
          <section class="commerce">
            <h2>購入先を探す / Find products</h2>
            <p lang="ja">この項目には管理済みのAmazon検索リンクがあります。価格・在庫・適合性を保証するものではありません。</p>
            <div id="affiliateMount" class="amazonMount"></div>
            <noscript><a href="${esc(offer.amazon_url)}" target="_blank" rel="sponsored noopener">${esc(offer.label_ja)}</a></noscript>
            <div id="affiliateDisclosure" class="disclosure"></div>
          </section>
          <section class="section">
            <h2>Atlasで開く</h2>
            <p>検索・関連項目・お気に入り・共有機能はAtlas本体で利用できます。</p>
            <a class="atlasCta" href="${esc(atlasUrl)}">Construction Tools Atlasで開く</a>
          </section>
          <section class="support">
            <h2>Support</h2>
            <div class="supportLinks"><a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a><a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a></div>
          </section>
        </aside>
      </div>
    </article>
  </main>
  <footer class="glossaryFooter"><div class="glossaryFooter__inner"><p>© NicheWorks — Small Web Tools for Boring Tasks</p><p>掲載情報の正確性は保証しません。安全基準・法令・施工仕様・製品仕様は必ず公式情報をご確認ください。</p></div></footer>
  ${affiliateScript}
</body>
</html>
`;
}

function sitemapWithGlossary(current, entries, options = {}) {
  const start = "  <!-- GENERATED_CTA_GLOSSARY_START -->";
  const end = "  <!-- GENERATED_CTA_GLOSSARY_END -->";
  const lastmod = options.lastmod ? `\n    <lastmod>${esc(options.lastmod)}</lastmod>` : "";
  const urls = entries.map(({slug}) => `  <url>\n    <loc>https://nicheworks.app/tools/construction-tools-atlas/glossary/${slug}/</loc>${lastmod}\n  </url>`).join("\n");
  const block = `${start}\n${urls}\n${end}`;
  const legacyStart = "  <!-- GENERATED_GLOSSARY_START -->";
  const legacyEnd = "  <!-- GENERATED_GLOSSARY_END -->";
  if (current.includes(start) && current.includes(end)) {
    return current.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
  }
  if (current.includes(legacyStart) && current.includes(legacyEnd)) {
    return current.replace(new RegExp(`${legacyStart}[\\s\\S]*?${legacyEnd}`), block);
  }
  return current.replace(/\s*<\/urlset>\s*$/, `\n${block}\n</urlset>\n`);
}

async function build() {
  const cohort = readJson(COHORT);
  requireValue(cohort?.schema === "cta-seo-launch-cohort-v2.3", "unexpected cohort schema");
  const cohortRows = Array.isArray(cohort.entries) ? cohort.entries : [];
  requireValue(cohortRows.length > 0, "cohort is empty");
  const seenIds = new Set(), seenSlugs = new Set();
  for (const row of cohortRows) {
    requireValue(text(row.id), "cohort row missing id");
    requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(row.slug)), `${row.id}: invalid slug`);
    requireValue(!seenIds.has(row.id), `${row.id}: duplicate cohort id`);
    requireValue(!seenSlugs.has(row.slug), `${row.slug}: duplicate cohort slug`);
    seenIds.add(row.id); seenSlugs.add(row.slug);
  }

  const [{entries, resolveId}, registry, publicImage, affiliate, quality] = await Promise.all([
    loadRuntimeEntries(), Promise.resolve(readJson(REGISTRY)), Promise.resolve(readJson(PUBLIC_IMAGE)),
    Promise.resolve(readJson(AFFILIATE)), Promise.resolve(readJson(CONTENT_QUALITY))
  ]);
  requireValue(quality?.summary?.runtime_fallback_dependent === 0, "SEO cohort requires zero runtime fallback-dependent public entries");
  requireValue(quality?.summary?.missing_core_bilingual_content === 0, "SEO cohort requires zero missing bilingual core entries");

  const byId = new Map(entries.map(e => [text(e.id), e]));
  const lifecycle = new Map((publicImage?.lifecycle?.rows || []).map(r => [text(r.id), r]));
  const images = buildImageMap(registry, publicImage);
  const offers = new Map((affiliate?.offers || []).filter(o => o.status === "active").map(o => [text(o.entry_id), o]));
  const slugById = new Map(cohortRows.map(r => [r.id, r.slug]));
  const expected = new Map();

  for (const row of cohortRows) {
    const entry = byId.get(row.id);
    const life = lifecycle.get(row.id);
    const offer = offers.get(row.id);
    requireValue(entry, `${row.id}: cohort target missing from runtime corpus`);
    requireValue(life, `${row.id}: missing public image lifecycle row`);
    requireValue(offer, `${row.id}: cohort target lacks active affiliate mapping`);
    requireValue(life.stage === "promoted" || life.stage === "not_required", `${row.id}: cohort target is not image-ready (${life.stage})`);
    const image = images.get(row.id) || null;
    if (life.stage === "promoted") requireValue(image?.primary?.display, `${row.id}: promoted cohort target lacks formal image`);
    const related = relationIds(entry).map(resolveId).filter(id => id && id !== row.id).map(id => byId.get(id)).filter(Boolean).slice(0,12);
    const html = pageHtml({entry, slug:row.slug, image, offer, related, slugById});
    expected.set(path.join(GLOSSARY, row.slug, "index.html"), html);
  }

  const currentSitemap = fs.readFileSync(SITEMAP, "utf8");
  const currentRootSitemap = fs.readFileSync(ROOT_SITEMAP, "utf8");
  const expectedSitemap = sitemapWithGlossary(currentSitemap, cohortRows);
  const expectedRootSitemap = sitemapWithGlossary(currentRootSitemap, cohortRows, { lastmod:"2026-09-19" });

  if (args.has("--write")) {
    fs.rmSync(GLOSSARY, {recursive:true, force:true});
    for (const [file, html] of expected) {
      fs.mkdirSync(path.dirname(file), {recursive:true});
      fs.writeFileSync(file, html);
    }
    fs.writeFileSync(SITEMAP, expectedSitemap);
    fs.writeFileSync(ROOT_SITEMAP, expectedRootSitemap);
  }

  if (args.has("--check")) {
    for (const [file, html] of expected) {
      requireValue(fs.existsSync(file), `${path.relative(ROOT,file)} is missing`);
      requireValue(fs.readFileSync(file,"utf8") === html, `${path.relative(ROOT,file)} is stale`);
    }
    const actualDirs = fs.existsSync(GLOSSARY) ? fs.readdirSync(GLOSSARY,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort() : [];
    const expectedDirs = cohortRows.map(r=>r.slug).sort();
    requireValue(JSON.stringify(actualDirs) === JSON.stringify(expectedDirs), "glossary directory set does not match explicit cohort");
    requireValue(fs.readFileSync(SITEMAP,"utf8") === expectedSitemap, "tool sitemap glossary block is stale");
    requireValue(fs.readFileSync(ROOT_SITEMAP,"utf8") === expectedRootSitemap, "root sitemap glossary block is stale");
  }

  console.log(JSON.stringify({
    cohort:cohort.version,
    pages:cohortRows.length,
    promoted_image_pages:cohortRows.filter(r=>lifecycle.get(r.id)?.stage==="promoted").length,
    image_not_required_pages:cohortRows.filter(r=>lifecycle.get(r.id)?.stage==="not_required").length,
    active_affiliate_pages:cohortRows.filter(r=>offers.has(r.id)).length,
    output_root:"glossary/"
  }, null, 2));
  console.log("Construction Tools Atlas SEO detail cohort v2.3: PASS");
}

build().catch((error) => {
  console.error("Construction Tools Atlas SEO detail cohort v2.3: FAIL");
  console.error("- " + error.message);
  process.exit(1);
});
