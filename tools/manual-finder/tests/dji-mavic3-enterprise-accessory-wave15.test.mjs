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
  'affiliate-dji-camera-accessories-wave15.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE15_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave));
assert.ok(Array.isArray(merged));
assert.equal(wave.length, 2, 'DJI Mavic 3 Enterprise Wave 15 must contain exactly two reviewed canonical rows');
assert.equal(merged.length, 43, 'Nikon 14 + DJI 29 should produce forty-three camera detail rows');
assert.equal(config.cameraAccessories.length, 43);
assert.deepEqual(Array.from(wave, (row) => row.model), ['DJI Mavic 3 Enterprise', 'DJI Mavic 3M']);

const enterpriseBatterySource = 'https://enterprise.dji.com/mavic-3-enterprise/specs';
const enterpriseHubSource = 'https://www.dji.com/support/product/mavic-3-enterprise';
const mavic3mSource = 'https://www.dji.com/support/product/mavic-3-m';
const batteryQuery = 'DJI Mavic 3 Series Intelligent Flight Battery';
const hubQuery = 'DJI Mavic 3 Battery Charging Hub 100W';
const batteryUrl = 'https://www.amazon.co.jp/s?k=DJI+Mavic+3+Series+Intelligent+Flight+Battery&tag=nicheworks09-22';
const hubUrl = 'https://www.amazon.co.jp/s?k=DJI+Mavic+3+Battery+Charging+Hub+100W&tag=nicheworks09-22';

for (const row of wave) {
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-17');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
}
assert.equal(wave[0].sourceUrl, enterpriseHubSource);
assert.deepEqual(Array.from(wave[0].evidenceUrls), [enterpriseBatterySource, enterpriseHubSource]);
assert.equal(wave[1].sourceUrl, mavic3mSource);
assert.deepEqual(Array.from(wave[1].evidenceUrls), [mavic3mSource]);

for (const model of ['DJI Mavic 3 Enterprise', 'DJI Mavic 3M']) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${model} must expose one reviewed battery and one 100W charging-hub handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [batteryQuery, hubQuery]);
  assert.deepEqual(offers.map((offer) => offer.url), [batteryUrl, hubUrl]);
  assert.ok(offers.every((offer) => offer.verifiedAt === '2026-09-17'));
}

const enterpriseOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Mavic 3 Enterprise', category: 'カメラ・映像' }));
assert.deepEqual(enterpriseOffers.map((offer) => offer.sourceUrl), [enterpriseBatterySource, enterpriseHubSource]);
const mavic3mOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Mavic 3M', category: 'カメラ・映像' }));
assert.deepEqual(mavic3mOffers.map((offer) => offer.sourceUrl), [mavic3mSource, mavic3mSource]);

for (const args of [
  { maker: 'dji', model: 'DJI Mavic 3 Enterprise', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'DJI Mavic 3 Enterprise', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mavic 3 Enterprise', category: 'その他' },
  { maker: 'DJI', model: 'DJI Mavic 3T', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Mavic 3 Enterprise Series', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 15 mapping must fail closed: ${JSON.stringify(args)}`);
}

for (const model of ['DJI Mavic 3', 'DJI Mavic 3 Classic', 'DJI Mavic 3 Pro']) {
  const priorOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(priorOffers.length, 2, `${model} must retain its Wave 4 handoffs`);
  assert.ok(priorOffers.every((offer) => ![enterpriseBatterySource, enterpriseHubSource, mavic3mSource].includes(offer.sourceUrl)), 'Wave 15 evidence must not replace Wave 4 evidence');
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave15.js'), 'runtime must load DJI camera accessory Wave 15 before rendering');
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE15_LEDGER'), 'runtime must wait for the DJI Wave 15 ledger');

console.log('ManualFinder DJI Mavic 3 Enterprise camera accessory Wave 15 passed.');
