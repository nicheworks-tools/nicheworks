import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave4.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE8_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 5, 'KYOCERA Wave 8 must contain exactly five audited FS-C MFP models');

const codes = ['TK-591K', 'TK-591C', 'TK-591M', 'TK-591Y'];
const expectedSources = new Map([
  ['FS-C2026MFP', 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp/price_table.html'],
  ['FS-C2026MFP+', 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2026mfp_plus/price_table.html'],
  ['FS-C2126MFP', 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp/price_table.html'],
  ['FS-C2126MFP+', 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2126mfp_plus/price_table.html'],
  ['FS-C2626MFP', 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco04/fs_c2626mfp/price_table.html']
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expectedSources.keys()).sort());
for (const row of ledger) {
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.equal(row.sourceUrl, expectedSources.get(row.model));
  assert.deepEqual(Array.from(row.tonerCodes), codes);
  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'FS-C2026MFP/DUPLEX', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'FS-C2626MFP', category: 'その他' },
  { maker: 'KYOCERA', model: 'FS-C2626MFP', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 8 tests passed.');
