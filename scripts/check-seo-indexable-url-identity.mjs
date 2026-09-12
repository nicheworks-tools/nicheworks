import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, htmlFilePublicUrl } from './seo-public-url-contract.mjs';

const root = process.cwd();
const sitemapPath = path.join(root, 'sitemap.xml');
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const errors = [];

function fail(message) {
  errors.push(message);
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    fail(`cannot read ${rel(file) || file}: ${error.message}`);
    return '';
  }
}

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tagAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function metaValues(html, attrName, attrValue, valueName = 'content') {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttr(tag, attrName).toLowerCase() === attrValue.toLowerCase())
    .map((tag) => tagAttr(tag, valueName));
}

function canonicalValues(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'))
    .map((tag) => tagAttr(tag, 'href'));
}

function isNoindex(html) {
  return metaValues(html, 'name', 'robots').some((value) => value.toLowerCase().split(/[\s,]+/).includes('noindex'));
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
}

const sitemap = readText(sitemapPath);
const locations = sitemapLocations(sitemap);
const locationCounts = new Map();
for (const url of locations) locationCounts.set(url, (locationCounts.get(url) || 0) + 1);

for (const [url, count] of locationCounts) {
  if (count !== 1) fail(`sitemap duplicate: ${url} occurs ${count} times`);
  if (/pages\.dev/i.test(url)) fail(`sitemap contains deprecated pages.dev URL: ${url}`);
  try {
    const parsed = new URL(url);
    if (parsed.origin === SITE_ORIGIN && /(?:^|\/)index\.html$/.test(parsed.pathname)) {
      fail(`sitemap publishes index.html alias: ${url}`);
    }
  } catch {
    fail(`sitemap contains invalid URL: ${url}`);
  }
}

let scanned = 0;
let indexable = 0;
let noindex = 0;

for (const file of listHtml()) {
  scanned += 1;
  const relative = rel(file);
  const html = readText(file);
  if (isNoindex(html)) {
    noindex += 1;
    continue;
  }
  indexable += 1;

  let expectedUrl;
  try {
    expectedUrl = htmlFilePublicUrl(relative);
  } catch (error) {
    fail(`${relative}: cannot derive public URL: ${error.message}`);
    continue;
  }

  const canonicals = canonicalValues(html);
  if (canonicals.length !== 1) {
    fail(`${relative}: expected exactly one canonical; found ${canonicals.length}`);
  } else if (canonicals[0] !== expectedUrl) {
    fail(`${relative}: canonical mismatch: expected ${expectedUrl}; found ${canonicals[0] || '(empty)'}`);
  }

  const ogUrls = metaValues(html, 'property', 'og:url');
  if (ogUrls.length !== 1) {
    fail(`${relative}: expected exactly one og:url; found ${ogUrls.length}`);
  } else if (ogUrls[0] !== expectedUrl) {
    fail(`${relative}: og:url mismatch: expected ${expectedUrl}; found ${ogUrls[0] || '(empty)'}`);
  }

  for (const [kind, values] of [['canonical', canonicals], ['og:url', ogUrls]]) {
    for (const url of values) {
      if (/pages\.dev/i.test(url)) fail(`${relative}: ${kind} uses deprecated pages.dev URL: ${url}`);
      if (/^https?:\/\//i.test(url) && !url.startsWith(`${SITE_ORIGIN}/`)) {
        fail(`${relative}: ${kind} uses non-canonical public origin: ${url}`);
      }
    }
  }

  const sitemapCount = locationCounts.get(expectedUrl) || 0;
  if (sitemapCount !== 1) {
    fail(`${relative}: sitemap must contain ${expectedUrl} exactly once; found ${sitemapCount}`);
  }
}

if (errors.length) {
  console.error(`Indexable SEO URL identity: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${indexable} indexable / ${noindex} noindex / ${scanned} scanned)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Indexable SEO URL identity: OK (${indexable} indexable / ${noindex} noindex / ${scanned} scanned)`);
}
