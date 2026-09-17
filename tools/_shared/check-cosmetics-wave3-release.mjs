import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const fixtures = JSON.parse(read('tools/_shared/cosmetics-full-label-fixtures.json'));
const liteEnhancements = read('tools/cosmetic-ingredient-checker-lite/enhancements.js');
const liteSpec = read('tools/cosmetic-ingredient-checker-lite/SPEC.md');
const fastAnalyze = read('tools/inci-fastscan/js/core_analyze.js');
const fastUi = read('tools/inci-fastscan/js/web_ui.js');
const fastSpec = read('tools/inci-fastscan/SPEC.md');
const affiliateConfig = read('tools/_shared/cosmetics-affiliate-config.js');
const affiliateAdapter = read('tools/_shared/cosmetics-affiliate-slot.js');
const workflow = read('.github/workflows/cosmetics-accuracy-benchmark.yml');

check(fixtures.length >= 24, 'wave 3 must retain at least 24 complete-label fixtures');
const categories = new Set(fixtures.map((fixture) => fixture.category));
check(categories.size >= 12, 'wave 3 must retain at least 12 product categories');
for (const category of ['sunscreen', 'conditioner', 'active-serum', 'color-cosmetic']) {
  check(categories.has(category), `wave 3 category missing: ${category}`);
}
for (const id of [
  'jp-sunscreen-wave3',
  'en-sunscreen-wave3',
  'jp-conditioner-wave3',
  'en-conditioner-wave3',
  'jp-active-serum-wave3',
  'en-active-serum-wave3',
  'jp-color-cosmetic-wave3',
  'en-color-cosmetic-wave3'
]) {
  check(fixtures.some((fixture) => fixture.id === id), `wave 3 fixture missing: ${id}`);
}

for (const token of [
  'CANONICAL_EQUIVALENTS',
  '"bemotrizinol": "bis-ethylhexyloxyphenol methoxyphenyl triazine"',
  '"bisoctrizole": "methylene bis-benzotriazolyl tetramethylbutylphenol"',
  '"ci 77891": "titanium dioxide"',
  '"ci 77019": "mica"',
  'canonicalIdentityKey'
]) {
  check(parser.includes(token), `canonical identity contract missing: ${token}`);
}
for (const ambiguous of ['"aha"', '"bha"', '"pha"', '"iron oxides"', '"酸化鉄"']) {
  check(parser.includes(ambiguous), `ambiguous exact-key protection missing: ${ambiguous}`);
}

for (const token of [
  'repairWrappedIngredientFragments',
  'buildKnownIngredientNameMap',
  'findExactWrappedJoin',
  'repairs: repaired.repairs',
  'currentKnown && nextKnown'
]) {
  check(fastAnalyze.includes(token), `FastScan OCR exact line repair missing: ${token}`);
}
check(fastSpec.includes('OCR cleanup preserves candidate boundaries'), 'FastScan SPEC lost conservative OCR-boundary contract');
check(fastSpec.includes('Exact OCR line repair only joins fragments when the combined text exactly matches a maintained dictionary key'), 'FastScan SPEC lost exact-only OCR line repair contract');

for (const token of [
  'liteCategoryFilter',
  'dataset.liteCategory',
  'rowCategoryMatches',
  '表示中をコピー',
  '情報未登録をコピー'
]) {
  check(liteEnhancements.includes(token), `Lite wave 3 navigation missing: ${token}`);
}
check(!liteEnhancements.includes('辞書認識率'), 'Lite Wave 3 UI must not restore dictionary-recognition percentage');
check(liteEnhancements.includes('役割情報あり'), 'Lite Wave 3 UI must remain role-first');
check(liteSpec.includes('functional-category filter') || liteSpec.includes('functional category'), 'Lite SPEC lost category-filter contract');

