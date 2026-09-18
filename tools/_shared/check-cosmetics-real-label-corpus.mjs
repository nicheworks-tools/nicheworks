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
  ['cohort2', 'tools/_shared/cosmetics-real-label-corpus-cohort2.json'],
  ['cohort3', 'tools/_shared/cosmetics-real-label-corpus-cohort3.json'],
  ['cohort4', 'tools/_shared/cosmetics-real-label-corpus-cohort4.json']
];

const ALLOWED_OFFICIAL_HOSTS = new Set([
  'www.kao-kirei.com',
  'www.cerave.com',
  'www.laroche-posay.us',
  'theordinary.com',
  'www.neutrogena.com',
  'www.eucerinus.com',
  'www.cosrx.com',
  'www.vanicream.com',
  'www.theinkeylist.com',
  'naturium.com',
  'versedskin.com',
  'www.cetaphil.com'
]);

const COHORT2_WAVE1_EXACT = [
  'Aqua (Water)',
  'Ethoxydiglycol',
  'Isoceteth-20',
  'Lysine HCl',
  'Ahnfeltiopsis Concinna Extract',
  'Arginine HCl',
  'Benzoyl Peroxide',
  'Carnitine',
  'Citrulline',
  'Dicaprylyl Ether',
  'Dimethicone Crosspolymer',
  'Dimethyl Isosorbide',
  'Glyceryl Glucoside',
  'Glycogen',
  'Histidine HCl',
  'Hydrogenated Coco-Glycerides',
  'Hydroxypropyl Methylcellulose',
  'Maltose',
  'Methylpropanediol',
  'Octyldodecanol',
  'p-Anisic Acid',
  'Polyacrylate Crosspolymer-6',
  'Saccharide Isomerate',
  'Sodium Cetearyl Sulfate',
  'Sodium Hyaluronate Crosspolymer',
  'Synthetic Beeswax',
  'Tamarindus Indica Seed Gum',
  'Tapioca Starch'
];

const COHORT3_WAVE1_EXACT = [
  'Aqua/Water',
  'Water (Aqua / Eau)',
  'Ethyl Hexanediol',
  'Jojoba Esters',
  'Acacia Decurrens (Early Green Wattle) Flower Wax',
  'Albizia Julibrissin Bark Extract',
  'Avena Sativa (Oat) Kernel Oil',
  'Betaine Salicylate',
  'Bis-Octyldodecyl Dimer Dilinoleate/Propanediol Copolymer',
  'Carnosine',
  'Cera Microcristallina',
  'Coco-Caprylate/Caprate',
  'Cryptomeria Japonica Leaf Extract',
  'Darutoside',
  'Glyceryl Behenate',
  'Glycine Soja (Soybean) Oil',
  'Glycine Soja (Soybean) Sterols',
  'Glycolipids',
  'Helianthus Annuus (Sunflower) Seed Wax',
  'Hippophae Rhamnoides (Seaberry) Fruit Oil',
  'Isopentyldiol',
  'Leuconostoc/Radish Root Ferment Filtrate',
  'Nelumbo Nucifera Leaf Extract',
  'Oenothera Biennis (Evening Primrose) Flower Extract',
  'PEG-20 Glyceryl Triisostearate',
  'Phytosterols',
  'Pinus Palustris Leaf Extract',
  'Polyacrylate Crosspolymer-11',
  'Polyglycerin-3',
  'Polyglyceryl-3 Beeswax',
  'Polyglyceryl-6 Caprylate',
  'Polyglyceryl-6 Distearate',
  'Prunus Amygdalus Dulcis (Sweet Almond) Oil',
  'Pueraria Lobata Root Extract',
  'Saccharomyces Ferment',
  'Sodium Lauroyl Methyl Isethionate',
  'Styrax Japonicus Branch/Fruit/Leaf Extract',
  'Ulmus Davidiana Root Extract'
];

const corpus = CORPUS_FILES.flatMap(([defaultCohort, rel]) => {
  const items = JSON.parse(read(rel));
  assert.ok(Array.isArray(items), `${rel}: real-label corpus file must be an array`);
  return items.map((item) => ({ ...item, cohort: item.cohort || defaultCohort }));
});
const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));

