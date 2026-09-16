import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js'
]) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave2 = context.window.MANUALFINDER_NIKON_CAMERA_ACCESSORY_WAVE2_LEDGER;
const merged = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(wave2));
assert.ok(Array.isArray(merged));
assert.equal(wave2.length, 10, 'Nikon camera accessory Wave 2 must close exactly ten remaining canonical Nikon models');
assert.equal(merged.length, 14, 'Wave 1 + Wave 2 should cover all fourteen actionable Nikon camera records');
assert.equal(config.cameraAccessories.length, 14);

const expected = new Map([
  ['Z9', ['EN-EL18d', 'MH-33', 'https://onlinemanual.nikonimglib.com/z9/ja/compatible_accessories_324.html']],
  ['Z7II', ['EN-EL15c', 'MH-25a', 'https://onlinemanual.nikonimglib.com/z7II_z6II/ja/15_technical_notes_04.html']],
  ['Z6II', ['EN-EL15c', 'MH-25a', 'https://onlinemanual.nikonimglib.com/z7II_z6II/ja/15_technical_notes_04.html']],
  ['Z7', ['EN-EL15b', 'MH-25a', 'https://onlinemanual.nikonimglib.com/z7_z6/ja/14_technical_notes_03.html']],
  ['Z6', ['EN-EL15b', 'MH-25a', 'https://onlinemanual.nikonimglib.com/z7_z6/ja/14_technical_notes_03.html']],
  ['Z5', ['EN-EL15c', 'MH-25a', 'https://onlinemanual.nikonimglib.com/z5/ja/15_technical_notes_04.html']],
  ['Z50II', ['EN-EL25a', 'MH-32', 'https://onlinemanual.nikonimglib.com/z50II/ja/15-04.html']],
  ['Z50', ['EN-EL25a', 'MH-32', 'https://onlinemanual.nikonimglib.com/z50/ja/90_technical_notes_04.html']],
  ['Z30', ['EN-EL25a', 'MH-32', 'https://onlinemanual.nikonimglib.com/z30/ja/15-04.html']],
  ['Zfc', ['EN-EL25a', 'MH-32', 'https://onlinemanual.nikonimglib.com/zfc/ja/15-04.html']]
]);

assert.deepEqual(Array.from(wave2, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of wave2) {
  const [battery, charger, sourceUrl] = expected.get(row.model);
  assert.equal(row.maker, 'Nikon');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, sourceUrl);

  const offers = Array.from(config.getAccessoryOffers({ maker: 'Nikon', model: row.model, category: 'カメラ・映像' }));
  assert.equal(offers.length, 2, `${row.model} must expose exactly one reviewed battery and one charger handoff`);
  assert.deepEqual(offers.map((offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.deepEqual(offers.map((offer) => offer.query), [`Nikon ${battery}`, `Nikon ${charger}`]);
  assert.equal(offers[0].url, `https://www.amazon.co.jp/s?k=${encodeURIComponent(`Nikon ${battery}`).replace(/%20/g, '+')}&tag=nicheworks09-22`);
  assert.equal(offers[1].url, `https://www.amazon.co.jp/s?k=${encodeURIComponent(`Nikon ${charger}`).replace(/%20/g, '+')}&tag=nicheworks09-22`);
  assert.equal(offers[0].sourceUrl, sourceUrl);
  assert.equal(offers[1].sourceUrl, sourceUrl);
}

for (const args of [
  { maker: 'NIKON', model: 'Z9', category: 'カメラ・映像' },
  { maker: 'Canon', model: 'Z9', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Z9', category: 'その他' },
  { maker: 'Nikon', model: 'Z999', category: 'カメラ・映像' },
  { maker: 'Nikon', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed Wave 2 accessory mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-nikon-camera-accessories-wave2.js'), 'runtime must load Nikon camera accessory Wave 2 before rendering');
assert.ok(runtimeSource.includes('loadCameraAccessoryLayers'), 'runtime must complete both camera accessory layers before init');

console.log('ManualFinder Nikon camera accessory Wave 2 passed.');
