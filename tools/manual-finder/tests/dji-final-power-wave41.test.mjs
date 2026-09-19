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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE41_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 84, 'Wave 41 baseline must retain Nikon 14 + DJI 70 reviewed camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Osmo Nano']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Nano', category: 'カメラ・映像' }));
assert.equal(offers.length, 1, 'Osmo Nano must expose the reviewed Multifunctional Vision Dock handoff');
assert.equal(offers[0].kind, 'camera_charger_search');
assert.equal(offers[0].query, 'DJI Osmo Nano Multifunctional Vision Dock');
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Nano+Multifunctional+Vision+Dock&tag=nicheworks09-22');
assert.equal(offers[0].sourceUrl, 'https://www.dji.com/support/product/nano');
assert.equal(offers[0].verifiedAt, '2026-09-19');

const expectedExclusions = new Map([
  ['DJI Digital FPV System', ['multi_component_system_no_single_model_specific_power_handoff', 'https://www.dji.com/support/product/fpv']],
  ['DJI Goggles', ['built_in_battery_no_model_specific_replaceable_power_accessory', 'https://www.dji.com/support/product/dji-goggles']],
  ['DJI Goggles RE', ['built_in_battery_no_model_specific_replaceable_power_accessory', 'https://www.dji.com/support/product/dji-goggles-re']],
  ['DJI O3 Air Unit', ['externally_powered_component_no_model_specific_battery_or_charger', 'https://www.dji.com/support/product/o3-air-unit']],
  ['DJI O4 Air Unit Series', ['externally_powered_component_no_model_specific_battery_or_charger', 'https://www.dji.com/support/product/o4-air-unit']]
]);

assert.ok(exclusions.length >= 26, 'Wave 41 baseline must retain the 26 DJI exclusions established through Wave 41');
for (const [model, [reason, sourceUrl]] of expectedExclusions) {
  const row = exclusions.find((entry) => entry.maker === 'DJI' && entry.model === model && entry.category === 'カメラ・映像');
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.reason, reason);
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-19');
  assert.deepEqual(Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' })), [], `${model} must remain detail-free`);
}

for (const args of [
  { maker: 'dji', model: 'Osmo Nano', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Osmo Nano', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Nano', category: 'その他' },
  { maker: 'DJI', model: 'Osmo Nano Vision Dock', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 41 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave41.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE41_LEDGER'));

console.log('ManualFinder DJI final power review Wave 41 passed.');
