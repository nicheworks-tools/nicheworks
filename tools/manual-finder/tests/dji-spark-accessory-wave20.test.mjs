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
  'affiliate-dji-camera-accessories-wave17.js',
  'affiliate-dji-camera-accessories-wave18.js',
  'affiliate-dji-camera-accessories-wave19.js',
  'affiliate-dji-camera-accessories-wave20.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE20_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'Wave 20 must contain exactly one reviewed canonical row');
assert.equal(merged.length, 48, 'Nikon 14 + DJI 34 should produce forty-eight camera detail rows');
assert.equal(config.cameraAccessories.length, 48);
assert.deepEqual(Array.from(wave, (row) => row.model), ['Spark']);

const productSource = 'https://www.dji.com/downloads/products/spark';
const batterySource = 'https://repair.dji.com/help/content?customId=01700009975&lang=en&paperDocType=ARTICLE&re=US&spaceId=17';
const batteryQuery = 'DJI Spark Intelligent Flight Battery';
const hubQuery = 'DJI Spark Battery Charging Hub';
const batteryUrl = 'https://www.amazon.co.jp/s?k=DJI+Spark+Intelligent+Flight+Battery&tag=nicheworks09-22';
const hubUrl = 'https://www.amazon.co.jp/s?k=DJI+Spark+Battery+Charging+Hub&tag=nicheworks09-22';

assert.equal(wave[0].maker, 'DJI');
assert.equal(wave[0].category, 'カメラ・映像');
assert.equal(wave[0].verifiedAt, '2026-09-18');
assert.equal(wave[0].sourceType, 'official_manufacturer_compatibility');
assert.equal(wave[0].sourceUrl, productSource);
assert.deepEqual(Array.from(wave[0].evidenceUrls), [productSource, batterySource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Spark', category: 'カメラ・映像' }));
assert.equal(offers.length, 2);
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
assert.deepEqual(offers.map((offer) => offer.url), [batteryUrl, hubUrl]);
assert.deepEqual(offers.map((offer) => offer.sourceUrl), [batterySource, productSource]);
assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-18'));

for (const args of [
  { maker: 'dji', model: 'Spark', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Spark', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Spark', category: 'その他' },
  { maker: 'DJI', model: 'DJI Spark', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Spark 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 20 mapping must fail closed: ${JSON.stringify(args)}`);
}

for (const model of ['Inspire 1', 'Inspire 1 Pro/Raw', 'Inspire 2', 'DJI Inspire 3']) {
  const priorOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(priorOffers.length, 2, `${model} must retain its prior reviewed handoffs`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave20.js'), 'runtime must load DJI camera accessory Wave 20 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE20_LEDGER'), 'runtime must wait for the DJI Wave 20 ledger');

console.log('ManualFinder DJI Spark camera accessory Wave 20 passed.');
