import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave4.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE10_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 27, 'KYOCERA Wave 10 must contain exactly twenty-seven audited legacy models');

const compatibilitySource = 'https://www.kyoceradocumentsolutions.de/content/dam/download-center-cf/de/documents/Others/Tonerkompatibilitaet_pdf.download.pdf';
const colorBrochureSource = 'https://www.kyoceradocumentsolutions.co.uk/content/download-center/gb/documents/brochure/TASKalfa_250ci_300ci_400ci_500ci_552ci_KDS_Final_pdf.download.pdf';
const expected = new Map([
  ['TASKalfa 620', { codes: ['TK-665'], source: compatibilitySource }],
  ['TASKalfa 820', { codes: ['TK-665'], source: compatibilitySource }],
  ['TASKalfa 300i', { codes: ['TK-685'], source: compatibilitySource }],
  ['TASKalfa 250ci', { codes: ['TK-865C', 'TK-865K', 'TK-865M', 'TK-865Y'], source: compatibilitySource }],
  ['TASKalfa 300ci', { codes: ['TK-865C', 'TK-865K', 'TK-865M', 'TK-865Y'], source: compatibilitySource }],
  ['TASKalfa 400ci', { codes: ['TK-855C', 'TK-855K', 'TK-855M', 'TK-855Y'], source: compatibilitySource }],
  ['TASKalfa 500ci', { codes: ['TK-855C', 'TK-855K', 'TK-855M', 'TK-855Y'], source: compatibilitySource }],
  ['TASKalfa 552ci', { codes: ['TK-855K', 'TK-855C', 'TK-855M', 'TK-855Y'], source: colorBrochureSource }],
  ['KM-1620', { codes: ['TK-410'], source: compatibilitySource }],
  ['KM-1650', { codes: ['TK-410'], source: compatibilitySource }],
  ['KM-2020', { codes: ['TK-410'], source: compatibilitySource }],
  ['KM-2050', { codes: ['TK-410'], source: compatibilitySource }],
  ['KM-2550', { codes: ['TK-420'], source: compatibilitySource }],
  ['KM-4050', { codes: ['TK-715'], source: compatibilitySource }],
  ['KM-5050', { codes: ['TK-715'], source: compatibilitySource }],
  ['KM-4530', { codes: ['TK-603'], source: compatibilitySource }],
  ['KM-5530', { codes: ['TK-603'], source: compatibilitySource }],
  ['KM-6330', { codes: ['TK-603'], source: compatibilitySource }],
  ['KM-7530', { codes: ['TK-603'], source: compatibilitySource }],
  ['KM-C2630', { codes: ['TK-815C', 'TK-815K', 'TK-815M', 'TK-815Y'], source: compatibilitySource }],
  ['KM-C850', { codes: ['TK-805C', 'TK-805K', 'TK-805M', 'TK-805Y'], source: compatibilitySource }],
  ['KM-C2520', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }],
  ['KM-C2525E', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }],
  ['KM-C3225', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }],
  ['KM-C3232', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }],
  ['KM-C3232E', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }],
  ['KM-C4035E', { codes: ['TK-825C', 'TK-825K', 'TK-825M', 'TK-825Y'], source: compatibilitySource }]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  const target = expected.get(row.model);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.equal(row.sourceUrl, target.source);
  assert.deepEqual(Array.from(row.tonerCodes), target.codes);
  const offers = config.getConsumableOffers({ maker: row.maker, model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${row.model} トナー`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), target.codes);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'KM-C9999', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C2630D', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C850D', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 255', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 620', category: 'その他' },
  { maker: 'KYOCERA', model: 'TASKalfa 620', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 10 tests passed.');
