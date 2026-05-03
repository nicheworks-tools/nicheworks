import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const sitemapPath = path.join(root, 'sitemap.xml');
const indexPath = path.join(root, 'tools', 'tools-index.json');
const metaPath = path.join(root, 'tools', 'tools-meta.json');
const siteBase = 'https://nicheworks.app';

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
const exists = (p) => fs.existsSync(p);
const has = (html, re) => re.test(html);
const titleText = (html) => (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
const metaContent = (html, name) => html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]?.trim() || '';
const propContent = (html, prop) => html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]?.trim() || '';

const sitemap = read(sitemapPath);
let toolIndex = new Set();
let toolMeta = {};
try {
  const parsed = JSON.parse(read(indexPath));
  toolIndex = new Set((parsed.items || []).map((it) => it.slug));
} catch {}
try {
  const parsed = JSON.parse(read(metaPath));
  toolMeta = parsed.items || {};
} catch {}

function listToolPages() {
  if (!exists(toolsDir)) return [];
  return fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ kind: 'tool', slug: d.name, url: `${siteBase}/tools/${d.name}/`, file: path.join(toolsDir, d.name, 'index.html') }))
    .filter((it) => exists(it.file));
}

function listStaticPages() {
  const candidates = [
    { kind: 'static', slug: 'home', url: `${siteBase}/`, file: path.join(root, 'index.html') },
    { kind: 'static', slug: 'about', url: `${siteBase}/about.html`, file: path.join(root, 'about.html') },
    { kind: 'static', slug: 'privacy', url: `${siteBase}/privacy.html`, file: path.join(root, 'privacy.html') },
    { kind: 'static', slug: 'contact', url: `${siteBase}/contact.html`, file: path.join(root, 'contact.html') },
    { kind: 'static', slug: 'home-en', url: `${siteBase}/en/`, file: path.join(root, 'en', 'index.html') },
    { kind: 'static', slug: 'about-en', url: `${siteBase}/en/about.html`, file: path.join(root, 'en', 'about.html') },
    { kind: 'static', slug: 'privacy-en', url: `${siteBase}/en/privacy.html`, file: path.join(root, 'en', 'privacy.html') },
    { kind: 'static', slug: 'contact-en', url: `${siteBase}/en/contact.html`, file: path.join(root, 'en', 'contact.html') }
  ];
  return candidates.filter((it) => exists(it.file));
}

function sitemapUrls() {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function urlToFile(url) {
  if (!url.startsWith(siteBase)) return null;
  let rel = url.slice(siteBase.length);
  if (!rel || rel === '/') return path.join(root, 'index.html');
  rel = rel.replace(/^\//, '');
  if (rel.endsWith('/')) return path.join(root, rel, 'index.html');
  return path.join(root, rel);
}

function hasStableMeta(slug) {
  const meta = toolMeta[slug];
  return !!(
    meta &&
    meta.title_ja &&
    meta.title_en &&
    meta.desc_ja &&
    meta.desc_en &&
    Array.isArray(meta.tags) &&
    meta.tags.length >= 2
  );
}

function extractInternalToolLinks(html) {
  const links = [];
  const re = /href=["'](\/tools\/([^/"'#?]+)\/?[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) links.push({ href: m[1], slug: m[2] });
  return links;
}

function missingInternalToolLinks(html) {
  return extractInternalToolLinks(html)
    .filter((l) => l.slug && l.slug !== '..' && !exists(path.join(toolsDir, l.slug, 'index.html')))
    .map((l) => l.href);
}

function checkPage(page) {
  const { kind, slug, file, url } = page;
  const html = read(file);
  const title = titleText(html);
  const description = metaContent(html, 'description');
  const issues = [];
  const warnings = [];
  const brokenLinks = missingInternalToolLinks(html);

  if (!title) issues.push('missing title');
  else if (title === 'NicheWorks' || title === slug) warnings.push('weak title');
  if (!description) issues.push('missing meta description');
  if (!has(html, /<link[^>]+rel=["']canonical["']/i)) issues.push('missing canonical');
  if (!propContent(html, 'og:title')) warnings.push('missing og:title');
  if (!propContent(html, 'og:description')) warnings.push('missing og:description');
  if (!propContent(html, 'og:image')) warnings.push('missing og:image');
  if (!has(html, /<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i)) warnings.push('missing favicon');
  if (!html.includes('G-57QT78M3JB')) issues.push('missing GA4');
  if (!html.includes('ca-pub-9879006623791275')) warnings.push('missing AdSense');
  if (kind === 'tool' && (!has(html, /application\/ld\+json/i) || !html.includes('WebApplication'))) warnings.push('missing WebApplication JSON-LD');
  if (!sitemap.includes(url)) warnings.push('not in sitemap.xml');
  if (kind === 'tool' && !toolIndex.has(slug)) warnings.push('not in tools-index.json');
  if (kind === 'tool' && !hasStableMeta(slug)) warnings.push('missing tools-meta.json SEO metadata');
  if (brokenLinks.length) warnings.push(`broken internal tool links: ${brokenLinks.join(', ')}`);

  return { kind, slug, status: issues.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK', issues: issues.join('; '), warnings: warnings.join('; ') };
}

function checkSitemapTargets() {
  return sitemapUrls()
    .map((url) => ({ url, file: urlToFile(url) }))
    .filter((it) => it.file && !exists(it.file))
    .map((it) => ({ kind: 'sitemap', slug: it.url.replace(siteBase, ''), status: 'WARN', issues: '', warnings: `sitemap URL has no matching file: ${it.file}` }));
}

const rows = [...listStaticPages(), ...listToolPages()].map(checkPage);
const sitemapRows = checkSitemapTargets();
const allRows = [...rows, ...sitemapRows].sort((a, b) => a.status.localeCompare(b.status) || a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug));
const fail = allRows.filter((r) => r.status === 'FAIL').length;
const warn = allRows.filter((r) => r.status === 'WARN').length;
const ok = allRows.filter((r) => r.status === 'OK').length;

console.log(`SEO audit: ${ok} OK / ${warn} WARN / ${fail} FAIL / ${allRows.length} checks`);
console.table(allRows);

if (fail > 0) process.exitCode = 1;
