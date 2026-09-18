import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, 'tools/_shared/cosmetics-category-taxonomy.json'), 'utf8'));

const EXPECTED_CATEGORIES = new Set([
  'solvent', 'humectant', 'preservative', 'thickener', 'pH adjuster', 'antioxidant', 'viscosity adjuster', 'chelating agent',
  'skin conditioning', 'emollient', 'cleanser', 'emulsifier', 'smoothing'
]);
const EXPECTED_AUTHORITY_FUNCTIONS = Object.freeze({
  'solvent': ['solvent'],
  'humectant': ['humectant'],
  'preservative': ['preservative'],
  'thickener': ['thickening agent', 'thickening'],
  'pH adjuster': ['pH adjuster'],
  'antioxidant': ['antioxidant', 'antioxidants'],
  'viscosity adjuster': ['viscosity increasing agent - aqueous', 'viscosity controlling'],
  'chelating agent': ['chelating agent', 'chelating agents', 'chelating'],
  'skin conditioning': ['skin conditioning', 'skin conditioning - miscellaneous'],
  'emollient': ['skin conditioning - emollient'],
  'cleanser': ['cleansing', 'surfactant - cleansing'],
  'emulsifier': ['surfactant - emulsifying'],
  'smoothing': ['smoothing']
});
const EXPECTED_WAVE3_PROMOTED = new Set(['sodium chloride', 'disodium edta']);
const EXPECTED_WAVE4_PROMOTED = new Set(['tocopheryl acetate']);
const EXPECTED_WAVE5_PROMOTED = new Set(['butylene glycol', 'dipropylene glycol', 'sodium hydroxide']);
const EXPECTED_WAVE6_PROMOTED = new Set(['aminomethyl propanol', 'triethanolamine', 'potassium hydroxide']);
const EXPECTED_WAVE7_PROMOTED = new Set(['bht', 'betaine', 'pentylene glycol']);
const EXPECTED_WAVE8_PROMOTED = new Set(['propanediol', '1,2-hexanediol', 'alcohol']);
const EXPECTED_WAVE9_PROMOTED = new Set(['ascorbyl palmitate']);
const EXPECTED_WAVE10_PROMOTED = new Set(['sodium gluconate', 'xanthan gum']);
const EXPECTED_WAVE11_PROMOTED = new Set(['ethylhexylglycerin', 'squalane', 'sodium cocoyl glutamate', 'dimethicone']);
const EXPECTED_WAVE12_PROMOTED = new Set(['cetearyl alcohol', 'cetyl alcohol', 'disodium lauryl sulfosuccinate', 'hydrogenated polyisobutene']);
const EXPECTED_WAVE13_PROMOTED = new Set(['cetearyl olivate', 'stearyl alcohol', 'sodium lauroyl glutamate', 'sodium coco-sulfate']);
const EXPECTED_WAVE14_PROMOTED = new Set(['polysorbate 80', 'sorbitan olivate', 'steareth-2', 'steareth-21']);
const EXPECTED_WAVE15_PROMOTED = new Set(['caprylyl glycol', 'ceramide np', 'cholesterol', 'hexylene glycol']);
const EXPECTED_WAVE16_PROMOTED = new Set(['hydroxyacetophenone', 'palmitic acid', 'stearic acid', 'myristic acid']);
const EXPECTED_WAVE17_PROMOTED = new Set(['niacinamide']);
const EXPECTED_WAVE18_PROMOTED = new Set(['hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer', 'ammonium polyacryloyldimethyl taurate', 'ethylhexyl methoxycrylene', 'glyceryl stearate se']);
const EXPECTED_WAVE19_PROMOTED = new Set(['polyacrylate crosspolymer-6', 'polyhydroxystearic acid', 'potassium cetyl phosphate', 'sorbitan isostearate']);
const ALLOWED_SOURCE_HOSTS = new Set(['www.cosmeticsinfo.org', 'health.ec.europa.eu', 'cosmileeurope.eu']);

