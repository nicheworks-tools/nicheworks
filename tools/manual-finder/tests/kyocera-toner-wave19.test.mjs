import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE19_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 2, 'KYOCERA Wave 19 must contain exactly the final two audited color models');

const expected = new Map([
  ['KM-C3225E', {
    source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_km_2525e_3225e_3232e_4035e_bsc.pdf',
    evidence: [
      'https://www.kyoceradocumentsolutions.co.jp/products/copy/copy01/km_c3225e/',
      'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_km_2525e_3225e_3232e_4035e_bsc.pdf'
    ]
  }],
  ['KM-C870', {
    source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_km_c870.pdf',
    evidence: [
      'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_km_c870.pdf',
      'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_c870.pdf'
    ]
  }]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  const target = expected.get(row.model);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-16');
  assert.equal(row.sourceUrl, target.source);
  assert.equal(row.evidenceRelation, 'official_model_manual_toner_reference');
  assert.deepEqual(Array.from(row.evidenceUrls), target.evidence);
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
  { maker: 'KYOCERA Document Solutions', model: 'KM-C3225E', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-C870', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 19 tests passed.');
