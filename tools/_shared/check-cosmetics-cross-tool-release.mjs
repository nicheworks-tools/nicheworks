import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const requiredFiles = [
  'tools/_shared/cosmetic-ingredient-parser.js',
  'tools/_shared/cosmetics-affiliate-config.js',
  'tools/_shared/cosmetics-affiliate-slot.js',
  'tools/_shared/check-cosmetics-affiliate-contract.mjs',
  'tools/_shared/check-cosmetics-accuracy-benchmark.mjs',
  'tools/_shared/check-cosmetics-full-label-benchmark.mjs',
  'tools/_shared/check-cosmetics-dictionary-quality.mjs',
  'tools/_shared/check-cosmetics-canonical-merge.mjs',
  'tools/_shared/check-fastscan-result-contract.mjs',
  'tools/_shared/cosmetics-full-label-fixtures.json',
  'tools/cosmetic-ingredient-checker-lite/index.html',
  'tools/cosmetic-ingredient-checker-lite/app.js',
  'tools/cosmetic-ingredient-checker-lite/enhancements.js',
  'tools/cosmetic-ingredient-checker-lite/ui-v2.css',
  'tools/cosmetic-ingredient-checker-lite/SPEC.md',
  'tools/inci-fastscan/index.html',
  'tools/inci-fastscan/enhancements.js',
  'tools/inci-fastscan/ui-v2.css',
  'tools/inci-fastscan/js/app.js',
  'tools/inci-fastscan/js/core_parser.js',
  'tools/inci-fastscan/js/core_matcher.js',
  'tools/inci-fastscan/js/core_analyze.js',
  'tools/inci-fastscan/js/core_ocr_post.js',
  'tools/inci-fastscan/js/web_ui.js',
  'tools/inci-fastscan/js/web_ocr.js',
  'tools/inci-fastscan/SPEC.md'
];
for (const file of requiredFiles) check(exists(file), `required cosmetics file missing: ${file}`);

const liteHtml = read('tools/cosmetic-ingredient-checker-lite/index.html');
const liteApp = read('tools/cosmetic-ingredient-checker-lite/app.js');
const liteEnhancements = read('tools/cosmetic-ingredient-checker-lite/enhancements.js');
const liteUiCss = read('tools/cosmetic-ingredient-checker-lite/ui-v2.css');
const liteSpec = read('tools/cosmetic-ingredient-checker-lite/SPEC.md');
const fastHtml = read('tools/inci-fastscan/index.html');
const fastApp = read('tools/inci-fastscan/js/app.js');
const fastUiCss = read('tools/inci-fastscan/ui-v2.css');
const fastSpec = read('tools/inci-fastscan/SPEC.md');
const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const resultUi = read('tools/inci-fastscan/js/web_ui.js');
const affiliateConfig = read('tools/_shared/cosmetics-affiliate-config.js');
const affiliateAdapter = read('tools/_shared/cosmetics-affiliate-slot.js');
const fixtures = JSON.parse(read('tools/_shared/cosmetics-full-label-fixtures.json'));

check(liteHtml.includes('<body class="lite-v2">'), 'Lite UI v2 body contract missing');
check(liteHtml.includes('class="tool-switch"'), 'Lite tool switch missing');
check(liteHtml.includes('data-lang="ja"') && liteHtml.includes('data-lang="en"'), 'Lite JP/EN controls missing');
check(liteHtml.includes('PASTE → CHECK → REVIEW'), 'Lite paste-first hero contract missing');
check(liteHtml.includes('/tools/inci-fastscan/'), 'Lite must link to FastScan for OCR/detail');
check(!liteHtml.includes('/assets/nicheworks-logo.png'), 'Lite must not restore the old NicheWorks logo header');
check(liteUiCss.includes('body.lite-v2 {\n  background: #fff;'), 'Lite UI v2 must retain a white page background');
check(liteUiCss.includes('body.lite-v2 .result-table tr,') && liteUiCss.includes('display: block;'), 'Lite mobile results must retain stacked/card-like rows');

