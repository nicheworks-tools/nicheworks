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
const EXPECTED_ALL = Object.freeze({ ...EXPECTED_WAVE1, ...EXPECTED_WAVE2, ...EXPECTED_WAVE3, ...EXPECTED_WAVE4, ...EXPECTED_WAVE5, ...EXPECTED_WAVE6, ...EXPECTED_WAVE7, ...EXPECTED_WAVE8, ...EXPECTED_WAVE9, ...EXPECTED_WAVE10, ...EXPECTED_WAVE11, ...EXPECTED_WAVE12 });

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
  'disodium lauryl sulfosuccinate':'https://cosmileeurope.eu/inci/detail/4979/disodium-lauryl-sulfosuccinate/', 'hydrogenated polyisobutene':'https://cosmileeurope.eu/inci/detail/6702/hydrogenated-polyisobutene/'
});
const ALLOWED_SOURCE_HOSTS = new Set(['www.cosmeticsinfo.org','health.ec.europa.eu','cosmileeurope.eu']);

function normalizeText(value=''){ return String(value).normalize('NFKC').replace(/\s+/g,' ').trim(); }
function splitCategory(value=''){ return normalizeText(value).split(/\s*\/\s*/).map(normalizeText).filter(Boolean); }
function validHttpsSource(value){ try { const u=new URL(String(value||'').trim()); return u.protocol==='https:' && ALLOWED_SOURCE_HOSTS.has(u.hostname); } catch { return false; } }

const rows=DATA_FILES.flatMap((file)=>{ const payload=JSON.parse(fs.readFileSync(path.join(root,file),'utf8')); if(!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`); return payload; });
const evidence=parser.verifiedCategoryEvidence||{};
assert.deepEqual(Object.fromEntries(Object.entries(evidence).map(([key,item])=>[key,item.category])),EXPECTED_ALL,'verified category evidence must remain the reviewed cumulative wave 1 through wave 12 set');
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
  if(rawCategories.length>0) assert.ok(rawCategories.includes(expectedCategory.toLowerCase()),`${canonical}: verified category conflicts with existing raw category metadata (${rawCategories.join(', ')})`);

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
assert.equal(wave6Resolved,3);
assert.equal(wave7Resolved,3);
assert.equal(wave8Resolved,3);
assert.equal(wave9Resolved,1);
assert.equal(wave10Resolved,2,'wave 10 must resolve exactly two completely category-empty canonical identities');
assert.equal(wave11Resolved,4,'wave 11 must resolve exactly four completely category-empty canonical identities');
assert.equal(wave12Resolved,4,'wave 12 must resolve exactly four completely category-empty canonical identities');
assert.equal(evidence['sodium citrate'],undefined,'Sodium Citrate must remain deferred until buffer vs pH-adjuster taxonomy is explicitly resolved');

console.log(JSON.stringify({ status:'pass', phase:'category-provenance-wave-12', raw_missing_category_rows_unchanged:rawMissingCategoryRows, verified_category_evidence_canonical_identities:Object.keys(EXPECTED_ALL).length, wave_10_verified_canonical_identities:Object.keys(EXPECTED_WAVE10).length, wave_11_verified_canonical_identities:Object.keys(EXPECTED_WAVE11).length, wave_12_verified_canonical_identities:Object.keys(EXPECTED_WAVE12).length, newly_classified_completely_category_empty_canonical_identities:newlyClassifiedCanonicalIdentities, wave_6_raw_missing_canonical_identities_resolved:wave6Resolved, wave_7_raw_missing_canonical_identities_resolved:wave7Resolved, wave_8_raw_missing_canonical_identities_resolved:wave8Resolved, wave_9_raw_missing_canonical_identities_resolved:wave9Resolved, wave_10_raw_missing_canonical_identities_resolved:wave10Resolved, wave_11_raw_missing_canonical_identities_resolved:wave11Resolved, wave_12_raw_missing_canonical_identities_resolved:wave12Resolved, wave_10_requires_completely_category_empty_raw_canonical:true, wave_11_requires_completely_category_empty_raw_canonical:true, wave_12_requires_completely_category_empty_raw_canonical:true, sodium_citrate_deferred_for_taxonomy_decision:true, raw_category_inventory:rawCategoryInventory, recognition_records_rewritten:false, safety_contract_changed:false, ambiguity_contract_changed:false, affiliate_contract_changed:false },null,2));
