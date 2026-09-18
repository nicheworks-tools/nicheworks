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

const EXPECTED_WAVE1 = Object.freeze({ water:'solvent', glycerin:'humectant', 'propylene glycol':'humectant', phenoxyethanol:'preservative', carbomer:'thickener' });
const EXPECTED_WAVE2 = Object.freeze({ 'citric acid':'pH adjuster', tocopherol:'antioxidant' });
const EXPECTED_WAVE3 = Object.freeze({ 'sodium chloride':'viscosity adjuster', 'disodium edta':'chelating agent' });
const EXPECTED_WAVE4 = Object.freeze({ 'tocopheryl acetate':'antioxidant' });
const EXPECTED_WAVE5 = Object.freeze({ 'butylene glycol':'solvent', 'dipropylene glycol':'solvent', 'sodium hydroxide':'pH adjuster' });
const EXPECTED_WAVE6 = Object.freeze({ 'aminomethyl propanol':'pH adjuster', triethanolamine:'pH adjuster', 'potassium hydroxide':'pH adjuster' });
const EXPECTED_WAVE7 = Object.freeze({ bht:'antioxidant', betaine:'humectant', 'pentylene glycol':'solvent' });
const EXPECTED_WAVE8 = Object.freeze({ propanediol:'humectant', '1,2-hexanediol':'solvent', alcohol:'solvent' });
const EXPECTED_WAVE9 = Object.freeze({ 'ascorbyl palmitate':'antioxidant' });
const EXPECTED_WAVE10 = Object.freeze({ 'sodium gluconate':'chelating agent', 'xanthan gum':'viscosity adjuster' });
const EXPECTED_WAVE11 = Object.freeze({ ethylhexylglycerin:'skin conditioning', squalane:'emollient', 'sodium cocoyl glutamate':'cleanser', dimethicone:'skin conditioning' });
const EXPECTED_WAVE12 = Object.freeze({ 'cetearyl alcohol':'emollient', 'cetyl alcohol':'emollient', 'disodium lauryl sulfosuccinate':'cleanser', 'hydrogenated polyisobutene':'emollient' });
const EXPECTED_WAVE13 = Object.freeze({ 'cetearyl olivate':'emollient', 'stearyl alcohol':'emollient', 'sodium lauroyl glutamate':'cleanser', 'sodium coco-sulfate':'cleanser' });
const EXPECTED_WAVE14 = Object.freeze({ 'polysorbate 80':'emulsifier', 'sorbitan olivate':'emulsifier', 'steareth-2':'emulsifier', 'steareth-21':'emulsifier' });
const EXPECTED_WAVE15 = Object.freeze({ 'caprylyl glycol':'emollient', 'ceramide np':'skin conditioning', cholesterol:'emollient', 'hexylene glycol':'solvent' });
const EXPECTED_WAVE15_LEGACY_CATEGORIES = Object.freeze({ 'caprylyl glycol':['preservative booster'], 'ceramide np':['barrier lipid'], cholesterol:['barrier lipid'], 'hexylene glycol':['general'] });
const EXPECTED_WAVE16 = Object.freeze({ hydroxyacetophenone:'antioxidant', 'palmitic acid':'emollient', 'stearic acid':'cleanser', 'myristic acid':'cleanser' });
const EXPECTED_WAVE16_LEGACY_CATEGORIES = Object.freeze({ hydroxyacetophenone:['preservative booster'], 'palmitic acid':['general'], 'stearic acid':['general'], 'myristic acid':['general'] });
const EXPECTED_ALL = Object.freeze({ ...EXPECTED_WAVE1, ...EXPECTED_WAVE2, ...EXPECTED_WAVE3, ...EXPECTED_WAVE4, ...EXPECTED_WAVE5, ...EXPECTED_WAVE6, ...EXPECTED_WAVE7, ...EXPECTED_WAVE8, ...EXPECTED_WAVE9, ...EXPECTED_WAVE10, ...EXPECTED_WAVE11, ...EXPECTED_WAVE12, ...EXPECTED_WAVE13, ...EXPECTED_WAVE14, ...EXPECTED_WAVE15, ...EXPECTED_WAVE16 });

