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
  ...fs.readdirSync(root).filter((name) => /^affiliate-dji-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0)),
  ...fs.readdirSync(root).filter((name) => /^affiliate-om-system-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>Number(a.match(/wave(\d+)/)?.[1]||0)-Number(b.match(/wave(\d+)/)?.[1]||0))
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const waveRows = context.window.MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE5_LEDGER;
const models = ["E-M1","E-M5","E-M5 Mark II","E-P5","PEN-F"];
assert.ok(config);
assert.equal(waveRows.length, models.length);
assert.deepEqual(Array.from(waveRows, row => row.model).sort(), [...models].sort());

for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'OM SYSTEM', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly one reviewed BLN-1 battery handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, 'OM SYSTEM BLN-1 Lithium Ion Rechargeable Battery');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=OM+SYSTEM+BLN-1+Lithium+Ion+Rechargeable+Battery&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, 'https://support.jp.omsystem.com/en/support/imsg/digicamera/compati/pen_power.html');
  assert.equal(offers[0].verifiedAt, '2026-09-19');
}

for (const args of [{"maker":"OM SYSTEM","model":"E-M1 Mark II","category":"カメラ・映像"},{"maker":"OM SYSTEM","model":"E-M5 Mark III","category":"カメラ・映像"},{"maker":"Olympus","model":"E-M1","category":"カメラ・映像"},{"maker":"OM SYSTEM","model":"E-M1","category":"その他"}]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed OM SYSTEM Wave 5 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-om-system-camera-accessories-wave5.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_OM_SYSTEM_CAMERA_ACCESSORY_WAVE5_LEDGER'));

console.log('ManualFinder OM SYSTEM BLN-1 camera accessory Wave 5 passed.');
