import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js'
]) {
  const source = fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  vm.runInContext(source, context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const wave2Ledger = context.window.MANUALFINDER_OKI_TONER_WAVE2_LEDGER;
const ledger = context.window.MANUALFINDER_OKI_TONER_WAVE3_LEDGER;
assert.ok(config);
assert.equal(wave2Ledger.length, 8, 'Wave 3 must preserve the eight Wave 2 mappings');
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 13, 'OKI Wave 3 must contain exactly the 13 audited color-printer models');

const expected = new Map([
  ['C610dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C610N/', codes: ['TNR-C4FK1', 'TNR-C4FY1', 'TNR-C4FM1', 'TNR-C4FC1', 'TNR-C4FK2', 'TNR-C4FY2', 'TNR-C4FM2', 'TNR-C4FC2'] }],
  ['C610dn2', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C610DN2/', codes: ['TNR-C4FK1', 'TNR-C4FY1', 'TNR-C4FM1', 'TNR-C4FC1', 'TNR-C4FK2', 'TNR-C4FY2', 'TNR-C4FM2', 'TNR-C4FC2'] }],
  ['C612dnw', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C612DNW/', codes: ['TC-C4DK1', 'TC-C4DY1', 'TC-C4DM1', 'TC-C4DC1', 'TC-C4DK2', 'TC-C4DY2', 'TC-C4DM2', 'TC-C4DC2'] }],
  ['C711dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C711DN/', codes: ['TNR-C4GK1', 'TNR-C4GY1', 'TNR-C4GM1', 'TNR-C4GC1', 'TNR-C4GK2', 'TNR-C4GY2', 'TNR-C4GM2', 'TNR-C4GC2'] }],
  ['C711dn2', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C711DN2/', codes: ['TNR-C4GK1', 'TNR-C4GY1', 'TNR-C4GM1', 'TNR-C4GC1', 'TNR-C4GK2', 'TNR-C4GY2', 'TNR-C4GM2', 'TNR-C4GC2'] }],
  ['C810dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C810DN/', codes: ['TNR-C3KK3', 'TNR-C3KY3', 'TNR-C3KM3', 'TNR-C3KC3', 'TNR-C3KK1', 'TNR-C3KY1', 'TNR-C3KM1', 'TNR-C3KC1'] }],
  ['C810dn-T', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C810DN-T/', codes: ['TNR-C3KK3', 'TNR-C3KY3', 'TNR-C3KM3', 'TNR-C3KC3', 'TNR-C3KK1', 'TNR-C3KY1', 'TNR-C3KM1', 'TNR-C3KC1'] }],
  ['C811dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C811DN/', codes: ['TNR-C3LK3', 'TNR-C3LY3', 'TNR-C3LM3', 'TNR-C3LC3', 'TNR-C3LK1', 'TNR-C3LY1', 'TNR-C3LM1', 'TNR-C3LC1', 'TNR-C3LK2', 'TNR-C3LY2', 'TNR-C3LM2', 'TNR-C3LC2'] }],
  ['C811dn-T', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C811DN-T/', codes: ['TNR-C3LK3', 'TNR-C3LY3', 'TNR-C3LM3', 'TNR-C3LC3', 'TNR-C3LK1', 'TNR-C3LY1', 'TNR-C3LM1', 'TNR-C3LC1', 'TNR-C3LK2', 'TNR-C3LY2', 'TNR-C3LM2', 'TNR-C3LC2'] }],
  ['C830dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C830DN/', codes: ['TNR-C3KK3', 'TNR-C3KY3', 'TNR-C3KM3', 'TNR-C3KC3', 'TNR-C3KK1', 'TNR-C3KY1', 'TNR-C3KM1', 'TNR-C3KC1'] }],
  ['C841dn', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/c841dn/', codes: ['TNR-C3LK3', 'TNR-C3LY3', 'TNR-C3LM3', 'TNR-C3LC3', 'TNR-C3LK1', 'TNR-C3LY1', 'TNR-C3LM1', 'TNR-C3LC1', 'TNR-C3LK2', 'TNR-C3LY2', 'TNR-C3LM2', 'TNR-C3LC2'] }],
  ['C841dn-PI', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C841DN-PI/', codes: ['TNR-C3LK3', 'TNR-C3LY3', 'TNR-C3LM3', 'TNR-C3LC3', 'TNR-C3LK1', 'TNR-C3LY1', 'TNR-C3LM1', 'TNR-C3LC1', 'TNR-C3LK2', 'TNR-C3LY2', 'TNR-C3LM2', 'TNR-C3LC2'] }],
  ['C8800-P', { sourceUrl: 'https://www.oki.com/jp/printing/support/consumables-and-accessories/color/C8800-P/', codes: ['TNR-C3FK1', 'TNR-C3FY1', 'TNR-C3FM1', 'TNR-C3FC1'] }]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());

for (const row of ledger) {
  const proof = expected.get(row.model);
  assert.ok(proof, `${row.model} must be part of the audited Wave 3 set`);
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.equal(row.sourceUrl, proof.sourceUrl);
  assert.deepEqual(Array.from(row.tonerCodes), proof.codes);

  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose exactly one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `OKI ${row.model} トナー`);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, proof.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), proof.codes);
}

assert.equal(
  config.getConsumableOffers({ maker: 'OKI', model: 'C612dnw', category: 'プリンター・複合機' })[0].url,
  'https://www.amazon.co.jp/s?k=OKI+C612dnw+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

for (const args of [
  { maker: 'OKI', model: 'C610', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'C612dnw', category: 'その他' },
  { maker: 'OKI Data', model: 'C612dnw', category: 'プリンター・複合機' },
  { maker: 'OKI', model: '', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);
}

console.log('ManualFinder OKI toner Wave 3 tests passed.');