const EXPECTED_SOURCES = Object.freeze({
  water:'https://www.cosmeticsinfo.org/ingredient/water/', glycerin:'https://www.cosmeticsinfo.org/ingredient/glycerin/', 'propylene glycol':'https://www.cosmeticsinfo.org/ingredient/propylene-glycol/',
  phenoxyethanol:'https://health.ec.europa.eu/publications/phenoxyethanol_en', carbomer:'https://www.cosmeticsinfo.org/ingredient/carbomer/', 'citric acid':'https://www.cosmeticsinfo.org/ingredient/citric-acid/', tocopherol:'https://www.cosmeticsinfo.org/ingredient/tocopherol/',
  'sodium chloride':'https://www.cosmeticsinfo.org/ingredient/sodium-chloride/', 'disodium edta':'https://www.cosmeticsinfo.org/ingredient/disodium-edta/', 'tocopheryl acetate':'https://www.cosmeticsinfo.org/ingredient/tocopherol/',
  'butylene glycol':'https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/', 'dipropylene glycol':'https://www.cosmeticsinfo.org/ingredient/dipropylene-glycol/', 'sodium hydroxide':'https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/',
  'aminomethyl propanol':'https://www.cosmeticsinfo.org/ingredient/aminomethyl-propanol/', triethanolamine:'https://www.cosmeticsinfo.org/ingredient/triethanolamine-and-tea-containing-ingredients/', 'potassium hydroxide':'https://www.cosmeticsinfo.org/product/cuticle-oils-creams-and-lotions/',
  bht:'https://cosmileeurope.eu/inci/detail/1672/bht/', betaine:'https://cosmileeurope.eu/inci/detail/1648/betaine/', 'pentylene glycol':'https://cosmileeurope.eu/inci/detail/11416/pentylene-glycol/',
  propanediol:'https://cosmileeurope.eu/inci/detail/13169/propanediol/', '1,2-hexanediol':'https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/', alcohol:'https://cosmileeurope.eu/inci/detail/590/alcohol/',
  'ascorbyl palmitate':'https://cosmileeurope.eu/inci/detail/1244/ascorbyl-palmitate/',
  'sodium gluconate':'https://cosmileeurope.eu/inci/detail/14787/sodium-gluconate/', 'xanthan gum':'https://cosmileeurope.eu/inci/detail/16999/xanthan-gum/',
  ethylhexylglycerin:'https://cosmileeurope.eu/inci/detail/5500/ethylhexylglycerin/', squalane:'https://cosmileeurope.eu/inci/detail/15418/squalane/',
  'sodium cocoyl glutamate':'https://cosmileeurope.eu/inci/detail/14710/sodium-cocoyl-glutamate/', dimethicone:'https://cosmileeurope.eu/inci/detail/4583/dimethicone/',
  'cetearyl alcohol':'https://cosmileeurope.eu/inci/detail/2895/cetearyl-alcohol/', 'cetyl alcohol':'https://cosmileeurope.eu/inci/detail/2973/cetyl-alcohol/',
  'disodium lauryl sulfosuccinate':'https://cosmileeurope.eu/inci/detail/4979/disodium-lauryl-sulfosuccinate/', 'hydrogenated polyisobutene':'https://cosmileeurope.eu/inci/detail/6702/hydrogenated-polyisobutene/',
  'cetearyl olivate':'https://cosmileeurope.eu/inci/detail/2907/cetearyl-olivate/', 'stearyl alcohol':'https://cosmileeurope.eu/inci/detail/15539/stearyl-alcohol/',
  'sodium lauroyl glutamate':'https://cosmileeurope.eu/inci/detail/14885/sodium-lauroyl-glutamate/', 'sodium coco-sulfate':'https://cosmileeurope.eu/inci/detail/14690/sodium-coco-sulfate/',
  'polysorbate 80':'https://cosmileeurope.eu/inci/detail/12497/polysorbate-80/', 'sorbitan olivate':'https://cosmileeurope.eu/inci/detail/15312/sorbitan-olivate/',
  'steareth-2':'https://cosmileeurope.eu/inci/detail/15492/steareth-2/', 'steareth-21':'https://cosmileeurope.eu/inci/detail/15496/steareth-21/',
  'caprylyl glycol':'https://cosmileeurope.eu/inci/detail/2612/caprylyl-glycol/', 'ceramide np':'https://cosmileeurope.eu/inci/detail/25522/ceramide-np/',
  cholesterol:'https://cosmileeurope.eu/inci/detail/3117/cholesterol/', 'hexylene glycol':'https://cosmileeurope.eu/inci/detail/6450/hexylene-glycol/',
  hydroxyacetophenone:'https://cosmileeurope.eu/inci/detail/17301/hydroxyacetophenone/', 'palmitic acid':'https://cosmileeurope.eu/inci/detail/10137/palmitic-acid/',
  'stearic acid':'https://cosmileeurope.eu/inci/detail/15514/stearic-acid/', 'myristic acid':'https://cosmileeurope.eu/inci/detail/9266/myristic-acid/'
});
const ALLOWED_SOURCE_HOSTS = new Set(['www.cosmeticsinfo.org','health.ec.europa.eu','cosmileeurope.eu']);

