import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of ['affiliate-config.js', 'affiliate-office-consumables.js', 'affiliate-kyocera-toner-wave4.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), context, { filename: `tools/manual-finder/${name}` });
}

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const ledger = context.window.MANUALFINDER_KYOCERA_TONER_WAVE9_LEDGER;
assert.ok(config);
assert.ok(Array.isArray(ledger));
assert.equal(ledger.length, 11, 'KYOCERA Wave 9 must contain exactly eleven audited legacy copier models');

const source180 = 'https://www.kyoceradocumentsolutions.eu/en/support/downloads.name-L2V1L2VuL21mcC9UQVNLQUxGQTIyMA%3D%3D.html';
const source420 = 'https://www.kyoceradocumentsolutions.co.uk/en/support/downloads.name-L2diL2VuL21mcC9UQVNLQUxGQTUyMEk%3D.html';
const source2560 = 'https://www.kyoceradocumentsolutions.be/nl/support/downloads.name-L2JlL25sL21mcC9LTTI1NjA%3D.html';
const source8030 = 'https://www.kyoceradocumentsolutions.pt/pt/support/downloads.name-L3B0L3B0L21mcC9LTTgwMzA%3D.html';
const expected = new Map([
  ['TASKalfa 180', { codes: ['TK-435'], source: source180 }],
  ['TASKalfa 181', { codes: ['TK-435'], source: source180 }],
  ['TASKalfa 221', { codes: ['TK-435'], source: source180 }],
  ['TASKalfa 420i', { codes: ['TK-725'], source: source420 }],
  ['TASKalfa 520i', { codes: ['TK-725'], source: source420 }],
  ['KM-2540', { codes: ['TK-675'], source: source2560 }],
  ['KM-2560', { codes: ['TK-675'], source: source2560 }],
  ['KM-3040', { codes: ['TK-675'], source: source2560 }],
  ['KM-3060', { codes: ['TK-675'], source: source2560 }],
  ['KM-6030', { codes: ['TK-655'], source: source8030 }],
  ['KM-8030', { codes: ['TK-655'], source: source8030 }]
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
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 220', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-2560', category: 'その他' },
  { maker: 'KYOCERA', model: 'KM-2560', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 420', category: 'プリンター・複合機' }
]) assert.deepEqual(Array.from(config.getConsumableOffers(args)), []);

console.log('ManualFinder KYOCERA toner Wave 9 tests passed.');
