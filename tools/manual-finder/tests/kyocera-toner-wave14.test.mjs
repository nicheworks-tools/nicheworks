import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE14_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 1, 'KYOCERA Wave 14 must contain exactly one audited remanufactured model');

const compatibilitySource = 'https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf';
const remanufactureSource = 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_6230rm.pdf';
const row = ledger[0];
assert.equal(row.maker, 'KYOCERA Document Solutions');
assert.equal(row.searchMaker, 'KYOCERA');
assert.equal(row.model, 'KM-6230RM');
assert.equal(row.verifiedAt, '2026-09-16');
assert.equal(row.sourceUrl, compatibilitySource);
assert.equal(row.evidenceAlias, 'KM-6230');
assert.equal(row.evidenceRelation, 'official_remanufactured_base_model');
assert.deepEqual(Array.from(row.evidenceUrls), [remanufactureSource, compatibilitySource]);
assert.deepEqual(Array.from(row.tonerCodes), ['37026000']);

const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
assert.equal(offers.length, 1, 'KM-6230RM must expose one verified toner handoff');
assert.equal(offers[0].kind, 'toner_search');
assert.equal(offers[0].query, 'KYOCERA KM-6230RM トナー');
assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
assert.equal(offers[0].sourceUrl, compatibilitySource);
assert.deepEqual(Array.from(offers[0].verifiedCodes), ['37026000']);

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C870', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C3225E', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-2531', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-3531', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-4031', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-6230RM', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-6230RM', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 14 tests passed.');
