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
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

const expected = [
  ['DJI RC', 'https://www.dji.com/support/product/rc'],
  ['DJI RC 2', 'https://www.dji.com/support/product/rc-2'],
  ['DJI RC Motion 2', 'https://www.dji.com/support/product/rc-motion-2'],
  ['DJI RC Motion 3', 'https://www.dji.com/support/product/rc-motion-3'],
  ['DJI RC Pro', 'https://www.dji.com/support/product/rc-pro'],
  ['DJI RC-N3 Remote Controller', 'https://store.dji.com/product/dji-rc-n3-remote-controller']
];

assert.ok(exclusions.length >= 21, 'Wave 40 baseline must retain the twenty-one exclusions established through Wave 40');

for (const [model, sourceUrl] of expected) {
  const row = exclusions.find((entry) => entry.model === model);
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.reason, 'rechargeable_controller_no_model_specific_replaceable_power_accessory');
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-19');
  assert.deepEqual(
    Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' })),
    [],
    `${model} must remain detail-free after reviewed exclusion`
  );
}

for (const model of [
  'DJI Digital FPV System',
  'DJI Goggles',
  'DJI Goggles RE',
  'DJI O3 Air Unit',
  'DJI O4 Air Unit Series',
  'Osmo Nano'
]) {
  assert.ok(!exclusions.some((row) => row.maker === 'DJI' && row.model === model && row.category === 'カメラ・映像'), `${model} must remain unresolved after Wave 40`);
}

const goggles2Offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Goggles 2', category: 'カメラ・映像' }));
assert.equal(goggles2Offers.length, 1, 'DJI Goggles 2 must retain its reviewed battery handoff');

console.log('ManualFinder DJI rechargeable controller exclusion Wave 40 passed.');
