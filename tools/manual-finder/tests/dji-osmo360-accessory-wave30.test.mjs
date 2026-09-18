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
    .sort((a, b) => Number(a.match(/wave(\d+)/)?.[1] || 0) - Number(b.match(/wave(\d+)/)?.[1] || 0))
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE30_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 64, 'Wave 30 baseline must retain at least Nikon 14 + DJI 50 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Osmo 360']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo 360', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'Osmo 360 must expose the reviewed battery and multifunctional case handoffs');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), [
  'DJI Osmo Action Extreme Battery Plus',
  'DJI Osmo Action Multifunctional Battery Case 2'
]);
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Action+Extreme+Battery+Plus&tag=nicheworks09-22');
assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Action+Multifunctional+Battery+Case+2&tag=nicheworks09-22');
assert.equal(offers[0].verifiedAt, '2026-09-18');
assert.equal(offers[1].verifiedAt, '2026-09-18');
assert.equal(offers[0].sourceUrl, 'https://store.dji.com/product/osmo-action-extreme-battery-plus');
assert.equal(offers[1].sourceUrl, 'https://store.dji.com/product/osmo-action-multifunctional-battery-case-2');

for (const args of [
  { maker: 'dji', model: 'Osmo 360', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Osmo 360', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo 360', category: 'その他' },
  { maker: 'DJI', model: 'DJI Osmo 360', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo 360 II', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo 360 Adventure Combo', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 30 mapping must fail closed: ${JSON.stringify(args)}`);
}

const action6Offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Action 6', category: 'カメラ・映像' }));
assert.equal(action6Offers.length, 2, 'Osmo Action 6 must retain its Wave 1 battery and case handoffs');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave30.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE30_LEDGER'));

console.log('ManualFinder DJI Osmo 360 camera accessory Wave 30 passed.');
