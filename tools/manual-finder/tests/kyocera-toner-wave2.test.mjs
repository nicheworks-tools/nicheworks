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
  ['LS-C8100DN', ['TK-821K', 'TK-821Y', 'TK-821M', 'TK-821C']],
  ['LS-C8008N', ['TK-801K', 'TK-801Y', 'TK-801M', 'TK-801C']],
  ['LS-C8008DN', ['TK-801K', 'TK-801Y', 'TK-801M', 'TK-801C']],
  ['LS-C5030N', ['TK-511K', 'TK-511Y', 'TK-511M', 'TK-511C']],
  ['LS-C5016N', ['TK-501K', 'TK-501Y', 'TK-501M', 'TK-501C']],
  ['LS-9520DN', ['TK-76']]
]);

for (const [model, codes] of expected) {
  const row = Array.from(config.officePrinterConsumables).find((item) =>
    item.maker === 'KYOCERA Document Solutions' && item.model === model
  );
  assert.ok(row, `${model} must have an explicit KYOCERA toner mapping`);
  assert.equal(row.verifiedAt, '2026-09-14');
  assert.ok(row.sourceUrl.startsWith('https://www.kyoceradocumentsolutions.co.jp/'));
  assert.deepEqual(Array.from(row.tonerCodes), codes);

  const offers = config.getConsumableOffers({
    maker: 'KYOCERA Document Solutions',
    model,
    category: 'プリンター・複合機'
  });
  assert.equal(offers.length, 1, `${model} must expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${model} トナー`);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

assert.equal(
  config.getConsumableOffers({
    maker: 'KYOCERA Document Solutions',
    model: 'LS-C8100DN',
    category: 'プリンター・複合機'
  })[0].url,
  'https://www.amazon.co.jp/s?k=KYOCERA+LS-C8100DN+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'LS-C8100DN+', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'LS-C8100DN', category: 'その他' },
  { maker: 'KYOCERA', model: 'LS-C8100DN', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'LS-C8008', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], 'unsupported or non-canonical identity must fail closed');
}

console.log('ManualFinder KYOCERA toner Wave 2 tests passed.');