check(fastHtml.includes('<body class="fastscan-v2 input-photo">'), 'FastScan UI v2/photo-default body contract missing');
check(fastHtml.includes('class="tool-switch"'), 'FastScan tool switch missing');
check(fastHtml.includes('data-lang="ja"') && fastHtml.includes('data-lang="en"'), 'FastScan JP/EN controls missing');
check(fastHtml.includes('PHOTO / OCR / DETAIL'), 'FastScan photo/OCR-first hero contract missing');
check(fastHtml.includes('data-input-mode="photo"') && fastHtml.includes('data-input-mode="text"'), 'FastScan photo/text mode controls missing');
check(fastHtml.includes("setMode('photo');"), 'FastScan must initialize in photo mode');
check(fastHtml.includes('機械翻訳ではありません') && fastHtml.includes('this is not machine translation'), 'FastScan Japanese-label mode must remain explicitly non-translation');
check(fastHtml.includes('/tools/cosmetic-ingredient-checker-lite/'), 'FastScan must link back to Lite');
check(!fastHtml.includes('/assets/nicheworks-logo.png'), 'FastScan must not restore the old NicheWorks logo header');
check(fastUiCss.includes('body.fastscan-v2 {\n  background: #fff;'), 'FastScan UI v2 must retain a white page background');

check(liteHtml.includes('id="inciInput"'), 'Lite must remain paste-first');
check(!/tesseract/i.test(liteHtml + liteApp), 'Lite must not absorb the OCR engine');
check(!liteHtml.includes('id="ocr-file"'), 'Lite must remain OCR-free');
check(liteApp.includes('ROLE_DESCRIPTIONS'), 'Lite must expose role descriptions');
check(liteEnhancements.includes('役割情報あり'), 'Lite public summary must be role-oriented');
check(!liteEnhancements.includes('辞書認識率'), 'Lite dictionary-coverage metric must not return');

check(fastHtml.includes('id="ocr-file-fast"'), 'FastScan EN OCR input missing');
check(fastHtml.includes('id="ocr-file"'), 'FastScan JP OCR input missing');
check(fastHtml.includes('id="fast-ocr-progress"'), 'FastScan EN OCR progress missing');
check(fastHtml.includes('id="jb-ocr-progress"'), 'FastScan JP OCR progress missing');
check(/tesseract\.js/i.test(fastHtml), 'FastScan OCR library reference missing');
check(parser.includes('/tools/inci-fastscan/enhancements.js'), 'FastScan OCR enhancement bootstrap missing');
check(parser.includes('/tools/cosmetic-ingredient-checker-lite/enhancements.js'), 'Lite result enhancement bootstrap missing');

check(liteHtml.includes('/tools/_shared/cosmetic-ingredient-parser.js'), 'Lite shared parser script missing');
check(fastHtml.includes('/tools/_shared/cosmetic-ingredient-parser.js'), 'FastScan shared parser script missing');
const dictFiles = ['ingredients.json', ...Array.from({ length: 8 }, (_, i) => `ingredients-extra-${i + 1}.json`)];
for (const file of dictFiles) {
  check(liteApp.includes(`/tools/inci-fastscan/data/${file}`), `Lite missing shared dictionary file: ${file}`);
  check(fastApp.includes(`data/${file}`), `FastScan missing shared dictionary file: ${file}`);
}
check(parser.includes('mergeDictionaryRecords'), 'shared canonical merge helper missing');
check(parser.includes('ambiguousExactKeys'), 'ambiguous exact-name protection missing');

check(matcher.includes('match_kind'), 'FastScan exact match route metadata missing internally');
check(matcher.includes('matched_name'), 'FastScan matched-name metadata missing internally');
check(resultUi.includes('主な役割'), 'FastScan role-first public result label missing');
check(resultUi.includes('情報未登録'), 'FastScan unavailable-information label missing');
check(resultUi.includes('ROLE_DESCRIPTIONS'), 'FastScan role descriptions missing');
check(!resultUi.includes('function getMatchRouteLabel'), 'FastScan must not expose match route as public result value');
check(!resultUi.includes('rt("matchRoute"'), 'FastScan must not render match route');
check(!resultUi.includes('rt("matchedName"'), 'FastScan must not render matched spelling debug detail');
check(!resultUi.includes('一般的に使用'), 'legacy safety-framed common label returned');
check(!resultUi.includes('注意して確認'), 'legacy safety-framed caution label returned');

