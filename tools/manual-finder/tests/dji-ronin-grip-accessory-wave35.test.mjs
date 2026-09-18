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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE35_LEDGER;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

assert.equal(wave.length, 2);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), ['DJI Ronin-SC', 'Ronin-S'].sort());

const cases = [
  ['DJI Ronin-SC', 'DJI Ronin-SC BG18 Grip', 'https://store.dji.com/product/ronin-sc-bg18-grip'],
  ['Ronin-S', 'DJI Ronin-S BG37 Grip', 'https://store.dji.com/product/ronin-s-bg37-grip']
];

for (const [model, query, sourceUrl] of cases) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly one reviewed grip handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, query);
  assert.equal(offers[0].sourceUrl, sourceUrl);
  assert.equal(offers[0].verifiedAt, '2026-09-18');
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must be detail-mapped, not excluded`);
}

for (const args of [
  { maker: 'dji', model: 'DJI Ronin-SC', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin-SC', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Ronin-S', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Ronin 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Ronin M', category: 'カメラ・映像' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 35 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave35.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE35_LEDGER'));

console.log('ManualFinder DJI Ronin grip camera accessory Wave 35 passed.');
