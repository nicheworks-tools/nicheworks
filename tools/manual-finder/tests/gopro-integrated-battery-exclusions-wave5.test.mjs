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
  ...fs.readdirSync(root).filter((name) => /^affiliate-gopro-camera-accessories-wave\d+\.js$/.test(name)).sort((a,b)=>waveNumber(a)-waveNumber(b)),
  'affiliate-camera-detail-exclusions.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);

const expected = new Map([
  ['HERO11 Black Mini', 'https://gopro.com/ja/jp/shop/cameras/hero11-black-mini/CHDHF-111-master.html'],
  ['HERO7 Silver', 'https://gopro.com/content/dam/help/hero7-silver/manuals/HERO7Silver_UM_ENG_REVA.pdf'],
  ['HERO7 White', 'https://gopro.com/content/dam/help/hero7-white/manuals/HERO7White_UM_ENG_REVB.pdf'],
  ['HERO5 Session', 'https://gopro.com/content/dam/help/hero5-session/manuals/HERO5Session_UM_ENG_REVD_WEB.pdf'],
  ['HERO Session', 'https://gopro.com/content/dam/help/hero-session/manuals/UM_HEROSession_ENG_REVC_Web.pdf'],
  ['HERO+', 'https://gopro.com/content/dam/help/heroplus/manuals/UM_HEROPlus_ENG_REVA_WEB.pdf'],
  ['HERO+ LCD', 'https://gopro.com/content/dam/help/heroplus-lcd/manuals/UM_HEROPlusLCD_ENG_REVB_WEB.pdf']
]);

assert.ok(exclusions.length >= 33, 'GoPro Wave 5 must retain the 26 DJI exclusions and add seven exact GoPro exclusions');

for (const [model, sourceUrl] of expected) {
  const row = exclusions.find((entry) => entry.maker === 'GoPro' && entry.model === model && entry.category === 'カメラ・映像');
  assert.ok(row, `${model} exclusion must exist`);
  assert.equal(row.reason, 'built_in_battery_no_model_specific_replaceable_power_accessory');
  assert.equal(row.sourceUrl, sourceUrl);
  assert.equal(row.verifiedAt, '2026-09-19');
  assert.deepEqual(Array.from(config.getAccessoryOffers({ maker: 'GoPro', model, category: 'カメラ・映像' })), [], `${model} must remain detail-free after reviewed exclusion`);
}

for (const model of ['HERO', 'HERO 2014', 'HERO3', 'HERO4', 'Fusion', 'LIT HERO']) {
  assert.ok(!exclusions.some((row) => row.maker === 'GoPro' && row.model === model && row.category === 'カメラ・映像'), `${model} must remain unresolved after GoPro Wave 5`);
}

console.log('ManualFinder GoPro integrated-battery exclusion Wave 5 passed.');
