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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE21_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
const models = ['Phantom 4', 'Phantom 4 Advanced', 'Phantom 4 Pro', 'Phantom 4 Pro V2.0', 'Phantom 4 RTK'];

assert.ok(config);
assert.equal(wave.length, 5);
assert.ok(merged.length >= 53, 'Wave 21 baseline must retain at least Nikon 14 + DJI 39 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), models);

const batteryQuery = 'DJI Phantom 4 Series Intelligent Flight Battery';
const hubQuery = 'DJI Phantom 4 Battery Charging Hub';
const batteryUrl = 'https://www.amazon.co.jp/s?k=DJI+Phantom+4+Series+Intelligent+Flight+Battery&tag=nicheworks09-22';
const hubUrl = 'https://www.amazon.co.jp/s?k=DJI+Phantom+4+Battery+Charging+Hub&tag=nicheworks09-22';

for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${model} must expose reviewed battery and charging-hub handoffs`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
  assert.deepEqual(offers.map((offer) => offer.url), [batteryUrl, hubUrl]);
  assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-18'));
}

for (const args of [
  { maker: 'dji', model: 'Phantom 4', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Phantom 4', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Phantom 4', category: 'その他' },
  { maker: 'DJI', model: 'DJI Phantom 4', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Phantom 4 Pro+', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 21 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave21.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE21_LEDGER'));

console.log('ManualFinder DJI Phantom 4 camera accessory Wave 21 passed.');
