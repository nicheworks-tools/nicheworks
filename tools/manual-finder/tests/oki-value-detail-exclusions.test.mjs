import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js',
  'affiliate-oki-toner-wave6.js',
  'affiliate-printer-detail-exclusions.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const exclusions = Array.from(context.window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS || []);
assert.ok(config);
assert.equal(exclusions.length, 4, 'exactly four reviewed OKI value-service models must be detail-excluded');

const serviceSource = 'https://www.oki.com/jp/printing/services-and-solutions/valueservice/index.html';
const expected = new Map([
  ['MC883dnwvバリューSタイプ', 'https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-S/'],
  ['MC883dnwvバリューMタイプ', 'https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-M/'],
  ['MC883dnwvバリューLタイプ', 'https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-L/'],
  ['MC883dnwvバリューXLタイプ', 'https://www.oki.com/jp/printing/support/consumables-and-accessories/colormfp/MC883DNWV-XL/']
]);

assert.deepEqual(Array.from(exclusions, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of exclusions) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.category, 'プリンター・複合機');
  assert.equal(row.reason, 'service_managed_consumables');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, serviceSource);
  assert.equal(row.supportUrl, expected.get(row.model));
  assert.deepEqual(
    Array.from(config.getConsumableOffers({ maker: row.maker, model: row.model, category: row.category })),
    [],
    `${row.model} must not receive an inferred retail consumables handoff`
  );
}

console.log('ManualFinder OKI value-service detail exclusion tests passed.');
