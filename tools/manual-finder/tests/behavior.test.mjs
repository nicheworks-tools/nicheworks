import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/manual-finder/affiliate-config.js' });

const ledger = context.window.MANUALFINDER_AFFILIATE_LEDGER;
const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;

assert.ok(Array.isArray(ledger), 'fixed affiliate ledger should be exposed');
assert.equal(ledger.length, 1, 'per-model stored links should not be required');
assert.ok(config, 'runtime affiliate config should be exposed');
assert.equal(config.enabled, true, 'affiliate runtime should be enabled');

assert.equal(ledger[0].maker, 'Nikon');
assert.equal(ledger[0].model, 'Z8');
assert.equal(ledger[0].specialLink, 'https://amzn.to/3T7sxbB');
assert.equal(config.targets.nikon_z8_search, 'https://amzn.to/3T7sxbB');

assert.equal(config.trackingId, 'nicheworks09-22');
assert.equal(config.modelSearchTemplate.status, 'verified');
assert.equal(config.modelSearchTemplate.verifiedAt, '2026-09-13');
assert.equal(config.modelSearchTemplate.verificationMethod, 'amazon_link_checker');
assert.equal(config.modelSearchTemplate.activationTarget, 'manual_model_search_template');
assert.equal(
  config.modelSearchTemplate.proofUrl,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22'
);
assert.deepEqual(
  Array.from(config.modelSearchTemplate.eligibleCategories),
  ['PC・スマホ', '家電', 'プリンター・複合機', 'カメラ・映像', 'オーディオ', 'ゲーム', 'ネットワーク機器'],
  'exact model search should cover product categories but not heterogeneous その他 records'
);
assert.deepEqual(Array.from(config.modelSearchTemplate.excludedCategories), ['その他']);
assert.equal(
  config.targets.manual_model_search_template,
  'https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22',
  'validated template should expose one coarse active target'
);
assert.equal(Object.keys(config.targets).length, 2, 'one fixed override plus one reusable template target should be active');
assert.equal(config.offers.length, 1, 'dynamic model search should not create one stored offer per model');

const samples = [
  ['Brother', 'MFC-J4440N', 'プリンター・複合機'],
  ['Nikon', 'Z6III', 'カメラ・映像'],
  ['T-fal', 'KO4901JP', '家電'],
  ['Aterm', 'WX5400HP', 'ネットワーク機器'],
  ['ExampleAudio', 'A100', 'オーディオ'],
  ['ExamplePhone', 'P100', 'PC・スマホ'],
  ['ExampleGame', 'G100', 'ゲーム']
];
for (const [maker, model, category] of samples) {
  const url = config.buildModelSearchUrl({ maker, model, category });
  assert.ok(url.startsWith('https://www.amazon.co.jp/s?'), `${category} should use the validated Amazon search template`);
  assert.ok(url.includes('tag=nicheworks09-22'), `${category} should retain the fixed tracking ID`);
}

assert.equal(
  config.buildModelSearchUrl({ maker: 'Seiko', model: '9F85', category: 'その他' }),
  '',
  'Seiko caliber / その他 records must not receive a generic Amazon model-search CTA'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'Roland', model: 'S-50', category: 'その他' }),
  '',
  'heterogeneous legacy その他 records must remain excluded until a family-specific rule exists'
);
assert.equal(
  config.buildModelSearchUrl({ maker: 'Brother', model: '', category: 'プリンター・複合機' }),
  '',
  'generic manufacturer entrances without exact model metadata must fail closed'
);

console.log('ManualFinder expanded affiliate template behavior test passed.');
