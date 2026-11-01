import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const context = vm.createContext({ window: {}, URL });
for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-fujifilm-camera-accessories-bulk.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(name, root), 'utf8'), context, { filename: name });
}
const source = JSON.parse(fs.readFileSync(new URL('../coverage-passes/fujifilm/jp-gfx-x-camera-manual-index.json', import.meta.url), 'utf8'));
const models = new Set(source.universe.models);
const rows = Array.from(context.window.MANUALFINDER_FUJIFILM_CAMERA_ACCESSORY_BULK_LEDGER || []);
const conf = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.equal(rows.length, 38);
assert.equal(new Set(rows.map((r) => r.model)).size, 38);
assert.ok(rows.every((r) => r.maker === 'Fujifilm' && r.category === 'カメラ・映像' && models.has(r.model)));
assert.equal(rows.filter((r) => r.accessories[0].key === 'np-w235').length, 10);
assert.equal(rows.filter((r) => r.accessories[0].key === 'np-w126s').length, 28);
for (const row of rows) {
  assert.equal(row.accessories.length, 2);
  const offers = Array.from(conf.getAccessoryOffers({ maker: row.maker, model: row.model, category: row.category }));
  assert.equal(offers.length, 2, 'each exact canonical camera gets battery and charger actions: ' + row.model);
  for (const offer of offers) {
    const url = new URL(offer.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'www.amazon.co.jp');
    assert.equal(url.pathname, '/s');
    assert.equal(url.searchParams.get('tag'), 'nicheworks09-22');
    assert.equal(url.searchParams.get('k'), offer.query);
    assert.ok(offer.sourceUrl.startsWith('https://www.fujifilm-x.com/ja-jp/'));
    assert.ok(offer.kind === 'camera_battery_search' || offer.kind === 'camera_charger_search');
  }
}
assert.equal(conf.getAccessoryOffers({ maker: 'Fujifilm', model: 'GFX100', category: 'カメラ・映像' }).length, 0);
assert.equal(conf.getAccessoryOffers({ maker: 'Sony', model: 'X-T5', category: 'カメラ・映像' }).length, 0);
assert.equal(conf.getAccessoryOffers({ maker: 'Fujifilm', model: 'X-T5', category: 'PC・スマホ' }).length, 0);
console.log('Fujifilm exact-model battery and charger affiliate mappings: 38 models / 76 tagged offers verified.');
