import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

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

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));
const fixtures = JSON.parse(read('tools/_shared/cosmetics-full-label-fixtures.json'));

const owners = new Map();
function add(value, canonical) {
  const key = parser.normalizeKey(value);
  if (!key) return;
  if (!owners.has(key)) owners.set(key, new Set());
  owners.get(key).add(canonical);
}

for (const item of records) {
  if (!item?.en) continue;
  add(item.en, item.en);
  for (const value of Array.isArray(item.jp) ? item.jp : []) add(value, item.en);
  for (const value of Array.isArray(item.alias) ? item.alias : []) add(value, item.en);
}

function isExactKnown(value) {
  const key = parser.normalizeKey(value);
  const matches = owners.get(key);
  return Boolean(matches && matches.size === 1);
}

assert.ok(Array.isArray(fixtures) && fixtures.length >= 12, 'full-label benchmark requires at least 12 fixtures');

let total = 0;
let matched = 0;
const results = [];

for (const fixture of fixtures) {
  const parts = parser.splitIngredients(fixture.label);
  assert.ok(parts.length >= 6, `${fixture.id}: full-label fixture is too small`);
  const unknown = parts.filter((value) => !isExactKnown(value));
  const known = parts.length - unknown.length;
  const coverage = known / parts.length;

  assert.ok(
    unknown.length <= Number(fixture.maxUnknown ?? 0),
    `${fixture.id}: unknown ${unknown.length} exceeds max ${fixture.maxUnknown}; ${unknown.join(' | ')}`
  );
  assert.ok(coverage >= 0.8, `${fixture.id}: coverage below 80% (${(coverage * 100).toFixed(1)}%)`);

  total += parts.length;
  matched += known;
  results.push({
    id: fixture.id,
    category: fixture.category,
    language: fixture.language,
    ingredients: parts.length,
    matched: known,
    unknown: unknown.length,
    coverage: Number(coverage.toFixed(4))
  });
}

const overallCoverage = matched / total;
assert.ok(overallCoverage >= 0.95, `overall full-label coverage below 95%: ${(overallCoverage * 100).toFixed(1)}%`);

const categoryCount = new Set(fixtures.map((fixture) => fixture.category)).size;
assert.ok(categoryCount >= 6, 'full-label benchmark must cover at least six product categories');
assert.ok(fixtures.some((fixture) => fixture.language === 'ja'), 'Japanese full-label coverage missing');
assert.ok(fixtures.some((fixture) => fixture.language === 'en'), 'English full-label coverage missing');
assert.ok(fixtures.some((fixture) => fixture.language === 'mixed'), 'mixed-language full-label coverage missing');

console.log(JSON.stringify({
  status: 'pass',
  fixtures: fixtures.length,
  categories: categoryCount,
  ingredients: total,
  matched,
  unknown: total - matched,
  overall_coverage: Number(overallCoverage.toFixed(4)),
  results
}, null, 2));