function normalizeText(value=''){ return String(value).normalize('NFKC').replace(/\s+/g,' ').trim(); }
function splitCategory(value=''){ return normalizeText(value).split(/\s*\/\s*/).map(normalizeText).filter(Boolean); }
function validHttpsSource(value){ try { const u=new URL(String(value||'').trim()); return u.protocol==='https:' && ALLOWED_SOURCE_HOSTS.has(u.hostname); } catch { return false; } }

const rows=DATA_FILES.flatMap((file)=>{ const payload=JSON.parse(fs.readFileSync(path.join(root,file),'utf8')); if(!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`); return payload; });
const evidence=parser.verifiedCategoryEvidence||{};
assert.deepEqual(Object.fromEntries(Object.entries(evidence).map(([key,item])=>[key,item.category])),EXPECTED_ALL,'verified category evidence must remain the reviewed cumulative wave 1 through wave 16 set');
for(const ambiguous of parser.ambiguousExactKeys||[]) assert.equal(evidence[ambiguous],undefined,`ambiguous exact token must not receive category evidence: ${ambiguous}`);

const groups=new Map();
for(const row of rows){ const key=parser.canonicalIdentityKey(row.en); if(!key) continue; if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(row); }
const rawMissingCategoryRows=rows.filter((row)=>!normalizeText(row.category)).length;
assert.equal(rawMissingCategoryRows,187,'verified overlay must not hide the frozen 187 raw category gaps by rewriting recognition records');

let newlyClassifiedCanonicalIdentities=0;
let wave6Resolved=0;
let wave7Resolved=0;
let wave8Resolved=0;
let wave9Resolved=0;
let wave10Resolved=0;
let wave11Resolved=0;
let wave12Resolved=0;
let wave13Resolved=0;
let wave14Resolved=0;
let wave15Reviewed=0;
let wave16Reviewed=0;
const rawCategoryInventory={};
for(const [canonical,expectedCategory] of Object.entries(EXPECTED_ALL)){
  const item=evidence[canonical];
  assert.ok(item,`missing verified category evidence: ${canonical}`);
  assert.equal(normalizeText(item.category),expectedCategory,`${canonical}: unexpected verified category`);
  assert.ok(normalizeText(item.authority),`${canonical}: authority label required`);
  assert.ok(Array.isArray(item.sources)&&item.sources.length>0,`${canonical}: at least one source required`);
  assert.ok(item.sources.every(validHttpsSource),`${canonical}: sources must be approved HTTPS authority URLs`);
  assert.ok(item.sources.includes(EXPECTED_SOURCES[canonical]),`${canonical}: reviewed source URL must remain attached`);
  assert.ok(groups.has(canonical),`${canonical}: evidence canonical must exist in maintained dictionary`);

  const canonicalRows=groups.get(canonical);
  const rawCategories=[...new Set(canonicalRows.flatMap((row)=>splitCategory(row.category)).map((category)=>category.toLowerCase()))];
  const hasRawMissing=canonicalRows.some((row)=>!normalizeText(row.category));
  rawCategoryInventory[canonical]=rawCategories;
  if(rawCategories.length===0) newlyClassifiedCanonicalIdentities+=1;
  if(rawCategories.length>0 && !Object.hasOwn(EXPECTED_WAVE15,canonical) && !Object.hasOwn(EXPECTED_WAVE16,canonical)) assert.ok(rawCategories.includes(expectedCategory.toLowerCase()),`${canonical}: verified category conflicts with existing raw category metadata (${rawCategories.join(', ')})`);

  if(Object.hasOwn(EXPECTED_WAVE6,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 6 must resolve at least one raw missing-category row`);
    assert.deepEqual(rawCategories,[expectedCategory.toLowerCase()],`${canonical}: duplicate legacy category hint must exactly match reviewed category`);
    wave6Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE7,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 7 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 7 must be completely category-empty before overlay`);
    wave7Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE8,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 8 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 8 must be completely category-empty before overlay`);
    wave8Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE9,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 9 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 9 must be completely category-empty before overlay`);
    wave9Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE10,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 10 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 10 must be completely category-empty before overlay`);
    wave10Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE11,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 11 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 11 must be completely category-empty before overlay`);
    wave11Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE12,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 12 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 12 must be completely category-empty before overlay`);
    wave12Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE13,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 13 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 13 must be completely category-empty before overlay`);
    wave13Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE14,canonical)){
    assert.equal(hasRawMissing,true,`${canonical}: wave 14 must resolve a raw missing-category row`);
    assert.deepEqual(rawCategories,[],`${canonical}: wave 14 must be completely category-empty before overlay`);
    wave14Resolved+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE15,canonical)){
    assert.deepEqual(rawCategories,EXPECTED_WAVE15_LEGACY_CATEGORIES[canonical],`${canonical}: wave 15 must preserve the frozen unsupported legacy category hint for audit`);
    if(canonical !== 'hexylene glycol') assert.equal(hasRawMissing,true,`${canonical}: wave 15 duplicate group must retain its raw missing-category row`);
    else assert.equal(hasRawMissing,false,'hexylene glycol: wave 15 must document the existing unsupported general category rather than inventing a missing row');
    wave15Reviewed+=1;
  }
  if(Object.hasOwn(EXPECTED_WAVE16,canonical)){
    assert.deepEqual(rawCategories,EXPECTED_WAVE16_LEGACY_CATEGORIES[canonical],`${canonical}: wave 16 must preserve the frozen unsupported legacy category hint for audit`);
    assert.equal(hasRawMissing,false,`${canonical}: wave 16 must document an existing unsupported legacy category rather than inventing a missing row`);
    wave16Reviewed+=1;
  }
}

const merged=parser.mergeDictionaryRecords(rows);
const mergedByCanonical=new Map(merged.map((item)=>[parser.canonicalIdentityKey(item.en),item]));
for(const [canonical,expectedCategory] of Object.entries(EXPECTED_ALL)){
  const item=mergedByCanonical.get(canonical);
  assert.ok(item,`${canonical}: missing from merged runtime dictionary`);
  assert.equal(item.category_verified,true,`${canonical}: verified category flag must survive merge`);
  assert.ok(Array.isArray(item.category_sources)&&item.category_sources.length>0,`${canonical}: category sources must survive merge`);
  assert.ok(item.category_sources.every(validHttpsSource),`${canonical}: merged category sources must remain approved HTTPS URLs`);
  assert.ok(item.category_sources.includes(EXPECTED_SOURCES[canonical]),`${canonical}: reviewed source URL must survive merge`);
  assert.ok(Array.isArray(item.categories)&&item.categories.some((category)=>category.toLowerCase()===expectedCategory.toLowerCase()),`${canonical}: verified category must be present in merged functional categories`);
}

assert.equal(Object.keys(EXPECTED_WAVE10).length,2);
assert.equal(Object.keys(EXPECTED_WAVE11).length,4);
assert.equal(Object.keys(EXPECTED_WAVE12).length,4);
assert.equal(Object.keys(EXPECTED_WAVE13).length,4);
assert.equal(Object.keys(EXPECTED_WAVE14).length,4);
assert.equal(Object.keys(EXPECTED_WAVE15).length,4);
assert.equal(Object.keys(EXPECTED_WAVE16).length,4);
assert.equal(wave6Resolved,3);
assert.equal(wave7Resolved,3);
assert.equal(wave8Resolved,3);
assert.equal(wave9Resolved,1);
assert.equal(wave10Resolved,2,'wave 10 must resolve exactly two completely category-empty canonical identities');
assert.equal(wave11Resolved,4,'wave 11 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave12Resolved,4,'wave 12 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave13Resolved,4,'wave 13 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave14Resolved,4,'wave 14 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave15Reviewed,4,'wave 15 must review exactly four unsupported legacy role categories');
assert.equal(wave16Reviewed,4,'wave 16 must review exactly four unsupported legacy role categories');
assert.equal(evidence['sodium citrate'],undefined,'Sodium Citrate must remain deferred until buffer vs pH-adjuster taxonomy is explicitly resolved');

console.log(JSON.stringify({ status:'pass', phase:'category-provenance-wave-16', raw_missing_category_rows_unchanged:rawMissingCategoryRows, verified_category_evidence_canonical_identities:Object.keys(EXPECTED_ALL).length, wave_10_verified_canonical_identities:Object.keys(EXPECTED_WAVE10).length, wave_11_verified_canonical_identities:Object.keys(EXPECTED_WAVE11).length, wave_12_verified_canonical_identities:Object.keys(EXPECTED_WAVE12).length, wave_13_verified_canonical_identities:Object.keys(EXPECTED_WAVE13).length, wave_14_verified_canonical_identities:Object.keys(EXPECTED_WAVE14).length, wave_15_verified_canonical_identities:Object.keys(EXPECTED_WAVE15).length, wave_16_verified_canonical_identities:Object.keys(EXPECTED_WAVE16).length, newly_classified_completely_category_empty_canonical_identities:newlyClassifiedCanonicalIdentities, wave_6_raw_missing_canonical_identities_resolved:wave6Resolved, wave_7_raw_missing_canonical_identities_resolved:wave7Resolved, wave_8_raw_missing_canonical_identities_resolved:wave8Resolved, wave_9_raw_missing_canonical_identities_resolved:wave9Resolved, wave_10_raw_missing_canonical_identities_resolved:wave10Resolved, wave_11_raw_missing_canonical_identities_resolved:wave11Resolved, wave_12_raw_missing_canonical_identities_resolved:wave12Resolved, wave_13_raw_missing_canonical_identities_resolved:wave13Resolved, wave_14_raw_missing_canonical_identities_resolved:wave14Resolved, wave_15_unsupported_legacy_categories_reviewed:wave15Reviewed, wave_16_unsupported_legacy_categories_reviewed:wave16Reviewed, wave_10_requires_completely_category_empty_raw_canonical:true, wave_11_requires_completely_category_empty_raw_canonical:true, wave_12_requires_completely_category_empty_raw_canonical:true, wave_13_requires_completely_category_empty_raw_canonical:true, wave_14_requires_completely_category_empty_raw_canonical:true, wave_15_preserves_unsupported_legacy_category_hints:true, wave_16_preserves_unsupported_legacy_category_hints:true, sodium_citrate_deferred_for_taxonomy_decision:true, raw_category_inventory:rawCategoryInventory, recognition_records_rewritten:false, safety_contract_changed:false, ambiguity_contract_changed:false, affiliate_contract_changed:false },null,2));
