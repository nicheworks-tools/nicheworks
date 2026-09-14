import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave2Source = fs.readFileSync(new URL('../affiliate-fujifilm-toner-wave2.js', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave2Source, context, { filename: 'tools/manual-finder/affiliate-fujifilm-toner-wave2.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_FUJIFILM_TONER_WAVE2_LEDGER;

assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 6);
assert.equal(config.officePrinterConsumables.length, 33, '27 previous office mappings plus six FUJIFILM BI Wave 2 mappings should be present');
assert.equal(config.printerConsumables.length, 58, '25 consumer mappings plus 33 office mappings should be present');

const models = [
  'Apeos C7071',
  'Apeos C6571',
  'Apeos C5571',
  'Apeos C4571',
  'Apeos C3571',
  'Apeos C2571'
];

for (const model of models) {
  const row = Array.from(config.officePrinterConsumables).find((item) =>
    item.maker === 'FUJIFILM Business Innovation' && item.model === model
  );
  assert.ok(row, `${model} should retain an explicit FUJIFILM BI toner evidence row`);
  assert.equal(row.evidenceKind, 'official_family_toner_sds');
  assert.equal(row.sourceUrl, 'https://www.fujifilm.com/fb/ja/support/sds-and-ais/multifunction-printers/color/apeos-c7071-c6571-c5571-c4571-c3571-C3071-c2571');
  assert.deepEqual(Array.from(row.tonerCodes), [], 'SDS document numbers must not be misrepresented as toner product codes');

  const offers = config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model,
    category: 'プリンター・複合機'
  });
  assert.equal(offers.length, 1, `${model} should expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `FUJIFILM ${model} トナー`);
  assert.ok(offers[0].url.startsWith('https://www.amazon.co.jp/s?'));
  assert.ok(offers[0].url.includes('tag=nicheworks09-22'));
  assert.equal(offers[0].evidenceKind, 'official_family_toner_sds');
  assert.deepEqual(Array.from(offers[0].verifiedCodes), []);
}

assert.equal(
  config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model: 'Apeos C7071',
    category: 'プリンター・複合機'
  })[0].url,
  'https://www.amazon.co.jp/s?k=FUJIFILM+Apeos+C7071+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

assert.deepEqual(
  Array.from(config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model: 'Apeos C3071',
    category: 'プリンター・複合機'
  })),
  [],
  'C3071 appears in the official family evidence but is not a current ManualFinder record, so it must fail closed'
);
assert.deepEqual(
  Array.from(config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model: 'Apeos C7071',
    category: 'その他'
  })),
  [],
  'toner mapping must remain category-gated'
);

console.log('ManualFinder FUJIFILM toner Wave 2 tests passed.');
