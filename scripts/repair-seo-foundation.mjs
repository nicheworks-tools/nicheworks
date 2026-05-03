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

function inferTitle(file, html) {
  const current = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (current && current !== 'NicheWorks' && current.length >= 8) return current;
  const rel = relPath(file);
  if (rel === 'index.html') return '無料ブラウザツール集｜NicheWorks';
  if (rel === 'en/index.html') return 'Free Browser Tools | NicheWorks';
  const parts = rel.split('/').filter(Boolean);
  const slug = parts[parts.length - 2] || parts[parts.length - 1].replace(/\.html$/, '');
  return `${titleCase(slug)} | NicheWorks`;
}

function inferDescription(file, html, title) {
  const current = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim();
  if (current && current.length >= 45) return current;
  const rel = relPath(file);
  if (rel.startsWith('en/')) return `${title.replace(' | NicheWorks', '')} is a lightweight NicheWorks browser page for small, practical tasks and local-first workflows.`;
  return `${title.replace(' | NicheWorks', '')} は、NicheWorks のブラウザ完結型ページです。小さな作業を軽くするための無料ツールです。`;
}

function injectBeforeHeadClose(html, block) {
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

function replaceOrAddMeta(html, attrName, attrValue, content) {
  const re = new RegExp(`<meta\\b([^>]*${attrName}=["']${attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*)>`, 'i');
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

function ensureHead(html, file) {
  const url = relUrlForFile(file);
  const title = inferTitle(file, html);
  const desc = inferDescription(file, html, title);
  const lang = relPath(file).startsWith('en/') ? 'en' : 'ja';

  if (!/<html\b[^>]*lang=["'][^"']+["']/i.test(html)) {
    html = html.replace(/<html\b([^>]*)>/i, `<html$1 lang="${lang}">`);
  }
  if (!/<meta\b[^>]*charset=/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta charset="utf-8">`);
  }
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) {
    html = html.replace(/<meta\b[^>]*charset=[^>]*>/i, (m) => `${m}\n  <meta name="viewport" content="width=device-width, initial-scale=1">`);
  }
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  } else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <title>${esc(title)}</title>`);
  }

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

  if (!html.includes(adsense)) {
    html = injectBeforeHeadClose(html, `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>`);
  }
  if (!html.includes(ga4)) {
    html = injectBeforeHeadClose(html, `  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${ga4}');\n  </script>`);
  }

  return html;
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
console.log(`SEO foundation repair complete. changed=${changed}`);
