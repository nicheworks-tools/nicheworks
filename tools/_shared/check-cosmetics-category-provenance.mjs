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
  EXPECTED_WAVE1,
  'wave 1 verified category evidence must remain the reviewed five-entry set'
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
assert.equal(rawMissingCategoryRows, 187, 'wave 1 must not hide the frozen 187 raw category gaps by rewriting recognition records');

let newlyClassifiedCanonicalIdentities = 0;
for (const [canonical, expectedCategory] of Object.entries(EXPECTED_WAVE1)) {
  const item = evidence[canonical];
  assert.ok(item, `missing verified category evidence: ${canonical}`);
  assert.equal(normalizeText(item.category), expectedCategory, `${canonical}: unexpected verified category`);
  assert.ok(normalizeText(item.authority), `${canonical}: authority label required`);
  assert.ok(Array.isArray(item.sources) && item.sources.length > 0, `${canonical}: at least one source required`);
  assert.ok(item.sources.every(validHttpsSource), `${canonical}: sources must be approved HTTPS authority URLs`);
  assert.ok(groups.has(canonical), `${canonical}: evidence canonical must exist in maintained dictionary`);

  const rawCategories = [...new Set(
    groups.get(canonical)
      .flatMap((row) => splitCategory(row.category))
      .map((category) => category.toLowerCase())
  )];

  if (rawCategories.length === 0) newlyClassifiedCanonicalIdentities += 1;
  if (rawCategories.length > 0) {
    assert.ok(
      rawCategories.includes(expectedCategory.toLowerCase()),
      `${canonical}: verified category conflicts with existing raw category metadata`
    );
  }
}

const merged = parser.mergeDictionaryRecords(rows);
const mergedByCanonical = new Map(merged.map((item) => [parser.canonicalIdentityKey(item.en), item]));

for (const [canonical, expectedCategory] of Object.entries(EXPECTED_WAVE1)) {
  const item = mergedByCanonical.get(canonical);
  assert.ok(item, `${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.category_verified, true, `${canonical}: verified category flag must survive merge`);
  assert.ok(Array.isArray(item.category_sources) && item.category_sources.length > 0, `${canonical}: category sources must survive merge`);
  assert.ok(item.category_sources.every(validHttpsSource), `${canonical}: merged category sources must remain approved HTTPS URLs`);
  assert.ok(
    Array.isArray(item.categories) && item.categories.some((category) => category.toLowerCase() === expectedCategory.toLowerCase()),
    `${canonical}: verified category must be present in merged functional categories`
  );
}

assert.equal(newlyClassifiedCanonicalIdentities, 4, 'wave 1 should newly classify four previously unclassified canonical identities; Water already had a duplicate solvent hint');

console.log(JSON.stringify({
  status: 'pass',
  phase: 'category-provenance-wave-1',
  raw_missing_category_rows_unchanged: rawMissingCategoryRows,
  verified_category_evidence_canonical_identities: Object.keys(EXPECTED_WAVE1).length,
  newly_classified_canonical_identities: newlyClassifiedCanonicalIdentities,
  recognition_records_rewritten: false,
  safety_contract_changed: false,
  ambiguity_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
