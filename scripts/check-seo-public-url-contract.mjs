import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, assertToolSlug, toolPublicUrl } from './seo-public-url-contract.mjs';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const indexPath = path.join(toolsDir, 'tools-index.json');
const sitemapPath = path.join(root, 'sitemap.xml');
const errors = [];

function fail(message) {
  errors.push(message);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    fail(`cannot read ${path.relative(root, file) || file}: ${error.message}`);
    return '';
  }
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tagAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function canonicalValues(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'))
    .map((tag) => tagAttr(tag, 'href'));
}

function ogUrlValues(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttr(tag, 'property').toLowerCase() === 'og:url')
    .map((tag) => tagAttr(tag, 'content'));
}

function typeIncludesWebApplication(value) {
  return value === 'WebApplication' || (Array.isArray(value) && value.includes('WebApplication'));
}

function collectWebApplications(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectWebApplications(item, output);
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (typeIncludesWebApplication(value['@type'])) output.push(value);
  for (const child of Object.values(value)) collectWebApplications(child, output);
  return output;
}

function webApplications(html, fileLabel) {
  const apps = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      collectWebApplications(JSON.parse(raw), apps);
    } catch (error) {
      fail(`${fileLabel}: invalid JSON-LD: ${error.message}`);
    }
  }
  return apps;
}

function exactSitemapCount(sitemap, url) {
  const pattern = new RegExp(`<loc>\\s*${escapeRegExp(url)}\\s*<\\/loc>`, 'g');
  return [...sitemap.matchAll(pattern)].length;
}

const registry = readJson(indexPath);
const sitemap = readText(sitemapPath);
const items = Array.isArray(registry?.items) ? registry.items : [];

if (!registry || !Array.isArray(registry.items)) fail('tools/tools-index.json must contain an items array');
if (registry && registry.total !== items.length) fail(`tools/tools-index.json total=${registry.total} but items.length=${items.length}`);
if (!sitemap) fail('sitemap.xml is empty or unreadable');
if (/pages\.dev/i.test(sitemap)) fail('sitemap.xml contains deprecated pages.dev URL(s)');
if (/<loc>[^<]*\/index\.html(?:[?#][^<]*)?<\/loc>/i.test(sitemap)) fail('sitemap.xml must not publish index.html URLs');

const seen = new Set();
for (const item of items) {
  const slug = item?.slug;
  try {
    assertToolSlug(slug);
  } catch (error) {
    fail(`tools/tools-index.json: ${error.message}`);
    continue;
  }
  if (seen.has(slug)) {
    fail(`tools/tools-index.json: duplicate slug ${slug}`);
    continue;
  }
  seen.add(slug);

  const expectedUrl = toolPublicUrl(slug);
  const relativeFile = `tools/${slug}/index.html`;
  const file = path.join(root, relativeFile);
  if (!fs.existsSync(file)) {
    fail(`${slug}: registered landing file missing: ${relativeFile}`);
    continue;
  }

  const sitemapCount = exactSitemapCount(sitemap, expectedUrl);
  if (sitemapCount !== 1) fail(`${slug}: sitemap must contain ${expectedUrl} exactly once; found ${sitemapCount}`);

  const html = readText(file);
  const canonicals = canonicalValues(html);
  if (canonicals.length !== 1) {
    fail(`${slug}: expected exactly one canonical; found ${canonicals.length}`);
  } else if (canonicals[0] !== expectedUrl) {
    fail(`${slug}: canonical mismatch: expected ${expectedUrl}; found ${canonicals[0] || '(empty)'}`);
  }

  const ogUrls = ogUrlValues(html);
  if (ogUrls.length !== 1) {
    fail(`${slug}: expected exactly one og:url; found ${ogUrls.length}`);
  } else if (ogUrls[0] !== expectedUrl) {
    fail(`${slug}: og:url mismatch: expected ${expectedUrl}; found ${ogUrls[0] || '(empty)'}`);
  }

  const apps = webApplications(html, relativeFile);
  if (apps.length === 0) {
    fail(`${slug}: missing WebApplication JSON-LD`);
  } else {
    for (const app of apps) {
      if (app.url !== expectedUrl) {
        fail(`${slug}: WebApplication url mismatch: expected ${expectedUrl}; found ${JSON.stringify(app.url ?? null)}`);
      }
    }
  }

  const identityUrls = [...canonicals, ...ogUrls, ...apps.map((app) => app.url).filter((value) => typeof value === 'string')];
  for (const url of identityUrls) {
    if (/pages\.dev/i.test(url)) fail(`${slug}: deprecated pages.dev identity URL: ${url}`);
    if (/^https?:\/\//i.test(url) && !url.startsWith(`${SITE_ORIGIN}/`)) fail(`${slug}: non-canonical public origin in identity URL: ${url}`);
  }
}

if (fs.existsSync(toolsDir)) {
  for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const landing = path.join(toolsDir, entry.name, 'index.html');
    if (fs.existsSync(landing) && !seen.has(entry.name)) fail(`${entry.name}: public tool landing exists but slug is absent from tools/tools-index.json`);
  }
}

for (const match of sitemap.matchAll(/<loc>\s*https:\/\/nicheworks\.app\/tools\/([^/<]+)\/\s*<\/loc>/g)) {
  const slug = match[1];
  if (!seen.has(slug)) fail(`${slug}: sitemap publishes a tool landing URL that is absent from tools/tools-index.json`);
}

if (errors.length) {
  console.error(`SEO public URL contract: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO public URL contract: OK (${items.length} registered tools checked)`);
}
