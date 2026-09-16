import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-camera-accessories.js']) {
  vm.runInContext(
    fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'),
    context,
    { filename: `tools/manual-finder/${name}` }
  );
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 4, 'Nikon camera accessory Wave 1 must stay bounded to four reviewed models');
assert.equal(config.cameraAccessories.length, 4);
assert.equal(config.cameraAccessorySearchTemplate.activationTarget, 'camera_accessory_search_template');
assert.ok(config.targets.camera_accessory_search_template, 'camera accessory target must be active');

const expectedSources = new Map([
  ['Z8', 'https://search.nikon-image.com/support/faq/products/article?articleNo=000059440'],
  ['Z6III', 'https://onlinemanual.nikonimglib.com/z6III/ja/compatible_accessories_379.html'],
  ['Z5II', 'https://onlinemanual.nikonimglib.com/z5II/ja/compatible_accessories_374.html'],
  ['Zf', 'https://search.nikon-image.com/support/faq/products/article?articleNo=000066700']
]);
assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expectedSources.keys()).sort());

for (const row of ledger) {
  assert.equal(row.maker, 'Nikon');
  assert.equal(row.category, 'カメラ・映像');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceType, 'official_manufacturer_compatibility');
  assert.equal(row.sourceUrl, expectedSources.get(row.model));

  const offers = config.getAccessoryOffers({ maker: row.maker, model: row.model, category: row.category });
  assert.equal(offers.length, 2, `${row.model} must expose exactly one battery and one charger handoff`);
  assert.deepEqual(Array.from(offers, (offer) => offer.key), ['en-el15c', 'mh-25a']);
  assert.deepEqual(Array.from(offers, (offer) => offer.kind), ['camera_battery_search', 'camera_charger_search']);
  assert.equal(offers[0].query, 'Nikon EN-EL15c');
  assert.equal(offers[1].query, 'Nikon MH-25a');
  assert.equal(offers[0].url, 'https://www.amazon.co.jp/s?k=Nikon+EN-EL15c&tag=nicheworks09-22');
  assert.equal(offers[1].url, 'https://www.amazon.co.jp/s?k=Nikon+MH-25a&tag=nicheworks09-22');
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.equal(offers[1].sourceUrl, row.sourceUrl);
}

for (const args of [
  { maker: 'NIKON', model: 'Z8', category: 'カメラ・映像' },
  { maker: 'Canon', model: 'Z8', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Z8', category: 'その他' },
  { maker: 'Nikon', model: 'Z6II', category: 'カメラ・映像' },
  { maker: 'Nikon', model: 'Z999', category: 'カメラ・映像' },
  { maker: 'Nikon', model: '', category: 'カメラ・映像' }
]) {
  assert.deepEqual(Array.from(config.getAccessoryOffers(args)), [], `unreviewed accessory mapping must fail closed: ${JSON.stringify(args)}`);
}

const runtimeSource = fs.readFileSync(new URL('../affiliate-runtime.js', import.meta.url), 'utf8');
assert.ok(runtimeSource.includes('affiliate-camera-accessories.js'), 'runtime must load the camera accessory layer');
assert.ok(runtimeSource.includes('config.getAccessoryOffers'), 'runtime must render reviewed camera accessory offers');
assert.ok(runtimeSource.includes('manual_result_accessory'), 'camera accessories must use their own coarse placement');
assert.ok(runtimeSource.includes('if (staticActive)') && runtimeSource.includes('accessories.forEach'), 'static model overrides must coexist with accessory handoffs');

console.log('ManualFinder Nikon camera accessory Wave 1 passed.');
