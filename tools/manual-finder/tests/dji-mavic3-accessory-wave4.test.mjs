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
  'affiliate-dji-camera-accessories-wave4.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE4_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 3, 'DJI Mavic 3 Wave 4 must contain exactly three reviewed consumer models');
assert.equal(merged.length, 26, 'Nikon 14 + DJI 12 should produce twenty-six camera detail rows');
assert.equal(config.cameraAccessories.length, 26);

const models = ['DJI Mavic 3', 'DJI Mavic 3 Classic', 'DJI Mavic 3 Pro'];
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

const batterySource = 'https://store.dji.com/product/dji-mavic-3-intelligent-flight-battery';
const hubSource = 'https://store.dji.com/product/dji-mavic-3-battery-charging-hub';
const batteryQuery = 'DJI Mavic 3 Series Intelligent Flight Battery';
const hubQuery = 'DJI Mavic 3 Series Battery Charging Hub';

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
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Mavic+3+Series+Intelligent+Flight+Battery&tag=nicheworks09-22');
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Mavic+3+Series+Battery+Charging+Hub&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, batterySource);
  assert.equal(offers[1].sourceUrl, hubSource);
}

for (const args of [
  { maker: 'dji', model: 'DJI Mavic 3', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Mavic 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mavic 3', category: 'その他' },
  { maker: 'DJI', model: 'DJI Mavic 3 Enterprise', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mavic 3M', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mavic 3 Cine', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI Mavic mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave4.js'), 'runtime must load DJI camera accessory Wave 4 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE4_LEDGER'), 'runtime must wait for the DJI Wave 4 ledger');

console.log('ManualFinder DJI Mavic 3 camera accessory Wave 4 passed.');
