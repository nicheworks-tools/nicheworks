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
const wave = context.window.MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE40_LEDGER;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

assert.equal(wave.length, 3);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), ['DJI RC', 'DJI RC Pro', 'Osmo Nano'].sort());

for (const model of ['DJI RC', 'DJI RC Pro']) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose the reviewed 65W charger handoff`);
  assert.equal(offers[0].kind, 'camera_charger_search');
  assert.equal(offers[0].query, 'DJI 65W Portable Charger');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=DJI+65W+Portable+Charger&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, 'https://store.dji.com/product/dji-65w-portable-charger');
  assert.equal(offers[0].verifiedAt, '2026-09-18');
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must be detail-mapped, not excluded`);
}

const nanoOffers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'Osmo Nano', category: 'カメラ・映像' }));
assert.equal(nanoOffers.length, 1);
assert.equal(nanoOffers[0].kind, 'camera_battery_search');
assert.equal(nanoOffers[0].query, 'DJI Osmo Nano Multifunctional Vision Dock');
assert.equal(nanoOffers[0].url, 'https://www.amazon.co.jp/s?k=DJI+Osmo+Nano+Multifunctional+Vision+Dock&tag=nicheworks09-22');
assert.equal(nanoOffers[0].sourceUrl, 'https://www.dji.com/support/product/nano');
assert.ok(!exclusions.some((row) => row.model === 'Osmo Nano'));

for (const args of [
  { maker: 'dji', model: 'DJI RC', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'RC', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI RC Pro 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'RC Pro', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Osmo Nano', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Osmo Nano', category: 'その他' },
  { maker: 'DJI', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 40 mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-dji-camera-accessories-wave40.js'));
assert.ok(runtimeSource.includes('MANUALFINDER_DJI_CAMERA_ACCESSORY_WAVE40_LEDGER'));

console.log('ManualFinder DJI RC / RC Pro / Osmo Nano Wave 40 passed.');
