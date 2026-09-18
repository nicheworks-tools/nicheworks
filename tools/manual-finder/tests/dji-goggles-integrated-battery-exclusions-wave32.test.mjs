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
  ['DJI Goggles 3', 'https://www.dji.com/support/product/goggles-3'],
  ['DJI Goggles Integra', 'https://www.dji.com/support/product/goggles-integra'],
  ['DJI Goggles N3', 'https://www.dji.com/support/product/goggles-n3']
];

assert.ok(exclusions.length >= 3, 'Wave 32 must retain its three reviewed built-in-battery exclusions');
assert.deepEqual(
  exclusions.filter((row) => expected.some(([model]) => model === row.model)).map((row) => row.model).sort(),
  expected.map(([model]) => model).sort()
);

for (const [model, sourceUrl] of expected) {
  const row = exclusions.find((entry) => entry.model === model);
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.reason, 'built_in_battery_no_model_specific_replaceable_power_accessory');
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-18');

  const offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' }));
  assert.deepEqual(offers, [], `${model} must remain detail-free after reviewed exclusion`);
}

for (const args of [
  { maker: 'DJI', model: 'DJI Goggles 2', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Goggles', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'DJI Goggles RE', category: 'カメラ・映像' },
  { maker: 'DJI', model: 'Goggles 3', category: 'カメラ・映像' }
]) {
  const key = `${args.maker}|${args.model}|${args.category}`.toLowerCase();
  assert.ok(!exclusions.some((row) => `${row.maker}|${row.model}|${row.category}`.toLowerCase() === key), `unreviewed exclusion must remain absent: ${JSON.stringify(args)}`);
}

const goggles2Offers = Array.from(config.getAccessoryOffers({ maker: 'DJI', model: 'DJI Goggles 2', category: 'カメラ・映像' }));
assert.equal(goggles2Offers.length, 1, 'DJI Goggles 2 must retain its Wave 31 battery handoff');

console.log('ManualFinder DJI integrated-battery goggles exclusion Wave 32 passed.');
