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
  'affiliate-dji-camera-accessories-wave6.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE6_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 3, 'DJI compact power Wave 6 must contain exactly three reviewed models');
assert.equal(merged.length, 31, 'Nikon 14 + DJI 17 should produce thirty-one camera detail rows');
assert.equal(config.cameraAccessories.length, 31);

const expected = new Map([
  ['DJI Avata 2', {
    batterySource: 'https://store.dji.com/product/dji-avata-2-intelligent-flight-battery',
    hubSource: 'https://store.dji.com/product/dji-avata-2-two-way-charging-hub',
    batteryQuery: 'DJI Avata 2 Intelligent Flight Battery',
    hubQuery: 'DJI Avata 2 Two-Way Charging Hub'
  }],
  ['DJI Flip', {
    batterySource: 'https://store.dji.com/product/dji-flip-intelligent-flight-battery?vid=180981',
    hubSource: 'https://store.dji.com/product/dji-flip-parallel-charging-hub?vid=181011',
    batteryQuery: 'DJI Flip Intelligent Flight Battery',
    hubQuery: 'DJI Flip Parallel Charging Hub'
  }],
  ['DJI Neo', {
    batterySource: 'https://store.dji.com/product/dji-neo-intelligent-flight-battery',
    hubSource: 'https://store.dji.com/pr/product/dji-neo-two-way-charging-hub?vid=169911',
    batteryQuery: 'DJI Neo Intelligent Flight Battery',
    hubQuery: 'DJI Neo Two-Way Charging Hub'
  }]
]);

assert.deepEqual(Array.from(wave, (row) => row.model).sort(), Array.from(expected.keys()).sort());

for (const row of wave) {
  const item = expected.get(row.model);
  assert.ok(item, `unexpected Wave 6 model: ${row.model}`);
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.sourceUrl, item.batterySource);
  assert.deepEqual(Array.from(row.evidenceUrls), [item.batterySource, item.hubSource]);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charging-hub handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [item.batteryQuery, item.hubQuery]);
  assert.equal(offers[0].sourceUrl, item.batterySource);
  assert.equal(offers[1].sourceUrl, item.hubSource);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[1].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.ok(offers[1].url.includes('tag=nicheworks09-22'));
}

for (const args of [
  { maker: 'dji', model: 'DJI Avata 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Flip', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Neo', category: 'その他' },
  { maker: 'DJI', model: 'DJI Avata', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Flip 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Neo 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed DJI Wave 6 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave6.js'), 'runtime must load DJI camera accessory Wave 6 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE6_LEDGER'), 'runtime must wait for the DJI Wave 6 ledger');

console.log('ManualFinder DJI compact power camera accessory Wave 6 passed.');
