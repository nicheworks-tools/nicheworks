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

const CORPUS_FILES = [
  ['cohort1', 'tools/_shared/cosmetics-real-label-corpus.json'],
  ['cohort2', 'tools/_shared/cosmetics-real-label-corpus-cohort2.json']
];

const ALLOWED_OFFICIAL_HOSTS = new Set([
  'www.kao-kirei.com',
  'www.cerave.com',
  'www.laroche-posay.us',
  'theordinary.com',
  'www.neutrogena.com',
  'www.eucerinus.com'
]);

const corpus = CORPUS_FILES.flatMap(([defaultCohort, rel]) => {
  const items = JSON.parse(read(rel));
  assert.ok(Array.isArray(items), `${rel}: real-label corpus file must be an array`);
  return items.map((item) => ({ ...item, cohort: item.cohort || defaultCohort }));
});
const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));

assert.ok(corpus.length >= 18, 'real-label corpus requires at least 18 source-backed products after cohort 2 expansion');

const ids = new Set();
const brands = new Set();
const markets = new Set();
const languages = new Set();
const categories = new Set();
const owners = new Map();
const cohortStats = new Map();

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

function ensureCohortStats(cohort) {
  if (!cohortStats.has(cohort)) {
    cohortStats.set(cohort, {
      cohort,
      products: 0,
      brands: new Set(),
      categories: new Set(),
      ingredients: 0,
      exactKnown: 0,
      unknownCounts: new Map()
    });
  }
  return cohortStats.get(cohort);
}

let ingredientTotal = 0;
let exactKnownTotal = 0;
const unknownCounts = new Map();
const results = [];

for (const item of corpus) {
  for (const field of [
    'id', 'cohort', 'brand', 'product', 'market', 'category', 'label_language',
    'source_type', 'source_url', 'retrieved_at', 'source_label',
    'analysis_label', 'transform_note'
  ]) {
    assert.equal(typeof item[field], 'string', `${item.id || '<missing-id>'}: ${field} must be a string`);
    assert.ok(item[field].trim(), `${item.id || '<missing-id>'}: ${field} must not be empty`);
  }

  assert.ok(['cohort1', 'cohort2'].includes(item.cohort), `${item.id}: unsupported corpus cohort ${item.cohort}`);
  assert.ok(!ids.has(item.id), `duplicate real-label corpus id: ${item.id}`);
  ids.add(item.id);
  brands.add(item.brand);
  markets.add(item.market);
  languages.add(item.label_language);
  categories.add(item.category);

  assert.equal(item.source_type, 'official_product_page', `${item.id}: source_type must be official_product_page`);
  const sourceUrl = new URL(item.source_url);
  assert.equal(sourceUrl.protocol, 'https:', `${item.id}: source URL must use https`);
  assert.ok(ALLOWED_OFFICIAL_HOSTS.has(sourceUrl.hostname), `${item.id}: source host is not an approved official host: ${sourceUrl.hostname}`);
  if (item.cohort === 'cohort1') {
    assert.match(item.retrieved_at, /^2026-09-13$/, `${item.id}: cohort 1 retrieved_at must be 2026-09-13`);
  } else {
    assert.match(item.retrieved_at, /^2026-09-14$/, `${item.id}: cohort 2 retrieved_at must be 2026-09-14`);
  }

  const parts = parser.splitIngredients(item.analysis_label);
  assert.ok(parts.length >= 8, `${item.id}: analysis label is too small (${parts.length})`);

  const cohort = ensureCohortStats(item.cohort);
  cohort.products += 1;
  cohort.brands.add(item.brand);
  cohort.categories.add(item.category);

  const unknown = [];
  let known = 0;
  for (const value of parts) {
    if (isExactKnown(value)) {
      known += 1;
    } else {
      unknown.push(value);
      const key = parser.normalizeBaseKey ? parser.normalizeBaseKey(value) : value.toLowerCase();
      unknownCounts.set(key, (unknownCounts.get(key) || 0) + 1);
      cohort.unknownCounts.set(key, (cohort.unknownCounts.get(key) || 0) + 1);
    }
  }

  ingredientTotal += parts.length;
  exactKnownTotal += known;
  cohort.ingredients += parts.length;
  cohort.exactKnown += known;
  results.push({
    id: item.id,
    cohort: item.cohort,
    brand: item.brand,
    category: item.category,
    market: item.market,
    ingredients: parts.length,
    exact_known: known,
    unknown: unknown.length,
    exact_coverage: Number((known / parts.length).toFixed(4))
  });
}