for (const [name, spec] of [['Lite', liteSpec], ['FastScan', fastSpec]]) {
  check(spec.includes('Specification status: `complete`'), `${name} SPEC must remain complete`);
  check(/raw ingredient|raw analysis|raw ingredient text|pasted ingredient/i.test(spec), `${name} SPEC must retain raw-input privacy language`);
  check(/tagged_search|fixed Amazon search/i.test(spec), `${name} SPEC must document the live fixed-search contract`);
}
check(liteSpec.includes('bilingual single-page'), 'Lite SPEC must retain bilingual single-page language mode');
check(fastSpec.includes('bilingual single-page'), 'FastScan SPEC must retain bilingual single-page language mode');
check(fastSpec.includes('photo/OCR') || fastSpec.includes('photo/image OCR'), 'FastScan SPEC must retain photo/OCR-first purpose');

check(affiliateConfig.includes('enabled: true'), 'Amazon config must be active');
check(affiliateConfig.includes('trackingMode: "tagged_search"'), 'Amazon config must use tagged_search mode');
check(affiliateConfig.includes('displayMode: "post_result_category_choice"'), 'Amazon config must remain post-result category choice');
check(affiliateConfig.includes('const ASSOCIATE_TAG = "nicheworks09-22"'), 'verified Associates tag missing');
check(affiliateConfig.includes('placement: "after-summary"'), 'Lite affiliate placement changed');
check(affiliateConfig.includes('placement: "after-results"'), 'FastScan affiliate placement changed');
check((affiliateConfig.match(/links: fixedSearchLinks/g) || []).length === 2, 'both cosmetics tools must use the fixed search set');
const affiliateCategoryKeys = ['toner', 'serum', 'moisturizer', 'cleanser', 'cleansing', 'sunscreen', 'bodycare'];
for (const key of affiliateCategoryKeys) check(affiliateConfig.includes(`key: "${key}"`), `fixed affiliate category missing: ${key}`);
check(affiliateAdapter.includes('function resultsReady(tool)'), 'affiliate chooser must remain result-gated');
check(affiliateAdapter.includes('#itemsTableBody tr'), 'Lite result gate missing');
check(affiliateAdapter.includes('#fast-results .result-card, #jb-results .result-card'), 'FastScan result gate missing');

check(Array.isArray(fixtures) && fixtures.length >= 12, 'full-label fixture set must retain at least 12 cases');
check(new Set(fixtures.map((item) => item.category)).size >= 6, 'full-label fixtures must retain at least six product categories');
check(fixtures.some((item) => item.language === 'ja'), 'Japanese full-label fixture missing');
check(fixtures.some((item) => item.language === 'en'), 'English full-label fixture missing');
check(fixtures.some((item) => item.language === 'mixed'), 'mixed-language full-label fixture missing');

if (failures.length) {
  console.error(`Cosmetics cross-tool release gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  tools: ['cosmetic-ingredient-checker-lite', 'inci-fastscan'],
  ui_contract: 'cosmetics-v2-role-first',
  lite_paste_first: true,
  fastscan_photo_first: true,
  public_results: 'ingredient-role-first',
  bilingual_ui: true,
  white_background: true,
  legacy_logo_header: false,
  shared_dictionary_files: dictFiles.length,
  full_label_fixtures: fixtures.length,
  amazon_enabled: true,
  amazon_tracking_mode: 'tagged_search',
  amazon_display_mode: 'post_result_category_choice',
  amazon_fixed_categories: affiliateCategoryKeys.length,
  release_gate: 'amazon-live-quality-wave'
}, null, 2));
