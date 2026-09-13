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
const workflow = read('.github/workflows/cosmetics-accuracy-benchmark.yml');

// PR19: broadened complete-label coverage must remain representative and measurable.
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

// PR20: maintained equivalent canonical identities must resolve to one shared key.
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

// PR21: OCR line-wrap repair remains exact-only and never becomes fuzzy auto-correction.
for (const token of [
  'repairWrappedIngredientFragments',
  'buildKnownIngredientNameMap',
  'findExactWrappedJoin',
  'repairs: repaired.repairs'
]) {
  check(fastAnalyze.includes(token), `FastScan OCR exact line repair missing: ${token}`);
}
check(fastSpec.includes('Exact OCR line repair only joins fragments when the repaired text exactly matches a maintained dictionary key'), 'FastScan SPEC lost exact-only OCR line repair contract');

// PR22: Lite remains a fast long-result review surface.
for (const token of [
  'liteCategoryFilter',
  'data-lite-category',
  'rowCategoryMatches',
  '表示中をコピー',
  '未分類をコピー'
]) {
  check(liteEnhancements.includes(token), `Lite wave 3 navigation missing: ${token}`);
}
check(liteSpec.includes('functional-category filter') || liteSpec.includes('functional category'), 'Lite SPEC lost category-filter contract');

// PR23: FastScan review queue moves focus only among visible review/unmatched cards.
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
check(!fastUi.includes('btn-fast-check.click('), 'review queue must not auto-rerun FastScan analysis');
check(!fastUi.includes('btn-jb-check.click('), 'review queue must not auto-rerun Japanese analysis');
check(fastSpec.includes('Review-queue controls only move focus'), 'FastScan SPEC lost review-queue no-edit contract');

// Amazon-ready invariant: Wave 3 may improve either tool but must not activate monetization.
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

// CI must continuously enforce every Wave 3 regression plus the frozen affiliate contract.
for (const checkFile of [
  'check-cosmetics-full-label-benchmark.mjs',
  'check-cosmetics-canonical-equivalents.mjs',
  'check-fastscan-ocr-line-repair.mjs',
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
  lite_long_result_navigation: true,
  fastscan_review_queue: true,
  amazon_enabled: false,
  amazon_activation_ready: true
}, null, 2));
