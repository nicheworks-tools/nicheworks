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
  'affiliate-dji-camera-accessories-wave3.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE3_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 3, 'DJI Mini Wave 3 must contain exactly three reviewed models');
assert.equal(merged.length, 23, 'Nikon 14 + DJI Waves 1-3 (9) should produce twenty-three camera detail rows');
assert.equal(config.cameraAccessories.length, 23);

const models = ['DJI Mini 3', 'DJI Mini 3 Pro', 'DJI Mini 4 Pro'];
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

const mini3BatterySource = 'https://store.dji.com/product/dji-mini-3-pro-intelligent-flight-battery';
const mini4BatterySource = 'https://store.dji.com/product/dji-mini-4-pro-intelligent-flight-battery?vid=148701';
const hubSource = 'https://store.dji.com/product/dji-mini-3-pro-two-way-charging-hub';
const hubQuery = 'DJI Mini 4 Pro Mini 3 Series Two-Way Charging Hub';

for (const row of wave) {
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');

  const isMini4 = row.model === 'DJI Mini 4 Pro';
  const batterySource = isMini4 ? mini4BatterySource : mini3BatterySource;
  const batteryQuery = isMini4
    ? 'DJI Mini 4 Pro Intelligent Flight Battery'
    : 'DJI Mini 3 Series Intelligent Flight Battery';

  assert.equal(row.sourceUrl, batterySource);
  assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, hubSource]);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charging-hub handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
  assert.equal(offers[0].url, `https://www.amazon.co.jp/s?k=${batteryQuery.replace(/ /g, '+')}&tag=nicheworks09-22`);
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Mini+4+Pro+Mini+3+Series+Two-Way+Charging+Hub&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, batterySource);
  assert.equal(offers[1].sourceUrl, hubSource);
}

for (const args of [
  { maker: 'dji', model: 'DJI Mini 3', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Mini 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini 3', category: 'その他' },
  { maker: 'DJI', model: 'DJI Mini 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini SE', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic Mini', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mini 5 Pro', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI Mini accessory mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave3.js'), 'runtime must load DJI camera accessory Wave 3 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE3_LEDGER'), 'runtime must wait for the DJI Wave 3 ledger');

console.log('ManualFinder DJI Mini camera accessory Wave 3 passed.');
