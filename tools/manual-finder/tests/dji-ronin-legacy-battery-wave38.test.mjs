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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE38_LEDGER;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

assert.equal(wave.length, 4);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), ['Ronin', 'Ronin 2', 'Ronin-M', 'Ronin-MX'].sort());

const cases = [
  ['Ronin 2', 'DJI TB50 Intelligent Battery'],
  ['Ronin-M', 'DJI Ronin-M Battery 1580mAh'],
  ['Ronin-MX', 'DJI Ronin-M Battery 1580mAh'],
  ['Ronin', 'DJI Ronin Battery 3400mAh']
];

for (const [model, query] of cases) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly one reviewed battery handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, query);
  assert.equal(offers[0].verifiedAt, '2026-09-18');
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must be detail-mapped, not excluded`);
}

for (const args of [
  { maker: 'dji', model: 'Ronin 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Ronin 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin M', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin MX', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin-S', category: 'その他' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 38 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave38.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE38_LEDGER'));

console.log('ManualFinder DJI legacy Ronin battery Wave 38 passed.');
