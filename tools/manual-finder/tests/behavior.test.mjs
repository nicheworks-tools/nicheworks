import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });

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
assert.equal(config.printerConsumables.length, 30, 'Brother 13 + Epson 6 + Canon 6 + OKI 5 verified printer mappings should be present');
assert.equal(config.officePrinterConsumables.length, 5, 'first OKI toner wave should contain five exact models');
assert.equal(Object.keys(config.targets).length, 3, 'fixed override, model template, and consumable template should be active');
assert.equal(config.offers.length, 1, 'dynamic searches must not create one stored Amazon URL per record');

const samples = [
  ['Brother', 'MFC-J4440N', 'プリンター・複合機'],
  ['Epson', 'EW-056A', 'プリンター・複合機'],
  ['Canon', 'TS8830', 'プリンター・複合機'],
  ['OKI', 'C650dnw', 'プリンター・複合機'],
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
  ['Brother|MFC-J1500N', ['lc3133', 'lc3135']],
  ['Brother|MFC-J1605DN', ['lc3133', 'lc3135']],
  ['Brother|MFC-J4440N', ['lc416', 'lc416xl']],
  ['Brother|MFC-J4443N', ['lc416', 'lc416xl']],
  ['Brother|MFC-J4450N', ['lc516', 'lc516xl']],
  ['Brother|MFC-J4510N', ['lc113', 'lc117-115']],
  ['Brother|MFC-J4540N', ['lc416', 'lc416xl']],
  ['Brother|MFC-J4543N', ['lc416', 'lc416xl']],
  ['Brother|MFC-J4720N', ['lc213', 'lc217-215']],
  ['Brother|MFC-J4725N', ['lc213', 'lc217-215']],
  ['Brother|MFC-J6995CDW', ['lc3129']],
  ['Brother|MFC-J6997CDW', ['lc3139']],
  ['Brother|MFC-J6999CDW', ['lc3139']],
  ['Epson|EW-056A', ['med-4cl']],
  ['Epson|EW-456A', ['med-4cl']],
  ['Epson|EP-817A', ['kak-6cl']],
  ['Epson|EP-887AW', ['kni-6cl', 'kni-6cl-l']],
  ['Epson|EP-887AB', ['kni-6cl', 'kni-6cl-l']],
  ['Epson|EP-887AP', ['kni-6cl', 'kni-6cl-l']],
  ['Canon|TS8830', ['bci331-330', 'bci331xl-330xl']],
  ['Canon|TS8730', ['bci331-330', 'bci331xl-330xl']],
  ['Canon|TS7630', ['bci331-330', 'bci331xl-330xl']],
  ['Canon|TS6730', ['bc385-386', 'bc385xl-386xl']],
  ['Canon|TS3730', ['bc365-366', 'bc365xl-366xl']],
  ['Canon|XK130', ['xki-n21-n20']]
]);
for (const [identity, keys] of expectedFamilies) {
  const [maker, model] = identity.split('|');
  const consumables = config.getConsumableOffers({ maker, model, category: 'プリンター・複合機' });
  assert.deepEqual(Array.from(consumables, (offer) => offer.key), keys, `${identity} should expose only its manufacturer-verified ink families`);
  for (const offer of consumables) {
    assert.ok(offer.url.startsWith('https://www.amazon.co.jp/s?'), `${identity}/${offer.key} should use tagged Amazon search`);
    assert.ok(offer.url.includes('tag=nicheworks09-22'), `${identity}/${offer.key} should retain the fixed tracking ID`);
    if (maker === 'Brother') assert.ok(offer.sourceUrl.includes('brother.co.jp'), `${identity}/${offer.key} must retain official Brother evidence`);
    if (maker === 'Epson') assert.ok(offer.sourceUrl.includes('epson.jp'), `${identity}/${offer.key} must retain official Epson evidence`);
    if (maker === 'Canon') assert.ok(offer.sourceUrl.includes('canon.jp'), `${identity}/${offer.key} must retain official Canon evidence`);
  }
}

const j4440 = config.getConsumableOffers({ maker: 'Brother', model: 'MFC-J4440N', category: 'プリンター・複合機' });
assert.equal(j4440[0].url, 'https://www.amazon.co.jp/s?k=Brother+LC416&tag=nicheworks09-22');
assert.equal(j4440[1].url, 'https://www.amazon.co.jp/s?k=Brother+LC416XL&tag=nicheworks09-22');

