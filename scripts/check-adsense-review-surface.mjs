import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(file) {
  try {
    return fs.readFileSync(path.join(root, file), 'utf8');
  } catch (error) {
    fail(`${file}: cannot read: ${error.message}`);
    return '';
  }
}

function readJson(file) {
  const text = read(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${file}: invalid JSON: ${error.message}`);
    return null;
  }
}

function metaRobots(html) {
  const match = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
  return (match?.[1] || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
}

function hasAdsense(html) {
  return /pagead2\.googlesyndication\.com|adsbygoogle/i.test(html);
}

const developmentTemplates = [
  'tools/_template/index.html',
  'templates/nw-minimal-base/index.html'
];

for (const file of developmentTemplates) {
  const html = read(file);
  if (!html) continue;
  const robots = metaRobots(html);
  if (!robots.includes('noindex') || !robots.includes('nofollow')) {
    fail(`${file}: development template must declare noindex,nofollow`);
  }
  if (hasAdsense(html)) {
    fail(`${file}: development template must not load AdSense`);
  }
  if (/googletagmanager\.com|cloudflareinsights\.com/i.test(html)) {
    fail(`${file}: development template must not load analytics`);
  }
  if (/<link\b[^>]*rel=["']canonical["']/i.test(html)) {
    fail(`${file}: development template must not publish a canonical URL`);
  }
  if (/<meta\b[^>]*property=["']og:url["']/i.test(html)) {
    fail(`${file}: development template must not publish og:url`);
  }
  if (/application\/ld\+json/i.test(html)) {
    fail(`${file}: development template must not publish structured data`);
  }
}

const sitemap = read('sitemap.xml');
const forbiddenSitemapUrls = [
  'https://nicheworks.app/billing/success.html',
  'https://nicheworks.app/billing/cancel.html',
  'https://nicheworks.app/tools/_template/',
  'https://nicheworks.app/templates/nw-minimal-base/'
];

for (const url of forbiddenSitemapUrls) {
  if (sitemap.includes(`<loc>${url}</loc>`)) {
    fail(`sitemap.xml must not publish ${url}`);
  }
}

for (const file of ['billing/success.html', 'billing/cancel.html']) {
  const html = read(file);
  if (!html) continue;
  const robots = metaRobots(html);
  if (!robots.includes('noindex')) {
    fail(`${file}: billing outcome page must remain noindex`);
  }
  if (hasAdsense(html)) {
    fail(`${file}: billing outcome page must not load AdSense`);
  }
}

const stagedRegistry = readJson('tools/staged-tools.json');
const stagedItems = Array.isArray(stagedRegistry?.items) ? stagedRegistry.items : [];
for (const item of stagedItems) {
  const slug = item?.slug;
  if (!slug) {
    fail('tools/staged-tools.json: staged item missing slug');
    continue;
  }
  const file = `tools/${slug}/index.html`;
  const html = read(file);
  if (!html) continue;
  const robots = metaRobots(html);
  if (!robots.includes('noindex') || !robots.includes('nofollow')) {
    fail(`${file}: staged tool must declare noindex,nofollow`);
  }
  if (hasAdsense(html)) {
    fail(`${file}: staged tool must not load AdSense`);
  }
  if (/>\s*(?:広告枠(?:（準備中）)?|Ad slot|Advertisement placeholder)\s*</i.test(html)) {
    fail(`${file}: staged tool must not render an ad placeholder`);
  }
  const publicUrl = `https://nicheworks.app/tools/${slug}/`;
  if (sitemap.includes(`<loc>${publicUrl}</loc>`)) {
    fail(`${file}: staged tool must be absent from sitemap`);
  }
}

const publicRegistry = readJson('tools/tools-index.json');
const publicItems = Array.isArray(publicRegistry?.items) ? publicRegistry.items : [];
const unfinishedSalesPatterns = [
  /data-okj-pro-state=["']billing-unavailable["']/i,
  /okj-pro-state-billing-unavailable/i,
  /課金(?:導線)?[^<\n]{0,40}(?:未接続|接続されていません)/i,
  /billing[^<\n]{0,40}(?:unavailable|not connected)/i
];
for (const item of publicItems) {
  const slug = item?.slug;
  if (!slug) continue;
  const file = `tools/${slug}/index.html`;
  const html = read(file);
  if (!html || metaRobots(html).includes('noindex')) continue;
  if (unfinishedSalesPatterns.some((pattern) => pattern.test(html))) {
    fail(`${file}: indexable public tool must not expose unfinished billing/Pro sales UI`);
  }
}

if (errors.length) {
  console.error(`AdSense review surface contract: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`AdSense review surface contract: OK (${stagedItems.length} staged tools, ${publicItems.length} public tools checked)`);
}
