import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave6.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE16_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 1, 'KYOCERA Wave 16 must contain exactly one audited same-family variant');

const compatibilitySource = 'https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf';
const relationSource = 'https://www.kyoceradocumentsolutions.co.jp/products/past/copy01/km_c850/specs.html';
const row = ledger[0];
assert.equal(row.maker, 'KYOCERA Document Solutions');
assert.equal(row.searchMaker, 'KYOCERA');
assert.equal(row.model, 'KM-C850D');
assert.equal(row.verifiedAt, '2026-09-16');
assert.equal(row.sourceUrl, compatibilitySource);
assert.equal(row.evidenceAlias, 'KM-C850');
assert.equal(row.evidenceRelation, 'official_same_family_variant');
assert.deepEqual(Array.from(row.evidenceUrls), [relationSource, compatibilitySource]);
assert.deepEqual(Array.from(row.tonerCodes), ['TK-805C', 'TK-805K', 'TK-805M', 'TK-805Y']);

const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
assert.equal(offers.length, 1, 'KM-C850D must expose one verified toner handoff');
assert.equal(offers[0].kind, 'toner_search');
assert.equal(offers[0].query, 'KYOCERA KM-C850D トナー');
assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
assert.equal(offers[0].sourceUrl, compatibilitySource);
assert.deepEqual(Array.from(offers[0].verifiedCodes), ['TK-805C', 'TK-805K', 'TK-805M', 'TK-805Y']);

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C870', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C3225E', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 4811w', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-3510w', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C850D', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-C850D', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 16 tests passed.');
