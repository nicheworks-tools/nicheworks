import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave1.js',
  'affiliate-dji-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave3.js',
  'affiliate-dji-camera-accessories-wave4.js',
  'affiliate-dji-camera-accessories-wave5.js',
  'affiliate-dji-camera-accessories-wave6.js',
  'affiliate-dji-camera-accessories-wave7.js',
  'affiliate-dji-camera-accessories-wave8.js',
  'affiliate-dji-camera-accessories-wave9.js',
  'affiliate-dji-camera-accessories-wave10.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE10_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'DJI Mavic 2 Wave 10 must contain exactly one reviewed canonical model');
assert.equal(merged.length, 37, 'Nikon 14 + DJI 23 should produce thirty-seven camera detail rows');
assert.equal(config.cameraAccessories.length, 37);

const batterySource = 'https://store.dji.com/product/mavic-2-intelligent-flight-battery';
const supportSource = 'https://www.dji.com/support/product/mavic-2';
const row = wave[0];
assert.equal(row.maker, 'DJI');
assert.equal(row.model, 'Mavic 2');
assert.equal(row.category, 'カメラ・映像');
assert.equal(row.verifiedAt, '2026-09-17');
assert.equal(row.sourceType, 'official_manufacturer_compatibility');
assert.equal(row.sourceUrl, supportSource);
assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, supportSource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Mavic 2', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'Mavic 2 must expose exactly one reviewed battery and one charging-hub handoff');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), ['Mavic 2 Intelligent Flight Battery', 'Mavic 2 Battery Charging Hub']);
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=Mavic+2+Intelligent+Flight+Battery&tag=nicheworks09-22');
assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=Mavic+2+Battery+Charging+Hub&tag=nicheworks09-22');
assert.equal(offers[0].sourceUrl, batterySource);
assert.equal(offers[1].sourceUrl, supportSource);

for (const args of [
  { maker: 'dji', model: 'Mavic 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Mavic 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2', category: 'その他' },
  { maker: 'DJI', model: 'Mavic 2 Enterprise Advanced', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2 Enterprise Series', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2 Pro', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2 Zoom', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Mavic 2 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave10.js'), 'runtime must load DJI camera accessory Wave 10 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE10_LEDGER'), 'runtime must wait for the DJI Wave 10 ledger');

console.log('ManualFinder DJI Mavic 2 camera accessory Wave 10 passed.');
