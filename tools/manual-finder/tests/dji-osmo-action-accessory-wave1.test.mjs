import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave1.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE1_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 4, 'DJI Osmo Action Wave 1 must contain exactly four reviewed models');
assert.equal(merged.length, 18, 'Nikon 14 + DJI 4 should produce eighteen camera detail rows');
assert.equal(config.cameraAccessories.length, 18);

const models = ['Osmo Action 3', 'Osmo Action 4', 'Osmo Action 5 Pro', 'Osmo Action 6'];
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

const batterySource = 'https://store.dji.com/product/osmo-action-extreme-battery-plus';
const chargerSource = 'https://store.dji.com/product/osmo-action-multifunctional-battery-case-2';
const batteryQuery = 'DJI Osmo Action Extreme Battery Plus';
const chargerQuery = 'DJI Osmo Action Multifunctional Battery Case 2';

for (const row of wave) {
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.sourceUrl, batterySource);
  assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, chargerSource]);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charger handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, chargerQuery]);
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Action+Extreme+Battery+Plus&tag=nicheworks09-22');
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Action+Multifunctional+Battery+Case+2&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, batterySource);
  assert.equal(offers[1].sourceUrl, chargerSource);
}

for (const args of [
  { maker: 'dji', model: 'Osmo Action 3', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Osmo Action 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Action 3', category: 'その他' },
  { maker: 'DJI', model: 'Osmo Action', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Action 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Action 7', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI accessory mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave1.js'), 'runtime must load DJI camera accessory Wave 1 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE1_LEDGER'), 'runtime must wait for the DJI Wave 1 ledger');

console.log('ManualFinder DJI Osmo Action camera accessory Wave 1 passed.');
