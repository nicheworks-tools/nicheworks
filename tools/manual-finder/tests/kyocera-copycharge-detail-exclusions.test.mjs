import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-kyocera-toner-wave3.js',
  'affiliate-kyocera-toner-wave4.js',
  'affiliate-kyocera-toner-wave6.js',
  'affiliate-printer-detail-exclusions.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const exclusions = Array.from(context.window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS || [])
  .filter((row) => row.maker === 'KYOCERA Document Solutions');
assert.ok(config);
assert.equal(exclusions.length, 3, 'exactly three reviewed KYOCERA copy-charge models must be detail-excluded');

const sharedSource = 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_2531/option.html';
const km4031Source = 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy02/km_4031/option.html';
const manualSource = 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m_html/km_2531_3531_4031.html';
const expected = new Map([
  ['KM-2531', sharedSource],
  ['KM-3531', sharedSource],
  ['KM-4031', km4031Source]
]);

assert.deepEqual(Array.from(exclusions, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of exclusions) {
  assert.equal(row.category, 'プリンター・複合機');
  assert.equal(row.reason, 'service_managed_consumables');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, expected.get(row.model));
  assert.equal(row.supportUrl, manualSource);
  assert.deepEqual(
    Array.from(config.getConsumableOffers({ maker: row.maker, model: row.model, category: row.category })),
    [],
    `${row.model} must remain without an inferred retail toner handoff`
  );
}

for (const model of ['KM-C850D', 'KM-C870', 'KM-C3225E', 'TASKalfa 4811w']) {
  assert.equal(
    exclusions.some((row) => row.model === model),
    false,
    `${model} must remain outside this reviewed copy-charge exclusion wave`
  );
}

console.log('ManualFinder KYOCERA copy-charge detail exclusion tests passed.');
