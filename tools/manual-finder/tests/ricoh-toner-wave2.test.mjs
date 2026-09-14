import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.ok(config);

const expected = new Map([
  ['RICOH IM C5511', ['RICOH トナー ブラック IM C6010', 'RICOH トナー イエロー IM C6010', 'RICOH トナー マゼンタ IM C6010', 'RICOH トナー シアン IM C6010']],
  ['RICOH IM C4511', ['RICOH トナー ブラック IM C6010', 'RICOH トナー イエロー IM C6010', 'RICOH トナー マゼンタ IM C6010', 'RICOH トナー シアン IM C6010']],
  ['RICOH IM C3011', ['RICOH トナー ブラック IM C3510', 'RICOH トナー イエロー IM C3510', 'RICOH トナー マゼンタ IM C3510', 'RICOH トナー シアン IM C3510']],
  ['RICOH IM C2511', ['RICOH トナー ブラック IM C2510', 'RICOH トナー イエロー IM C2510', 'RICOH トナー マゼンタ IM C2510', 'RICOH トナー シアン IM C2510']],
  ['RICOH IM C320F', ['RICOH Pトナー ブラック IM C320', 'RICOH Pトナー イエロー IM C320', 'RICOH Pトナー マゼンタ IM C320', 'RICOH Pトナー シアン IM C320']],
  ['RICOH IM C2011', ['RICOH トナーキット ブラック IM C2010', 'RICOH トナーキット イエロー IM C2010', 'RICOH トナーキット マゼンタ IM C2010', 'RICOH トナーキット シアン IM C2010']]
]);

for (const [model, codes] of expected) {
  const row = Array.from(config.officePrinterConsumables).find((item) =>
    item.maker === 'RICOH' && item.model === model
  );
  assert.ok(row, `${model} must have an explicit RICOH toner mapping`);
  assert.equal(row.verifiedAt, '2026-09-14');
  assert.ok(row.sourceUrl.startsWith('https://www.ricoh.co.jp/products/list/'));
  assert.deepEqual(Array.from(row.tonerCodes), codes);

  const offers = config.getConsumableOffers({ maker: 'RICOH', model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${model} must expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `RICOH ${model.replace(/^RICOH /, '')} トナー`);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

assert.equal(
  config.getConsumableOffers({ maker: 'RICOH', model: 'RICOH IM C320F', category: 'プリンター・複合機' })[0].url,
  'https://www.amazon.co.jp/s?k=RICOH+IM+C320F+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

for (const args of [
  { maker: 'RICOH', model: 'RICOH IM C431', category: 'プリンター・複合機' },
  { maker: 'RICOH', model: 'RICOH IM C5511', category: 'その他' },
  { maker: 'Ricoh Office', model: 'RICOH IM C5511', category: 'プリンター・複合機' },
  { maker: 'RICOH', model: 'IM C5511', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], 'unsupported or non-canonical identity must fail closed');
}

console.log('ManualFinder RICOH toner Wave 2 tests passed.');
