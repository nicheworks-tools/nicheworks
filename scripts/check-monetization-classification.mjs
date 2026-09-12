import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), 'utf8'),
);

const registry = readJson('tools/tools-index.json');
const ledger = readJson('MONETIZATION_CLASSIFICATION_87.json');

const allowedClasses = [
  'PRO_BUNDLE',
  'STANDALONE_PRO',
  'AFFILIATE',
  'ADS_DONATION',
  'FREE',
  'HOLD',
];

const fail = (message) => {
  console.error(`monetization classification check failed: ${message}`);
  process.exitCode = 1;
};

if (ledger.schemaVersion !== 'nicheworks-monetization-classification-v1') {
  fail(`unexpected schemaVersion: ${ledger.schemaVersion}`);
}

if (!Number.isInteger(registry.total) || !Array.isArray(registry.items)) {
  fail('tools/tools-index.json does not expose integer total + items[]');
}

if (registry.total !== registry.items.length) {
  fail(`registry total=${registry.total} but items.length=${registry.items.length}`);
}

if (ledger.registryTotal !== registry.total) {
  fail(`ledger registryTotal=${ledger.registryTotal} but registry total=${registry.total}`);
}

if (ledger.bundleProductId !== 'nicheworks.pro') {
  fail(`bundleProductId must be nicheworks.pro, got ${ledger.bundleProductId}`);
}

if (ledger.bundleBoundaryStatus !== 'pending-freeze') {
  fail(`bundleBoundaryStatus must remain pending-freeze in this phase, got ${ledger.bundleBoundaryStatus}`);
}

if (!ledger.classes || typeof ledger.classes !== 'object') {
  fail('ledger classes object is missing');
}

const classKeys = Object.keys(ledger.classes || {});
for (const key of classKeys) {
  if (!allowedClasses.includes(key)) fail(`unknown class: ${key}`);
}
for (const key of allowedClasses) {
  if (!Array.isArray(ledger.classes?.[key])) fail(`missing class array: ${key}`);
}

const flattened = [];
for (const key of allowedClasses) {
  for (const slug of ledger.classes?.[key] || []) {
    if (typeof slug !== 'string' || !slug.trim()) {
      fail(`invalid slug in ${key}`);
      continue;
    }
    flattened.push({ slug, className: key });
  }
}

const occurrences = new Map();
for (const item of flattened) {
  const existing = occurrences.get(item.slug) || [];
  existing.push(item.className);
  occurrences.set(item.slug, existing);
}

for (const [slug, classes] of occurrences) {
  if (classes.length !== 1) fail(`slug classified ${classes.length} times: ${slug} -> ${classes.join(', ')}`);
}

const registrySlugs = registry.items.map((item) => item.slug);
const registrySet = new Set(registrySlugs);
const ledgerSet = new Set(flattened.map((item) => item.slug));

if (registrySet.size !== registrySlugs.length) {
  fail('tools/tools-index.json contains duplicate slugs');
}

for (const slug of registrySet) {
  if (!ledgerSet.has(slug)) fail(`registered slug missing from monetization ledger: ${slug}`);
}
for (const slug of ledgerSet) {
  if (!registrySet.has(slug)) fail(`unregistered slug present in monetization ledger: ${slug}`);
}

if (flattened.length !== registry.total) {
  fail(`classified ${flattened.length} entries but registry total is ${registry.total}`);
}

for (const key of allowedClasses) {
  const actual = ledger.classes?.[key]?.length ?? 0;
  const declared = ledger.counts?.[key];
  if (declared !== actual) {
    fail(`declared count for ${key}=${declared}, actual=${actual}`);
  }
}

const declaredTotal = allowedClasses.reduce((sum, key) => sum + (ledger.counts?.[key] ?? 0), 0);
if (declaredTotal !== registry.total) {
  fail(`declared class counts sum to ${declaredTotal}, registry total is ${registry.total}`);
}

if (!process.exitCode) {
  console.log(
    `monetization classification OK: ${registry.total} tools; ` +
    allowedClasses.map((key) => `${key}=${ledger.classes[key].length}`).join(', '),
  );
}
