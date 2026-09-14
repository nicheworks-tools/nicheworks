import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

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

const records = DATA_FILES.flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
const merged = parser.mergeDictionaryRecords(records);

assert.equal(records.length, 725, 'PR40 baseline expects the current 725 maintained source records');
assert.equal(merged.length, 599, 'PR40 baseline expects 599 canonical runtime identities');

const safetyConflicts = merged.filter((item) => Array.isArray(item.semantic_conflicts?.safety));
const categoryConflicts = merged.filter((item) => Array.isArray(item.semantic_conflicts?.category));

assert.equal(safetyConflicts.length, 16, 'all 16 audited legacy safety conflicts must be explicit at runtime');
assert.equal(categoryConflicts.length, 4, 'all 4 audited category conflicts must be explicit at runtime');

for (const item of safetyConflicts) {
  assert.equal(item.safety, undefined, `${item.en}: conflicting legacy safety must not select a runtime winner`);
  assert.ok(Array.isArray(item.legacy_safety_values) && item.legacy_safety_values.length >= 2, `${item.en}: conflicting legacy values must remain auditable`);
  assert.deepEqual(item.legacy_safety_values, item.semantic_conflicts.safety, `${item.en}: conflict marker and auditable safety values must agree`);
}

for (const item of categoryConflicts) {
  assert.ok(Array.isArray(item.categories) && item.categories.length >= 2, `${item.en}: category conflict must preserve multiple functional categories`);
  assert.equal(item.category, item.categories.join(' / '), `${item.en}: runtime category display must include every normalized function`);
}

const urea = merged.find((item) => parser.canonicalIdentityKey(item.en) === 'urea');
assert.ok(urea, 'Urea canonical runtime record missing');
assert.equal(urea.safety, undefined, 'Urea safety conflict must be neutralized');
assert.deepEqual(urea.categories, ['active', 'humectant'], 'Urea must retain both observed functional categories');

const titaniumDioxide = merged.find((item) => parser.canonicalIdentityKey(item.en) === 'titanium dioxide');
assert.ok(titaniumDioxide, 'Titanium Dioxide canonical runtime record missing');
assert.deepEqual(titaniumDioxide.categories, ['uv filter', 'colorant'], 'Titanium Dioxide must retain UV-filter and colorant functions without duplicate colorant tokens');

const microcrystallineWax = merged.find((item) => parser.canonicalIdentityKey(item.en) === 'microcrystalline wax');
assert.ok(microcrystallineWax, 'Microcrystalline Wax canonical runtime record missing');
assert.deepEqual(microcrystallineWax.categories, ['wax', 'texture agent'], 'Microcrystalline Wax must retain both observed functional categories');

const peg32 = merged.find((item) => parser.canonicalIdentityKey(item.en) === 'peg-32');
assert.ok(peg32, 'PEG-32 canonical runtime record missing');
assert.deepEqual(peg32.categories, ['humectant', 'solvent'], 'PEG-32 must normalize overlapping category variants without duplication');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'canonical-semantic-runtime-merge',
  source_records: records.length,
  runtime_canonical_identities: merged.length,
  explicit_safety_conflicts: safetyConflicts.length,
  safety_conflicts_with_selected_winner: safetyConflicts.filter((item) => item.safety).length,
  explicit_category_conflicts: categoryConflicts.length,
  category_conflicts_preserving_all_functions: categoryConflicts.filter((item) => item.categories?.length >= 2).length
}, null, 2));
