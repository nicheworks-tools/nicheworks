import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, htmlFilePublicUrl } from './seo-public-url-contract.mjs';

const root = process.cwd();
const SITE_HOST = new URL(SITE_ORIGIN).host;
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const NON_NAV_SCHEMES = /^(?:mailto|tel|javascript|data|blob):/i;
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

function excludedRelative(relative) {
  return relative.startsWith('_archive/')
    || relative.startsWith('apps/')
    || relative.startsWith('templates/')
    || relative.startsWith('tools/_template/')
    || relative.startsWith('pro/unlock/')
    || relative.includes('/mock/')
    || relative.endsWith('/404.html')
    || relative.includes('/howto/howto/');
}

function excluded(file) {
  return excludedRelative(rel(file));
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

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => tagAttr(match[0], 'href'))
    .filter(Boolean);
}

function looksLikeHtmlNavigation(pathname) {
  if (pathname.endsWith('/')) return true;
  const basename = path.posix.basename(pathname);
  const extension = path.posix.extname(basename).toLowerCase();
  return extension === '' || extension === '.html' || extension === '.htm';
}

function candidateRelatives(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return [];
  }

  const normalized = path.posix.normalize(decoded || '/');
  const relative = normalized.replace(/^\/+/, '');
  if (!relative) return ['index.html'];

  const candidates = [];
  if (normalized.endsWith('/')) {
    candidates.push(`${relative.replace(/\/$/, '')}/index.html`);
  } else {
    candidates.push(relative);
    const extension = path.posix.extname(relative);
    if (!extension) {
      candidates.push(`${relative}.html`);
      candidates.push(`${relative}/index.html`);
    }
  }
  return [...new Set(candidates)];
}

function publicExistingTarget(pathname) {
  for (const relative of candidateRelatives(pathname)) {
    if (!relative || excludedRelative(relative)) continue;
    const absolute = path.resolve(root, relative);
    const rootPrefix = `${root}${path.sep}`;
    if (absolute !== root && !absolute.startsWith(rootPrefix)) continue;
    if (!fs.existsSync(absolute)) continue;
    let stat;
    try {
      stat = fs.statSync(absolute);
    } catch {
      continue;
    }
    if (stat.isFile()) return relative;
  }
  return '';
}

const pages = [];
let scanned = 0;
let noindex = 0;

for (const file of listHtml()) {
  scanned += 1;
  const relative = rel(file);
  const html = readText(file);
  if (isNoindex(html)) {
    noindex += 1;
    continue;
  }

  let canonicalUrl = '';
  try {
    canonicalUrl = htmlFilePublicUrl(relative);
  } catch (error) {
    fail(`${relative}: cannot derive public URL: ${error.message}`);
    continue;
  }

  pages.push({ relative, canonicalUrl, hrefs: anchorHrefs(html) });
}

let checkedLinks = 0;
const uniqueTargets = new Set();

for (const page of pages) {
  for (const href of page.hrefs) {
    if (!href || href.startsWith('#') || NON_NAV_SCHEMES.test(href)) continue;

    let resolved;
    try {
      resolved = new URL(href, page.canonicalUrl);
    } catch {
      if (/^(?:https?:)?\/\//i.test(href) || href.startsWith('/') || href.startsWith('.') || !href.includes(':')) {
        fail(`${page.relative}: invalid navigation href: ${href}`);
      }
      continue;
    }

    if (!['http:', 'https:'].includes(resolved.protocol)) continue;
    if (resolved.host !== SITE_HOST) continue;

    if (resolved.protocol !== 'https:') {
      fail(`${page.relative}: internal navigation must use https: ${href}`);
      continue;
    }
    if (resolved.origin !== SITE_ORIGIN) {
      fail(`${page.relative}: internal navigation must use ${SITE_ORIGIN}: ${href}`);
      continue;
    }
    if (!looksLikeHtmlNavigation(resolved.pathname)) continue;

    checkedLinks += 1;
    const identity = `${resolved.origin}${resolved.pathname}`;
    uniqueTargets.add(identity);

    const target = publicExistingTarget(resolved.pathname);
    if (!target) {
      fail(`${page.relative}: internal navigation target does not exist: ${href} -> ${resolved.pathname}`);
    }
  }
}

const indexable = pages.length;
const summary = `${indexable} indexable / ${noindex} noindex / ${scanned} scanned; ${checkedLinks} internal navigation links / ${uniqueTargets.size} unique targets`;

if (errors.length) {
  console.error(`SEO internal link integrity: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${summary})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO internal link integrity: OK (${summary})`);
}
