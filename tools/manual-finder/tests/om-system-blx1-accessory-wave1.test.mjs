import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
const root = new URL('../', import.meta.url);

for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  ...fs.readdirSync(root)
    .filter((name) => /^affiliate-dji-camera-accessories-wave\d+\.js$/.test(name))
    .sort((a, b) => Number(a.match(/wave(\d+)/)?.[1] || 0) - Number(b.match(/wave(\d+)/)?.[1] || 0)),
  'affiliate-om-system-camera-accessories-wave1.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE1_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
const models = ['OM-1', 'OM-1 Mark II', 'OM-3'];

assert.ok(config);
assert.equal(wave.length, 3);
assert.equal(config.cameraAccessories.length, merged.length);
assert.ok(merged.length >= 87, 'OM SYSTEM Wave 1 must retain the 84-row closed Nikon/DJI baseline and add three rows');
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'OM SYSTEM', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly the reviewed BLX-1 battery handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, 'OM SYSTEM BLX-1 Lithium Ion Rechargeable Battery');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=OM+SYSTEM+BLX-1+Lithium+Ion+Rechargeable+Battery&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, 'https://explore.omsystem.com/us/en/blx-1-lithium-ion-rechargeable-battery');
  assert.equal(offers[0].verifiedAt, '2026-09-19');
}

for (const args of [
  { maker: 'OM System', model: 'OM-1', category: 'カメラ・映像' },
  { maker: 'OM SYSTEM', model: 'OM-1', category: 'その他' },
  { maker: 'OM SYSTEM', model: 'OM-1 Mark III', category: 'カメラ・映像' },
  { maker: 'OM SYSTEM', model: 'OM-5', category: 'カメラ・映像' },
  { maker: 'Olympus', model: 'OM-1', category: 'カメラ・映像' },
  { maker: 'OM SYSTEM', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed OM SYSTEM Wave 1 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-om-system-camera-accessories-wave1.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE1_LEDGER'));

console.log('ManualFinder OM SYSTEM BLX-1 camera accessory Wave 1 passed.');