assert.ok(brands.size >= 6, `expanded real-label corpus requires at least 6 brands; found ${brands.size}`);
assert.ok(markets.has('JP') && markets.has('US'), 'real-label corpus must include JP and US markets');
assert.ok(languages.has('ja') && languages.has('en'), 'real-label corpus must include Japanese and English labels');
assert.ok(categories.size >= 10, `expanded real-label corpus requires at least 10 categories; found ${categories.size}`);

const cohort1 = cohortStats.get('cohort1');
const cohort2 = cohortStats.get('cohort2');
assert.ok(cohort1 && cohort1.products === 12, `cohort 1 must remain exactly 12 fixed products; found ${cohort1?.products || 0}`);
assert.ok(cohort2 && cohort2.products >= 6, `cohort 2 requires at least 6 products; found ${cohort2?.products || 0}`);
assert.ok(cohort2.brands.size >= 3, `cohort 2 requires at least 3 new brands; found ${cohort2.brands.size}`);
assert.ok(cohort2.categories.size >= 5, `cohort 2 requires at least 5 categories; found ${cohort2.categories.size}`);

const cohort1Coverage = cohort1.exactKnown / cohort1.ingredients;
const cohort2Coverage = cohort2.exactKnown / cohort2.ingredients;
assert.ok(cohort1Coverage >= 0.965, `cohort 1 exact coverage ${(cohort1Coverage * 100).toFixed(2)}% is below its frozen 96.5% floor`);
assert.ok(cohort2Coverage >= 0.95, `cohort 2 exact coverage ${(cohort2Coverage * 100).toFixed(2)}% is below the 95% Wave 1 floor`);

for (const unresolved of [
  'パラベン',
  'エデト酸塩',
  'Ammonium Polyacryloyldimethyl',
  'POE・ジメチコン共重合体',
  'POEメチルグルコシド',
  'POE水添ヒマシ油',
  'Carbomer Homopolymer Type B',
  'Chondrus Crispus',
  'Phospholipids'
]) {
  assert.equal(isExactKnown(unresolved), false, `${unresolved}: under-specified or deliberately deferred label must remain non-exact`);
}

function sortedUnknownInventory(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

const unknownInventory = sortedUnknownInventory(unknownCounts);
const overallCoverage = ingredientTotal ? exactKnownTotal / ingredientTotal : 0;
const cohortSummaries = [...cohortStats.values()].map((cohort) => {
  const unknownInventoryForCohort = sortedUnknownInventory(cohort.unknownCounts);
  const floor = cohort.cohort === 'cohort1' ? 0.965 : 0.95;
  return {
    cohort: cohort.cohort,
    products: cohort.products,
    brands: [...cohort.brands].sort(),
    categories: [...cohort.categories].sort(),
    ingredients: cohort.ingredients,
    exact_known: cohort.exactKnown,
    unknown: cohort.ingredients - cohort.exactKnown,
    exact_coverage: Number((cohort.exactKnown / cohort.ingredients).toFixed(4)),
    exact_coverage_floor: floor,
    distinct_unknowns: unknownInventoryForCohort.length,
    top_unknowns: unknownInventoryForCohort.slice(0, 30)
  };
});

console.log(JSON.stringify({
  status: 'pass',
  phase: 'wave4-cohort2-dictionary-wave1',
  products: corpus.length,
  brands: brands.size,
  markets: [...markets].sort(),
  languages: [...languages].sort(),
  categories: categories.size,
  ingredients: ingredientTotal,
  exact_known: exactKnownTotal,
  unknown: ingredientTotal - exactKnownTotal,
  exact_coverage: Number(overallCoverage.toFixed(4)),
  cohort1_exact_coverage_floor: 0.965,
  cohort2_exact_coverage_floor: 0.95,
  cohort2_is_baseline_only: false,
  distinct_unknowns: unknownInventory.length,
  broad_group_labels_are_not_exact: true,
  top_unknowns: unknownInventory.slice(0, 30),
  unknown_inventory: unknownInventory,
  cohorts: cohortSummaries,
  results
}, null, 2));
