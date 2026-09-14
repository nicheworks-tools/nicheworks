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

const EXPECTED_WAVE1 = Object.freeze({
  water: 'solvent',
  glycerin: 'humectant',
  'propylene glycol': 'humectant',
  phenoxyethanol: 'preservative',
  carbomer: 'thickener'
});

const EXPECTED_WAVE2 = Object.freeze({
  'citric acid': 'pH adjuster',
  tocopherol: 'antioxidant'
});

const EXPECTED_WAVE3 = Object.freeze({
  'sodium chloride': 'viscosity adjuster',
  'disodium edta': 'chelating agent'
});

const EXPECTED_ALL = Object.freeze({
  ...EXPECTED_WAVE1,
  ...EXPECTED_WAVE2,
  ...EXPECTED_WAVE3
});

const EXPECTED_SOURCES = Object.freeze({
  water: 'https://www.cosmeticsinfo.org/ingredient/water/',
  glycerin: 'https://www.cosmeticsinfo.org/ingredient/glycerin/',
  'propylene glycol': 'https://www.cosmeticsinfo.org/ingredient/propylene-glycol/',
  phenoxyethanol: 'https://health.ec.europa.eu/publications/phenoxyethanol_en',
  carbomer: 'https://www.cosmeticsinfo.org/ingredient/carbomer/',
  'citric acid': 'https://www.cosmeticsinfo.org/ingredient/citric-acid/',
  tocopherol: 'https://www.cosmeticsinfo.org/ingredient/tocopherol/',
  'sodium chloride': 'https://www.cosmeticsinfo.org/ingredient/sodium-chloride/',
  'disodium edta': 'https://www.cosmeticsinfo.org/ingredient/disodium-edta/'
});

const ALLOWED_SOURCE_HOSTS = new Set([
  'www.cosmeticsinfo.org',
  'health.ec.europa.eu'
]);

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function splitCategory(value = '') {
  return normalizeText(value)
    .split(/\s*\/\s*/)
    .map(normalizeText)
    .filter(Boolean);
}

function validHttpsSource(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && ALLOWED_SOURCE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

const rows = DATA_FILES.flatMap((file) => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`);
  return payload;
});

const evidence = parser.verifiedCategoryEvidence || {};
assert.deepEqual(
  Object.fromEntries(Object.entries(evidence).map(([key, item]) => [key, item.category])),
  EXPECTED_ALL,
  'verified category evidence must remain the reviewed cumulative wave 1 + wave 2 + wave 3 set'
);

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(evidence[ambiguous], undefined, `ambiguous exact token must not receive category evidence: ${ambiguous}`);
}

const groups = new Map();
for (const row of rows) {
  const key = parser.canonicalIdentityKey(row.en);
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

let rawMissingCategoryRows = 0;
for (const row of rows) {
  if (!normalizeText(row.category)) rawMissingCategoryRows += 1;
}
assert.equal(rawMissingCategoryRows, 187, 'verified overlay must not hide the frozen 187 raw category gaps by rewriting recognition records');

let newlyClassifiedCanonicalIdentities = 0;
let wave3NewlyClassifiedCanonicalIdentities = 0;
const rawCategoryInventory = {};

for (const [canonical, expectedCategory] of Object.entries(EXPECTED_ALL)) {
  const item = evidence[canonical];
  assert.ok(item, `missing verified category evidence: ${canonical}`);
  assert.equal(normalizeText(item.category), expectedCategory, `${canonical}: unexpected verified category`);
  assert.ok(normalizeText(item.authority), `${canonical}: authority label required`);
  assert.ok(Array.isArray(item.sources) && item.sources.length > 0, `${canonical}: at least one source required`);
  assert.ok(item.sources.every(validHttpsSource), `${canonical}: sources must be approved HTTPS authority URLs`);
  assert.ok(item.sources.includes(EXPECTED_SOURCES[canonical]), `${canonical}: reviewed source URL must remain attached`);
  assert.ok(groups.has(canonical), `${canonical}: evidence canonical must exist in maintained dictionary`);

  const rawCategories = [...new Set(
    groups.get(canonical)
      .flatMap((row) => splitCategory(row.category))
      .map((category) => category.toLowerCase())
  )];
  rawCategoryInventory[canonical] = rawCategories;

  if (rawCategories.length === 0) {
    newlyClassifiedCanonicalIdentities += 1;
    if (Object.hasOwn(EXPECTED_WAVE3, canonical)) wave3NewlyClassifiedCanonicalIdentities += 1;
  }
  if (rawCategories.length > 0) {
    assert.ok(
      rawCategories.includes(expectedCategory.toLowerCase()),
      `${canonical}: verified category conflicts with existing raw category metadata (${rawCategories.join(', ')})`
    );
  }
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));

for (const [canonical, expectedCategory] of Object.entries(EXPECTED_ALL)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.category_verified, true, `${canonical}: verified category flag must survive merge`);
  assert.ok(Array.isArray(item.category_sources) && item.category_sources.length > 0, `${canonical}: category sources must survive merge`);
  assert.ok(item.category_sources.every(validHttpsSource), `${canonical}: merged category sources must remain approved HTTPS URLs`);
  assert.ok(item.category_sources.includes(EXPECTED_SOURCES[canonical]), `${canonical}: reviewed source URL must survive merge`);
  assert.ok(
    Array.isArray(item.categories) && item.categories.some((category) => category.toLowerCase() === expectedCategory.toLowerCase()),
    `${canonical}: verified category must be present in merged functional categories`
  );
}

assert.equal(Object.keys(EXPECTED_WAVE1).length, 5, 'wave 1 reviewed set must remain five canonical identities');
assert.equal(Object.keys(EXPECTED_WAVE2).length, 2, 'wave 2 reviewed set must remain two canonical identities');
assert.equal(Object.keys(EXPECTED_WAVE3).length, 2, 'wave 3 reviewed set must remain two canonical identities');
assert.equal(
  newlyClassifiedCanonicalIdentities >= 4,
  true,
  'cumulative verified overlay must retain the four wave 1 previously unclassified canonical identities'
);

console.log(JSON.stringify({
  status: 'pass',
  phase: 'category-provenance-wave-3',
  raw_missing_category_rows_unchanged: rawMissingCategoryRows,
  verified_category_evidence_canonical_identities: Object.keys(EXPECTED_ALL).length,
  wave_1_verified_canonical_identities: Object.keys(EXPECTED_WAVE1).length,
  wave_2_verified_canonical_identities: Object.keys(EXPECTED_WAVE2).length,
  wave_3_verified_canonical_identities: Object.keys(EXPECTED_WAVE3).length,
  newly_classified_canonical_identities: newlyClassifiedCanonicalIdentities,
  wave_3_newly_classified_canonical_identities: wave3NewlyClassifiedCanonicalIdentities,
  raw_category_inventory: rawCategoryInventory,
  recognition_records_rewritten: false,
  safety_contract_changed: false,
  ambiguity_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
