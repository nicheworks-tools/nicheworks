import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave3Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave3.js', import.meta.url), 'utf8');
const supplementalSource = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave4.js', import.meta.url), 'utf8');
const canonicalSource = fs.readFileSync(new URL('../data/manuals.wave1.02.js', import.meta.url), 'utf8');
const jaHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enHtml = fs.readFileSync(new URL('../en/index.html', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js' });
vm.runInContext(supplementalSource, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE5_LEDGER || []);
const expected = new Map([
  ['TASKalfa 2550ci', { codes: ['TK-8316C', 'TK-8316M', 'TK-8316Y', 'TK-8316K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta2550ci_qg.pdf' }],
  ['TASKalfa 3050ci', { codes: ['TK-8306C', 'TK-8306M', 'TK-8306Y', 'TK-8306K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf' }],
  ['TASKalfa 3550ci', { codes: ['TK-8306C', 'TK-8306M', 'TK-8306Y', 'TK-8306K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf' }],
  ['TASKalfa 4550ci', { codes: ['TK-8506C', 'TK-8506M', 'TK-8506Y', 'TK-8506K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf' }],
  ['TASKalfa 5550ci', { codes: ['TK-8506C', 'TK-8506M', 'TK-8506Y', 'TK-8506K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5550ci_series_qg.pdf' }],
  ['TASKalfa 6550ci', { codes: ['TK-8706C', 'TK-8706M', 'TK-8706Y', 'TK-8706K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf' }],
  ['TASKalfa 7550ci', { codes: ['TK-8706C', 'TK-8706M', 'TK-8706Y', 'TK-8706K'], source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_7550ci_6550ci_qg.pdf' }],
  ['ECOSYS M6526cidn', { codes: ['TK-591K', 'TK-591Y', 'TK-591M', 'TK-591C'], source: 'https://www.kyoceradocumentsolutions.co.jp/products/other/toner_old.html' }],
  ['ECOSYS M6526cdn', { codes: ['TK-591K', 'TK-591Y', 'TK-591M', 'TK-591C'], source: 'https://www.kyoceradocumentsolutions.co.jp/products/other/toner_old.html' }]
]);

assert.ok(config);
assert.equal(rows.length, 9, 'Wave 5 must stay bounded to nine exact KYOCERA canonical models');
assert.equal(config.officePrinterConsumables.length, 63, 'Wave 5 must extend office mappings by exactly nine rows');
assert.equal(config.printerConsumables.length, 88, 'Wave 5 must extend printer mappings by exactly nine rows');

for (const [model, evidence] of expected) {
  assert.ok(canonicalSource.includes(`~${model}~`), `${model} must already exist in the canonical Wave 1 dataset`);
  const row = rows.find((item) => item.model === model);
  assert.ok(row, `${model} must be present in the Wave 5 ledger`);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-14');
  assert.equal(row.sourceUrl, evidence.source);
  assert.deepEqual(Array.from(row.tonerCodes), evidence.codes);

  const offers = config.getConsumableOffers({ maker: 'KYOCERA Document Solutions', model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${model} must expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${model} トナー`);
  const expectedUrl = new URL('https://www.amazon.co.jp/s');
  expectedUrl.searchParams.set('k', `KYOCERA ${model} トナー`);
  expectedUrl.searchParams.set('tag', 'nicheworks09-22');
  assert.equal(offers[0].url, expectedUrl.toString());
  assert.deepEqual(Array.from(offers[0].verifiedCodes), evidence.codes);
  assert.equal(offers[0].sourceUrl, evidence.source);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 205c', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 255c', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 250ci', category: 'プリンター・複合機' },
  { maker: 'KYOCERA', model: 'TASKalfa 2550ci', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 2550ci', category: 'その他' },
  { maker: 'KYOCERA Document Solutions', model: 'NOT-A-CANONICAL-MODEL', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], `${args.maker}|${args.model}|${args.category} must fail closed`);
}

for (const [label, html, prefix] of [['JA', jaHtml, './'], ['EN', enHtml, '../']]) {
  assert.ok(html.includes(`${prefix}affiliate-kyocera-toner-wave4.js?v=mf-kyocera-toner-20260914c`), `${label} must load the Wave 5-capable KYOCERA supplemental bundle with the new cache key`);
  assert.ok(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275'), `${label} must retain the required AdSense script`);
}

vm.runInContext(supplementalSource, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js#second-load' });
assert.equal(context.window.MANUALFINDER_AFFILIATE_CONFIG.officePrinterConsumables.length, 63, 'Wave 5-capable supplemental bundle must be idempotent');

console.log('ManualFinder KYOCERA toner Wave 5 tests passed.');
