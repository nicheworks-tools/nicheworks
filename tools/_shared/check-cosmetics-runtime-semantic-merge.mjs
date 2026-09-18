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
assert.equal(categoryConflicts.length, 52, 'the 3 remaining legacy-only category conflicts plus 49 reviewed Wave 15-16 and Wave 18-25 legacy-vs-verified role conflicts must be explicit at runtime');

for (const item of safetyConflicts) {
  assert.equal(item.safety, undefined, `${item.en}: conflicting legacy safety must not select a runtime winner`);
  assert.ok(Array.isArray(item.legacy_safety_values) && item.legacy_safety_values.length >= 2, `${item.en}: conflicting legacy values must remain auditable`);
  assert.deepEqual(item.legacy_safety_values, item.semantic_conflicts.safety, `${item.en}: conflict marker and auditable safety values must agree`);
}

const reviewedVerifiedPrimary = new Map([
  ['caprylyl glycol', { category: 'emollient', legacy: ['preservative booster'] }],
  ['ceramide np', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['cholesterol', { category: 'emollient', legacy: ['barrier lipid'] }],
  ['hexylene glycol', { category: 'solvent', legacy: ['general'] }],
  ['hydroxyacetophenone', { category: 'antioxidant', legacy: ['preservative booster'] }],
  ['palmitic acid', { category: 'emollient', legacy: ['general'] }],
  ['stearic acid', { category: 'cleanser', legacy: ['general'] }],
  ['myristic acid', { category: 'cleanser', legacy: ['general'] }],
  ['hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer', { category: 'viscosity adjuster', legacy: ['general'] }],
  ['ammonium polyacryloyldimethyl taurate', { category: 'viscosity adjuster', legacy: ['polymer'] }],
  ['ethylhexyl methoxycrylene', { category: 'skin conditioning', legacy: ['general'] }],
  ['polyacrylate crosspolymer-6', { category: 'viscosity adjuster', legacy: ['polymer'] }],
  ['polyhydroxystearic acid', { category: 'emulsifier', legacy: ['general'] }],
  ['potassium cetyl phosphate', { category: 'emulsifier', legacy: ['general'] }],
  ['sorbitan isostearate', { category: 'emulsifier', legacy: ['general'] }],
  ['ceramide ap', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['ceramide eop', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['silica', { category: 'viscosity adjuster', legacy: ['powder'] }],
  ['alumina', { category: 'viscosity adjuster', legacy: ['powder'] }],
  ['aluminum stearate', { category: 'viscosity adjuster', legacy: ['powder'] }],
  ['dimethicone crosspolymer', { category: 'viscosity adjuster', legacy: ['texture polymer'] }],
  ['glycol distearate', { category: 'emulsifier', legacy: ['general'] }],
  ['myristyl myristate', { category: 'emollient', legacy: ['general'] }],
  ['calcium gluconate', { category: 'chelating agent', legacy: ['general'] }],
  ['ceramide as', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['ceramide ng', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['glyceryl acrylate/acrylic acid copolymer', { category: 'humectant', legacy: ['general'] }],
  ['hectorite', { category: 'viscosity adjuster', legacy: ['general'] }],
  ['tapioca starch', { category: 'viscosity adjuster', legacy: ['powder'] }],
  ['helianthus annuus sunflower seed wax', { category: 'skin conditioning', legacy: ['texture agent'] }],
  ['melaleuca alternifolia tea tree leaf oil', { category: 'antioxidant', legacy: ['essential oil'] }],
  ['peg-120 methyl glucose dioleate', { category: 'emulsifier', legacy: ['general'] }],
  ['peg-30 dipolyhydroxystearate', { category: 'emulsifier', legacy: ['general'] }],
  ['pentaerythrityl tetraethylhexanoate', { category: 'emollient', legacy: ['general'] }],
  ['polyacrylate crosspolymer-11', { category: 'viscosity adjuster', legacy: ['polymer'] }],
  ['sphingolipids', { category: 'skin conditioning', legacy: ['barrier lipid'] }],
  ['peg-40 hydrogenated castor oil', { category: 'emulsifier', legacy: ['solubilizer'] }],
  ['benzyl alcohol', { category: 'preservative', legacy: ['fragrance'] }],
  ['urea', { category: 'humectant', legacy: ['active'] }],
  ['limonene', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['linalool', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['citral', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['geraniol', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['citronellol', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['eugenol', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['coumarin', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['farnesol', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['hexyl cinnamal', { category: 'fragrance', legacy: ['fragrance allergen'] }],
  ['alpha-isomethyl ionone', { category: 'fragrance', legacy: ['fragrance allergen'] }]
]);

for (const item of categoryConflicts) {
  assert.ok(Array.isArray(item.categories) && item.categories.length >= 2, `${item.en}: category conflict must preserve multiple functional categories`);
  const canonical = parser.canonicalIdentityKey(item.en);
  const reviewed = reviewedVerifiedPrimary.get(canonical);
  if (reviewed) {
    assert.equal(item.category, reviewed.category, `${item.en}: reviewed verified role must be the public primary category`);
    assert.equal(item.category_verified, true, `${item.en}: reviewed verified role must remain provenance-marked`);
    assert.deepEqual(item.legacy_category_values, reviewed.legacy, `${item.en}: unsupported legacy category must remain auditable`);
    assert.ok(item.categories.includes(reviewed.category), `${item.en}: verified role must remain in the full functional category set`);
    for (const legacy of reviewed.legacy) assert.ok(item.categories.includes(legacy), `${item.en}: legacy category must remain in the full functional category set`);
  } else {
    assert.equal(item.category, item.categories.join(' / '), `${item.en}: unverified legacy category conflict must continue to display every normalized function`);
    assert.equal(item.legacy_category_values, undefined, `${item.en}: legacy-only conflicts must not gain a synthetic verified-primary audit field`);
  }
}

const urea = merged.find((item) => parser.canonicalIdentityKey(item.en) === 'urea');
assert.ok(urea, 'Urea canonical runtime record missing');
assert.equal(urea.safety, undefined, 'Urea safety conflict must be neutralized');
assert.deepEqual(urea.categories, ['active', 'humectant'], 'Urea must retain both observed functional categories');
assert.equal(urea.category, 'humectant', 'Urea verified humectant role must be the public primary category');
assert.equal(urea.category_verified, true, 'Urea verified humectant role must remain provenance-marked');
assert.deepEqual(urea.legacy_category_values, ['active'], 'Urea legacy active category must remain auditable');

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
  reviewed_verified_primary_category_conflicts: categoryConflicts.filter((item) => reviewedVerifiedPrimary.has(parser.canonicalIdentityKey(item.en))).length,
  legacy_only_category_conflicts: categoryConflicts.filter((item) => !reviewedVerifiedPrimary.has(parser.canonicalIdentityKey(item.en))).length,
  category_conflicts_preserving_all_functions: categoryConflicts.filter((item) => item.categories?.length >= 2).length
}, null, 2));
