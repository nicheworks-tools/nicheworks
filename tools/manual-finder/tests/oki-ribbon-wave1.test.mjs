import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js',
  'affiliate-oki-toner-wave6.js'
]) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_OKI_RIBBON_WAVE1_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 14, 'OKI Ribbon Wave 1 must contain exactly fourteen audited dot-impact models');

const expected = new Map([
  ['MICROLINE 50HU', ['RN6-00-008']],
  ['MICROLINE 5350SE', ['RN6-00-009']],
  ['MICROLINE 5460HU2', ['RBC-21-001', 'IRB-21-006']],
  ['MICROLINE 5650SU-R', ['RN6-00-009']],
  ['MICROLINE 5650SU3-R', ['RN6-00-009']],
  ['MICROLINE 6300FB2', ['RBC-11-001', 'IRB-11-006']],
  ['MICROLINE 80HU', ['RN6-00-008']],
  ['MICROLINE 8460HU2', ['RBC-22-001', 'IRB-22-006']],
  ['MICROLINE 8480SU2', ['RBN-00-007', 'RN6-00-007']],
  ['MICROLINE 8480SU2-R', ['RBN-00-007', 'RN6-00-007']],
  ['MICROLINE 8480SU3', ['RBN-00-007', 'RN6-00-007']],
  ['MICROLINE 8480SU3-R', ['RBN-00-007', 'RN6-00-007']],
  ['MICROLINE 8580SE', ['RBN-00-002', 'RN6-00-003']],
  ['MICROLINE 8720SE2', ['RBN-00-006', 'RN6-00-003']]
]);

assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), Array.from(expected.keys()).sort());
for (const row of ledger) {
  assert.equal(row.maker, 'OKI');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.ok(row.sourceUrl.startsWith('https://www.oki.com/jp/printing/support/consumables-and-accessories/dot/'));
  assert.deepEqual(Array.from(row.ribbonCodes), expected.get(row.model));
  const offers = config.getConsumableOffers({ maker: 'OKI', model: row.model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${row.model} must expose one verified ribbon handoff`);
  assert.equal(offers[0].kind, 'ribbon_search');
  assert.equal(offers[0].query, `OKI ${row.model} インクリボン`);
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), expected.get(row.model));
}

for (const args of [
  { maker: 'OKI', model: 'MICROLINE 8480SU', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MICROLINE 50HU', category: 'その他' },
  { maker: 'OKI Data', model: 'MICROLINE 50HU', category: 'プリンター・複合機' },
  { maker: 'OKI', model: 'MC883dnwvバリューSタイプ', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder OKI Ribbon Wave 1 tests passed.');