function normalize(value = '') {
  return String(value).normalize('NFKC').replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
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
assert.ok(taxonomy.categories && typeof taxonomy.categories === 'object');
assert.ok(taxonomy.reviewed_mappings && typeof taxonomy.reviewed_mappings === 'object');
assert.deepEqual(new Set(Object.keys(taxonomy.categories)), EXPECTED_CATEGORIES, 'verified category taxonomy set changed unexpectedly');
for (const [category, functions] of Object.entries(EXPECTED_AUTHORITY_FUNCTIONS)) {
  assert.deepEqual(taxonomy.categories[category]?.authority_functions, functions, `${category}: authority function vocabulary changed without review`);
}

const authorityFunctionToCategory = new Map();
for (const [category, contract] of Object.entries(taxonomy.categories)) {
  assert.ok(Array.isArray(contract.authority_functions) && contract.authority_functions.length > 0, `${category}: authority_functions required`);
  for (const sourceFunction of contract.authority_functions) {
    const key = normalize(sourceFunction);
    assert.ok(key, `${category}: empty authority function not allowed`);
    assert.equal(authorityFunctionToCategory.has(key), false, `${sourceFunction}: authority function may map to only one internal category`);
    authorityFunctionToCategory.set(key, category);
  }
}
assert.equal(authorityFunctionToCategory.get('chelating'), 'chelating agent', 'COSMILE CHELATING must map explicitly to chelating agent');
assert.equal(authorityFunctionToCategory.get('viscosity controlling'), 'viscosity adjuster', 'COSMILE VISCOSITY CONTROLLING must map explicitly to viscosity adjuster');
assert.equal(authorityFunctionToCategory.get('skin conditioning - miscellaneous'), 'skin conditioning', 'COSMILE SKIN CONDITIONING - MISCELLANEOUS must map explicitly to skin conditioning');
assert.equal(authorityFunctionToCategory.get('smoothing'), 'smoothing', 'COSMILE SMOOTHING must map explicitly to smoothing');
assert.equal(authorityFunctionToCategory.size, 20, 'authority function vocabulary must contain exactly 20 reviewed terms');

const runtimeMappings = {};
for (const [canonical, mapping] of Object.entries(taxonomy.reviewed_mappings)) {
  assert.ok(EXPECTED_CATEGORIES.has(mapping.category), `${canonical}: unknown internal category ${mapping.category}`);
  assert.ok(Array.isArray(mapping.source_functions) && mapping.source_functions.length > 0, `${canonical}: source_functions required`);
  assert.ok(String(mapping.authority || '').trim(), `${canonical}: authority required`);
  assert.ok(Array.isArray(mapping.sources) && mapping.sources.length > 0, `${canonical}: source URL required`);
  assert.ok(mapping.sources.every(validHttpsSource), `${canonical}: only approved HTTPS authority sources are allowed`);
  for (const sourceFunction of mapping.source_functions) {
    assert.equal(authorityFunctionToCategory.get(normalize(sourceFunction)), mapping.category, `${canonical}: source function ${sourceFunction} is not explicitly mapped to ${mapping.category}`);
  }
  assert.equal(mapping.runtime_verified, true, `${canonical}: reviewed mapping must be explicitly runtime_verified`);
  runtimeMappings[canonical] = mapping;
}

for (const canonical of EXPECTED_WAVE3_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 3 mapping must remain runtime_verified`);
for (const canonical of EXPECTED_WAVE4_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 4 mapping must remain runtime_verified`);
for (const canonical of EXPECTED_WAVE5_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 5 mapping must remain runtime_verified`);
for (const canonical of EXPECTED_WAVE6_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 6 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE7_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 7 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE8_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 8 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE9_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 9 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE10_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 10 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE11_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 11 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE12_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 12 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE13_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 13 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE14_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 14 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE15_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 15 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE16_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 16 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE17_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 17 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE18_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 18 mapping must be runtime_verified`);
for (const canonical of EXPECTED_WAVE19_PROMOTED) assert.ok(runtimeMappings[canonical], `${canonical}: wave 19 mapping must be runtime_verified`);
assert.equal(runtimeMappings['sodium gluconate']?.source_functions?.[0], 'chelating', 'Sodium Gluconate must use the reviewed COSMILE CHELATING authority term');
assert.equal(runtimeMappings['xanthan gum']?.source_functions?.[0], 'viscosity controlling', 'Xanthan Gum must use the reviewed COSMILE VISCOSITY CONTROLLING authority term');
assert.equal(runtimeMappings['ethylhexylglycerin']?.source_functions?.[0], 'skin conditioning', 'Ethylhexylglycerin must use the reviewed COSMILE SKIN CONDITIONING authority term');
assert.equal(runtimeMappings['squalane']?.source_functions?.[0], 'skin conditioning - emollient', 'Squalane must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['sodium cocoyl glutamate']?.source_functions?.[0], 'cleansing', 'Sodium Cocoyl Glutamate must use the reviewed COSMILE CLEANSING authority term');
assert.equal(runtimeMappings['dimethicone']?.source_functions?.[0], 'skin conditioning', 'Dimethicone must use the reviewed COSMILE SKIN CONDITIONING authority term');
assert.equal(runtimeMappings['cetearyl alcohol']?.source_functions?.[0], 'skin conditioning - emollient', 'Cetearyl Alcohol must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['cetyl alcohol']?.source_functions?.[0], 'skin conditioning - emollient', 'Cetyl Alcohol must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['disodium lauryl sulfosuccinate']?.source_functions?.[0], 'cleansing', 'Disodium Lauryl Sulfosuccinate must use the reviewed COSMILE CLEANSING authority term');
assert.equal(runtimeMappings['hydrogenated polyisobutene']?.source_functions?.[0], 'skin conditioning - emollient', 'Hydrogenated Polyisobutene must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['cetearyl olivate']?.source_functions?.[0], 'skin conditioning - emollient', 'Cetearyl Olivate must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['stearyl alcohol']?.source_functions?.[0], 'skin conditioning - emollient', 'Stearyl Alcohol must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['sodium lauroyl glutamate']?.source_functions?.[0], 'surfactant - cleansing', 'Sodium Lauroyl Glutamate must use the reviewed COSMILE SURFACTANT - CLEANSING authority term');
assert.equal(runtimeMappings['sodium coco-sulfate']?.source_functions?.[0], 'surfactant - cleansing', 'Sodium Coco-Sulfate must use the reviewed COSMILE SURFACTANT - CLEANSING authority term');
assert.equal(runtimeMappings['polysorbate 80']?.source_functions?.[0], 'surfactant - emulsifying', 'Polysorbate 80 must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['sorbitan olivate']?.source_functions?.[0], 'surfactant - emulsifying', 'Sorbitan Olivate must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['steareth-2']?.source_functions?.[0], 'surfactant - emulsifying', 'Steareth-2 must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['steareth-21']?.source_functions?.[0], 'surfactant - emulsifying', 'Steareth-21 must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['caprylyl glycol']?.source_functions?.[0], 'skin conditioning - emollient', 'Caprylyl Glycol must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['ceramide np']?.source_functions?.[0], 'skin conditioning - miscellaneous', 'Ceramide NP must use the reviewed COSMILE SKIN CONDITIONING - MISCELLANEOUS authority term');
assert.equal(runtimeMappings['cholesterol']?.source_functions?.[0], 'skin conditioning - emollient', 'Cholesterol must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['hexylene glycol']?.source_functions?.[0], 'solvent', 'Hexylene Glycol must use the reviewed COSMILE SOLVENT authority term');
assert.equal(runtimeMappings['hydroxyacetophenone']?.source_functions?.[0], 'antioxidant', 'Hydroxyacetophenone must use the reviewed COSMILE ANTIOXIDANT authority term');
assert.equal(runtimeMappings['palmitic acid']?.source_functions?.[0], 'skin conditioning - emollient', 'Palmitic Acid must use the reviewed COSMILE SKIN CONDITIONING - EMOLLIENT authority term');
assert.equal(runtimeMappings['stearic acid']?.source_functions?.[0], 'cleansing', 'Stearic Acid must use the reviewed COSMILE CLEANSING authority term');
assert.equal(runtimeMappings['myristic acid']?.source_functions?.[0], 'cleansing', 'Myristic Acid must use the reviewed COSMILE CLEANSING authority term');
assert.equal(runtimeMappings['niacinamide']?.source_functions?.[0], 'smoothing', 'Niacinamide must use the reviewed COSMILE SMOOTHING authority term');
assert.equal(runtimeMappings['hydroxyethyl acrylate/sodium acryloyldimethyl taurate copolymer']?.source_functions?.[0], 'viscosity controlling', 'Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer must use the reviewed COSMILE VISCOSITY CONTROLLING authority term');
assert.equal(runtimeMappings['ammonium polyacryloyldimethyl taurate']?.source_functions?.[0], 'viscosity controlling', 'Ammonium Polyacryloyldimethyl Taurate must use the reviewed COSMILE VISCOSITY CONTROLLING authority term');
assert.equal(runtimeMappings['ethylhexyl methoxycrylene']?.source_functions?.[0], 'skin conditioning', 'Ethylhexyl Methoxycrylene must use the reviewed COSMILE SKIN CONDITIONING authority term');
assert.equal(runtimeMappings['glyceryl stearate se']?.source_functions?.[0], 'surfactant - emulsifying', 'Glyceryl Stearate SE must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['polyacrylate crosspolymer-6']?.source_functions?.[0], 'viscosity controlling', 'Polyacrylate Crosspolymer-6 must use the reviewed COSMILE VISCOSITY CONTROLLING authority term');
assert.equal(runtimeMappings['polyhydroxystearic acid']?.source_functions?.[0], 'surfactant - emulsifying', 'Polyhydroxystearic Acid must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['potassium cetyl phosphate']?.source_functions?.[0], 'surfactant - emulsifying', 'Potassium Cetyl Phosphate must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['sorbitan isostearate']?.source_functions?.[0], 'surfactant - emulsifying', 'Sorbitan Isostearate must use the reviewed COSMILE SURFACTANT - EMULSIFYING authority term');
assert.equal(runtimeMappings['sodium citrate'], undefined, 'Sodium Citrate must remain out of runtime taxonomy until buffer vs pH-adjuster semantics are explicitly resolved');

const runtimeEvidence = parser.verifiedCategoryEvidence || {};
assert.deepEqual(new Set(Object.keys(runtimeMappings)), new Set(Object.keys(runtimeEvidence)), 'taxonomy runtime mappings must exactly match runtime category evidence');
for (const [canonical, mapping] of Object.entries(runtimeMappings)) {
  const evidence = runtimeEvidence[canonical];
  assert.ok(evidence, `${canonical}: runtime evidence missing`);
  assert.equal(evidence.category, mapping.category, `${canonical}: taxonomy category differs from runtime evidence`);
  assert.equal(evidence.authority, mapping.authority, `${canonical}: taxonomy authority differs from runtime evidence`);
  assert.deepEqual([...evidence.sources], mapping.sources, `${canonical}: taxonomy sources differ from runtime evidence`);
}
for (const ambiguous of parser.ambiguousExactKeys || []) assert.equal(taxonomy.reviewed_mappings[ambiguous], undefined, `ambiguous exact token must not enter category taxonomy: ${ambiguous}`);

console.log(JSON.stringify({
  status: 'pass',
  phase: 'verified-category-taxonomy-wave-19',
  mapping_policy: taxonomy.mapping_policy,
  canonical_categories: Object.keys(taxonomy.categories).length,
  unique_authority_function_terms: authorityFunctionToCategory.size,
  runtime_verified_mappings: Object.keys(runtimeMappings).length,
  wave_3_promoted_mappings: [...EXPECTED_WAVE3_PROMOTED],
  wave_4_promoted_mappings: [...EXPECTED_WAVE4_PROMOTED],
  wave_5_promoted_mappings: [...EXPECTED_WAVE5_PROMOTED],
  wave_6_promoted_mappings: [...EXPECTED_WAVE6_PROMOTED],
  wave_7_promoted_mappings: [...EXPECTED_WAVE7_PROMOTED],
  wave_8_promoted_mappings: [...EXPECTED_WAVE8_PROMOTED],
  wave_9_promoted_mappings: [...EXPECTED_WAVE9_PROMOTED],
  wave_10_promoted_mappings: [...EXPECTED_WAVE10_PROMOTED],
  wave_11_promoted_mappings: [...EXPECTED_WAVE11_PROMOTED],
  wave_12_promoted_mappings: [...EXPECTED_WAVE12_PROMOTED],
  wave_13_promoted_mappings: [...EXPECTED_WAVE13_PROMOTED],
  wave_14_promoted_mappings: [...EXPECTED_WAVE14_PROMOTED],
  wave_15_promoted_mappings: [...EXPECTED_WAVE15_PROMOTED],
  wave_16_promoted_mappings: [...EXPECTED_WAVE16_PROMOTED],
  wave_17_promoted_mappings: [...EXPECTED_WAVE17_PROMOTED],
  wave_18_promoted_mappings: [...EXPECTED_WAVE18_PROMOTED],
  wave_19_promoted_mappings: [...EXPECTED_WAVE19_PROMOTED],
  sodium_citrate_deferred_for_taxonomy_decision: true,
  raw_legacy_taxonomy_rewritten: false,
  safety_contract_changed: false,
  ambiguity_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
