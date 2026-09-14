import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-oki-toner-wave2.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_OKI_TONER_WAVE4_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 8, 'OKI Wave 4 must contain exactly eight audited MC300/MC500 models');

const expected = new Map([
  ['MC361dn', ['TNR-C4HK1', 'TNR-C4HY1', 'TNR-C4HM1', 'TNR-C4HC1']],
  ['MC362dn', ['TNR-C4KK3', 'TNR-C4KY3', 'TNR-C4KM3', 'TNR-C4KC3', 'TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1']],
  ['MC362dnw', ['TNR-C4KK3', 'TNR-C4KY3', 'TNR-C4KM3', 'TNR-C4KC3', 'TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1']],
  ['MC363dnw', ['TC-C4AK1', 'TC-C4AY1', 'TC-C4AM1', 'TC-C4AC1', 'TC-C4AK2', 'TC-C4AY2', 'TC-C4AM2', 'TC-C4AC2']],
  ['MC561dn', ['TNR-C4HK1', 'TNR-C4HY1', 'TNR-C4HM1', 'TNR-C4HC1', 'TNR-C4HK2', 'TNR-C4HY2', 'TNR-C4HM2', 'TNR-C4HC2']],
  ['MC562dn', ['TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1', 'TNR-C4KK2', 'TNR-C4KY2', 'TNR-C4KM2', 'TNR-C4KC2']],
  ['MC562dnw', ['TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1', 'TNR-C4KK2', 'TNR-C4KY2', 'TNR-C4KM2', 'TNR-C4KC2']],
  ['MC573dnw', ['TC-C4BK1', 'TC-C4BY1', 'TC-C4BM1', 'TC-C4BC1', 'TC-C4BK2', 'TC-C4BY2', 'TC-C4BM2', 'TC-C4BC2']]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.ok(row.sourceUrl.startsWith('https://www.oki.com/jp/printing/support/consumables-and-accessories/'));
  assert.deepEqual(Array.from(row.tonerCodes), expected.get(row.model));
  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].query, `OKI ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), expected.get(row.model));
}

for (const args of [
  { maker: 'OKI', model: 'MC362', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MC573dnw', category: 'その他' },
  { maker: 'OKI Data', model: 'MC573dnw', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder OKI toner Wave 4 tests passed.');
