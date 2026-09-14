import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const sitemapPath = path.join(root, 'sitemap.xml');

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

function metaRobots(html) {
  const match = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
  return (match?.[1] || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
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
  if (/pagead2\.googlesyndication\.com|adsbygoogle/i.test(html)) {
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
  if (/pagead2\.googlesyndication\.com|adsbygoogle/i.test(html)) {
    fail(`${file}: billing outcome page must not load AdSense`);
  }
}

if (errors.length) {
  console.error(`AdSense review surface contract: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('AdSense review surface contract: OK');
}
