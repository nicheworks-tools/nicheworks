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
  'affiliate-dji-camera-accessories-wave16.js',
  'affiliate-dji-camera-accessories-wave17.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE17_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'DJI Inspire 2 Wave 17 must contain exactly one reviewed canonical row');
assert.equal(merged.length, 45, 'Nikon 14 + DJI 31 should produce forty-five camera detail rows');
assert.equal(config.cameraAccessories.length, 45);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Inspire 2']);

const batterySource = 'https://store.dji.com/product/ronin-2-tb50-intelligent-battery?vid=37021';
const hubSource = 'https://store.dji.com/product/inspire-2-charging-hub';
const batteryQuery = 'DJI TB50 Intelligent Battery';
const hubQuery = 'DJI Inspire 2 Battery Charging Hub';
const batteryUrl = 'https://www.amazon.co.jp/s?k=DJI+TB50+Intelligent+Battery&tag=nicheworks09-22';
const hubUrl = 'https://www.amazon.co.jp/s?k=DJI+Inspire+2+Battery+Charging+Hub&tag=nicheworks09-22';

assert.equal(wave[0].maker, 'DJI');
assert.equal(wave[0].category, 'カメラ・映像');
assert.equal(wave[0].verifiedAt, '2026-09-17');
assert.equal(wave[0].sourceType, 'official_manufacturer_compatibility');
assert.equal(wave[0].sourceUrl, hubSource);
assert.deepEqual(Array.from(wave[0].evidenceUrls), [batterySource, hubSource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Inspire 2', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'Inspire 2 must expose one reviewed TB50 battery and one Inspire 2 charging-hub handoff');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
assert.deepEqual(offers.map((offer) => offer.url), [batteryUrl, hubUrl]);
assert.deepEqual(offers.map((offer) => offer.sourceUrl), [batterySource, hubSource]);
assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-17'));

for (const args of [
  { maker: 'dji', model: 'Inspire 2', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Inspire 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Inspire 2', category: 'その他' },
  { maker: 'DJI', model: 'DJI Inspire 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Inspire 1', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Inspire 1 Pro/Raw', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 17 mapping must fail closed: ${JSON.stringify(args)}`);
}

const priorOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Inspire 3', category: 'カメラ・映像' }));
assert.equal(priorOffers.length, 2, 'DJI Inspire 3 must retain its Wave 16 handoffs');
assert.ok(priorOffers.every((offer) => ![batterySource, hubSource].includes(offer.sourceUrl)), 'Wave 17 evidence must not replace Wave 16 evidence');

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave17.js'), 'runtime must load DJI camera accessory Wave 17 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE17_LEDGER'), 'runtime must wait for the DJI Wave 17 ledger');

console.log('ManualFinder DJI Inspire 2 camera accessory Wave 17 passed.');
