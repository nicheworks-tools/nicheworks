import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const context = vm.createContext({ window: {}, URL });
for (const name of ['affiliate-config.js', 'affiliate-camera-accessories.js', 'affiliate-sony-camera-accessories-bulk.js']) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: name });
}
const source = JSON.parse(fs.readFileSync(new URL('../coverage-passes/sony/jp-alpha-e-mount-bodies.json', import.meta.url), 'utf8'));
const canonical = new Set(source.universe.models);
const rows = Array.from(context.window.MANUALFINDER_SONY_CAMERA_ACCESSORY_BULK_LEDGER || []);
const conf = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(rows.length, 22);
assert.equal(new Set(rows.map((r) => r.model)).size, 22);
assert.ok(rows.every((r) => r.maker === 'Sony' && r.category === 'カメラ・映像' && canonical.has(r.model)));
assert.equal(rows.filter((r) => r.accessories[0].key === 'np-fz100').length, 16);
assert.equal(rows.filter((r) => r.accessories[0].key === 'np-fw50').length, 6);
for (const row of rows) {
  const offers = Array.from(conf.getAccessoryOffers({ maker: row.maker, model: row.model, category: row.category }));
  assert.equal(offers.length, 2, 'battery and charger required for ' + row.model);
  for (const offer of offers) {
    const url = new URL(offer.url);
    assert.equal(url.hostname, 'www.amazon.co.jp');
    assert.equal(url.pathname, '/s');
    assert.equal(url.searchParams.get('tag'), 'nicheworks09-22');
    assert.equal(url.searchParams.get('k'), offer.query);
    assert.ok(offer.sourceUrl.startsWith('https://') && /sony\.jp/.test(offer.sourceUrl));
  }
}
for (const model of ['ILCE-7RM6', 'ILCE-7RM4A', 'ILCE-6400K']) {
  assert.equal(conf.getAccessoryOffers({ maker: 'Sony', model, category: 'カメラ・映像' }).length, 0, 'no inferred variant compatibility: ' + model);
}
assert.equal(conf.getAccessoryOffers({ maker: 'Fujifilm', model: 'ILCE-7M4', category: 'カメラ・映像' }).length, 0);
console.log('Sony official battery/charger mappings: 22 exact models / 44 tagged Amazon search offers.');
