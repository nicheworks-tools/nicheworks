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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE23_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 57, 'Wave 23 baseline must retain at least Nikon 14 + DJI 43 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Phantom 3 SE']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Phantom 3 SE', category: 'カメラ・映像' }));
assert.equal(offers.length, 1, 'Phantom 3 SE must expose only the reviewed battery handoff');
assert.equal(offers[0].kind, 'camera_battery_search');
assert.equal(offers[0].query, 'DJI Phantom 3 Intelligent Flight Battery');
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Phantom+3+Intelligent+Flight+Battery&tag=nicheworks09-22');
assert.equal(offers[0].verifiedAt, '2026-09-18');
assert.equal(offers[0].sourceUrl, 'https://repair.dji.com/help/content?customId=01700006548&lang=en&spaceId=17');
assert.ok(!offers.some((offer) => offer.kind === 'camera_charger_search'), 'Wave 23 must not infer Phantom 3 Charging Hub compatibility to Phantom 3 SE');

for (const args of [
  { maker: 'dji', model: 'Phantom 3 SE', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Phantom 3 SE', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Phantom 3 SE', category: 'その他' },
  { maker: 'DJI', model: 'DJI Phantom 3 SE', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Phantom 3 4K Pro', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 23 mapping must fail closed: ${JSON.stringify(args)}`);
}

const priorOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Phantom 3 Standard', category: 'カメラ・映像' }));
assert.equal(priorOffers.length, 2, 'Phantom 3 Standard must retain its Wave 22 battery and hub handoffs');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave23.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE23_LEDGER'));

console.log('ManualFinder DJI Phantom 3 SE camera accessory Wave 23 passed.');
