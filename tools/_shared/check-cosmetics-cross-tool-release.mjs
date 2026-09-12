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
  'tools/cosmetic-ingredient-checker-lite/SPEC.md',
  'tools/inci-fastscan/index.html',
  'tools/inci-fastscan/enhancements.js',
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
const liteSpec = read('tools/cosmetic-ingredient-checker-lite/SPEC.md');
const fastHtml = read('tools/inci-fastscan/index.html');
const fastApp = read('tools/inci-fastscan/js/app.js');
const fastSpec = read('tools/inci-fastscan/SPEC.md');
const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const resultUi = read('tools/inci-fastscan/js/web_ui.js');
const affiliateConfig = read('tools/_shared/cosmetics-affiliate-config.js');
const fixtures = JSON.parse(read('tools/_shared/cosmetics-full-label-fixtures.json'));

// Product-role separation.
check(liteHtml.includes('id="inciInput"'), 'Lite must remain paste-first');
check(liteHtml.includes('/tools/inci-fastscan/'), 'Lite must link to FastScan for OCR/detail');
check(!/tesseract/i.test(liteHtml + liteApp), 'Lite must not absorb the OCR engine');
check(!liteHtml.includes('id="ocr-file"'), 'Lite must remain OCR-free');

check(fastHtml.includes('id="ocr-file-fast"'), 'FastScan EN OCR input missing');
check(fastHtml.includes('id="ocr-file"'), 'FastScan JP OCR input missing');
check(fastHtml.includes('id="fast-ocr-progress"'), 'FastScan EN OCR progress missing');
check(fastHtml.includes('id="jb-ocr-progress"'), 'FastScan JP OCR progress missing');
check(/tesseract\.js/i.test(fastHtml), 'FastScan OCR library reference missing');
check(fastHtml.includes('/tools/cosmetic-ingredient-checker-lite/'), 'FastScan must link back to Lite');
check(parser.includes('/tools/inci-fastscan/enhancements.js'), 'FastScan OCR enhancement bootstrap missing');
check(parser.includes('/tools/cosmetic-ingredient-checker-lite/enhancements.js'), 'Lite result enhancement bootstrap missing');

// Shared parser/dictionary contract.
check(liteHtml.includes('/tools/_shared/cosmetic-ingredient-parser.js'), 'Lite shared parser script missing');
check(fastHtml.includes('/tools/_shared/cosmetic-ingredient-parser.js'), 'FastScan shared parser script missing');
const dictFiles = ['ingredients.json', ...Array.from({ length: 8 }, (_, i) => `ingredients-extra-${i + 1}.json`)];
for (const file of dictFiles) {
  check(liteApp.includes(`/tools/inci-fastscan/data/${file}`), `Lite missing shared dictionary file: ${file}`);
  check(fastApp.includes(`data/${file}`), `FastScan missing shared dictionary file: ${file}`);
}
check(parser.includes('mergeDictionaryRecords'), 'shared canonical merge helper missing');
check(parser.includes('ambiguousExactKeys'), 'ambiguous exact-name protection missing');

// Result semantics.
check(matcher.includes('match_kind'), 'FastScan exact match route metadata missing');
check(matcher.includes('matched_name'), 'FastScan matched-name metadata missing');
check(resultUi.includes('辞書一致'), 'FastScan dictionary-match label missing');
check(resultUi.includes('追加確認'), 'FastScan additional-review label missing');
check(resultUi.includes('未一致'), 'FastScan unmatched label missing');
check(resultUi.includes('安全性・刺激性・製品適合性の判定ではありません'), 'FastScan non-safety result disclaimer missing');
check(!resultUi.includes('一般的に使用'), 'legacy safety-framed common label returned');
check(!resultUi.includes('注意して確認'), 'legacy safety-framed caution label returned');

// Specs and privacy contract.
for (const [name, spec] of [['Lite', liteSpec], ['FastScan', fastSpec]]) {
  check(spec.includes('Specification status: `complete`'), `${name} SPEC must remain complete`);
  check(/raw ingredient|raw analysis|raw ingredient text|pasted ingredient/i.test(spec), `${name} SPEC must retain raw-input privacy language`);
  check(/Amazon Associates is not active|enabled = false/i.test(spec), `${name} SPEC must retain inactive Amazon state`);
}

// Amazon activation invariant.
check(affiliateConfig.includes('enabled: false'), 'Amazon config must remain disabled');
check(affiliateConfig.includes('associateTag: ""'), 'Amazon associate tag must remain empty');
check(affiliateConfig.includes('placement: "after-summary"'), 'Lite affiliate placement changed');
check(affiliateConfig.includes('placement: "after-results"'), 'FastScan affiliate placement changed');
check(!/https?:\/\/[^"']*amazon\./i.test(affiliateConfig), 'live Amazon URL must not exist before activation');

// Benchmark/release quality floor.
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
  shared_dictionary_files: dictFiles.length,
  full_label_fixtures: fixtures.length,
  amazon_enabled: false,
  release_gate: 'amazon-ready-improvement-wave'
}, null, 2));
