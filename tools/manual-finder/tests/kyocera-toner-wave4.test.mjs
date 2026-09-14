import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave3Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave3.js', import.meta.url), 'utf8');
const wave4Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave4.js', import.meta.url), 'utf8');
const canonicalSource = fs.readFileSync(new URL('../data/manuals.wave1.02.js', import.meta.url), 'utf8');
const jaHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enHtml = fs.readFileSync(new URL('../en/index.html', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js' });
vm.runInContext(wave4Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE4_LEDGER || []);
const expected = new Map([
  ['LS-6020', ['TK-401']],
  ['LS-3830N', ['TK-66']],
  ['LS-1820', ['TK-66']],
  ['FS-920', ['TK-111']]
]);

assert.ok(config);
assert.equal(rows.length, 4, 'Wave 4 must stay bounded to four exact KYOCERA models');
assert.equal(config.officePrinterConsumables.length, 54, '39 base office mappings plus 11 Wave 3 plus 4 Wave 4 mappings');
assert.equal(config.printerConsumables.length, 79, '64 base printer mappings plus 11 Wave 3 plus 4 Wave 4 mappings');

for (const [model, codes] of expected) {
  assert.ok(canonicalSource.includes(`~${model}~`), `${model} must already exist in the canonical Wave 1 dataset`);
  const row = rows.find((item) => item.model === model);
  assert.ok(row, `${model} must be present in the bounded Wave 4 ledger`);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-14');
  assert.equal(row.sourceUrl, 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_c/km_page_printer_series.pdf');
  assert.deepEqual(Array.from(row.tonerCodes), codes);

  const offers = config.getConsumableOffers({ maker: 'KYOCERA Document Solutions', model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${model} must expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${model} トナー`);
  const expectedUrl = new URL('https://www.amazon.co.jp/s');
  expectedUrl.searchParams.set('k', `KYOCERA ${model} トナー`);
  expectedUrl.searchParams.set('tag', 'nicheworks09-22');
  assert.equal(offers[0].url, expectedUrl.toString());
  assert.deepEqual(Array.from(offers[0].verifiedCodes), codes);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 205c', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'KM-C850', category: 'プリンター・複合機' },
  { maker: 'KYOCERA', model: 'LS-6020', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'LS-6020', category: 'その他' },
  { maker: 'KYOCERA Document Solutions', model: 'NOT-A-CANONICAL-MODEL', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], `${args.maker}|${args.model}|${args.category} must fail closed`);
}

for (const [label, html, prefix] of [['JA', jaHtml, './'], ['EN', enHtml, '../']]) {
  const officeIndex = html.indexOf(`${prefix}affiliate-office-consumables.js?v=mf-office-20260914d`);
  const wave3Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave3.js?v=mf-kyocera-toner-20260914a`);
  const wave4Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave4.js?v=mf-kyocera-toner-20260914b`);
  const fujiIndex = html.indexOf(`${prefix}affiliate-fujifilm-toner-wave2.js?v=mf-fuji-toner-20260914b`);
  const runtimeIndex = html.indexOf(`${prefix}affiliate-runtime.js?v=mf-affiliate-20260914c`);
  assert.ok(officeIndex >= 0 && wave3Index > officeIndex && wave4Index > wave3Index, `${label} must load KYOCERA waves after the base office ledger in order`);
  assert.ok(fujiIndex > wave4Index && runtimeIndex > fujiIndex, `${label} must compose KYOCERA before FUJIFILM and the runtime`);
  assert.ok(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275'), `${label} must retain the required AdSense script`);
}

vm.runInContext(wave4Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js#second-load' });
assert.equal(context.window.MANUALFINDER_AFFILIATE_CONFIG.officePrinterConsumables.length, 54, 'Wave 4 must be idempotent when loaded twice');

console.log('ManualFinder KYOCERA toner Wave 4 tests passed.');
