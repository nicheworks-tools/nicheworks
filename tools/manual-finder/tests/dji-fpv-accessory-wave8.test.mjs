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
  'affiliate-dji-camera-accessories-wave8.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE8_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'DJI FPV Wave 8 must contain exactly one reviewed model');
assert.equal(merged.length, 35, 'Nikon 14 + DJI 21 should produce thirty-five camera detail rows');
assert.equal(config.cameraAccessories.length, 35);

const row = wave[0];
const batterySource = 'https://store.dji.com/sg/product/dji-fpv-intelligent-flight-battery?vid=101902';
const adapterSource = 'https://store.dji.com/product/dji-fpv-ac-power-adapter?vid=101991';
assert.equal(row.maker, 'DJI');
assert.equal(row.model, 'DJI FPV');
assert.equal(row.category, 'カメラ・映像');
assert.equal(row.verifiedAt, '2026-09-16');
assert.equal(row.sourceType, 'official_manufacturer_compatibility');
assert.equal(row.sourceUrl, batterySource);
assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, adapterSource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI FPV', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'DJI FPV must expose exactly one reviewed battery and one charger/power-adapter handoff');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), ['DJI FPV Intelligent Flight Battery', 'DJI FPV AC Power Adapter']);
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+FPV+Intelligent+Flight+Battery&tag=nicheworks09-22');
assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+FPV+AC+Power+Adapter&tag=nicheworks09-22');
assert.equal(offers[0].sourceUrl, batterySource);
assert.equal(offers[1].sourceUrl, adapterSource);

for (const args of [
  { maker: 'dji', model: 'DJI FPV', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI FPV', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI FPV', category: 'その他' },
  { maker: 'DJI', model: 'DJI Digital FPV System', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Avata', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI FPV 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI FPV mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave8.js'), 'runtime must load DJI camera accessory Wave 8 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE8_LEDGER'), 'runtime must wait for the DJI Wave 8 ledger');

console.log('ManualFinder DJI FPV camera accessory Wave 8 passed.');
