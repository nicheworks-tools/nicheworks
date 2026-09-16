import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE17_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 8, 'KYOCERA Wave 17 must contain exactly eight audited wide-format models');

const km4010FamilySource = 'https://www.kyoceradocumentsolutions.co.jp/products/copy/copy03/km_4010w/option.html';
const km4015Source = 'https://www.kyoceradocumentsolutions.co.jp/products/copy/copy03/km_4015w/option.html';
const km4850Source = 'https://www.kyoceradocumentsolutions.co.jp/products/copy/copy03/km_4850w/option.html';
const taskalfa4811Source = 'https://www.kyoceradocumentsolutions.co.jp/products/copy/copy03/4811w/option.html';
const taskalfa4814FamilySource = 'https://www.kyoceradocumentsolutions.co.jp/products/wide-format-multifunction/taskalfa-4814w-4815w-4816w/';
const expected = new Map([
  ['KM-4010w', { source: km4010FamilySource, relation: 'official_family_toner_reference' }],
  ['KM-4070w', { source: km4010FamilySource, relation: 'official_family_toner_reference' }],
  ['KM-4015w', { source: km4015Source, relation: 'official_model_toner_reference' }],
  ['KM-4850w', { source: km4850Source, relation: 'official_model_toner_reference' }],
  ['TASKalfa 4811w', { source: taskalfa4811Source, relation: 'official_model_toner_reference' }],
  ['TASKalfa 4814w', { source: taskalfa4814FamilySource, relation: 'official_family_toner_reference' }],
  ['TASKalfa 4815w', { source: taskalfa4814FamilySource, relation: 'official_family_toner_reference' }],
  ['TASKalfa 4816w', { source: taskalfa4814FamilySource, relation: 'official_family_toner_reference' }]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  const target = expected.get(row.model);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, target.source);
  assert.equal(row.evidenceRelation, target.relation);
  assert.deepEqual(Array.from(row.evidenceUrls), [target.source]);
  assert.deepEqual(Array.from(row.tonerCodes), [], `${row.model} must not invent an unpublished toner SKU`);

  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one manufacturer-evidenced toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, target.source);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), []);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C9999', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 4811w', category: 'その他' },
  { maker: 'KYOCERA', model: 'TASKalfa 4811w', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA wide-format toner Wave 17 tests passed.');
