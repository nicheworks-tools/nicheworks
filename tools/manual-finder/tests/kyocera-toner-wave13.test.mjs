import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE13_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 3, 'KYOCERA Wave 13 must contain exactly three audited same-engine variants');

const compatibilitySource = 'https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf';
const expected = new Map([
  ['KM-1570', {
    alias: 'KM-1530',
    relation: 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_1570/specs.html',
    codes: ['1T02AV0NL0']
  }],
  ['KM-2070', {
    alias: 'KM-2030',
    relation: 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_2030/specs.html',
    codes: ['1T02AV0NL0']
  }],
  ['KM-C2630D', {
    alias: 'KM-C2630',
    relation: 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy01/km_c2630/specs.html',
    codes: ['TK-815C', 'TK-815K', 'TK-815M', 'TK-815Y']
  }]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  const target = expected.get(row.model);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, compatibilitySource);
  assert.equal(row.evidenceAlias, target.alias);
  assert.equal(row.evidenceRelation, 'official_same_engine_variant');
  assert.deepEqual(Array.from(row.evidenceUrls), [target.relation, compatibilitySource]);
  assert.deepEqual(Array.from(row.tonerCodes), target.codes);

  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, compatibilitySource);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), target.codes);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C870', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C3225E', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-2531', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-3531', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-1570', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-1570', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 13 tests passed.');
