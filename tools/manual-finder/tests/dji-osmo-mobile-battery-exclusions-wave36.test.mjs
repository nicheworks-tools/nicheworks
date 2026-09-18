import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
const root = new URL('../', import.meta.url);

for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  ...fs.readdirSync(root)
    .filter((name) => /^affiliate-dji-camera-accessories-wave\d+\.js$/.test(name))
    .sort((a, b) => Number(a.match(/wave(\d+)/)?.[1] || 0) - Number(b.match(/wave(\d+)/)?.[1] || 0)),
  'affiliate-camera-detail-exclusions.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

const expected = new Map([
  ['DJI OM 4', 'https://www.dji.com/support/product/om-4'],
  ['DJI OM 4 SE', 'https://www.dji.com/support/product/om-4-se'],
  ['DJI OM 5', 'https://www.dji.com/support/product/om-5'],
  ['Osmo Mobile 2', 'https://www.dji.com/support/product/osmo-mobile-2'],
  ['Osmo Mobile 3', 'https://www.dji.com/support/product/osmo-mobile-3'],
  ['Osmo Mobile 6', 'https://www.dji.com/support/product/osmo-mobile-6'],
  ['Osmo Mobile 7 Series', 'https://www.dji.com/support/product/osmo-mobile-7-series'],
  ['Osmo Mobile 8', 'https://www.dji.com/support/product/osmo-mobile-8'],
  ['Osmo Mobile SE', 'https://www.dji.com/support/product/osmo-mobile-se']
]);

assert.equal(exclusions.length, 15, 'Wave 36 must bring the reviewed camera exclusion ledger to fifteen rows');

for (const [model, sourceUrl] of expected) {
  const row = exclusions.find((entry) => entry.model === model);
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.reason, 'built_in_battery_no_model_specific_replaceable_power_accessory');
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-18');
  assert.deepEqual(Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' })), [], `${model} must remain detail-free`);
}

for (const model of ['Osmo Mobile', 'DJI OM 6', 'Osmo Mobile 7', 'Osmo Mobile 8P']) {
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must remain unresolved/noncanonical rather than inferred into Wave 36`);
}

assert.ok(!exclusions.some((row) => row.model === 'Osmo Mobile'), 'original Osmo Mobile must never inherit the Wave 36 built-in-battery exclusion');

console.log('ManualFinder DJI Osmo Mobile built-in battery exclusion Wave 36 passed.');
