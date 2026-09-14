import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave3Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave3.js', import.meta.url), 'utf8');
const canonicalSource = fs.readFileSync(new URL('../data/manuals.wave1.02.js', import.meta.url), 'utf8');
const jaHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enHtml = fs.readFileSync(new URL('../en/index.html', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE3_LEDGER || []);
const expected = new Map([
  ['LS-6970DN', ['TK-451']],
  ['LS-6950DN', ['TK-441']],
  ['LS-6820N', ['TK-21']],
  ['LS-6800', ['TK-20H']],
  ['LS-4020DN', ['TK-361']],
  ['LS-3900DN', ['TK-331']],
  ['LS-2020D', ['TK-341']],
  ['LS-2000D', ['TK-311']],
  ['FS-1370DN', ['TK-131']],
  ['FS-1300D', ['TK-131']],
  ['FS-1010', ['TK-17']]
]);

assert.ok(config);
assert.equal(rows.length, 11, 'Wave 3 must stay bounded to eleven exact KYOCERA models');
assert.equal(config.officePrinterConsumables.length, 50, '39 prior office mappings plus 11 KYOCERA Wave 3 mappings');
assert.equal(config.printerConsumables.length, 75, '64 prior printer mappings plus 11 KYOCERA Wave 3 mappings');

for (const [model, codes] of expected) {
  assert.ok(canonicalSource.includes(`~${model}~`), `${model} must already exist in the canonical Wave 1 dataset`);
  const row = rows.find((item) => item.model === model);
  assert.ok(row, `${model} must be present in the bounded Wave 3 ledger`);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
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
  assert.equal(offers[0].url, `https://www.amazon.co.jp/s?k=${encodeURIComponent(`KYOCERA ${model} トナー`).replace(/%20/g, '+')}&tag=nicheworks09-22`);
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
  assert.equal(offers[0].sourceUrl, row.sourceUrl);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'LS-6020', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'FS-920', category: 'プリンター・複合機' },
  { maker: 'KYOCERA', model: 'LS-6970DN', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'LS-6970DN', category: 'その他' },
  { maker: 'KYOCERA Document Solutions', model: 'NOT-A-CANONICAL-MODEL', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], `${args.maker}|${args.model}|${args.category} must fail closed`);
}

for (const [label, html, prefix] of [
  ['JA', jaHtml, './'],
  ['EN', enHtml, '../']
]) {
  const officeIndex = html.indexOf(`${prefix}affiliate-office-consumables.js?v=mf-office-20260914d`);
  const wave3Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave3.js?v=mf-kyocera-toner-20260914a`);
  const fujiIndex = html.indexOf(`${prefix}affiliate-fujifilm-toner-wave2.js?v=mf-fuji-toner-20260914b`);
  const runtimeIndex = html.indexOf(`${prefix}affiliate-runtime.js?v=mf-affiliate-20260914c`);
  assert.ok(officeIndex >= 0 && wave3Index > officeIndex, `${label} must load KYOCERA Wave 3 after the base office ledger`);
  assert.ok(fujiIndex > wave3Index && runtimeIndex > fujiIndex, `${label} must compose KYOCERA before FUJIFILM and the runtime`);
  assert.ok(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275'), `${label} must retain the required AdSense script`);
}

vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js#second-load' });
assert.equal(context.window.MANUALFINDER_AFFILIATE_CONFIG.officePrinterConsumables.length, 50, 'Wave 3 must be idempotent when loaded twice');

console.log('ManualFinder KYOCERA toner Wave 3 tests passed.');
