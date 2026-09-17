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
  'affiliate-dji-camera-accessories-wave14.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE14_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 1, 'DJI Mavic Pro Platinum Wave 14 must contain exactly one reviewed model');
assert.equal(merged.length, 41, 'Nikon 14 + DJI 27 should produce forty-one camera detail rows');
assert.equal(config.cameraAccessories.length, 41);

const batterySource = 'https://www.dji.com/support/product/mavic-pro-platinum';
const hubSource = 'https://repair.dji.com/help/content?customId=01700010412&lang=en&paperDocType=ARTICLE&re=US&spaceId=17';
const row = wave[0];
assert.equal(row.maker, 'DJI');
assert.equal(row.model, 'Mavic Pro Platinum');
assert.equal(row.category, 'カメラ・映像');
assert.equal(row.verifiedAt, '2026-09-17');
assert.equal(row.sourceType, 'official_manufacturer_compatibility');
assert.equal(row.sourceUrl, hubSource);
assert.deepEqual(Array.from(row.evidenceUrls), [batterySource, hubSource]);

const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Mavic Pro Platinum', category: 'カメラ・映像' }));
assert.equal(offers.length, 2, 'Mavic Pro Platinum must expose exactly one reviewed battery and one charging-hub handoff');
assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(offers.map((offer) => offer.query), ['Mavic Pro Platinum Intelligent Flight Battery', 'Mavic Pro Battery Charging Hub']);
assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=Mavic+Pro+Platinum+Intelligent+Flight+Battery&tag=nicheworks09-22');
assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=Mavic+Pro+Battery+Charging+Hub&tag=nicheworks09-22');
assert.equal(offers[0].sourceUrl, batterySource);
assert.equal(offers[1].sourceUrl, hubSource);

for (const args of [
  { maker: 'dji', model: 'Mavic Pro Platinum', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Mavic Pro Platinum', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic Pro Platinum', category: 'その他' },
  { maker: 'DJI', model: 'Mavic Pro', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Mavic 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  const actual = Array.from(config.getAccessoryOffers(args));
  if (args.model === 'Mavic Pro' || args.model === 'Mavic 2') {
    assert.equal(actual.length, 2, `${args.model} must retain its separately reviewed existing handoffs`);
    assert.ok(actual.every((offer) => offer.sourceUrl !== batterySource), 'Wave 14 battery evidence must not replace an existing Mavic-family contract');
  } else {
    assert.deepEqual(actual, [], `unreviewed Mavic Pro Platinum mapping must fail closed: ${JSON.stringify(args)}`);
  }
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave14.js'), 'runtime must load DJI camera accessory Wave 14 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE14_LEDGER'), 'runtime must wait for the DJI Wave 14 ledger');

console.log('ManualFinder DJI Mavic Pro Platinum camera accessory Wave 14 passed.');