const j4720 = config.getConsumableOffers({ maker: 'Brother', model: 'MFC-J4720N', category: 'プリンター・複合機' });
assert.equal(j4720[1].url, 'https://www.amazon.co.jp/s?k=Brother+LC217+LC215&tag=nicheworks09-22', 'Brother MFC-J4720N must keep the LC217/LC215 mapping');

const ew056 = config.getConsumableOffers({ maker: 'Epson', model: 'EW-056A', category: 'プリンター・複合機' });
assert.equal(ew056[0].url, 'https://www.amazon.co.jp/s?k=Epson+MED-4CL&tag=nicheworks09-22');

const ep887 = config.getConsumableOffers({ maker: 'Epson', model: 'EP-887AW', category: 'プリンター・複合機' });
assert.equal(ep887[0].url, 'https://www.amazon.co.jp/s?k=Epson+KNI-6CL&tag=nicheworks09-22');
assert.equal(ep887[1].url, 'https://www.amazon.co.jp/s?k=Epson+KNI-6CL-L&tag=nicheworks09-22');

const ts8830 = config.getConsumableOffers({ maker: 'Canon', model: 'TS8830', category: 'プリンター・複合機' });
assert.equal(ts8830[0].url, 'https://www.amazon.co.jp/s?k=Canon+BCI-331+BCI-330&tag=nicheworks09-22');
assert.equal(ts8830[1].url, 'https://www.amazon.co.jp/s?k=Canon+BCI-331XL+BCI-330XL&tag=nicheworks09-22');

const ts3730 = config.getConsumableOffers({ maker: 'Canon', model: 'TS3730', category: 'プリンター・複合機' });
assert.equal(ts3730[0].url, 'https://www.amazon.co.jp/s?k=Canon+BC-365+BC-366&tag=nicheworks09-22');
assert.equal(ts3730[1].url, 'https://www.amazon.co.jp/s?k=Canon+BC-365XL+BC-366XL&tag=nicheworks09-22');

const okiModels = new Map([
  ['C650dnw', ['TC-C4EK1', 'TC-C4EY1', 'TC-C4EM1', 'TC-C4EC1']],
  ['C651dnw', ['TC-C4FK1', 'TC-C4FY1', 'TC-C4FM1', 'TC-C4FC1']],
  ['C712dnw', ['TC-C4CK1', 'TC-C4CY1', 'TC-C4CM1', 'TC-C4CC1', 'TC-C4CK2', 'TC-C4CY2', 'TC-C4CM2', 'TC-C4CC2']],
  ['C835dnw', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1', 'TC-C3BK2', 'TC-C3BY2', 'TC-C3BM2', 'TC-C3BC2']],
  ['C844dnw', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1', 'TC-C3BK2', 'TC-C3BY2', 'TC-C3BM2', 'TC-C3BC2']]
]);
for (const [model, codes] of okiModels) {
  const row = Array.from(config.officePrinterConsumables).find((item) => item.model === model);
  assert.ok(row, `${model} should retain an official OKI toner mapping`);
  assert.deepEqual(Array.from(row.tonerCodes), codes, `${model} toner codes should match official OKI evidence`);
  assert.ok(row.sourceUrl.includes('oki.com/'), `${model} should retain OKI source evidence`);

  const offers = config.getConsumableOffers({ maker: 'OKI', model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${model} should expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `OKI ${model} トナー`);
  assert.ok(offers[0].url.includes(`k=OKI+${encodeURIComponent(model).replace(/%/g, '%25')}`) || offers[0].url.includes(`k=OKI+${model}+%E3%83%88%E3%83%8A%E3%83%BC`));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

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
  Array.from(config.getConsumableOffers({ maker: 'Epson', model: 'UNKNOWN', category: 'プリンター・複合機' })),
  [],
  'unverified Epson models must not receive guessed consumable offers'
);
assert.deepEqual(
  Array.from(config.getConsumableOffers({ maker: 'Canon', model: 'UNKNOWN', category: 'プリンター・複合機' })),
  [],
  'unverified Canon models must not receive guessed consumable offers'
);
assert.deepEqual(
  Array.from(config.getConsumableOffers({ maker: 'OKI', model: 'UNKNOWN', category: 'プリンター・複合機' })),
  [],
  'unverified OKI models must not receive guessed toner offers'
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

console.log('ManualFinder model-search plus Brother/Epson/Canon/OKI consumable affiliate behavior tests passed.');