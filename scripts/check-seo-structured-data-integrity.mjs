import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, htmlFilePublicUrl } from './seo-public-url-contract.mjs';

const root = process.cwd();
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const PAGE_IDENTITY_TYPES = new Set([
  'WebApplication',
  'SoftwareApplication',
  'MobileApplication',
  'WebPage',
  'AboutPage',
  'CheckoutPage',
  'CollectionPage',
  'ContactPage',
  'FAQPage',
  'ItemPage',
  'MedicalWebPage',
  'ProfilePage',
  'QAPage',
  'SearchResultsPage',
  'Article',
  'AdvertiserContentArticle',
  'BlogPosting',
  'NewsArticle',
  'Report',
  'SatiricalArticle',
  'ScholarlyArticle',
  'SocialMediaPosting',
  'TechArticle',
  'HowTo'
]);
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

function isNoindex(html) {
  return metaValues(html, 'name', 'robots').some((value) => value.toLowerCase().split(/[\s,]+/).includes('noindex'));
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim());
}

function typesOf(node) {
  const value = node?.['@type'];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  return [];
}

function isPageIdentityNode(node) {
  return typesOf(node).some((type) => PAGE_IDENTITY_TYPES.has(type));
}

function topLevelNodes(value) {
  const output = [];
  const add = (node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    if (node['@type']) output.push(node);
    if (Array.isArray(node['@graph'])) {
      for (const item of node['@graph']) {
        if (item && typeof item === 'object' && !Array.isArray(item)) output.push(item);
      }
    }
  };

  if (Array.isArray(value)) {
    for (const item of value) add(item);
  } else {
    add(value);
  }
  return output;
}

function identityValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && !Array.isArray(value) && typeof value['@id'] === 'string') {
    return value['@id'].trim();
  }
  return '';
}

function shouldCompareMainEntity(value) {
  return /^https?:\/\//i.test(value) && (value.startsWith(`${SITE_ORIGIN}/`) || /pages\.dev/i.test(value));
}

let scanned = 0;
let indexable = 0;
let noindex = 0;
let blockCount = 0;
let parsedBlockCount = 0;
let pageIdentityNodeCount = 0;
let pageIdentityUrlCount = 0;
let mainEntityIdentityCount = 0;

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

  const blocks = jsonLdBlocks(html);
  blockCount += blocks.length;
  if (blocks.length === 0) {
    fail(`${relative}: missing application/ld+json block`);
    continue;
  }

  blocks.forEach((raw, index) => {
    const label = `${relative}: JSON-LD block ${index + 1}`;
    if (!raw) {
      fail(`${label} is empty`);
      return;
    }
    if (/pages\.dev/i.test(raw)) fail(`${label} contains deprecated pages.dev origin`);

    let parsed;
    try {
      parsed = JSON.parse(raw);
      parsedBlockCount += 1;
    } catch (error) {
      fail(`${label} is invalid JSON: ${error.message}`);
      return;
    }

    for (const node of topLevelNodes(parsed)) {
      if (!isPageIdentityNode(node)) continue;
      pageIdentityNodeCount += 1;
      const typeLabel = typesOf(node).join('|') || '(unknown type)';

      if (Object.hasOwn(node, 'url')) {
        const value = identityValue(node.url);
        pageIdentityUrlCount += 1;
        if (!value) {
          fail(`${label} ${typeLabel} has unusable url: ${JSON.stringify(node.url)}`);
        } else if (value !== expectedUrl) {
          fail(`${label} ${typeLabel} url mismatch: expected ${expectedUrl}; found ${value}`);
        }
      }

      if (Object.hasOwn(node, 'mainEntityOfPage')) {
        const value = identityValue(node.mainEntityOfPage);
        if (value && shouldCompareMainEntity(value)) {
          mainEntityIdentityCount += 1;
          if (value !== expectedUrl) {
            fail(`${label} ${typeLabel} mainEntityOfPage mismatch: expected ${expectedUrl}; found ${value}`);
          }
        }
      }
    }
  });
}

const summary = `${indexable} indexable / ${noindex} noindex / ${scanned} scanned; ${blockCount} JSON-LD blocks / ${parsedBlockCount} parsed; ${pageIdentityNodeCount} page-identity nodes / ${pageIdentityUrlCount} urls / ${mainEntityIdentityCount} mainEntityOfPage identities`;

if (errors.length) {
  console.error(`SEO structured data integrity: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${summary})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO structured data integrity: OK (${summary})`);
}
