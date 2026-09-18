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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE25_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;

assert.ok(config);
assert.equal(wave.length, 1);
assert.ok(merged.length >= 59, 'Wave 25 baseline must retain at least Nikon 14 + DJI 45 camera detail rows');
assert.equal(config.cameraAccessories.length, merged.length);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Mavic 2 Enterprise Series']);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Mavic 2 Enterprise Series', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'Mavic 2 Enterprise Series must expose reviewed battery and charging-hub handoffs');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), ['DJI Mavic 2 Enterprise Battery', 'Mavic 2 Battery Charging Hub']);
assert.deepEqual(offers.map((offer) => offer.url), [
  'https://www.amazon.co.jp/s?k=DJI+Mavic+2+Enterprise+Battery&tag=nicheworks09-22',
  'https://www.amazon.co.jp/s?k=Mavic+2+Battery+Charging+Hub&tag=nicheworks09-22'
]);
assert.equal(offers[0].sourceUrl, 'https://www.dji.com/downloads/products/mavic-2-enterprise');
assert.equal(offers[1].sourceUrl, 'https://repair.dji.com/help/content?customId=01700010412&lang=en&paperDocType=ARTICLE&re=US&spaceId=17');
assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-18'));

for (const args of [
  { maker: 'dji', model: 'Mavic 2 Enterprise Series', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Mavic 2 Enterprise Series', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2 Enterprise Series', category: 'その他' },
  { maker: 'DJI', model: 'DJI Mavic 2 Enterprise Series', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2 Enterprise', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 25 mapping must fail closed: ${JSON.stringify(args)}`);
}

const advancedOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Mavic 2 Enterprise Advanced', category: 'カメラ・映像' }));
assert.equal(advancedOffers.length, 1, 'Mavic 2 Enterprise Advanced must retain its Wave 24 battery-only handoff');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave25.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE25_LEDGER'));

console.log('ManualFinder DJI Mavic 2 Enterprise Series camera accessory Wave 25 passed.');
