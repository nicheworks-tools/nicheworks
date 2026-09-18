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
  'affiliate-camera-detail-exclusions.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE39_LEDGER;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

assert.equal(wave.length, 2);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), ['DJI Ronin 4D', 'Osmo Action'].sort());

const roninOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Ronin 4D', category: 'カメラ・映像' }));
assert.equal(roninOffers.length, 2);
assert.deepEqual(roninOffers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(roninOffers.map((offer) => offer.query), [
  'DJI TB50 Intelligent Battery',
  'DJI Inspire 2 Ronin 2 Battery Charging Hub'
]);
assert.ok(roninOffers.every((offer) => offer.url.includes('tag=nicheworks09-22')));

const actionOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Action', category: 'カメラ・映像' }));
assert.equal(actionOffers.length, 2);
assert.deepEqual(actionOffers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
assert.deepEqual(actionOffers.map((offer) => offer.query), [
  'DJI Osmo Action Battery 1300mAh',
  'DJI Osmo Action Charging Hub'
]);
assert.ok(actionOffers.every((offer) => offer.url.includes('tag=nicheworks09-22')));

for (const model of ['DJI Ronin 4D', 'Osmo Action']) {
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must be detail-mapped, not excluded`);
}

for (const args of [
  { maker: 'dji', model: 'DJI Ronin 4D', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin 4D', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Ronin 4D-8K', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Osmo Action', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Action 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 39 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave39.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE39_LEDGER'));

console.log('ManualFinder DJI Ronin 4D / Osmo Action Wave 39 passed.');
