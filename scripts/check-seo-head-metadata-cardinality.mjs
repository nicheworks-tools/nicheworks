import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
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

function titleValues(html) {
  return [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim());
}

function isNoindex(html) {
  return metaValues(html, 'name', 'robots').some((value) => value.toLowerCase().split(/[\s,]+/).includes('noindex'));
}

function checkSingleton(relative, label, values) {
  if (values.length !== 1) {
    fail(`${relative}: expected exactly one ${label}; found ${values.length}`);
    return '';
  }
  if (!values[0]) fail(`${relative}: ${label} is empty`);
  return values[0];
}

function checkHttpsImage(relative, label, value) {
  if (!value) return;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`${relative}: ${label} is not an absolute URL: ${value}`);
    return;
  }
  if (parsed.protocol !== 'https:') fail(`${relative}: ${label} must use https: ${value}`);
  if (/pages\.dev/i.test(parsed.hostname)) fail(`${relative}: ${label} uses deprecated pages.dev origin: ${value}`);
}

let scanned = 0;
let indexable = 0;
let noindex = 0;
let singletonChecks = 0;

for (const file of listHtml()) {
  scanned += 1;
  const relative = rel(file);
  const html = readText(file);
  if (isNoindex(html)) {
    noindex += 1;
    continue;
  }
  indexable += 1;

  const values = {
    title: titleValues(html),
    description: metaValues(html, 'name', 'description'),
    robots: metaValues(html, 'name', 'robots'),
    'og:title': metaValues(html, 'property', 'og:title'),
    'og:description': metaValues(html, 'property', 'og:description'),
    'og:url': metaValues(html, 'property', 'og:url'),
    'og:image': metaValues(html, 'property', 'og:image'),
    'twitter:card': metaValues(html, 'name', 'twitter:card'),
    'twitter:title': metaValues(html, 'name', 'twitter:title'),
    'twitter:description': metaValues(html, 'name', 'twitter:description'),
    'twitter:image': metaValues(html, 'name', 'twitter:image')
  };

  const resolved = {};
  for (const [label, fieldValues] of Object.entries(values)) {
    singletonChecks += 1;
    resolved[label] = checkSingleton(relative, label, fieldValues);
  }

  for (const label of ['og:url', 'og:image', 'twitter:image']) {
    if (resolved[label] && /pages\.dev/i.test(resolved[label])) {
      fail(`${relative}: ${label} contains deprecated pages.dev origin: ${resolved[label]}`);
    }
  }

  checkHttpsImage(relative, 'og:image', resolved['og:image']);
  checkHttpsImage(relative, 'twitter:image', resolved['twitter:image']);
}

const summary = `${indexable} indexable / ${noindex} noindex / ${scanned} scanned; ${singletonChecks} singleton field checks`;

if (errors.length) {
  console.error(`SEO head metadata cardinality: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${summary})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`SEO head metadata cardinality: OK (${summary})`);
}
