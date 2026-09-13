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
assert.equal(ledger.length, 1, 'per-model stored Amazon links should not be required');
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
  'validated model template should expose one coarse active target'
);

assert.equal(config.consumableSearchTemplate.status, 'verified');
assert.equal(config.consumableSearchTemplate.activationTarget, 'printer_consumable_search_template');
assert.equal(config.printerConsumables.length, 13, 'first Brother wave should map all 13 verified MFC-J rows');
assert.equal(Object.keys(config.targets).length, 3, 'fixed override, model template, and consumable template should be active');
assert.equal(config.offers.length, 1, 'dynamic searches must not create one stored Amazon URL per record');

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

const expectedFamilies = new Map([
  ['MFC-J1500N', ['lc3133', 'lc3135']],
  ['MFC-J1605DN', ['lc3133', 'lc3135']],
  ['MFC-J4440N', ['lc416', 'lc416xl']],
  ['MFC-J4443N', ['lc416', 'lc416xl']],
  ['MFC-J4450N', ['lc516', 'lc516xl']],
  ['MFC-J4510N', ['lc113', 'lc117-115']],
  ['MFC-J4540N', ['lc416', 'lc416xl']],
  ['MFC-J4543N', ['lc416', 'lc416xl']],
  ['MFC-J4720N', ['lc213', 'lc217-215']],
  ['MFC-J4725N', ['lc213', 'lc217-215']],
  ['MFC-J6995CDW', ['lc3129']],
  ['MFC-J6997CDW', ['lc3139']],
  ['MFC-J6999CDW', ['lc3139']]
]);
for (const [model, keys] of expectedFamilies) {
  const consumables = config.getConsumableOffers({ maker: 'Brother', model, category: 'プリンター・複合機' });
  assert.deepEqual(Array.from(consumables, (offer) => offer.key), keys, `${model} should expose only its manufacturer-verified ink families`);
  for (const offer of consumables) {
    assert.ok(offer.url.startsWith('https://www.amazon.co.jp/s?'), `${model}/${offer.key} should use tagged Amazon search`);
    assert.ok(offer.url.includes('tag=nicheworks09-22'), `${model}/${offer.key} should retain the fixed tracking ID`);
    assert.ok(offer.sourceUrl.includes('brother.co.jp'), `${model}/${offer.key} must retain official Brother compatibility evidence`);
  }
}

const j4440 = config.getConsumableOffers({ maker: 'Brother', model: 'MFC-J4440N', category: 'プリンター・複合機' });
assert.equal(j4440[0].url, 'https://www.amazon.co.jp/s?k=Brother+LC416&tag=nicheworks09-22');
assert.equal(j4440[1].url, 'https://www.amazon.co.jp/s?k=Brother+LC416XL&tag=nicheworks09-22');

assert.deepEqual(
  Array.from(config.getConsumableOffers({ maker: 'Brother', model: 'MFC-J4440N', category: 'その他' })),
  [],
  'consumable offers must fail closed outside the printer category'
);
assert.deepEqual(
  Array.from(config.getConsumableOffers({ maker: 'Nikon', model: 'Z8', category: 'カメラ・映像' })),
  [],
  'non-printer products must not receive printer consumable offers'
);
assert.deepEqual(
  Array.from(config.getConsumableOffers({ maker: 'Brother', model: 'UNKNOWN', category: 'プリンター・複合機' })),
  [],
  'unverified models must not receive guessed consumable offers'
);

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

console.log('ManualFinder model-search and Brother consumable affiliate behavior tests passed.');
