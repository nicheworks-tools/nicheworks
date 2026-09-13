import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const fixtures = JSON.parse(read('tools/_shared/cosmetics-full-label-fixtures.json'));
const extra8 = JSON.parse(read('tools/inci-fastscan/data/ingredients-extra-8.json'));
const liteEnhancements = read('tools/cosmetic-ingredient-checker-lite/enhancements.js');
const liteSpec = read('tools/cosmetic-ingredient-checker-lite/SPEC.md');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const fastUi = read('tools/inci-fastscan/js/web_ui.js');
const fastSpec = read('tools/inci-fastscan/SPEC.md');
const affiliateConfig = read('tools/_shared/cosmetics-affiliate-config.js');
const workflow = read('.github/workflows/cosmetics-accuracy-benchmark.yml');

// PR13: high-frequency dictionary coverage must remain available to both tools.
const wave2Ingredients = [
  ['Sodium PCA', 'PCA-Na'],
  ['Urea', '尿素'],
  ['Ceramide NP', 'セラミドNP'],
  ['Cholesterol', 'コレステロール'],
  ['Caprylyl Glycol', 'カプリリルグリコール'],
  ['Hydroxyethylcellulose', 'ヒドロキシエチルセルロース'],
  ['Sodium Polyacrylate', 'ポリアクリル酸Na'],
  ['Polyglyceryl-10 Laurate', 'ラウリン酸ポリグリセリル-10']
];
for (const [en, jp] of wave2Ingredients) {
  const record = extra8.find((item) => item.en === en);
  check(Boolean(record), `wave 2 dictionary record missing: ${en}`);
  check(Array.isArray(record?.jp) && record.jp.includes(jp), `wave 2 Japanese name missing: ${en} / ${jp}`);
}

const fixtureIds = new Set(fixtures.map((item) => item.id));
for (const id of ['jp-barrier-wave2', 'en-barrier-wave2', 'jp-emulsion-wave2', 'en-emulsion-wave2']) {
  check(fixtureIds.has(id), `wave 2 full-label fixture missing: ${id}`);
}
check(fixtures.length >= 16, 'wave 2 must retain at least 16 full-label fixtures');

// PR14: reviewed Japanese naming variants remain shared rather than tool-specific.
for (const value of [
  'ポリアクリル酸ナトリウム',
  'ラウレス硫酸ナトリウム',
  '安息香酸ナトリウム',
  'ソルビン酸カリウム',
  '水酸化カリウム',
  'リン酸ナトリウム',
  'リン酸二ナトリウム',
  'pcaナトリウム'
]) {
  check(parser.includes(`"${value}"`), `shared Japanese label variant missing: ${value}`);
}
check(parser.includes('version: "1.8.0"') || /version: "1\.(?:[89]|[1-9][0-9])\./.test(parser), 'shared parser version predates wave 2 variants');

// PR15: OCR review hints stay conservative and never become automatic correction.
check(matcher.includes('ocr_confusion'), 'FastScan OCR confusion metadata missing');
check(matcher.includes('isCommonOcrConfusion'), 'FastScan OCR confusion guard missing');
for (const pair of ['i1', '1i', 'l1', '1l', 'il', 'li', 'o0', '0o']) {
  check(matcher.includes(`"${pair}"`), `FastScan OCR confusion pair missing: ${pair}`);
}
check(fastUi.includes('OCR文字誤認識の可能性'), 'FastScan OCR review warning missing');
check(fastUi.includes('Suggestions are never applied automatically'), 'FastScan must retain no-auto-apply wording');

// PR16: Lite remains the fast mobile review surface.
for (const state of ['all', 'unknown', 'review', 'matched']) {
  check(liteEnhancements.includes(`data-lite-filter="${state}"`), `Lite result filter missing: ${state}`);
}
check(liteEnhancements.includes('liteCopyUnknownBtn'), 'Lite unclassified-only copy control missing');
check(liteSpec.includes('Result filters only change visibility'), 'Lite SPEC must state filters do not change analysis');

// PR17: FastScan retains explicit review controls without auto rerun.
for (const state of ['all', 'matched', 'review', 'unknown']) {
  check(fastUi.includes(`data-result-filter="${state}"`), `FastScan result filter missing: ${state}`);
}
check(fastUi.includes('data-suggestion-value'), 'FastScan explicit candidate-apply control missing');
check(fastUi.includes('button.addEventListener("click"'), 'FastScan candidate application must remain user-triggered');
check(fastUi.includes('再解析も自動では行いません'), 'FastScan Japanese no-auto-rerun statement missing');
check(fastUi.includes('analysis will not rerun automatically'), 'FastScan English no-auto-rerun statement missing');
check(fastSpec.includes('does not automatically rerun ingredient analysis'), 'FastScan SPEC must retain no-auto-rerun contract');

// Amazon-ready invariant: this wave may improve either tool but must never activate monetization.
check(affiliateConfig.includes('enabled: false'), 'Amazon config must remain disabled');
check(affiliateConfig.includes('associateTag: ""'), 'Amazon associate tag must remain empty');
check(affiliateConfig.includes('placement: "after-summary"'), 'Lite Amazon placement changed');
check(affiliateConfig.includes('placement: "after-results"'), 'FastScan Amazon placement changed');
check((affiliateConfig.match(/links: Object\.freeze\(\[\]\)/g) || []).length === 2, 'Amazon link arrays must remain empty for both cosmetics tools');
check(!/https?:\/\/[^"']*amazon\./i.test(affiliateConfig), 'live Amazon URL must not exist before activation');
for (const spec of [liteSpec, fastSpec]) {
  check(spec.includes('enabled = false'), 'tool SPEC lost disabled Amazon activation contract');
  check(/raw ingredient|pasted ingredient|OCR output/i.test(spec), 'tool SPEC lost input privacy contract');
}

// The CI must continuously enforce every wave-2 behavioral regression plus the affiliate gate.
for (const checkFile of [
  'check-fastscan-ocr-confusion.mjs',
  'check-fastscan-result-controls.mjs',
  'check-cosmetics-cross-tool-release.mjs',
  'check-cosmetics-affiliate-contract.mjs'
]) {
  check(workflow.includes(checkFile), `cosmetics CI missing required wave 2 gate: ${checkFile}`);
}

if (failures.length) {
  console.error(`Cosmetics wave 2 release gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  wave: 2,
  tools: ['cosmetic-ingredient-checker-lite', 'inci-fastscan'],
  high_frequency_records: wave2Ingredients.length,
  full_label_fixtures: fixtures.length,
  lite_result_filters: 4,
  fastscan_result_filters: 4,
  ocr_auto_correction: false,
  amazon_enabled: false,
  amazon_activation_ready: true
}, null, 2));
