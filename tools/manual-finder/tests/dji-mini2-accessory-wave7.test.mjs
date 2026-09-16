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
  'affiliate-dji-camera-accessories-wave7.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE7_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 3, 'DJI Mini 2 Wave 7 must contain exactly three canonical reviewed rows');
assert.equal(merged.length, 34, 'Nikon 14 + DJI 20 should produce thirty-four camera detail rows');
assert.equal(config.cameraAccessories.length, 34);

const models = ['DJI Mini 2', 'DJI Mini 4K | DJI Mini 2 SE', 'DJI Mini SE'];
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

const batterySource = 'https://store.dji.com/product/mini-2-intelligent-flight-battery';
const hubSource = 'https://store.dji.com/product/mini-2-two-way-charging-hub';
const batteryQuery = 'DJI Mini 2 Intelligent Flight Battery';
const hubQuery = 'DJI Mini 2 Two-Way Charging Hub';

for (const row of wave) {
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.sourceUrl, batterySource);
  assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, hubSource]);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charging-hub handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Mini+2+Intelligent+Flight+Battery&tag=nicheworks09-22');
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Mini+2+Two-Way+Charging+Hub&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, batterySource);
  assert.equal(offers[1].sourceUrl, hubSource);
}

for (const args of [
  { maker: 'dji', model: 'DJI Mini 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Mini 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini SE', category: 'その他' },
  { maker: 'DJI', model: 'Mavic Mini', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini 4K', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini 2 SE', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed/non-canonical DJI Mini 2 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave7.js'), 'runtime must load DJI camera accessory Wave 7 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE7_LEDGER'), 'runtime must wait for the DJI Wave 7 ledger');

console.log('ManualFinder DJI Mini 2 camera accessory Wave 7 passed.');
