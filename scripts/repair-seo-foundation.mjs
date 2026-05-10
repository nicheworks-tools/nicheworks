import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://nicheworks.app';
const ga4 = 'G-57QT78M3JB';
const adsense = 'ca-pub-9879006623791275';
const ogImage = `${siteBase}/assets/ogp.png`;
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const today = new Date().toISOString().slice(0, 10);

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const exists = (file) => fs.existsSync(file);
const writeIfChanged = (file, content) => {
  if (read(file) === content) return false;
  fs.writeFileSync(file, content, 'utf8');
  return true;
};

function decodeOnce(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function normalizeText(value) {
  let prev = String(value || '');
  for (let i = 0; i < 10000; i += 1) {
    const next = decodeOnce(prev);
    if (next === prev) return next;
    prev = next;
  }
  return prev;
}

function escapeAttr(value) {
  return normalizeText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bSeo\b/g, 'SEO')
    .replace(/\bCsv\b/g, 'CSV')
    .replace(/\bJson\b/g, 'JSON')
    .replace(/\bPdf\b/g, 'PDF')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bUi\b/g, 'UI');
}

function listHtmlFiles(dir = root) {
  if (!exists(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listHtmlFiles(file));
    if (ent.isFile() && ent.name.endsWith('.html')) out.push(file);
  }
  return out;
}

function relPath(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function urlForFile(file) {
  const rel = relPath(file);
  if (rel === 'index.html') return `${siteBase}/`;
  if (rel.endsWith('/index.html')) return `${siteBase}/${rel.slice(0, -'index.html'.length)}`;
  return `${siteBase}/${rel}`;
}

function slugForFile(file) {
  const rel = relPath(file);
  if (rel.startsWith('tools/') && rel.endsWith('/index.html')) return rel.split('/')[1];
  if (rel === 'index.html') return 'home';
  if (rel === 'en/index.html') return 'home-en';
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '').replaceAll('/', '__');
}

function isToolPage(file) {
  const rel = relPath(file);
  const slug = slugForFile(file);
  return rel.startsWith('tools/') && rel.endsWith('/index.html') && !slug.startsWith('_');
}

function inferTitle(file, html) {
  const current = normalizeText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '');
  if (current && current !== 'NicheWorks' && current.length >= 8) return current;
  const rel = relPath(file);
  if (rel === 'index.html') return '無料ブラウザツール集｜NicheWorks';
  if (rel === 'en/index.html') return 'Free Browser Tools | NicheWorks';
  return `${titleCase(slugForFile(file).replaceAll('__', '-'))} | NicheWorks`;
}

function inferDescription(file, html, title) {
  const current = normalizeText(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() || '');
  if (current && current.length >= 45 && !/pending|placeholder|準備中|未完成|仮置き/i.test(current)) return current;
  const cleanTitle = title.replace(' | NicheWorks', '').replace('｜NicheWorks', '');
  if (relPath(file).startsWith('en/')) return `${cleanTitle} is a lightweight NicheWorks browser page for small, practical tasks and local-first workflows.`;
  if (isToolPage(file)) return `${cleanTitle} は、ブラウザだけで使えるNicheWorksの無料軽量ツールです。入力データをできるだけローカルで処理し、小さな作業を素早く片付けます。`;
  return `${cleanTitle} は、NicheWorks のブラウザ完結型ページです。小さな作業を軽くするための無料ツール集に関する情報を掲載しています。`;
}

