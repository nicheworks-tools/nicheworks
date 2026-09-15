import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-oki-toner-wave2.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_OKI_TONER_WAVE5_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 14, 'OKI Wave 5 must contain exactly fourteen audited MC700/MC800 models');

const c4r = ['TNR-C4RK2', 'TNR-C4RY2', 'TNR-C4RM2', 'TNR-C4RC2', 'TNR-C4RK1', 'TNR-C4RY1', 'TNR-C4RM1', 'TNR-C4RC1'];
const c3l = ['TNR-C3LK1', 'TNR-C3LY1', 'TNR-C3LM1', 'TNR-C3LC1', 'TNR-C3LK2', 'TNR-C3LY2', 'TNR-C3LM2', 'TNR-C3LC2', 'TNR-C3LK4'];
const c3m = ['TNR-C3MK1', 'TNR-C3MY1', 'TNR-C3MM1', 'TNR-C3MC1'];
const c3k = ['TNR-C3KK3', 'TNR-C3KY3', 'TNR-C3KM3', 'TNR-C3KC3', 'TNR-C3KK1', 'TNR-C3KY1', 'TNR-C3KM1', 'TNR-C3KC1'];
const c3p = ['TNR-C3PK1', 'TNR-C3PY1', 'TNR-C3PM1', 'TNR-C3PC1', 'TNR-C3PK2', 'TNR-C3PY2', 'TNR-C3PM2', 'TNR-C3PC2'];

const expected = new Map([
  ['MC780dn', c4r],
  ['MC780dnf', c4r],
  ['MC780dnl', c4r],
  ['MC843dnw', c3l],
  ['MC843dnwv', c3l],
  ['MC852dn', c3m],
  ['MC860dn', c3k],
  ['MC860dtn', c3k],
  ['MC862dn', c3p],
  ['MC862dn-T', c3p],
  ['MC863dnw', c3l],
  ['MC863dnwv', c3l],
  ['MC883dnw', c3l],
  ['MC883dnwv', c3l]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.ok(row.sourceUrl.startsWith('https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/'));
  assert.deepEqual(Array.from(row.tonerCodes), expected.get(row.model));
  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].query, `OKI ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), expected.get(row.model));
}

for (const args of [
  { maker: 'OKI', model: 'MC883dnwvバリューSタイプ', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MC883dnwv', category: 'その他' },
  { maker: 'OKI Data', model: 'MC883dnwv', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MC862', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder OKI toner Wave 5 tests passed.');
