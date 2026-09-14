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
assert.equal(ledger.length, 20);
assert.equal(config.officePrinterConsumables.length, 47, '27 previous office mappings plus 20 FUJIFILM BI family-evidence mappings should be present');
assert.equal(config.printerConsumables.length, 72, '25 consumer mappings plus 47 office mappings should be present');

const models = [
  'Apeos C7071', 'Apeos C6571', 'Apeos C5571', 'Apeos C4571', 'Apeos C3571', 'Apeos C2571',
  'Apeos 7580', 'Apeos 6580', 'Apeos 5580',
  'Apeos C3061', 'Apeos C2561', 'Apeos C2061',
  'Apeos 3060', 'Apeos 2560', 'Apeos 1860',
  'Apeos 4570', 'Apeos 3570',
  'Apeos 3061', 'Apeos 2561', 'Apeos 2061'
];
const productPageModels = new Set(['Apeos 3061', 'Apeos 2561', 'Apeos 2061']);

assert.deepEqual(Array.from(ledger, (row) => row.model), models, 'only the twenty existing canonical FUJIFILM BI records should be activated');

for (const model of models) {
  const row = Array.from(config.officePrinterConsumables).find((item) =>
    item.maker === 'FUJIFILM Business Innovation' && item.model === model
  );
  assert.ok(row, `${model} should retain an explicit FUJIFILM BI toner evidence row`);
  const expectedKind = productPageModels.has(model)
    ? 'official_family_toner_product_page'
    : 'official_family_toner_sds';
  assert.equal(row.evidenceKind, expectedKind);
  assert.ok(row.sourceUrl.startsWith('https://www.fujifilm.com/fb/ja/'));
  if (expectedKind === 'official_family_toner_sds') {
    assert.ok(row.sourceUrl.includes('/support/sds-and-ais/'));
  } else {
    assert.equal(row.sourceUrl, 'https://www.fujifilm.com/fb/ja/products/multifunction-printers/monochrome/apeos-3061-2561-2061/features');
  }
  assert.deepEqual(Array.from(row.tonerCodes), [], 'SDS/document identifiers must never be misrepresented as retail toner product codes');

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
  assert.equal(offers[0].evidenceKind, expectedKind);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), []);
}

assert.equal(
  config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model: 'Apeos 7580',
    category: 'プリンター・複合機'
  })[0].url,
  'https://www.amazon.co.jp/s?k=FUJIFILM+Apeos+7580+%E3%83%88%E3%83%8A%E3%83%BC&tag=nicheworks09-22'
);

for (const model of ['Apeos C3071', 'Apeos C3067', 'Apeos 5330']) {
  assert.deepEqual(
    Array.from(config.getConsumableOffers({
      maker: 'FUJIFILM Business Innovation',
      model,
      category: 'プリンター・複合機'
    })),
    [],
    `${model} must remain fail-closed because it is not in this exact canonical activation set`
  );
}

assert.deepEqual(
  Array.from(config.getConsumableOffers({
    maker: 'FUJIFILM Business Innovation',
    model: 'Apeos 7580',
    category: 'その他'
  })),
  [],
  'toner mapping must remain category-gated'
);

assert.deepEqual(
  Array.from(config.getConsumableOffers({
    maker: 'FUJIFILM',
    model: 'Apeos 7580',
    category: 'プリンター・複合機'
  })),
  [],
  'retail search maker must not replace the canonical maker identity'
);

console.log('ManualFinder FUJIFILM family toner coverage tests passed.');
