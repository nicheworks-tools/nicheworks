import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../affiliate-config.js', import.meta.url), 'utf8');
const officeSource = fs.readFileSync(new URL('../affiliate-office-consumables.js', import.meta.url), 'utf8');
const wave3Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave3.js', import.meta.url), 'utf8');
const wave45Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave4.js', import.meta.url), 'utf8');
const wave67Source = fs.readFileSync(new URL('../affiliate-kyocera-toner-wave6.js', import.meta.url), 'utf8');
const canonicalSource = fs.readFileSync(new URL('../data/manuals.wave1.03.js', import.meta.url), 'utf8');
const jaHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enHtml = fs.readFileSync(new URL('../en/index.html', import.meta.url), 'utf8');

const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
vm.runInContext(configSource, context, { filename: 'tools/manual-finder/affiliate-config.js' });
vm.runInContext(officeSource, context, { filename: 'tools/manual-finder/affiliate-office-consumables.js' });
vm.runInContext(wave3Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave3.js' });
vm.runInContext(wave45Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave4.js' });
vm.runInContext(wave67Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave6.js' });

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
const rows = Array.from(context.window.MANUALFINDER_KYOCERA_TONER_WAVE7_LEDGER || []);
const expected = new Map([
  ['LS-1135MFP', { code: 'TK-1141', source: 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco03/ls_1135mfp/price_table.html' }],
  ['LS-1035MFP/DP', { code: 'TK-1141', source: 'https://www.kyoceradocumentsolutions.co.jp/products/ecosys/eco03/ls_1035mfp/specs_1.html' }],
  ['LS-1128MFP', { code: 'TK-131', source: 'https://www.kyoceradocumentsolutions.co.jp/support/receive_recycle/pdf/form_recycle.pdf' }],
  ['LS-1028MFP', { code: 'TK-131', source: 'https://www.kyoceradocumentsolutions.co.jp/support/receive_recycle/pdf/form_recycle.pdf' }],
  ['LS-3140MFP', { code: 'TK-361', source: 'https://www.kyoceradocumentsolutions.co.jp/support/receive_recycle/pdf/form_recycle.pdf' }],
  ['LS-3640MFP', { code: 'TK-361', source: 'https://www.kyoceradocumentsolutions.co.jp/support/receive_recycle/pdf/form_recycle.pdf' }]
]);

assert.ok(config);
assert.equal(rows.length, 6, 'Wave 7 must stay bounded to six exact KYOCERA canonical models');
assert.equal(config.officePrinterConsumables.length, 74, '68 prior office mappings plus six Wave 7 rows');
assert.equal(config.printerConsumables.length, 99, '93 prior printer mappings plus six Wave 7 rows');

for (const [model, evidence] of expected) {
  assert.ok(canonicalSource.includes(`~${model}~`), `${model} must already exist in the canonical Wave 1 dataset`);
  const row = rows.find((item) => item.model === model);
  assert.ok(row, `${model} must be present in the Wave 7 ledger`);
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
  { maker: 'KYOCERA Document Solutions', model: 'KM-4035', category: 'プリンター・複合機' },
  { maker: 'KYOCERA', model: 'LS-1135MFP', category: 'プリンター・複合機' },
  { maker: 'KYOCERA Document Solutions', model: 'LS-1135MFP', category: 'その他' },
  { maker: 'KYOCERA Document Solutions', model: 'NOT-A-CANONICAL-MODEL', category: 'プリンター・複合機' }
]) {
  assert.deepEqual(Array.from(config.getConsumableOffers(args)), [], `${args.maker}|${args.model}|${args.category} must fail closed`);
}

for (const [label, html, prefix] of [['JA', jaHtml, './'], ['EN', enHtml, '../']]) {
  const wave45Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave4.js?v=mf-kyocera-toner-20260914c`);
  const wave67Index = html.indexOf(`${prefix}affiliate-kyocera-toner-wave6.js?v=mf-kyocera-toner-20260914a`);
  const fujiIndex = html.indexOf(`${prefix}affiliate-fujifilm-toner-wave2.js?v=mf-fuji-toner-20260914b`);
  const runtimeIndex = html.indexOf(`${prefix}affiliate-runtime.js?v=mf-affiliate-20260914c`);
  assert.ok(wave45Index >= 0 && wave67Index > wave45Index, `${label} must load the Waves 6–7 bundle after Waves 4–5`);
  assert.ok(fujiIndex > wave67Index && runtimeIndex > fujiIndex, `${label} must compose the Waves 6–7 bundle before FUJIFILM and the runtime`);
  assert.ok(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275'), `${label} must retain the required AdSense script`);
}

vm.runInContext(wave67Source, context, { filename: 'tools/manual-finder/affiliate-kyocera-toner-wave6.js#second-load' });
assert.equal(context.window.MANUALFINDER_AFFILIATE_CONFIG.officePrinterConsumables.length, 74, 'the bundled Waves 6–7 runtime must be idempotent when loaded twice');

console.log('ManualFinder KYOCERA toner Wave 7 tests passed.');
