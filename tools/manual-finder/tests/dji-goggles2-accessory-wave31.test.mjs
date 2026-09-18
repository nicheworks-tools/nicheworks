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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE31_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 65, 'Wave 31 baseline must retain at least Nikon 14 + DJI 51 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['DJI Goggles 2']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Goggles 2', category: 'カメラ・映像' }));
assert.equal(offers.length, 1, 'DJI Goggles 2 must expose the reviewed battery handoff');
assert.equal(offers[0].kind, 'camera_battery_search');
assert.equal(offers[0].query, 'DJI Goggles 2 Battery');
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Goggles+2+Battery&tag=nicheworks09-22');
assert.equal(offers[0].verifiedAt, '2026-09-18');
assert.equal(offers[0].sourceUrl, 'https://store.dji.com/hr/product/dji-goggels-2-battery?vid=119061');

for (const args of [
  { maker: 'dji', model: 'DJI Goggles 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Goggles 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Goggles 2', category: 'その他' },
  { maker: 'DJI', model: 'Goggles 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Goggles Integra', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Goggles 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 31 mapping must fail closed: ${JSON.stringify(args)}`);
}

const avataOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Avata', category: 'カメラ・映像' }));
assert.equal(avataOffers.length, 2, 'DJI Avata must retain its Wave 9 battery and charging-hub handoffs');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave31.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE31_LEDGER'));

console.log('ManualFinder DJI Goggles 2 camera accessory Wave 31 passed.');
