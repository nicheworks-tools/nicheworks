import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const sitemapPath = path.join(root, 'sitemap.xml');
const indexPath = path.join(root, 'tools', 'tools-index.json');
const metaPath = path.join(root, 'tools', 'tools-meta.json');

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
    .map((d) => ({ slug: d.name, file: path.join(toolsDir, d.name, 'index.html') }))
    .filter((it) => exists(it.file));
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

function checkPage({ slug, file }) {
  const html = read(file);
  const url = `https://nicheworks.app/tools/${slug}/`;
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
  if (!has(html, /application\/ld\+json/i) || !html.includes('WebApplication')) warnings.push('missing WebApplication JSON-LD');
  if (!sitemap.includes(url)) warnings.push('not in sitemap.xml');
  if (!toolIndex.has(slug)) warnings.push('not in tools-index.json');
  if (!hasStableMeta(slug)) warnings.push('missing tools-meta.json SEO metadata');
  if (brokenLinks.length) warnings.push(`broken internal tool links: ${brokenLinks.join(', ')}`);

  return { slug, status: issues.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK', issues: issues.join('; '), warnings: warnings.join('; ') };
}

const rows = listToolPages().map(checkPage).sort((a, b) => a.status.localeCompare(b.status) || a.slug.localeCompare(b.slug));
const fail = rows.filter((r) => r.status === 'FAIL').length;
const warn = rows.filter((r) => r.status === 'WARN').length;
const ok = rows.filter((r) => r.status === 'OK').length;

console.log(`SEO audit: ${ok} OK / ${warn} WARN / ${fail} FAIL / ${rows.length} pages`);
console.table(rows);

if (fail > 0) process.exitCode = 1;
