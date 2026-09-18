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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE33_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

const models = [
  'DJI RS 2',
  'DJI RS 3',
  'DJI RS 3 Pro',
  'DJI RS 4',
  'DJI RS 4 Pro',
  'DJI RS 5'
];

assert.ok(config);
assert.equal(wave.length, 6);
assert.ok(merged.length >= 71, 'Wave 33 baseline must retain at least Nikon 14 + DJI 57 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly the reviewed BG30 battery grip handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, 'DJI RS BG30 Battery Grip');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+RS+BG30+Battery+Grip&tag=nicheworks09-22');
  assert.equal(offers[0].verifiedAt, '2026-09-18');
  assert.equal(offers[0].sourceUrl, 'https://store.dji.com/product/ronin-bg30-grip');
}

for (const args of [
  { maker: 'dji', model: 'DJI RS 4', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI RS 4', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI RS 4', category: 'その他' },
  { maker: 'DJI', model: 'RS 4', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI RS 4 Mini', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI RS 3 Mini', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI RSC 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 33 mapping must fail closed: ${JSON.stringify(args)}`);
}

const goggles2Offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Goggles 2', category: 'カメラ・映像' }));
assert.equal(goggles2Offers.length, 1, 'DJI Goggles 2 must retain its Wave 31 battery handoff');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave33.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE33_LEDGER'));

console.log('ManualFinder DJI RS BG30 camera accessory Wave 33 passed.');
