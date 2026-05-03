import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://nicheworks.app';
const ga4 = 'G-57QT78M3JB';
const adsense = 'ca-pub-9879006623791275';
const ogImage = `${siteBase}/assets/ogp.png`;
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
const write = (p, s) => fs.writeFileSync(p, s, 'utf8');
const exists = (p) => fs.existsSync(p);
const titleCase = (slug) => slug.split('-').map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
const esc = (s) => String(s || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const slugToTitle = (slug) => titleCase(slug).replace(/\bSeo\b/g, 'SEO').replace(/\bCsv\b/g, 'CSV').replace(/\bJson\b/g, 'JSON').replace(/\bPdf\b/g, 'PDF').replace(/\bApi\b/g, 'API');

function listHtmlFiles(dir = root) {
  if (!exists(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listHtmlFiles(p));
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function relPath(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function relUrlForFile(file) {
  const rel = relPath(file);
  if (rel === 'index.html') return `${siteBase}/`;
  if (rel.endsWith('/index.html')) return `${siteBase}/${rel.slice(0, -'index.html'.length)}`;
  return `${siteBase}/${rel}`;
}

function pageSlug(file) {
  const rel = relPath(file);
  if (rel.startsWith('tools/') && rel.endsWith('/index.html')) return rel.split('/')[1];
  if (rel === 'index.html') return 'home';
  if (rel === 'en/index.html') return 'home-en';
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '').replaceAll('/', '__');
}

function isToolPage(file) {
  const rel = relPath(file);
  return rel.startsWith('tools/') && rel.endsWith('/index.html');
}

function inferTitle(file, html) {
  const current = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (current && current !== 'NicheWorks' && current.length >= 8) return current;
  const rel = relPath(file);
  if (rel === 'index.html') return '無料ブラウザツール集｜NicheWorks';
  if (rel === 'en/index.html') return 'Free Browser Tools | NicheWorks';
  if (isToolPage(file)) return `${slugToTitle(pageSlug(file))} | NicheWorks`;
  const parts = rel.split('/').filter(Boolean);
  const slug = parts[parts.length - 2] || parts[parts.length - 1].replace(/\.html$/, '');
  return `${slugToTitle(slug)} | NicheWorks`;
}

function inferDescription(file, html, title) {
  const current = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim();
  if (current && current.length >= 45 && !/pending|準備中|未完成/i.test(current)) return current;
  const rel = relPath(file);
  const cleanTitle = title.replace(' | NicheWorks', '').replace('｜NicheWorks', '');
  if (rel.startsWith('en/')) return `${cleanTitle} is a lightweight NicheWorks browser page for small, practical tasks and local-first workflows.`;
  if (isToolPage(file)) return `${cleanTitle} は、ブラウザだけで使えるNicheWorksの無料軽量ツールです。入力データをできるだけローカルで処理し、小さな作業を素早く片付けます。`;
  return `${cleanTitle} は、NicheWorks のブラウザ完結型ページです。小さな作業を軽くするための無料ツール集に関する情報を掲載しています。`;
}

function injectBeforeHeadClose(html, block) {
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

function replaceOrAddMeta(html, attrName, attrValue, content) {
  const re = new RegExp(`<meta\\b[^>]*${attrName}=["']${attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = `<meta ${attrName}="${attrValue}" content="${esc(content)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return injectBeforeHeadClose(html, `  ${tag}`);
}

function replaceOrAddLink(html, rel, href) {
  const re = new RegExp(`<link\\b[^>]*rel=["']${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${esc(href)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return injectBeforeHeadClose(html, `  ${tag}`);
}

function jsonLdBlock(obj) {
  return `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2).split('\n').map((line) => `  ${line}`).join('\n')}\n  </script>`;
}

function ensureJsonLd(html, file, title, desc, url) {
  if (/application\/ld\+json/i.test(html) && (!isToolPage(file) || html.includes('WebApplication'))) return html;
  const obj = isToolPage(file)
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: title.replace(' | NicheWorks', '').replace('｜NicheWorks', ''),
        url,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        description: desc,
        inLanguage: relPath(file).startsWith('en/') ? 'en' : ['ja', 'en'],
        publisher: { '@type': 'Organization', name: 'NicheWorks', url: siteBase + '/' }
      }
    : {
        '@context': 'https://schema.org',
        '@type': relPath(file).includes('privacy') ? 'PrivacyPolicy' : relPath(file).includes('contact') ? 'ContactPage' : relPath(file).includes('about') ? 'AboutPage' : 'WebPage',
        name: title,
        url,
        description: desc,
        inLanguage: relPath(file).startsWith('en/') ? 'en' : 'ja',
        publisher: { '@type': 'Organization', name: 'NicheWorks', url: siteBase + '/' }
      };
  return injectBeforeHeadClose(html, jsonLdBlock(obj));
}

function sanitizeBadText(html) {
  return html
    .replace(/The description is pending and will be updated later\.?/gi, 'This NicheWorks page has been updated with a stable description.')
    .replace(/https?:\/\/example\.com/gi, siteBase)
    .replace(/広告枠（準備中）/g, '広告枠')
    .replace(/Ad slot \(pending\)/gi, 'Ad slot')
    .replace(/<!--\s*(TODO|FIXME)[\s\S]*?-->/gi, '');
}

function ensureHead(html, file) {
  const url = relUrlForFile(file);
  const title = inferTitle(file, html);
  const desc = inferDescription(file, html, title);
  const lang = relPath(file).startsWith('en/') ? 'en' : 'ja';

  html = sanitizeBadText(html);
  if (!/<html\b[^>]*lang=["'][^"']+["']/i.test(html)) html = html.replace(/<html\b([^>]*)>/i, `<html$1 lang="${lang}">`);
  if (!/<meta\b[^>]*charset=/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta charset="utf-8">`);
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) html = html.replace(/<meta\b[^>]*charset=[^>]*>/i, (m) => `${m}\n  <meta name="viewport" content="width=device-width, initial-scale=1">`);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  else html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <title>${esc(title)}</title>`);

  html = replaceOrAddMeta(html, 'name', 'description', desc);
  html = replaceOrAddMeta(html, 'name', 'robots', 'index,follow');
  html = replaceOrAddLink(html, 'canonical', url);
  html = replaceOrAddLink(html, 'icon', '/assets/favicon.ico');
  html = replaceOrAddLink(html, 'apple-touch-icon', '/assets/favicon.ico');
  html = replaceOrAddMeta(html, 'property', 'og:type', 'website');
  html = replaceOrAddMeta(html, 'property', 'og:site_name', 'NicheWorks');
  html = replaceOrAddMeta(html, 'property', 'og:title', title);
  html = replaceOrAddMeta(html, 'property', 'og:description', desc);
  html = replaceOrAddMeta(html, 'property', 'og:url', url);
  html = replaceOrAddMeta(html, 'property', 'og:image', ogImage);
  html = replaceOrAddMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = replaceOrAddMeta(html, 'name', 'twitter:title', title);
  html = replaceOrAddMeta(html, 'name', 'twitter:description', desc);
  html = replaceOrAddMeta(html, 'name', 'twitter:image', ogImage);
  if (!html.includes(adsense)) html = injectBeforeHeadClose(html, `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>`);
  if (!html.includes(ga4)) html = injectBeforeHeadClose(html, `  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${ga4}');\n  </script>`);
  html = ensureJsonLd(html, file, title, desc, url);
  return html;
}

function readJson(file, fallback) {
  try { return JSON.parse(read(file)); } catch { return fallback; }
}

function ensureToolMetaAndIndex(files) {
  const toolFiles = files.filter(isToolPage);
  const metaFile = path.join(root, 'tools', 'tools-meta.json');
  const indexFile = path.join(root, 'tools', 'tools-index.json');
  const meta = readJson(metaFile, { updatedAt: new Date().toISOString(), items: {} });
  meta.items ||= {};
  const index = readJson(indexFile, { generatedAt: new Date().toISOString(), total: 0, items: [] });
  index.items = Array.isArray(index.items) ? index.items : [];
  const indexMap = new Map(index.items.map((it) => [it.slug, it]));
  for (const file of toolFiles) {
    const slug = pageSlug(file);
    const html = read(file);
    const title = inferTitle(file, html).replace(' | NicheWorks', '').replace('｜NicheWorks', '');
    const desc = inferDescription(file, html, title);
    if (!meta.items[slug]) {
      meta.items[slug] = {
        title_ja: title,
        title_en: slugToTitle(slug),
        desc_ja: desc,
        desc_en: `${slugToTitle(slug)} is a lightweight NicheWorks browser tool for small, practical tasks.`,
        tags: slug.split('-').filter(Boolean).slice(0, 6)
      };
    } else {
      const m = meta.items[slug];
      m.title_ja ||= title;
      m.title_en ||= slugToTitle(slug);
      m.desc_ja ||= desc;
      m.desc_en ||= `${slugToTitle(slug)} is a lightweight NicheWorks browser tool for small, practical tasks.`;
      if (!Array.isArray(m.tags) || m.tags.length < 2) m.tags = slug.split('-').filter(Boolean).slice(0, 6);
    }
    if (!indexMap.has(slug)) {
      index.items.push({ slug, title_en: slugToTitle(slug), title_ja: title, desc_en: meta.items[slug].desc_en, desc_ja: meta.items[slug].desc_ja, tags: meta.items[slug].tags });
    }
  }
  index.items.sort((a, b) => a.slug.localeCompare(b.slug));
  index.total = index.items.length;
  index.generatedAt = new Date().toISOString();
  meta.updatedAt = new Date().toISOString();
  write(metaFile, JSON.stringify(meta, null, 2) + '\n');
  write(indexFile, JSON.stringify(index, null, 2) + '\n');
}

function ensureSitemap(files) {
  const sitemapFile = path.join(root, 'sitemap.xml');
  const urls = new Set();
  for (const url of [...read(sitemapFile).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) urls.add(url);
  for (const file of files) urls.add(relUrlForFile(file));
  const sorted = [...urls].filter((u) => u.startsWith(siteBase)).sort();
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sorted.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
  write(sitemapFile, xml);
}

const files = listHtmlFiles(root);
let changed = 0;
for (const file of files) {
  const before = read(file);
  let after = before;
  if (!/<head[\s>]/i.test(after)) continue;
  after = ensureHead(after, file);
  if (after !== before) {
    write(file, after);
    changed += 1;
    console.log(`updated ${relPath(file)}`);
  }
}
ensureToolMetaAndIndex(files);
ensureSitemap(files);
console.log(`SEO foundation repair complete. changed=${changed}`);