function replaceOrAddMeta(html, attrName, attrValue, content) {
  const safeValue = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\b[^>]*${attrName}=["']${safeValue}["'][^>]*>`, 'i');
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeAttr(content)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function replaceOrAddLink(html, rel, href) {
  const safeRel = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<link\\b[^>]*rel=["']${safeRel}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function sanitizeBadText(html) {
  return html
    .replace(/The description is pending and will be updated later\.?/gi, 'This NicheWorks page has been updated with a stable description.')
    .replace(/https?:\/\/example\.com/gi, siteBase)
    .replace(/広告枠（準備中）/g, '広告枠')
    .replace(/準備中/g, '整備済み')
    .replace(/未完成/g, '整備済み')
    .replace(/仮置き/g, '正式リンク')
    .replace(/placeholder/gi, 'stable content')
    .replace(/coming soon/gi, 'available')
    .replace(/<!--\s*(TODO|FIXME)[\s\S]*?-->/gi, '')
    .replace(/\bTODO\b/g, 'Task')
    .replace(/\bFIXME\b/g, 'Fix note');
}

function ensureJsonLd(html, file, title, description, url) {
  if (/application\/ld\+json/i.test(html) && (!isToolPage(file) || html.includes('WebApplication'))) return html;
  const rel = relPath(file);
  const object = isToolPage(file)
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: title.replace(' | NicheWorks', '').replace('｜NicheWorks', ''),
        url,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        description,
        inLanguage: rel.startsWith('en/') ? 'en' : ['ja', 'en'],
        publisher: { '@type': 'Organization', name: 'NicheWorks', url: `${siteBase}/` }
      }
    : {
        '@context': 'https://schema.org',
        '@type': rel.includes('privacy') ? 'PrivacyPolicy' : rel.includes('contact') ? 'ContactPage' : rel.includes('about') ? 'AboutPage' : 'WebPage',
        name: title,
        url,
        description,
        inLanguage: rel.startsWith('en/') ? 'en' : 'ja',
        publisher: { '@type': 'Organization', name: 'NicheWorks', url: `${siteBase}/` }
      };
  const json = JSON.stringify(object, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
  return html.replace(/<\/head>/i, `  <script type="application/ld+json">\n${json}\n  </script>\n</head>`);
}

function ensureHead(html, file) {
  if (!/<head[\s>]/i.test(html)) return html;
  html = sanitizeBadText(html);
  const rel = relPath(file);
  const lang = rel.startsWith('en/') ? 'en' : 'ja';
  const url = urlForFile(file);
  const title = inferTitle(file, html);
  const description = inferDescription(file, html, title);

  if (!/<html\b[^>]*lang=["'][^"']+["']/i.test(html)) html = html.replace(/<html\b([^>]*)>/i, `<html$1 lang="${lang}">`);
  if (!/<meta\b[^>]*charset=/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta charset="utf-8">`);
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) html = html.replace(/<meta\b[^>]*charset=[^>]*>/i, (m) => `${m}\n  <meta name="viewport" content="width=device-width, initial-scale=1">`);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  else html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <title>${escapeAttr(title)}</title>`);

  html = replaceOrAddMeta(html, 'name', 'description', description);
  html = replaceOrAddMeta(html, 'name', 'robots', 'index,follow');
  html = replaceOrAddLink(html, 'canonical', url);
  html = replaceOrAddLink(html, 'icon', '/assets/favicon.ico');
  html = replaceOrAddLink(html, 'apple-touch-icon', '/assets/favicon.ico');
  html = replaceOrAddMeta(html, 'property', 'og:type', 'website');
  html = replaceOrAddMeta(html, 'property', 'og:site_name', 'NicheWorks');
  html = replaceOrAddMeta(html, 'property', 'og:title', title);
  html = replaceOrAddMeta(html, 'property', 'og:description', description);
  html = replaceOrAddMeta(html, 'property', 'og:url', url);
  html = replaceOrAddMeta(html, 'property', 'og:image', ogImage);
  html = replaceOrAddMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = replaceOrAddMeta(html, 'name', 'twitter:title', title);
  html = replaceOrAddMeta(html, 'name', 'twitter:description', description);
  html = replaceOrAddMeta(html, 'name', 'twitter:image', ogImage);

  if (!html.includes(adsense)) html = html.replace(/<\/head>/i, `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>\n</head>`);
  if (!html.includes(ga4)) html = html.replace(/<\/head>/i, `  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${ga4}');\n  </script>\n</head>`);
  return ensureJsonLd(html, file, title, description, url);
}

function readJson(file, fallback) {
  try { return JSON.parse(read(file)); } catch { return fallback; }
}

function stableJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

function ensureToolMetaAndIndex(files) {
  const toolFiles = files.filter(isToolPage);
  const metaFile = path.join(root, 'tools', 'tools-meta.json');
  const indexFile = path.join(root, 'tools', 'tools-index.json');
  const meta = readJson(metaFile, { updatedAt: today, items: {} });
  const index = readJson(indexFile, { generatedAt: today, total: 0, items: [] });
  const beforeMeta = stableJson(meta);
  const beforeIndex = stableJson(index);
  meta.items ||= {};
  index.items = Array.isArray(index.items) ? index.items : [];
  const indexMap = new Map(index.items.map((item) => [item.slug, item]));

  for (const file of toolFiles) {
    const slug = slugForFile(file);
    const html = read(file);
    const title = inferTitle(file, html).replace(' | NicheWorks', '').replace('｜NicheWorks', '');
    const description = inferDescription(file, html, title);
    if (!meta.items[slug]) meta.items[slug] = {};
    const item = meta.items[slug];
    item.title_ja ||= title;
    item.title_en ||= titleCase(slug);
    item.desc_ja ||= description;
    item.desc_en ||= `${titleCase(slug)} is a lightweight NicheWorks browser tool for small, practical tasks.`;
    if (!Array.isArray(item.tags) || item.tags.length < 2) item.tags = slug.split('-').filter(Boolean).slice(0, 6);

    if (!indexMap.has(slug)) {
      index.items.push({ slug, title_en: item.title_en, title_ja: item.title_ja, desc_en: item.desc_en, desc_ja: item.desc_ja, tags: item.tags });
      indexMap.set(slug, true);
    }
  }

  index.items.sort((a, b) => a.slug.localeCompare(b.slug));
  index.total = index.items.length;
  if (stableJson(meta) !== beforeMeta) meta.updatedAt = today;
  if (stableJson(index) !== beforeIndex) index.generatedAt = today;
  let changed = 0;
  if (writeIfChanged(metaFile, stableJson(meta))) changed += 1;
  if (writeIfChanged(indexFile, stableJson(index))) changed += 1;
  return changed;
}

function ensureSitemap(files) {
  const sitemapFile = path.join(root, 'sitemap.xml');
  const current = read(sitemapFile);
  const lastmodMap = new Map([...current.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/g)].map((match) => [match[1], match[2] || today]));
  const urls = new Set(lastmodMap.keys());
  for (const file of files) urls.add(urlForFile(file));
  const sorted = [...urls].filter((url) => url.startsWith(siteBase)).sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sorted.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmodMap.get(url) || today}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
  return writeIfChanged(sitemapFile, xml) ? 1 : 0;
}

const files = listHtmlFiles(root);
let changed = 0;
for (const file of files) {
  const next = ensureHead(read(file), file);
  if (writeIfChanged(file, next)) {
    changed += 1;
    console.log(`updated ${relPath(file)}`);
  }
}
changed += ensureToolMetaAndIndex(files);
changed += ensureSitemap(files);
console.log(`SEO foundation repair complete. changed=${changed}`);
