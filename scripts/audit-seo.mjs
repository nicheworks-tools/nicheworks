// SEO strict verification marker: 2026-05-10 r3
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const siteBase = 'https://nicheworks.app';
const strict = process.argv.includes('--strict');
const sitemap = read('sitemap.xml');
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const BAD_VISIBLE_TEXT = [/description is pending/i, /\bTODO\b/, /\bFIXME\b/i, /coming soon/i, /未完成/, /仮置き/, /準備中/];

function read(relativePath) {
  const file = path.join(root, relativePath);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}
function exists(relativePath) { return fs.existsSync(path.join(root, relativePath)); }
function has(html, re) { return re.test(html); }
function rel(file) { return path.relative(root, file).split(path.sep).join('/'); }
function titleOf(html) { return (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim(); }
function attr(html, attrName, attrValue) {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = html.match(new RegExp(`<meta\\b[^>]*${attrName}=["']${escaped}["'][^>]*>`, 'i'))?.[0] || '';
  return tag.match(/content=["']([^"']+)["']/i)?.[1]?.trim() || '';
}
const meta = (html, name) => attr(html, 'name', name);
const prop = (html, name) => attr(html, 'property', name);
function canonicalOf(html) { return html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || ''; }
function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let toolIndex = new Set();
let toolMeta = {};
try { toolIndex = new Set((JSON.parse(read('tools/tools-index.json')).items || []).map((item) => item.slug)); } catch {}
try { toolMeta = JSON.parse(read('tools/tools-meta.json')).items || {}; } catch {}

function excluded(file) {
  const relative = rel(file);
  return relative.startsWith('_archive/')
    || relative.startsWith('apps/')
    || relative.startsWith('templates/')
    || relative.startsWith('tools/_template/')
    || relative.startsWith('pro/unlock/')
    || relative.includes('/mock/')
    || relative.endsWith('/404.html')
    || relative.includes('/howto/howto/');
}
function listHtml(dir = root) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...listHtml(file));
    else if (entry.isFile() && entry.name.endsWith('.html') && !excluded(file)) output.push(file);
  }
  return output;
}
function fileUrl(file) {
  const relative = rel(file);
  if (relative === 'index.html') return `${siteBase}/`;
  if (relative.endsWith('/index.html')) return `${siteBase}/${relative.slice(0, -'index.html'.length)}`;
  return `${siteBase}/${relative}`;
}
function kindOf(file) { return rel(file).startsWith('tools/') && rel(file).endsWith('/index.html') ? 'tool' : 'static'; }
function slugOf(file) {
  const relative = rel(file);
  if (relative === 'index.html') return 'home';
  if (relative === 'en/index.html') return 'home-en';
  if (relative.startsWith('tools/') && relative.endsWith('/index.html')) return relative.split('/')[1];
  return relative.replace(/\/index\.html$/, '').replace(/\.html$/, '').replaceAll('/', '__');
}
function stableMeta(slug) {
  const item = toolMeta[slug];
  return !!(item?.title_ja && item?.title_en && item?.desc_ja && item?.desc_en && Array.isArray(item.tags) && item.tags.length >= 2);
}
function internalLinks(html) {
  return [...html.matchAll(/href=["'](\/tools\/([^/"'#?]+)\/?[^"']*)["']/gi)]
    .map((match) => ({ href: match[1], slug: match[2] }))
    .filter((link) => !link.href.includes('${'));
}
function brokenLinks(html) {
  return internalLinks(html).filter((link) => link.slug && !exists(`tools/${link.slug}/index.html`)).map((link) => link.href);
}
function badText(html, file) {
  const text = visibleText(html);
  const honest = ['tools/earth-alerts/index.html', 'tools/earth-timeseries/index.html', 'tools/earth-map-suite/index.html'].includes(rel(file));
  const patterns = honest ? BAD_VISIBLE_TEXT.filter((re) => !['/coming soon/i', '/準備中/'].includes(String(re))) : BAD_VISIBLE_TEXT;
  return patterns.filter((re) => re.test(text)).map(String);
}
function row(kind, slug, file, issues, warnings) {
  return { kind, slug, file: rel(file), status: issues.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK', issues: issues.join('; '), warnings: warnings.join('; ') };
}
function check(file) {
  const html = fs.readFileSync(file, 'utf8');
  const kind = kindOf(file);
  const slug = slugOf(file);
  const url = fileUrl(file);
  const issues = [];
  const warnings = [];
  const title = titleOf(html);
  const description = meta(html, 'description');
  const canonical = canonicalOf(html);
  const robots = meta(html, 'robots').toLowerCase();
  const noindex = robots.includes('noindex');

  if (!has(html, /<html\b[^>]*lang=["'][^"']+["']/i)) issues.push('missing html lang');
  if (!has(html, /<meta\b[^>]*name=["']viewport["']/i)) issues.push('missing viewport');
  if (!title) issues.push('missing title'); else if (title === 'NicheWorks' || title === slug || title.length < 8) warnings.push('weak title');

  if (!noindex) {
    if (!description) issues.push('missing meta description'); else if (description.length < 45) warnings.push('short meta description');
    if (!canonical) issues.push('missing canonical'); else if (canonical !== url) warnings.push(`canonical mismatch: ${canonical}`);
    if (!robots) warnings.push('missing robots');
    for (const name of ['title', 'description', 'image']) if (!prop(html, `og:${name}`)) warnings.push(`missing og:${name}`);
    for (const name of ['card', 'title', 'description', 'image']) if (!meta(html, `twitter:${name}`)) warnings.push(`missing twitter:${name}`);
    if (!has(html, /<link[^>]+rel=["'](?:icon|shortcut icon)["']/i)) warnings.push('missing favicon');
    if (!has(html, /<link[^>]+rel=["']apple-touch-icon["']/i)) warnings.push('missing apple-touch-icon');
    if (!html.includes('G-57QT78M3JB')) issues.push('missing GA4');
    if (!html.includes('ca-pub-9879006623791275')) warnings.push('missing AdSense');
    if (!has(html, /application\/ld\+json/i)) warnings.push('missing JSON-LD');
    if (kind === 'tool' && !html.includes('WebApplication')) warnings.push('missing WebApplication JSON-LD');
    if (!sitemap.includes(url)) warnings.push('not in sitemap.xml');
    if (kind === 'tool' && !toolIndex.has(slug)) warnings.push('not in tools-index.json');
    if (kind === 'tool' && !stableMeta(slug)) warnings.push('missing tools-meta.json SEO metadata');
  }

  const broken = brokenLinks(html); if (broken.length) warnings.push(`broken internal tool links: ${broken.join(', ')}`);
  const bad = badText(html, file); if (bad.length) warnings.push(`unfinished visible text found: ${bad.join(', ')}`);
  return row(kind, slug, file, issues, warnings);
}
function sitemapTargetRows() {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith(siteBase))
    .map((url) => {
      const relative = url.slice(siteBase.length).replace(/^\//, '');
      const file = relative ? path.join(root, relative.endsWith('/') ? relative + 'index.html' : relative) : path.join(root, 'index.html');
      return { url, file };
    })
    .filter((item) => !fs.existsSync(item.file))
    .map((item) => ({ kind: 'sitemap', slug: item.url.replace(siteBase, ''), file: '', status: 'WARN', issues: '', warnings: `sitemap URL has no matching file: ${item.file}` }));
}

const rows = [...listHtml().map(check), ...sitemapTargetRows()].sort((a, b) => a.status.localeCompare(b.status) || a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug));
const fail = rows.filter((item) => item.status === 'FAIL').length;
const warn = rows.filter((item) => item.status === 'WARN').length;
const ok = rows.filter((item) => item.status === 'OK').length;
console.log(`SEO audit: ${ok} OK / ${warn} WARN / ${fail} FAIL / ${rows.length} checks${strict ? ' (strict)' : ''}`);
console.table(rows);
if (fail > 0 || (strict && warn > 0)) process.exitCode = 1;
