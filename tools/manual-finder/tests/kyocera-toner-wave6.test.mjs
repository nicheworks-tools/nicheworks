import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave3Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave3.js', import.meta.url), 'utf8');
const wave45Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave4.js', import.meta.url), 'utf8');
const wave6Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave6.js', import.meta.url), 'utf8');
const canonicalSource = fs.readFileSync(new URL('../data/manuals.wave1.02.js', import.meta.url), 'utf8');
const jaHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enHtml = fs.readFileSync(new URL('../en/index.html', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js' });
vm.runInContext(wave45Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js' });
vm.runInContext(wave6Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave6.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE6_LEDGER || []);
const wave7Rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE7_LEDGER || []);
const expected = new Map([
  ['TASKalfa 3500i', { code: 'TK-6306', source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf' }],
  ['TASKalfa 4500i', { code: 'TK-6306', source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf' }],
  ['TASKalfa 5500i', { code: 'TK-6306', source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta5500i_series_qg.pdf' }],
  ['TASKalfa 6500i', { code: 'TK-6706', source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_8000i_6500i_qg.pdf' }],
  ['TASKalfa 8000i', { code: 'TK-6706', source: 'https://www.kyoceradocumentsolutions.co.jp/support/prod_inf/pdf_m/m_ta_8000i_6500i_qg.pdf' }]
]);

assert.ok(config);
assert.equal(rows.length, 5, 'Wave 6 must stay bounded to five exact KYOCERA canonical models');
assert.equal(wave7Rows.length, 6, 'the bundled Wave 7 ledger must remain a separate six-row contract');
assert.equal(config.officePrinterConsumables.length, 74, '63 prior office mappings plus five Wave 6 and six Wave 7 rows');
assert.equal(config.printerConsumables.length, 99, '88 prior printer mappings plus five Wave 6 and six Wave 7 rows');

for (const [model, evidence] of expected) {
  assert.ok(canonicalSource.includes(`~${model}~`), `${model} must already exist in the canonical Wave 1 dataset`);
  const row = rows.find((item) => item.model === model);
  assert.ok(row, `${model} must be present in the Wave 6 ledger`);
  assert.equal(row.maker, 'KYOCERA Document Solutions');
  assert.equal(row.searchMaker, 'KYOCERA');
  assert.equal(row.verifiedAt, '2026-09-14');
  assert.equal(row.sourceUrl, evidence.source);
  assert.deepEqual(Array.from(row.tonerCodes), [evidence.code]);

  const offers = config.getConsumableOffers({ maker: 'KYOCERA Document Solutions', model, category: 'プリンター・複合機' });
  assert.equal(offers.length, 1, `${model} must expose one concise toner handoff`);
  assert.equal(offers[0].kind, 'toner_search');
  assert.equal(offers[0].query, `KYOCERA ${model} トナー`);
  const expectedUrl = new URL('https://www.amazon.co.jp/s');
  expectedUrl.searchParams.set('k', `KYOCERA ${model} トナー`);
  expectedUrl.searchParams.set('tag', 'nicheworks09-22');
  assert.equal(offers[0].url, expectedUrl.toString());
  assert.deepEqual(Array.from(offers[0].verifiedCodes), [evidence.code]);
  assert.equal(offers[0].sourceUrl, evidence.source);
}

for (const args of [
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 255', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 305', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 420i', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 520i', category: 'プリンター・複合機' },
  { maker: 'KYOCERA', model: 'TASKalfa 3500i', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'TASKalfa 3500i', category: 'その他' },
  { maker: 'KYOCERA Document Solutions', model: 'NOT-A-CANONICAL-MODEL', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], `${args.maker}|${args.model}|${args.category} must fail closed`);
}

for (const [label, html, prefix] of [['JA', jaHtml, './'], ['EN', enHtml, '../']]) {
  const wave45Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave4.js?v=mf-kyocera-toner-20260914c`);
  const wave6Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave6.js?v=mf-kyocera-toner-20260914a`);
  const fujiIndex = html.indexOf(`${prefix}affiliate-fujifilm-toner-wave2.js?v=mf-fuji-toner-20260914b`);
  const runtimeIndex = html.indexOf(`${prefix}affiliate-runtime.js?v=mf-affiliate-20260914c`);
  assert.ok(wave45Index >= 0 && wave6Index > wave45Index, `${label} must load the Waves 6–7 bundle after the earlier KYOCERA supplemental bundle`);
  assert.ok(fujiIndex > wave6Index && runtimeIndex > fujiIndex, `${label} must compose the Waves 6–7 bundle before FUJIFILM and the runtime`);
  assert.ok(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275'), `${label} must retain the required AdSense script`);
}

vm.runInContext(wave6Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave6.js#second-load' });
assert.equal(context.window.MANUALFINDER_AFFILIATE_CONFIG.officePrinterConsumables.length, 74, 'the Waves 6–7 bundle must be idempotent when loaded twice');

console.log('ManualFinder KYOCERA toner Wave 6 tests passed.');