assert.ok(corpus.length >= 30, 'real-label corpus requires at least 30 source-backed products after cohort 4 expansion');

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

const PUBLIC_ROLE_CATEGORIES = new Set([
  'humectant', 'moisturizer', 'soothing', 'smoothing', 'active', 'amino acid', 'silicone',
  'film former', 'binder', 'emollient', 'oil', 'solvent', 'preservative', 'fragrance',
  'surfactant', 'cleanser', 'uv filter', 'sunscreen', 'colorant', 'pigment',
  'antioxidant', 'botanical', 'extract', 'plant extract', 'peptide', 'ferment',
  'thickener', 'emulsifier', 'chelator', 'chelating agent', 'ph', 'ph adjuster',
  'viscosity adjuster', 'buffer', 'conditioning', 'skin conditioning', 'hair conditioning'
]);
const runtimeByCanonical = new Map(
  parser.mergeDictionaryRecords(records).map((item) => [canonicalIdentity(item.en), item])
);
const exactKnownRoleGaps = new Map();

function hasSupportedPublicRole(item) {
  const categories = Array.isArray(item?.categories) ? item.categories : [item?.category];
  return categories.some((value) => PUBLIC_ROLE_CATEGORIES.has(String(value || '').trim().toLowerCase()));
}

function canonicalForExactKnown(value) {
  const set = owners.get(parser.normalizeKey(value));
  return set && set.size === 1 ? [...set][0] : '';
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

  assert.ok(['cohort1', 'cohort2', 'cohort3', 'cohort4'].includes(item.cohort), `${item.id}: unsupported corpus cohort ${item.cohort}`);
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
  } else if (item.cohort === 'cohort4') {
    assert.match(item.retrieved_at, /^2026-09-16$/, `${item.id}: cohort 4 retrieved_at must be 2026-09-16`);
  } else {
    assert.match(item.retrieved_at, /^2026-09-14$/, `${item.id}: ${item.cohort} retrieved_at must be 2026-09-14`);
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
      const canonical = canonicalForExactKnown(value);
      const runtimeItem = runtimeByCanonical.get(canonical);
      if (!runtimeItem || !hasSupportedPublicRole(runtimeItem)) {
        const key = canonical || parser.normalizeBaseKey(value);
        exactKnownRoleGaps.set(key, (exactKnownRoleGaps.get(key) || 0) + 1);
      }
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

assert.ok(brands.size >= 12, `expanded real-label corpus requires at least 12 brands; found ${brands.size}`);
assert.ok(markets.has('JP') && markets.has('US'), 'real-label corpus must include JP and US markets');
assert.ok(languages.has('ja') && languages.has('en'), 'real-label corpus must include Japanese and English labels');
assert.ok(categories.size >= 20, `expanded real-label corpus requires at least 20 categories; found ${categories.size}`);

const cohort1 = cohortStats.get('cohort1');
const cohort2 = cohortStats.get('cohort2');
const cohort3 = cohortStats.get('cohort3');
const cohort4 = cohortStats.get('cohort4');
assert.ok(cohort1 && cohort1.products === 12, `cohort 1 must remain exactly 12 fixed products; found ${cohort1?.products || 0}`);
assert.ok(cohort2 && cohort2.products === 6, `cohort 2 must remain exactly 6 fixed products; found ${cohort2?.products || 0}`);
assert.ok(cohort2.brands.size === 3, `cohort 2 must remain exactly 3 brands; found ${cohort2.brands.size}`);
assert.ok(cohort2.categories.size === 5, `cohort 2 must remain exactly 5 categories; found ${cohort2.categories.size}`);
assert.ok(cohort3 && cohort3.products === 6, `cohort 3 requires exactly 6 products; found ${cohort3?.products || 0}`);
assert.ok(cohort3.brands.size === 3, `cohort 3 requires exactly 3 new brands; found ${cohort3.brands.size}`);
assert.ok(cohort3.categories.size === 6, `cohort 3 requires exactly 6 categories; found ${cohort3.categories.size}`);
for (const brand of cohort3.brands) {
  assert.ok(!cohort1.brands.has(brand) && !cohort2.brands.has(brand), `cohort 3 brand must be new to the source-backed corpus: ${brand}`);
}
assert.ok(cohort4 && cohort4.products === 6, `cohort 4 requires exactly 6 products; found ${cohort4?.products || 0}`);
assert.ok(cohort4.brands.size === 3, `cohort 4 requires exactly 3 new brands; found ${cohort4.brands.size}`);
assert.ok(cohort4.categories.size === 6, `cohort 4 requires exactly 6 categories; found ${cohort4.categories.size}`);
for (const brand of cohort4.brands) {
  assert.ok(
    !cohort1.brands.has(brand) && !cohort2.brands.has(brand) && !cohort3.brands.has(brand),
    `cohort 4 brand must be new to the source-backed corpus: ${brand}`
  );
}

const cohort1Coverage = cohort1.exactKnown / cohort1.ingredients;
const cohort2Coverage = cohort2.exactKnown / cohort2.ingredients;
const cohort3Coverage = cohort3.exactKnown / cohort3.ingredients;
const cohort4Coverage = cohort4.exactKnown / cohort4.ingredients;
assert.ok(cohort1Coverage >= 0.965, `cohort 1 exact coverage ${(cohort1Coverage * 100).toFixed(2)}% is below its frozen 96.5% floor`);
assert.ok(cohort2Coverage >= 0.976, `cohort 2 exact coverage ${(cohort2Coverage * 100).toFixed(2)}% is below the 97.6% Wave 1 floor`);
assert.ok(cohort3Coverage >= 0.992, `cohort 3 exact coverage ${(cohort3Coverage * 100).toFixed(2)}% is below the 99.2% Wave 1 floor`);
assert.ok(cohort4Coverage >= 0.70, `cohort 4 baseline exact coverage ${(cohort4Coverage * 100).toFixed(2)}% is below the provisional 70% baseline floor`);

for (const exactName of COHORT2_WAVE1_EXACT) {
  assert.equal(isExactKnown(exactName), true, `${exactName}: cohort 2 Wave 1 exact identity must remain recognized`);
}
for (const exactName of COHORT3_WAVE1_EXACT) {
  assert.equal(isExactKnown(exactName), true, `${exactName}: cohort 3 Wave 1 exact identity must remain recognized`);
}

assert.equal(
  [...exactKnownRoleGaps.values()].reduce((sum, count) => sum + count, 0),
  0,
  `recognized canonical ingredients in the official-label corpus must all have supported public roles: ${JSON.stringify([...exactKnownRoleGaps.entries()])}`
);

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
  const floor = cohort.cohort === 'cohort1'
    ? 0.965
    : cohort.cohort === 'cohort2'
      ? 0.976
      : cohort.cohort === 'cohort3'
        ? 0.992
        : 0.70;
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
  phase: 'wave24-final-official-label-role-coverage',
  products: corpus.length,
  brands: brands.size,
  markets: [...markets].sort(),
  languages: [...languages].sort(),
  categories: categories.size,
  ingredients: ingredientTotal,
  exact_known: exactKnownTotal,
  unknown: ingredientTotal - exactKnownTotal,
  exact_coverage: Number(overallCoverage.toFixed(4)),
  recognized_canonical_public_role_gaps: [...exactKnownRoleGaps.values()].reduce((sum, count) => sum + count, 0),
  recognized_canonical_public_role_gap_identities: [...exactKnownRoleGaps.keys()],
  cohort1_exact_coverage_floor: 0.965,
  cohort2_exact_coverage_floor: 0.976,
  cohort3_exact_coverage_floor: 0.992,
  cohort4_exact_coverage_floor: 0.70,
  cohort2_wave1_exact_names: COHORT2_WAVE1_EXACT.length,
  cohort3_wave1_exact_names: COHORT3_WAVE1_EXACT.length,
  cohort4_is_baseline_only: true,
  distinct_unknowns: unknownInventory.length,
  broad_group_labels_are_not_exact: true,
  top_unknowns: unknownInventory.slice(0, 30),
  unknown_inventory: unknownInventory,
  cohorts: cohortSummaries,
  results
}, null, 2));