for (const token of [
  'fastscan-review-queue',
  'data-review-nav="prev"',
  'data-review-nav="next"',
  'reviewCards = () =>',
  'card.scrollIntoView',
  'card.focus',
  'reviewIndex = -1'
]) {
  check(fastUi.includes(token), `FastScan review queue missing: ${token}`);
}
check(fastUi.includes('ROLE_DESCRIPTIONS'), 'FastScan Wave 3 public result must remain role-first');
check(!fastUi.includes('function getMatchRouteLabel'), 'FastScan must not restore public match-route debugging');
check(!fastUi.includes('btn-fast-check.click('), 'review queue must not auto-rerun FastScan analysis');
check(!fastUi.includes('btn-jb-check.click('), 'review queue must not auto-rerun Japanese analysis');
check(fastSpec.includes('Review-queue controls only move focus'), 'FastScan SPEC lost review-queue no-edit contract');

check(affiliateConfig.includes('enabled: true'), 'Amazon config must stay active');
check(affiliateConfig.includes('trackingMode: "tagged_search"'), 'Amazon tracking mode must be tagged_search');
check(affiliateConfig.includes('displayMode: "post_result_category_choice"'), 'Amazon chooser must remain post-result only');
check(affiliateConfig.includes('const ASSOCIATE_TAG = "nicheworks09-22"'), 'verified Associates tag missing');
check(affiliateConfig.includes('associateTag: ASSOCIATE_TAG'), 'affiliate config must use the verified Associates tag constant');
check(!affiliateConfig.includes('placement: "after-summary"'), 'Cosmetics Amazon placement must not return to after-summary');
check((affiliateConfig.match(/placement: "after-results"/g) || []).length === 2, 'both cosmetics Amazon placements must stay after-results');
check((affiliateConfig.match(/links: fixedSearchLinks/g) || []).length === 2, 'both cosmetics tools must retain the fixed search set');
const affiliateCategoryKeys = ['toner', 'serum', 'moisturizer', 'cleanser', 'cleansing', 'sunscreen', 'bodycare'];
for (const key of affiliateCategoryKeys) {
  check(affiliateConfig.includes(`key: "${key}"`), `fixed affiliate category missing: ${key}`);
}
check((affiliateConfig.match(/tag=nicheworks09-22/g) || []).length === affiliateCategoryKeys.length, 'every fixed search must carry the configured Associates tag');
check(affiliateAdapter.includes('function resultsReady(tool)'), 'affiliate chooser must remain result-gated');
check(!affiliateConfig.includes('amzn.to/4xNbcDO'), 'retired single Special Link returned');
for (const spec of [liteSpec, fastSpec]) {
  check(/tagged_search|fixed Amazon search/i.test(spec), 'tool SPEC lost active fixed-search contract');
  check(/raw ingredient|pasted ingredient|OCR output/i.test(spec), 'tool SPEC lost input privacy contract');
}

for (const checkFile of [
  'check-cosmetics-full-label-benchmark.mjs',
  'check-cosmetics-canonical-equivalents.mjs',
  'check-fastscan-ocr-line-repair.mjs',
  'check-fastscan-ocr-robustness.mjs',
  'check-lite-wave3-navigation.mjs',
  'check-fastscan-review-queue.mjs',
  'check-cosmetics-wave2-release.mjs',
  'check-cosmetics-affiliate-contract.mjs'
]) {
  check(workflow.includes(checkFile), `cosmetics CI missing required wave 3 gate: ${checkFile}`);
}

if (failures.length) {
  console.error(`Cosmetics wave 3 release gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  wave: 3,
  tools: ['cosmetic-ingredient-checker-lite', 'inci-fastscan'],
  full_label_fixtures: fixtures.length,
  product_categories: categories.size,
  canonical_equivalence: true,
  ocr_exact_line_repair: true,
  ocr_source_backed_robustness: true,
  lite_long_result_navigation: true,
  fastscan_review_queue: true,
  public_results: 'ingredient-role-first',
  amazon_enabled: true,
  amazon_tracking_mode: 'tagged_search',
  amazon_display_mode: 'post_result_category_choice',
  amazon_fixed_categories: affiliateCategoryKeys.length
}, null, 2));
