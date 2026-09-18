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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE29_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 63, 'Wave 29 baseline must retain at least Nikon 14 + DJI 49 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Osmo Pocket']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Pocket', category: 'カメラ・映像' }));
assert.equal(offers.length, 1, 'Osmo Pocket must expose the reviewed Charging Case handoff');
assert.equal(offers[0].kind, 'camera_charger_search');
assert.equal(offers[0].query, 'DJI Osmo Pocket Charging Case');
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Pocket+Charging+Case&tag=nicheworks09-22');
assert.equal(offers[0].verifiedAt, '2026-09-18');
assert.equal(offers[0].sourceUrl, 'https://store.dji.com/product/osmo-pocket-charging-case');

for (const args of [
  { maker: 'dji', model: 'Osmo Pocket', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Osmo Pocket', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Pocket', category: 'その他' },
  { maker: 'DJI', model: 'DJI Osmo Pocket', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Pocket Charging Case', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 29 mapping must fail closed: ${JSON.stringify(args)}`);
}

const pocket2ComboOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Pocket 2 Creator Combo', category: 'カメラ・映像' }));
assert.deepEqual(pocket2ComboOffers, [], 'DJI Pocket 2 Creator Combo must not inherit the Osmo Pocket Charging Case mapping');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave29.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE29_LEDGER'));

console.log('ManualFinder DJI Osmo Pocket camera accessory Wave 29 passed.');
