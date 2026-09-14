import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-ricoh-consumables-wave3.js'
]) {
  const source = fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  vm.runInContext(source, context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_RICOH_CONSUMABLES_WAVE3_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 28, 'RICOH Wave 3 must cover exactly the 28 audited printer-detail gaps');

const expectedModels = [
  'RICOH IM 2500', 'RICOH IM 2510', 'RICOH IM 3500', 'RICOH IM 3510', 'RICOH IM 370F',
  'RICOH IM 4000', 'RICOH IM 4510', 'RICOH IM 460F', 'RICOH IM 5000', 'RICOH IM 6000',
  'RICOH IM 6010', 'RICOH IM 7000', 'RICOH IM 7010', 'RICOH IM 8000', 'RICOH IM 9000',
  'RICOH IM C2500F CE', 'RICOH IM C3000F CE', 'RICOH IM C3010SD', 'RICOH IM C431',
  'RICOH IM C4500F CE', 'RICOH IM C4510SD', 'RICOH IM C6000F CE', 'RICOH IM C6010SD',
  'RICOH IM CW1200', 'RICOH IM CW2200', 'RICOH MP W6700 SP', 'RICOH MP W7100', 'RICOH MP W8140'
].sort();
assert.deepEqual(Array.from(ledger, (row) => row.model).sort(), expectedModels);

for (const row of ledger) {
  assert.equal(row.maker, 'RICOH');
  assert.equal(row.verifiedAt, '2026-09-15');
  assert.ok(row.sourceUrl.startsWith('https://www.ricoh.co.jp/products/list/'));
  assert.ok(row.verifiedCodes.length > 0);

  const offers = config.getConsumableOffers({
    maker: 'RICOH',
    model: row.model,
    category: 'プリンター・複合機'
  });
  assert.equal(offers.length, 1, `${row.model} must expose exactly one detailed handoff`);
  assert.equal(offers[0].kind, row.kind);
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), Array.from(row.verifiedCodes));
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
}

assert.equal(ledger.filter((row) => row.kind === 'toner_search').length, 26);
assert.equal(ledger.filter((row) => row.kind === 'ink_search').length, 2);

const byModel = new Map(Array.from(ledger, (row) => [row.model, row]));
assert.deepEqual(Array.from(byModel.get('RICOH IM 7010').verifiedCodes), ['RICOH トナー ブラック IM 6010']);
assert.deepEqual(Array.from(byModel.get('RICOH IM 2500').verifiedCodes), ['RICOH MP Pトナー ブラック 3554']);
assert.deepEqual(Array.from(byModel.get('RICOH IM 460F').verifiedCodes), ['RICOH P トナー IM 460']);
assert.deepEqual(Array.from(byModel.get('RICOH IM C431').verifiedCodes), [
  'RICOH トナー ブラック IM C300', 'RICOH トナー イエロー IM C300',
  'RICOH トナー マゼンタ IM C300', 'RICOH トナー シアン IM C300'
]);
assert.ok(byModel.get('RICOH IM C6000F CE').verifiedCodes.every((code) => code.includes('C6003')));
assert.deepEqual(Array.from(byModel.get('RICOH MP W8140').verifiedCodes), ['imagio トナー タイプ19W ブラック']);

const cw = config.getConsumableOffers({ maker: 'RICOH', model: 'RICOH IM CW2200', category: 'プリンター・複合機' })[0];
assert.equal(cw.kind, 'ink_search');
assert.equal(cw.query, 'RICOH IM CW2200 インク');
assert.equal(cw.url, 'https://www.amazon.co.jp/s?k=RICOH+IM+CW2200+%E3%82%A4%E3%83%B3%E3%82%AF&tag=nicheworks09-22');

const mono = config.getConsumableOffers({ maker: 'RICOH', model: 'RICOH IM 7010', category: 'プリンター・複合機' })[0];
assert.equal(mono.query, 'RICOH IM 7010 トナー');
assert.equal(mono.kind, 'toner_search');

for (const args of [
  { maker: 'RICOH', model: 'RICOH IM UNKNOWN', category: 'プリンター・複合機' },
  { maker: 'RICOH', model: 'IM 7010', category: 'プリンター・複合機' },
  { maker: 'Ricoh Office', model: 'RICOH IM 7010', category: 'プリンター・複合機' },
  { maker: 'RICOH', model: 'RICOH IM 7010', category: 'その他' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);
}

console.log('ManualFinder RICOH consumables Wave 3 tests passed.');
