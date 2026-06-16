import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const reviewKey = ['review', 'Mode'].join('');
const reviewOnlyIdentifier = ['REVIEW', 'ONLY', 'SLUGS'].join('_');
const reviewIndexName = ['tools-index', 'review'].join('-') + '.json';
const reviewSitemapName = ['sitemap', 'review'].join('-') + '.xml';
const oldKanjiOnlyJa = ['審査中は', '内容確認済み'].join('');
const oldKanjiOnlyEnTitle = ['Old Kanji Reference', 'and Small Browser Tools'].join(' ');
const oldKanjiOnlyEnDescription = ['centered on an', 'Old Kanji Reference'].join(' ');
const reviewOnlyLabel = ['review', 'only'].join('-');
const reviewedPagesOnly = ['reviewed pages', 'only'].join(' ');

function fail(message) {
  errors.push(message);
}

for (const obsoleteFile of [
  `tools/${reviewIndexName}`,
  reviewSitemapName
]) {
  if (exists(obsoleteFile)) fail(`obsolete publishing file still exists: ${obsoleteFile}`);
}

let index;
try {
  index = JSON.parse(read('tools/tools-index.json'));
} catch (error) {
  fail(`tools/tools-index.json is not valid JSON: ${error.message}`);
  index = { items: [] };
}

if (Object.prototype.hasOwnProperty.call(index, reviewKey)) {
  fail(`tools/tools-index.json still contains obsolete key: ${reviewKey}`);
}
if (index.total !== 87) fail(`tools/tools-index.json total must be 87, got ${index.total}`);
if (!Array.isArray(index.items) || index.items.length !== 87) {
  fail(`tools/tools-index.json items length must be 87, got ${Array.isArray(index.items) ? index.items.length : 'non-array'}`);
}
const slugs = Array.isArray(index.items) ? index.items.map((item) => item?.slug).filter(Boolean) : [];
if (new Set(slugs).size !== 87) fail(`tools/tools-index.json must contain 87 unique slugs, got ${new Set(slugs).size}`);

const robots = read('robots.txt').replace(/\r\n/g, '\n').trim();
const expectedRobots = [
  'User-agent: *',
  'Allow: /',
  'Sitemap: https://nicheworks.app/sitemap.xml'
].join('\n');
if (robots !== expectedRobots) fail('robots.txt must allow the site and reference only sitemap.xml');

const scanFiles = [
  'index.html',
  'en/index.html',
  'robots.txt',
  'sitemap.xml',
  'scripts/generate-tools-index.mjs',
  '.github/workflows/seo-auto-repair.yml'
];
const forbidden = [
  reviewOnlyIdentifier,
  reviewIndexName,
  reviewSitemapName,
  oldKanjiOnlyJa,
  oldKanjiOnlyEnTitle,
  oldKanjiOnlyEnDescription,
  reviewOnlyLabel,
  reviewedPagesOnly
];

for (const relativePath of scanFiles) {
  if (!exists(relativePath)) {
    fail(`required publishing file is missing: ${relativePath}`);
    continue;
  }
  const text = read(relativePath);
  for (const token of forbidden) {
    if (text.includes(token)) fail(`${relativePath} contains obsolete publishing token: ${token}`);
  }
}

if (errors.length) {
  console.error(`Publishing-mode audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Publishing-mode audit passed: full 87-tool publishing mode is enforced.');
}
