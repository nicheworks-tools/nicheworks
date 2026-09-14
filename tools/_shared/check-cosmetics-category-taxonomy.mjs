import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(
  fs.readFileSync(path.join(root, 'tools/_shared/cosmetics-category-taxonomy.json'), 'utf8')
);

const EXPECTED_CATEGORIES = new Set([
  'solvent',
  'humectant',
  'preservative',
  'thickener',
  'pH adjuster',
  'antioxidant',
  'viscosity adjuster',
  'chelating agent'
]);

const EXPECTED_DEFERRED = new Set();
const EXPECTED_WAVE3_PROMOTED = new Set(['sodium chloride', 'disodium edta']);
const EXPECTED_WAVE4_PROMOTED = new Set(['tocopheryl acetate', 'sodium citrate']);
const ALLOWED_SOURCE_HOSTS = new Set(['www.cosmeticsinfo.org', 'health.ec.europa.eu']);

function normalize(value = '') {
  return String(value)
    .normalize('NFKC')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function validHttpsSource(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && ALLOWED_SOURCE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

assert.equal(taxonomy.version, 1, 'taxonomy version must remain explicit');
assert.equal(taxonomy.scope, 'verified_category_overlay_only', 'taxonomy must not silently normalize raw legacy categories');
assert.equal(taxonomy.mapping_policy, 'explicit_only', 'authority-function mapping must remain explicit-only');
assert.ok(taxonomy.categories && typeof taxonomy.categories === 'object', 'taxonomy categories object required');
assert.ok(taxonomy.reviewed_mappings && typeof taxonomy.reviewed_mappings === 'object', 'reviewed mappings object required');

assert.deepEqual(
  new Set(Object.keys(taxonomy.categories)),
  EXPECTED_CATEGORIES,
  'verified category taxonomy set changed unexpectedly'
);

const authorityFunctionToCategory = new Map();
for (const [category, contract] of Object.entries(taxonomy.categories)) {
  assert.ok(Array.isArray(contract.authority_functions) && contract.authority_functions.length > 0, `${category}: authority_functions required`);
  for (const sourceFunction of contract.authority_functions) {
    const key = normalize(sourceFunction);
    assert.ok(key, `${category}: empty authority function not allowed`);
    assert.equal(
      authorityFunctionToCategory.has(key),
      false,
      `${sourceFunction}: authority function may map to only one internal category`
    );
    authorityFunctionToCategory.set(key, category);
  }
}

const runtimeMappings = {};
const deferredMappings = new Set();
for (const [canonical, mapping] of Object.entries(taxonomy.reviewed_mappings)) {
  assert.ok(EXPECTED_CATEGORIES.has(mapping.category), `${canonical}: unknown internal category ${mapping.category}`);
  assert.ok(Array.isArray(mapping.source_functions) && mapping.source_functions.length > 0, `${canonical}: source_functions required`);
  assert.ok(String(mapping.authority || '').trim(), `${canonical}: authority required`);
  assert.ok(Array.isArray(mapping.sources) && mapping.sources.length > 0, `${canonical}: source URL required`);
  assert.ok(mapping.sources.every(validHttpsSource), `${canonical}: only approved HTTPS authority sources are allowed`);

  for (const sourceFunction of mapping.source_functions) {
    const normalizedFunction = normalize(sourceFunction);
    assert.equal(
      authorityFunctionToCategory.get(normalizedFunction),
      mapping.category,
      `${canonical}: source function ${sourceFunction} is not explicitly mapped to ${mapping.category}`
    );
  }

  if (mapping.runtime_verified === true) runtimeMappings[canonical] = mapping;
  else if (mapping.runtime_verified === false) deferredMappings.add(canonical);
  else assert.fail(`${canonical}: runtime_verified must be explicit boolean`);
}

assert.deepEqual(deferredMappings, EXPECTED_DEFERRED, 'reviewed mappings must not remain silently deferred');

for (const canonical of EXPECTED_WAVE3_PROMOTED) {
  assert.ok(runtimeMappings[canonical], `${canonical}: wave 3 mapping must remain runtime_verified`);
}
for (const canonical of EXPECTED_WAVE4_PROMOTED) {
  assert.ok(runtimeMappings[canonical], `${canonical}: wave 4 mapping must be runtime_verified`);
}

const runtimeEvidence = parser.verifiedCategoryEvidence || {};
assert.deepEqual(
  new Set(Object.keys(runtimeMappings)),
  new Set(Object.keys(runtimeEvidence)),
  'taxonomy runtime_verified mappings must exactly match runtime category evidence'
);

for (const [canonical, mapping] of Object.entries(runtimeMappings)) {
  const evidence = runtimeEvidence[canonical];
  assert.ok(evidence, `${canonical}: runtime evidence missing`);
  assert.equal(evidence.category, mapping.category, `${canonical}: taxonomy category differs from runtime evidence`);
  assert.equal(evidence.authority, mapping.authority, `${canonical}: taxonomy authority differs from runtime evidence`);
  assert.deepEqual([...evidence.sources], mapping.sources, `${canonical}: taxonomy sources differ from runtime evidence`);
}

for (const ambiguous of parser.ambiguousExactKeys || []) {
  assert.equal(taxonomy.reviewed_mappings[ambiguous], undefined, `ambiguous exact token must not enter category taxonomy: ${ambiguous}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-category-taxonomy-wave-4',
  mapping_policy: taxonomy.mapping_policy,
  canonical_categories: Object.keys(taxonomy.categories).length,
  unique_authority_function_terms: authorityFunctionToCategory.size,
  runtime_verified_mappings: Object.keys(runtimeMappings).length,
  wave_3_promoted_mappings: [...EXPECTED_WAVE3_PROMOTED],
  wave_4_promoted_mappings: [...EXPECTED_WAVE4_PROMOTED],
  deferred_reviewed_mappings: [...deferredMappings],
  raw_legacy_taxonomy_rewritten: false,
  safety_contract_changed: false,
  ambiguity_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
