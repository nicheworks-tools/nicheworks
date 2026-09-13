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

assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 1, 'per-model stored Amazon links should not be required');
assert.equal(ledger[0].maker, 'Nikon');
assert.equal(ledger[0].model, 'Z8');
assert.equal(ledger[0].specialLink, 'https://amzn.to/3T7sxbB');

assert.ok(config);
assert.equal(config.enabled, true);
assert.equal(config.trackingId, 'nicheworks09-22');
assert.equal(config.modelSearchTemplate.status, 'verified');
assert.equal(config.modelSearchTemplate.verificationMethod, 'amazon_link_checker');
assert.equal(config.modelSearchTemplate.activationTarget, 'manual_model_search_template');
assert.equal(config.consumableSearchTemplate.status, 'verified');
assert.equal(config.consumableSearchTemplate.activationTarget, 'printer_consumable_search_template');
assert.deepEqual(
  Array.from(config.modelSearchTemplate.eligibleCategories),
  ['PC・スマホ', '家電', 'プリンター・複合機', 'カメラ・映像', 'オーディオ', 'ゲーム', 'ネットワーク機器']
);
assert.deepEqual(Array.from(config.modelSearchTemplate.excludedCategories), ['その他']);
assert.equal(config.printerConsumables.length, 45, '25 consumer-printer mappings plus 20 office-toner mappings should be present');
assert.equal(config.officePrinterConsumables.length, 20, 'OKI 10 + KYOCERA 5 + RICOH 5 office-toner mappings should be present');
assert.equal(Object.keys(config.targets).length, 3);
assert.equal(config.offers.length, 1, 'dynamic searches must not create one stored Amazon URL per record');

