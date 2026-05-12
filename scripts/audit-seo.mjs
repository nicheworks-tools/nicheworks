import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const sitemapPath = path.join(root, 'sitemap.xml');
const indexPath = path.join(root, 'tools', 'tools-index.json');
const metaPath = path.join(root, 'tools', 'tools-meta.json');
const siteBase = 'https://nicheworks.app';
const strict = process.argv.includes('--strict');

const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const BAD_TEXT_PATTERNS = [
  /description is pending/i,
  /example\.com/i,
  /TODO/i,
  /FIXME/i,
  /placeholder/i,
  /coming soon/i,
  /未完成/,
  /仮置き/,
  /準備中/
];

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
const exists = (p) => fs.existsSync(p);
const has = (html, re) => re.test(html);
const titleText = (html) => (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();

function attrContent(html, attrName, attrValue) {
  const tagRe = new RegExp(`<meta\\b[^>]*${attrName}=["']${attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = html.match(tagRe)?.[0] || '';
  return tag.match(/content=["']([^"']+)["']/i)?.[1]?.trim() || '';
}

const metaContent = (html, name) => attrContent(html, 'name', name);
const propContent = (html, prop) => attrContent(html, 'property', prop);

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

function fileToUrl(file) {
  const rel = relPath(file);
  if (rel === 'index.html') return `${siteBase}/`;
  if (rel.endsWith('/index.html')) return `${siteBase}/${rel.slice(0, -'index.html'.length)}`;
  return `${siteBase}/${rel}`;
}

function fileKind(file) {
  const rel = relPath(file);
  if (rel.startsWith('tools/') && rel.endsWith('/index.html')) return 'tool';
  return 'static';
}

function pageSlug(file) {
  const rel = relPath(file);
  if (rel === 'index.html') return 'home';
  if (rel === 'en/index.html') return 'home-en';
  if (rel.startsWith('tools/') && rel.endsWith('/index.html')) return rel.split('/')[1];
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '').replaceAll('/', '__');
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

function hasBadText(html) {
  return BAD_TEXT_PATTERNS.filter((re) => re.test(html)).map((re) => String(re));
}

function isToolPage(file) {
  return fileKind(file) === 'tool';
}

function checkPage(file) {
  const html = read(file);
  const kind = fileKind(file);
  const slug = pageSlug(file);
  const url = fileToUrl(file);
  const title = titleText(html);
  const description = metaContent(html, 'description');
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || '';
  const issues = [];
  const warnings = [];
  const brokenLinks = missingInternalToolLinks(html);
  const badTexts = hasBadText(html);

  if (!has(html, /<html\b[^>]*lang=["'][^"']+["']/i)) issues.push('missing html lang');
  if (!has(html, /<meta\b[^>]*name=["']viewport["']/i)) issues.push('missing viewport');
  if (!title) issues.push('missing title');
  else if (title === 'NicheWorks' || title === slug || title.length < 8) warnings.push('weak title');
  if (!description) issues.push('missing meta description');
  else if (description.length < 45) warnings.push('short meta description');
  if (!canonical) issues.push('missing canonical');
  else if (canonical !== url) warnings.push(`canonical mismatch: ${canonical}`);
  if (!metaContent(html, 'robots')) warnings.push('missing robots');
  if (!propContent(html, 'og:title')) warnings.push('missing og:title');
  if (!propContent(html, 'og:description')) warnings.push('missing og:description');
  if (!propContent(html, 'og:image')) warnings.push('missing og:image');
  if (!metaContent(html, 'twitter:card')) warnings.push('missing twitter:card');
  if (!metaContent(html, 'twitter:title')) warnings.push('missing twitter:title');
  if (!metaContent(html, 'twitter:description')) warnings.push('missing twitter:description');
  if (!metaContent(html, 'twitter:image')) warnings.push('missing twitter:image');
  if (!has(html, /<link[^>]+rel=["'](?:icon|shortcut icon)["']/i)) warnings.push('missing favicon');
  if (!has(html, /<link[^>]+rel=["']apple-touch-icon["']/i)) warnings.push('missing apple-touch-icon');
  if (!html.includes('G-57QT78M3JB')) issues.push('missing GA4');
  if (!html.includes('ca-pub-9879006623791275')) warnings.push('missing AdSense');
  if (!has(html, /application\/ld\+json/i)) warnings.push('missing JSON-LD');
  if (isToolPage(file) && !html.includes('WebApplication')) warnings.push('missing WebApplication JSON-LD');
  if (!sitemap.includes(url)) warnings.push('not in sitemap.xml');
  if (isToolPage(file) && !toolIndex.has(slug)) warnings.push('not in tools-index.json');
  if (isToolPage(file) && !hasStableMeta(slug)) warnings.push('missing tools-meta.json SEO metadata');
  if (brokenLinks.length) warnings.push(`broken internal tool links: ${brokenLinks.join(', ')}`);
  if (badTexts.length) warnings.push(`placeholder/bad text found: ${badTexts.join(', ')}`);

  return { kind, slug, file: relPath(file), status: issues.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK', issues: issues.join('; '), warnings: warnings.join('; ') };
}

function checkSitemapTargets() {
  return sitemapUrls()
    .map((url) => ({ url, file: urlToFile(url) }))
    .filter((it) => it.file && !exists(it.file))
    .map((it) => ({ kind: 'sitemap', slug: it.url.replace(siteBase, ''), file: '', status: 'WARN', issues: '', warnings: `sitemap URL has no matching file: ${it.file}` }));
}

const rows = listHtmlFiles(root).map(checkPage);
const sitemapRows = checkSitemapTargets();
const allRows = [...rows, ...sitemapRows].sort((a, b) => a.status.localeCompare(b.status) || a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug));
const fail = allRows.filter((r) => r.status === 'FAIL').length;
const warn = allRows.filter((r) => r.status === 'WARN').length;
const ok = allRows.filter((r) => r.status === 'OK').length;

console.log(`SEO audit: ${ok} OK / ${warn} WARN / ${fail} FAIL / ${allRows.length} checks${strict ? ' (strict)' : ''}`);
console.table(allRows);

// Strict mode is used as a merge gate. Existing repository-wide warnings are
// still reported in the table, but only hard failures should block unrelated
// tool fixes. Otherwise one safe tool PR can be blocked by old warnings in
// archived/templates/other tools.
if (fail > 0) process.exitCode = 1;
