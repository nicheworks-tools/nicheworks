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
  'affiliate-dji-camera-accessories-wave10.js',
  'affiliate-dji-camera-accessories-wave11.js',
  'affiliate-dji-camera-accessories-wave12.js',
  'affiliate-dji-camera-accessories-wave13.js',
  'affiliate-dji-camera-accessories-wave14.js',
  'affiliate-dji-camera-accessories-wave15.js',
  'affiliate-dji-camera-accessories-wave16.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE16_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'DJI Inspire 3 Wave 16 must contain exactly one reviewed canonical row');
assert.equal(merged.length, 44, 'Nikon 14 + DJI 30 should produce forty-four camera detail rows');
assert.equal(config.cameraAccessories.length, 44);
assert.deepEqual(Array.from(wave, (row) => row.model), ['DJI Inspire 3']);

const batterySource = 'https://www.dji.com/inspire-3/specs';
const hubSource = 'https://store.dji.com/product/dji-tb51-intelligent-battery-charging-hub?vid=136731';
const batteryQuery = 'DJI TB51 Intelligent Battery';
const hubQuery = 'DJI TB51 Intelligent Battery Charging Hub';
const batteryUrl = 'https://www.amazon.co.jp/s?k=DJI+TB51+Intelligent+Battery&tag=nicheworks09-22';
const hubUrl = 'https://www.amazon.co.jp/s?k=DJI+TB51+Intelligent+Battery+Charging+Hub&tag=nicheworks09-22';

assert.equal(wave[0].maker, 'DJI');
assert.equal(wave[0].category, 'カメラ・映像');
assert.equal(wave[0].verifiedAt, '2026-09-17');
assert.equal(wave[0].sourceType, 'official_manufacturer_compatibility');
assert.equal(wave[0].sourceUrl, hubSource);
assert.deepEqual(Array.from(wave[0].evidenceUrls), [batterySource, hubSource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Inspire 3', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'DJI Inspire 3 must expose one reviewed TB51 battery and one TB51 charging-hub handoff');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
assert.deepEqual(offers.map((offer) => offer.url), [batteryUrl, hubUrl]);
assert.deepEqual(offers.map((offer) => offer.sourceUrl), [batterySource, hubSource]);
assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-17'));

for (const args of [
  { maker: 'dji', model: 'DJI Inspire 3', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Inspire 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Inspire 3', category: 'その他' },
  { maker: 'DJI', model: 'Inspire 3', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Inspire 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Inspire 1', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 16 mapping must fail closed: ${JSON.stringify(args)}`);
}

for (const model of ['DJI Mavic 3 Enterprise', 'DJI Mavic 3M']) {
  const priorOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(priorOffers.length, 2, `${model} must retain its Wave 15 handoffs`);
  assert.ok(priorOffers.every((offer) => ![batterySource, hubSource].includes(offer.sourceUrl)), 'Wave 16 evidence must not replace Wave 15 evidence');
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave16.js'), 'runtime must load DJI camera accessory Wave 16 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE16_LEDGER'), 'runtime must wait for the DJI Wave 16 ledger');

console.log('ManualFinder DJI Inspire 3 camera accessory Wave 16 passed.');
