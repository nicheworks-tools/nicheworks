import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
const root = new URL('../', import.meta.url);

function waveNumber(name) {
  return Number(name.match(/wave(\d+)\.js$/)?.[1] || 0);
}

for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  ...fs.readdirSync(root).filter((name) => /^affiliate-dji-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>waveNumber(a)-waveNumber(b)),
  ...fs.readdirSync(root).filter((name) => /^affiliate-om-system-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>waveNumber(a)-waveNumber(b)),
  ...fs.readdirSync(root).filter((name) => /^affiliate-gopro-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>waveNumber(a)-waveNumber(b))
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave = context.window.MANUALFINDER_GOPRO_CAMERA_ACCESSORY_WAVE1_LEDGER;
const models = ["HERO13 Black"];
const expectedUrlsByModel = {"HERO13 Black":"https://gopro.com/en/us/shop/mounts-accessories/enduro-battery/AEBAT-001.html"};

assert.ok(config);
assert.equal(wave.length, models.length);
assert.deepEqual(Array.from(wave, (row) => row.model).sort(), [...models].sort());

for (const model of models) {
  const offers = Array.from(config.getAccessoryOffers({ maker: 'GoPro', model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 1, `${model} must expose exactly one reviewed power handoff`);
  assert.equal(offers[0].kind, 'camera_battery_search');
  assert.equal(offers[0].query, "GoPro Enduro Battery HERO13 Black");
  assert.equal(offers[0].sourceUrl, expectedUrlsByModel[model]);
  assert.equal(offers[0].verifiedAt, '2026-09-19');
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
}

for (const args of [{"maker":"GoPro","model":"HERO13","category":"カメラ・映像"},{"maker":"gopro","model":"HERO13 Black","category":"カメラ・映像"},{"maker":"GoPro","model":"HERO13 Black","category":"その他"}]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed GoPro mapping must fail closed: ${JSON.stringify(args)}`);
}

console.log("ManualFinder GoPro HERO13 Wave 1 passed.");
