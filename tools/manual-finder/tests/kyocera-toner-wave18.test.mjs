import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE18_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 7, 'KYOCERA Wave 18 must contain exactly seven audited wide-format models');

const source = 'https://www.kyoceradocumentsolutions.co.jp/support/wt_attention.html';
const expectedModels = [
  'KM-3510w',
  'KM-3650w',
  'KM-4075w',
  'KM-4830w',
  'KM-5410w',
  'TASKalfa 4812w',
  'TASKalfa 4813w'
];
assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), [...expectedModels].sort());

for (const row of ledger) {
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, source);
  assert.equal(row.evidenceRelation, 'official_model_toner_container_reference');
  assert.deepEqual(Array.from(row.evidenceUrls), [source]);
  assert.deepEqual(Array.from(row.tonerCodes), [], `${row.model} must not invent an unpublished toner SKU`);

  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one manufacturer-evidenced toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, source);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), []);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C9999', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-3510w', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-3510w', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA wide-format toner Wave 18 tests passed.');