for (const [maker, model, category] of [
  ['Brother', 'MFC-J4440N', 'プリンター・複合機'],
  ['Epson', 'EW-056A', 'プリンター・複合機'],
  ['Canon', 'TS8830', 'プリンター・複合機'],
  ['OKI', 'C650dnw', 'プリンター・複合機'],
  ['KYOCERA Document Solutions', 'ECOSYS P6026cdn', 'プリンター・複合機'],
  ['RICOH', 'RICOH IM C8010', 'プリンター・複合機'],
  ['Nikon', 'Z6III', 'カメラ・映像'],
  ['T-fal', 'KO4901JP', '家電'],
  ['Aterm', 'WX5400HP', 'ネットワーク機器']
]) {
  const url = config.buildModelSearchUrl({ maker, model, category });
  assert.ok(url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(url.includes('tag=nicheworks09-22'));
}

const consumerFamilies = new Map([
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
for (const [identity, keys] of consumerFamilies) {
  const [maker, model] = identity.split('|');
  const offers = config.getConsumableOffers({ maker, model, category: 'プリンター・複合機' });
  assert.deepEqual(Array.from(offers, (offer) => offer.key), keys, `${identity} should expose only verified consumable families`);
  for (const offer of offers) {
    assert.ok(offer.url.startsWith('https://www.amazon.co.jp/s?'));
    assert.ok(offer.url.includes('tag=nicheworks09-22'));
  }
}

assert.equal(
  config.getConsumableOffers({ maker: 'Brother', model: 'MFC-J4440N', category: 'プリンター・複合機' })[0].url,
  'https://www.amazon.co.jp/s?k=Brother+LC416&tag=nicheworks09-22'
);
assert.equal(
  config.getConsumableOffers({ maker: 'Epson', model: 'EP-887AW', category: 'プリンター・複合機' })[1].url,
  'https://www.amazon.co.jp/s?k=Epson+KNI-6CL-L&tag=nicheworks09-22'
);
assert.equal(
  config.getConsumableOffers({ maker: 'Canon', model: 'TS8830', category: 'プリンター・複合機' })[0].url,
  'https://www.amazon.co.jp/s?k=Canon+BCI-331+BCI-330&tag=nicheworks09-22'
);

const officeModels = new Map([
  ['OKI|C650dnw', ['TC-C4EK1', 'TC-C4EY1', 'TC-C4EM1', 'TC-C4EC1']],
  ['OKI|C651dnw', ['TC-C4FK1', 'TC-C4FY1', 'TC-C4FM1', 'TC-C4FC1']],
  ['OKI|C712dnw', ['TC-C4CK1', 'TC-C4CY1', 'TC-C4CM1', 'TC-C4CC1', 'TC-C4CK2', 'TC-C4CY2', 'TC-C4CM2', 'TC-C4CC2']],
  ['OKI|C835dnw', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1', 'TC-C3BK2', 'TC-C3BY2', 'TC-C3BM2', 'TC-C3BC2']],
  ['OKI|C844dnw', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1', 'TC-C3BK2', 'TC-C3BY2', 'TC-C3BM2', 'TC-C3BC2']],
  ['OKI|C824dn', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1']],
  ['OKI|C835dnwt', ['TC-C3BK1', 'TC-C3BY1', 'TC-C3BM1', 'TC-C3BC1', 'TC-C3BK2', 'TC-C3BY2', 'TC-C3BM2', 'TC-C3BC2']],
  ['OKI|C911dn', ['TNR-C3RK2', 'TNR-C3RY2', 'TNR-C3RM2', 'TNR-C3RC2']],
  ['OKI|C931dn', ['TNR-C3RK2', 'TNR-C3RY2', 'TNR-C3RM2', 'TNR-C3RC2', 'TNR-C3RK1', 'TNR-C3RY1', 'TNR-C3RM1', 'TNR-C3RC1']],
  ['OKI|C941dn', ['TNR-C3RK2', 'TNR-C3RY2', 'TNR-C3RM2', 'TNR-C3RC2', 'TNR-C3RSW2', 'TNR-C3RSC2', 'TNR-C3RK1', 'TNR-C3RY1', 'TNR-C3RM1', 'TNR-C3RC1']],
  ['KYOCERA Document Solutions|ECOSYS P6026cdn', ['TK-591K', 'TK-591C', 'TK-591M', 'TK-591Y']],
  ['KYOCERA Document Solutions|LS-C8500DN', ['TK-881K', 'TK-881C', 'TK-881M', 'TK-881Y']],
  ['KYOCERA Document Solutions|FS-C5300DN', ['TK-561K', 'TK-561Y', 'TK-561M', 'TK-561C']],
  ['KYOCERA Document Solutions|FS-C5200DN', ['TK-551K', 'TK-551C', 'TK-551M', 'TK-551Y']],
  ['KYOCERA Document Solutions|LS-C8026N', ['TK-811K', 'TK-811Y', 'TK-811M', 'TK-811C']],
  ['RICOH|RICOH IM C8010', ['RICOH MP トナー ブラック C8003', 'RICOH MP トナー イエロー C8003', 'RICOH MP トナー マゼンタ C8003', 'RICOH MP トナー シアン C8003']],
  ['RICOH|RICOH IM C6510', ['RICOH MP トナー ブラック C8003', 'RICOH MP トナー イエロー C8003', 'RICOH MP トナー マゼンタ C8003', 'RICOH MP トナー シアン C8003']],
  ['RICOH|RICOH IM C7010', ['RICOH トナー ブラック IM C7010', 'RICOH トナー イエロー IM C7010', 'RICOH トナー マゼンタ IM C7010', 'RICOH トナー シアン IM C7010']],
  ['RICOH|RICOH IM C6011', ['RICOH トナー ブラック IM C6010', 'RICOH トナー イエロー IM C6010', 'RICOH トナー マゼンタ IM C6010', 'RICOH トナー シアン IM C6010']],
  ['RICOH|RICOH IM C3511', ['RICOH トナー ブラック IM C3510', 'RICOH トナー イエロー IM C3510', 'RICOH トナー マゼンタ IM C3510', 'RICOH トナー シアン IM C3510']]
]);
for (const [identity, codes] of officeModels) {
  const [maker, model] = identity.split('|');
  const row = Array.from(config.officePrinterConsumables).find((item) => item.maker === maker && item.model === model);
  assert.ok(row, `${identity} should retain an official toner mapping`);
  assert.deepEqual(Array.from(row.tonerCodes), codes, `${identity} toner identifiers should match manufacturer evidence`);

  const offers = config.getConsumableOffers({ maker, model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${identity} should expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

const kyocera = config.getConsumableOffers({
  maker: 'KYOCERA Document Solutions',
  model: 'ECOSYS P6026cdn',
  category: 'プリンター・複合機'
});
assert.equal(kyocera[0].query, 'KYOCERA ECOSYS P6026cdn トナー');
assert.equal(
  kyocera[0].url,
  'https://www.amazon.co.jp/s?k=KYOCERA+ECOSYS+P6026cdn+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);
assert.ok(kyocera[0].sourceUrl.includes('kyoceradocumentsolutions.co.jp'));

const ricoh = config.getConsumableOffers({
  maker: 'RICOH',
  model: 'RICOH IM C8010',
  category: 'プリンター・複合機'
});
assert.equal(ricoh[0].query, 'RICOH IM C8010 トナー');
assert.equal(
  ricoh[0].url,
  'https://www.amazon.co.jp/s?k=RICOH+IM+C8010+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);
assert.ok(ricoh[0].sourceUrl.includes('ricoh.co.jp'));

for (const args of [
  { maker: 'Brother', model: 'MFC-J4440N', category: 'その他' },
  { maker: 'Nikon', model: 'Z8', category: 'カメラ・映像' },
  { maker: 'Epson', model: 'UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'Canon', model: 'UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'RICOH', model: 'UNKNOWN', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);
}

assert.equal(config.buildModelSearchUrl({ maker: 'Seiko', model: '9F85', category: 'その他' }), '');
assert.equal(config.buildModelSearchUrl({ maker: 'Roland', model: 'S-50', category: 'その他' }), '');
assert.equal(config.buildModelSearchUrl({ maker: 'Brother', model: '', category: 'プリンター・複合機' }), '');

console.log('ManualFinder model-search and cross-maker consumable affiliate behavior tests passed.');
