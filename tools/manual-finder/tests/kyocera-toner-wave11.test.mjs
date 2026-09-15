import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave4.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE11_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 5, 'KYOCERA Wave 11 must contain exactly five audited legacy models');

const compatibilitySource = 'https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf';
const expected = new Map([
  ['KM-1530', ['1T02AV0NL0']],
  ['KM-2030', ['1T02AV0NL0']],
  ['KM-3035', ['370AB000']],
  ['KM-4035', ['370AB000']],
  ['KM-5035', ['370AB000']]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  const codes = expected.get(row.model);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.equal(row.sourceUrl, compatibilitySource);
  assert.deepEqual(Array.from(row.tonerCodes), codes);
  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, compatibilitySource);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-1570', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-2531', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 255', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: '4811w', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-1530', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-1530', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 11 tests passed.');
