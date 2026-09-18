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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE27_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 61, 'Wave 27 baseline must retain at least Nikon 14 + DJI 47 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['DJI Action 2']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Action 2', category: 'カメラ・映像' }));
assert.equal(offers.length, 1, 'DJI Action 2 must expose the reviewed Power Module handoff');
assert.equal(offers[0].kind, 'camera_battery_search');
assert.equal(offers[0].query, 'DJI Action 2 Power Module');
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Action+2+Power+Module&tag=nicheworks09-22');
assert.equal(offers[0].verifiedAt, '2026-09-18');
assert.equal(offers[0].sourceUrl, 'https://store.dji.com/ro/product/dji-action-2-power-module?vid=109071');

for (const args of [
  { maker: 'dji', model: 'DJI Action 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Action 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Action 2', category: 'その他' },
  { maker: 'DJI', model: 'Action 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Action 2 Power Combo', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 27 mapping must fail closed: ${JSON.stringify(args)}`);
}

const osmoActionOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Action', category: 'カメラ・映像' }));
assert.deepEqual(osmoActionOffers, [], 'Osmo Action must not inherit the DJI Action 2 Power Module mapping');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave27.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE27_LEDGER'));

console.log('ManualFinder DJI Action 2 camera accessory Wave 27 passed.');
