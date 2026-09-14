import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js'
]) {
  const source = fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  vm.runInContext(source, context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_OKI_TONER_WAVE2_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 8, 'OKI Wave 2 must contain exactly the eight audited color-printer models');

const expected = new Map([
  ['C301dn', ['TNR-C4JK1', 'TNR-C4JY1', 'TNR-C4JM1', 'TNR-C4JC1']],
  ['C310dn', ['TNR-C4HK3', 'TNR-C4HY3', 'TNR-C4HM3', 'TNR-C4HC3', 'TNR-C4HK1', 'TNR-C4HY1', 'TNR-C4HM1', 'TNR-C4HC1']],
  ['C312dn', ['TNR-C4KK3', 'TNR-C4KY3', 'TNR-C4KM3', 'TNR-C4KC3', 'TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1']],
  ['C332dnw', ['TC-C4AK1', 'TC-C4AY1', 'TC-C4AM1', 'TC-C4AC1', 'TC-C4AK2', 'TC-C4AY2', 'TC-C4AM2', 'TC-C4AC2']],
  ['C510dn', ['TNR-C4HK3', 'TNR-C4HY3', 'TNR-C4HM3', 'TNR-C4HC3', 'TNR-C4HK1', 'TNR-C4HY1', 'TNR-C4HM1', 'TNR-C4HC1', 'TNR-C4HK2', 'TNR-C4HY2', 'TNR-C4HM2', 'TNR-C4HC2']],
  ['C511dn', ['TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1', 'TNR-C4KK2', 'TNR-C4KY2', 'TNR-C4KM2', 'TNR-C4KC2']],
  ['C530dn', ['TNR-C4HK3', 'TNR-C4HY3', 'TNR-C4HM3', 'TNR-C4HC3', 'TNR-C4HK1', 'TNR-C4HY1', 'TNR-C4HM1', 'TNR-C4HC1', 'TNR-C4HK2', 'TNR-C4HY2', 'TNR-C4HM2', 'TNR-C4HC2']],
  ['C531dn', ['TNR-C4KK1', 'TNR-C4KY1', 'TNR-C4KM1', 'TNR-C4KC1', 'TNR-C4KK2', 'TNR-C4KY2', 'TNR-C4KM2', 'TNR-C4KC2']]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());

for (const row of ledger) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.equal(row.sourceUrl, `https://www.oki.com/jp/printing/support/consumables-and-accessories/color/${row.model.toUpperCase()}/`);
  assert.deepEqual(Array.from(row.tonerCodes), expected.get(row.model));

  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose exactly one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `OKI ${row.model} トナー`);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), expected.get(row.model));
}

assert.equal(
  config.getConsumableOffers({ maker: 'OKI', model: 'C332dnw', category: 'プリンター・複合機' })[0].url,
  'https://www.amazon.co.jp/s?k=OKI+C332dnw+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

for (const args of [
  { maker: 'OKI', model: 'UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'C301dn', category: 'その他' },
  { maker: 'OKI Data', model: 'C301dn', category: 'プリンター・複合機' },
  { maker: 'OKI', model: '', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);
}

console.log('ManualFinder OKI toner Wave 2 tests passed.');
