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
  'affiliate-dji-camera-accessories-wave2.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE2_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 2, 'DJI Air Wave 2 must contain exactly two reviewed models');
assert.equal(merged.length, 20, 'Nikon 14 + DJI Osmo Action 4 + DJI Air 2 should produce twenty camera detail rows');
assert.equal(config.cameraAccessories.length, 20);

const models = ['DJI Air 3', 'DJI Air 3S'];
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

const batterySource = 'https://store.dji.com/product/dji-air-3-intelligent-flight-battery?vid=143391';
const chargerSource = 'https://www.dji.com/support/product/air-3s';
const batteryQuery = 'DJI Air 3 Intelligent Flight Battery';
const chargerQuery = 'DJI Air 3 Series Battery Charging Hub';

for (const row of wave) {
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.sourceUrl, batterySource);
  assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, chargerSource]);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charging-hub handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, chargerQuery]);
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Air+3+Intelligent+Flight+Battery&tag=nicheworks09-22');
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Air+3+Series+Battery+Charging+Hub&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, batterySource);
  assert.equal(offers[1].sourceUrl, chargerSource);
}

for (const args of [
  { maker: 'dji', model: 'DJI Air 3', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Air 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Air 3', category: 'その他' },
  { maker: 'DJI', model: 'DJI Air 2S', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic Air 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Air 4', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI Air accessory mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave2.js'), 'runtime must load DJI camera accessory Wave 2 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE2_LEDGER'), 'runtime must wait for the DJI Wave 2 ledger');

console.log('ManualFinder DJI Air camera accessory Wave 2 passed.');
