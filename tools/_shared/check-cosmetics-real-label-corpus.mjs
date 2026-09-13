import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];

const ALLOWED_OFFICIAL_HOSTS = new Set([
  'www.kao-kirei.com',
  'www.cerave.com',
  'www.laroche-posay.us'
]);

const corpus = JSON.parse(read('tools/_shared/cosmetics-real-label-corpus.json'));
const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));

assert.ok(Array.isArray(corpus), 'real-label corpus must be an array');
assert.ok(corpus.length >= 12, 'real-label corpus cohort 1 requires at least 12 source-backed products');

const ids = new Set();
const brands = new Set();
const markets = new Set();
const languages = new Set();
const categories = new Set();
const owners = new Map();

function canonicalIdentity(value) {
  if (parser?.canonicalIdentityKey) return parser.canonicalIdentityKey(value);
  if (parser?.normalizeBaseKey) return parser.normalizeBaseKey(value);
  return String(value || '').normalize('NFKC').toLowerCase().trim();
}

function addOwner(value, canonical) {
  const key = parser.normalizeKey(value);
  if (!key) return;
  if (!owners.has(key)) owners.set(key, new Set());
  owners.get(key).add(canonicalIdentity(canonical));
}

for (const item of records) {
  if (!item?.en) continue;
  addOwner(item.en, item.en);
  for (const value of Array.isArray(item.jp) ? item.jp : []) addOwner(value, item.en);
  for (const value of Array.isArray(item.alias) ? item.alias : []) addOwner(value, item.en);
}

function isExactKnown(value) {
  const key = parser.normalizeKey(value);
  if (!key) return false;
  const set = owners.get(key);
  return Boolean(set && set.size === 1);
}

let ingredientTotal = 0;
let exactKnownTotal = 0;
const unknownCounts = new Map();
const results = [];

for (const item of corpus) {
  for (const field of [
    'id', 'brand', 'product', 'market', 'category', 'label_language',
    'source_type', 'source_url', 'retrieved_at', 'source_label',
    'analysis_label', 'transform_note'
  ]) {
    assert.equal(typeof item[field], 'string', `${item.id || '<missing-id>'}: ${field} must be a string`);
    assert.ok(item[field].trim(), `${item.id || '<missing-id>'}: ${field} must not be empty`);
  }

  assert.ok(!ids.has(item.id), `duplicate real-label corpus id: ${item.id}`);
  ids.add(item.id);
  brands.add(item.brand);
  markets.add(item.market);
  languages.add(item.label_language);
  categories.add(item.category);

  assert.equal(item.source_type, 'official_product_page', `${item.id}: source_type must be official_product_page in cohort 1`);
  const sourceUrl = new URL(item.source_url);
  assert.equal(sourceUrl.protocol, 'https:', `${item.id}: source URL must use https`);
  assert.ok(ALLOWED_OFFICIAL_HOSTS.has(sourceUrl.hostname), `${item.id}: source host is not an approved official host: ${sourceUrl.hostname}`);
  assert.match(item.retrieved_at, /^2026-09-13$/, `${item.id}: cohort 1 retrieved_at must be 2026-09-13`);

  const parts = parser.splitIngredients(item.analysis_label);
  assert.ok(parts.length >= 8, `${item.id}: analysis label is too small (${parts.length})`);

  const unknown = [];
  let known = 0;
  for (const value of parts) {
    if (isExactKnown(value)) {
      known += 1;
    } else {
      unknown.push(value);
      const key = parser.normalizeBaseKey ? parser.normalizeBaseKey(value) : value.toLowerCase();
      unknownCounts.set(key, (unknownCounts.get(key) || 0) + 1);
    }
  }

  ingredientTotal += parts.length;
  exactKnownTotal += known;
  results.push({
    id: item.id,
    brand: item.brand,
    category: item.category,
    market: item.market,
    ingredients: parts.length,
    exact_known: known,
    unknown: unknown.length,
    exact_coverage: Number((known / parts.length).toFixed(4))
  });
}

assert.ok(brands.size >= 3, `real-label corpus requires at least 3 brands; found ${brands.size}`);
assert.ok(markets.has('JP') && markets.has('US'), 'real-label corpus must include JP and US markets');
assert.ok(languages.has('ja') && languages.has('en'), 'real-label corpus must include Japanese and English labels');
assert.ok(categories.size >= 6, `real-label corpus requires at least 6 categories; found ${categories.size}`);

const unknownInventory = [...unknownCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([name, count]) => ({ name, count }));
const topUnknowns = unknownInventory.slice(0, 30);

const overallCoverage = ingredientTotal ? exactKnownTotal / ingredientTotal : 0;

// Wave 4 baseline. Keep the same source-backed products and improve actual
// exact-identity coverage; do not inflate the score by treating broad group
// labels or visibly truncated OCR/label fragments as one exact chemical.
assert.ok(overallCoverage >= 0.80, `real-label exact coverage ${(overallCoverage * 100).toFixed(2)}% is below the 80% Wave 4 floor`);
assert.equal(isExactKnown('パラベン'), false, 'broad group label パラベン must not become one exact ingredient identity');
assert.equal(isExactKnown('Ammonium Polyacryloyldimethyl'), false, 'truncated Ammonium Polyacryloyldimethyl must remain non-exact');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'wave4-real-label-gap-wave2',
  products: corpus.length,
  brands: brands.size,
  markets: [...markets].sort(),
  languages: [...languages].sort(),
  categories: categories.size,
  ingredients: ingredientTotal,
  exact_known: exactKnownTotal,
  unknown: ingredientTotal - exactKnownTotal,
  exact_coverage: Number(overallCoverage.toFixed(4)),
  exact_coverage_floor: 0.80,
  distinct_unknowns: unknownInventory.length,
  broad_group_labels_are_not_exact: true,
  top_unknowns: topUnknowns,
  unknown_inventory: unknownInventory,
  results
}, null, 2));
