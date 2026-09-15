import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-oki-toner-wave2.js', 'affiliate-oki-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_OKI_TONER_WAVE6_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 6, 'OKI Wave 6 must contain exactly six audited color LED printer models');

const c4b = ['TC-C4BK1', 'TC-C4BY1', 'TC-C4BM1', 'TC-C4BC1', 'TC-C4BK2', 'TC-C4BY2', 'TC-C4BM2', 'TC-C4BC2'];
const c3h = ['TNR-C3HK1', 'TNR-C3HY1', 'TNR-C3HM1', 'TNR-C3HC1', 'TNR-C3HK2', 'TNR-C3HY2', 'TNR-C3HM2', 'TNR-C3HC2'];
const expected = new Map([
  ['C542dnw', c4b],
  ['MICROLINE 910PS', c3h],
  ['MICROLINE 910PS-D', c3h],
  ['MICROLINE Pro 930PS-E', c3h],
  ['MICROLINE Pro 930PS-S', c3h],
  ['MICROLINE Pro 930PS-X', c3h]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.ok(row.sourceUrl.startsWith('https://www.oki.com/jp/printing/support/consumables-and-accessories/color/'));
  assert.deepEqual(Array.from(row.tonerCodes), expected.get(row.model));
  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].query, `OKI ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), expected.get(row.model));
}

for (const args of [
  { maker: 'OKI', model: 'MICROLINE 50HU', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MICROLINE Pro 930PS', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'C542dnw', category: 'その他' },
  { maker: 'OKI Data', model: 'C542dnw', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder OKI toner Wave 6 tests passed.');
