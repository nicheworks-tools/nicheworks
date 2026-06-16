import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const expectedToolCount = 87;
const legacyFlagKey = ['review', 'Mode'].join('');
const legacyIndexName = ['tools-index', 'review'].join('-') + '.json';
const legacySitemapName = ['sitemap', 'review'].join('-') + '.xml';

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : null;
}

function fail(message) {
  failures.push(message);
}

for (const relativePath of [path.join('tools', legacyIndexName), legacySitemapName]) {
  if (fs.existsSync(path.join(root, relativePath))) fail(`${relativePath} must not exist.`);
}

const indexText = read(path.join('tools', 'tools-index.json'));
if (indexText === null) {
  fail('tools/tools-index.json is missing.');
} else {
  try {
    const index = JSON.parse(indexText);
    if (Object.prototype.hasOwnProperty.call(index, legacyFlagKey)) fail(`tools index still contains ${legacyFlagKey}.`);
    if (index.total !== expectedToolCount) fail(`tools index total must be ${expectedToolCount}.`);
    if (!Array.isArray(index.items) || index.items.length !== expectedToolCount) fail(`tools index must contain ${expectedToolCount} items.`);
    if (Array.isArray(index.items)) {
      const slugs = index.items.map((item) => item?.slug).filter(Boolean);
      if (new Set(slugs).size !== expectedToolCount) fail('tools index contains missing or duplicate slugs.');
    }
  } catch (error) {
    fail(`tools index is invalid JSON: ${error.message}`);
  }
}

const robots = read('robots.txt');
const expectedRobots = 'User-agent: *\nAllow: /\n\nSitemap: https://nicheworks.app/sitemap.xml\n';
if (robots !== expectedRobots) fail('robots.txt must contain only the normal sitemap declaration.');

if (failures.length > 0) {
  console.error('[publishing-mode] FAILED');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`[publishing-mode] OK: ${expectedToolCount} tools in normal publication mode.`);
