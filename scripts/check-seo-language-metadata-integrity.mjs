import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, htmlFilePublicUrl } from './seo-public-url-contract.mjs';

const root = process.cwd();
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const LANGUAGE_TAG_RE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
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

function htmlLangValues(html) {
  return [...html.matchAll(/<html\b[^>]*>/gi)].map((match) => tagAttr(match[0], 'lang'));
}

function alternateLinks(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttr(tag, 'rel').toLowerCase().split(/\s+/).includes('alternate'))
    .map((tag) => ({
      hreflang: tagAttr(tag, 'hreflang'),
      href: tagAttr(tag, 'href')
    }))
    .filter((item) => item.hreflang || item.href);
}

function validLanguageTag(value) {
  return LANGUAGE_TAG_RE.test(value);
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
  }

  const langs = htmlLangValues(html);
  if (langs.length !== 1) {
    fail(`${relative}: expected exactly one <html> lang; found ${langs.length}`);
  } else if (!langs[0]) {
    fail(`${relative}: html lang is empty`);
  } else if (!validLanguageTag(langs[0])) {
    fail(`${relative}: invalid html lang: ${langs[0]}`);
  }

  pages.push({
    relative,
    canonicalUrl,
    htmlLang: langs[0] || '',
    alternates: alternateLinks(html)
  });
}

const pageByUrl = new Map(pages.filter((page) => page.canonicalUrl).map((page) => [page.canonicalUrl, page]));
let hreflangPages = 0;
let hreflangLinks = 0;

for (const page of pages) {
  if (page.alternates.length === 0) continue;
  hreflangPages += 1;
  hreflangLinks += page.alternates.length;

  const seenKeys = new Set();
  for (const alternate of page.alternates) {
    const key = alternate.hreflang.toLowerCase();
    if (!alternate.hreflang) {
      fail(`${page.relative}: alternate link is missing hreflang for href ${alternate.href || '(empty)'}`);
      continue;
    }
    if (seenKeys.has(key)) fail(`${page.relative}: duplicate hreflang key ${alternate.hreflang}`);
    seenKeys.add(key);

    if (key !== 'x-default' && !validLanguageTag(alternate.hreflang)) {
      fail(`${page.relative}: invalid hreflang value ${alternate.hreflang}`);
    }
    if (!alternate.href) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} has empty href`);
      continue;
    }

    let parsed;
    try {
      parsed = new URL(alternate.href);
    } catch {
      fail(`${page.relative}: hreflang ${alternate.hreflang} href is not an absolute URL: ${alternate.href}`);
      continue;
    }
    if (parsed.protocol !== 'https:') {
      fail(`${page.relative}: hreflang ${alternate.hreflang} href must use https: ${alternate.href}`);
      continue;
    }
    if (parsed.origin !== SITE_ORIGIN) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} href must use ${SITE_ORIGIN}: ${alternate.href}`);
      continue;
    }
    if (parsed.search || parsed.hash) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} href must be canonical without query/fragment: ${alternate.href}`);
      continue;
    }

    const target = pageByUrl.get(alternate.href);
    if (!target) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} target is not an indexable canonical page: ${alternate.href}`);
      continue;
    }
    if (alternate.href !== target.canonicalUrl) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} target is not canonical: ${alternate.href}`);
    }
  }
}

for (const page of pages) {
  for (const alternate of page.alternates) {
    if (!alternate.hreflang || alternate.hreflang.toLowerCase() === 'x-default') continue;
    const target = pageByUrl.get(alternate.href);
    if (!target) continue;
    const reciprocal = target.alternates.some((candidate) =>
      candidate.hreflang
      && candidate.hreflang.toLowerCase() !== 'x-default'
      && candidate.href === page.canonicalUrl
    );
    if (!reciprocal) {
      fail(`${page.relative}: hreflang ${alternate.hreflang} target ${target.relative} does not link back to ${page.canonicalUrl}`);
    }
  }
}

const indexable = pages.length;
const summary = `${indexable} indexable / ${noindex} noindex / ${scanned} scanned; ${indexable} html lang checks; ${hreflangPages} pages with hreflang / ${hreflangLinks} hreflang links`;

if (errors.length) {
  console.error(`SEO language metadata integrity: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${summary})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO language metadata integrity: OK (${summary})`);
}
