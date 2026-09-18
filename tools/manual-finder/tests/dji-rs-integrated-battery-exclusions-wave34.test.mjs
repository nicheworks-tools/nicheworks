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

const expected = ['DJI RS 3 Mini', 'DJI RS 4 Mini', 'DJI RSC 2'];
const sourceUrl = 'https://repair.dji.com/help/content?customId=01700007783&lang=en&paperDocType=ARTICLE&re=US&spaceId=17';

assert.equal(exclusions.length, 6, 'Wave 34 must retain three Goggles exclusions and add three nonremovable RS/RSC exclusions');

for (const model of expected) {
  const row = exclusions.find((entry) => entry.model === model);
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.maker, 'DJI');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.reason, 'built_in_battery_no_model_specific_replaceable_power_accessory');
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-18');
  assert.deepEqual(Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' })), [], `${model} must remain detail-free`);
}

for (const model of ['DJI RS 2', 'DJI RS 3', 'DJI RS 3 Pro', 'DJI RS 4', 'DJI RS 4 Pro', 'DJI RS 5']) {
  assert.equal(Array.from(config.getAccessoryOffers({ maker: 'DJI', model, category: 'カメラ・映像' })).length, 1, `${model} must retain Wave 33 BG30 detail`);
}

for (const model of ['DJI Ronin-SC', 'Ronin-S', 'Ronin 2']) {
  assert.ok(!exclusions.some((row) => row.model === model), `${model} must remain unresolved rather than inferred into Wave 34`);
}

console.log('ManualFinder DJI RS/RSC nonremovable battery exclusion Wave 34 passed.');
