import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const lite = read('tools/cosmetic-ingredient-checker-lite/app.js');
const liteEnhancements = read('tools/cosmetic-ingredient-checker-lite/enhancements.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const fastscanGuideJa = read('tools/inci-fastscan/howto/index.html');
const fastscanGuideEn = read('tools/inci-fastscan/howto/en/index.html');
const dictionaryPolicy = read('tools/inci-fastscan/DICTIONARY.md');
const testingGuide = read('tools/inci-fastscan/docs/testing.md');
const contract = read('tools/_shared/COSMETICS_LEGACY_SAFETY_ISOLATION.md');

// Lite now exposes ingredient role/information availability, not a legacy safety-derived review state.
assert.ok(lite.includes('ROLE_DESCRIPTIONS'), 'Lite role descriptions must exist');
assert.ok(lite.includes('function roleLabel'), 'Lite role label function must exist');
assert.ok(lite.includes("statusKey: !match && !flags.length ? 'unknown' : 'matched'"), 'Lite public state must be role-information availability only');
assert.ok(!lite.includes('function isReviewCandidate'), 'Lite must not restore the obsolete public review-candidate state');
assert.ok(!/match\.safety|item\.safety/.test(lite), 'Lite public results must not be driven by legacy safety metadata');
assert.ok(lite.includes('sharedParser.mergeDictionaryRecords(loaded)'), 'Lite must use the same canonical merge layer as FastScan');
assert.ok(liteEnhancements.includes('役割情報あり'), 'Lite public UI must describe available role information');
assert.ok(liteEnhancements.includes('情報未登録'), 'Lite public UI must describe unavailable role information');
assert.ok(!liteEnhancements.includes('辞書認識率'), 'Lite public UI must not restore dictionary coverage as user value');

const foundStart = matcher.indexOf('function found');
const foundEnd = matcher.indexOf('\n}\n', foundStart);
assert.ok(foundStart >= 0 && foundEnd > foundStart, 'FastScan found() result builder must exist');
const foundFunction = matcher.slice(foundStart, foundEnd + 3);
assert.ok(!foundFunction.includes('safety:'), 'FastScan result objects must not expose legacy safety metadata');
assert.ok(foundFunction.includes('category: item.category'), 'FastScan must retain neutral functional category metadata');

// FastScan public results are role-first and keep safety limitations explicit without presenting ranks.
assert.ok(ui.includes('主な役割'), 'FastScan public results must expose ingredient roles');
assert.ok(ui.includes('情報未登録'), 'FastScan public results must expose unavailable role information');
assert.ok(ui.includes('濃度や製品全体の安全性を判定するものではありません'), 'FastScan must retain the Japanese non-safety limitation');
assert.ok(ui.includes('does not determine concentration or overall product safety'), 'FastScan must retain the English non-safety limitation');
assert.ok(!ui.includes('function getMatchRouteLabel'), 'FastScan public UI must not restore matching-engine route labels');
assert.ok(!ui.includes('rt("matchRoute"'), 'FastScan public UI must not render match-route metadata');
assert.ok(!ui.includes('rt("matchedName"'), 'FastScan public UI must not render matched-spelling debug metadata');

// Existing public guides must still avoid the retired SAFE / CAUTION / RISK and machine-translation product model.
for (const forbidden of [
  '成分を貼る / 撮る → 翻訳 → 安全性の目安',
  '日本語成分を英語に翻訳し、同じ基準で安全性ランクを表示',
  '<code>Check Safety</code>',
  '<code>Translate &amp; Check Safety</code>',
  'ランクは 3段階'
]) {
  assert.ok(!fastscanGuideJa.includes(forbidden), `FastScan Japanese public guide revived legacy safety/translation copy: ${forbidden}`);
}
for (const forbidden of [
  'get SAFE/CAUTION/RISK hints',
  'Fast safety check for English ingredient lists',
  'Translate Japanese (J-Beauty) ingredients to English, then check safety',
  '<code>Check Safety</code>',
  '<code>Translate &amp; Check Safety</code>',
  'Ranks: <code>SAFE</code>'
]) {
  assert.ok(!fastscanGuideEn.includes(forbidden), `FastScan English public guide revived legacy safety/translation copy: ${forbidden}`);
}

for (const required of [
  'legacy `safety` field',
  'not the current FastScan or Lite user-facing classification contract',
  'must not be presented as a product or ingredient safety verdict',
  'FastScan result objects do not expose legacy `safety` metadata',
  'Lite review state is not driven by legacy `safety` metadata'
]) {
  assert.ok(dictionaryPolicy.includes(required), `FastScan dictionary policy missing legacy-safety isolation rule: ${required}`);
}
assert.ok(!dictionaryPolicy.includes('Labels mean:\n\n- `safe`: generally common ingredient'), 'FastScan dictionary policy must not define legacy safety values as current user-facing labels');

for (const required of [
  'No SAFE / CAUTION / RISK safety ranking is shown as the current result contract',
  'It is not a machine-translation test.',
  'legacy `safety` field remains part of the stored dictionary schema for compatibility'
]) {
  assert.ok(testingGuide.includes(required), `FastScan testing guide missing safety-isolation contract: ${required}`);
}

for (const token of [
  'legacy `safety` metadata',
  'does not drive',
  'Lite',
  'FastScan',
  'Amazon',
  'no user ingredient or OCR data'
]) {
  assert.ok(contract.includes(token), `legacy safety isolation contract missing: ${token}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'legacy-safety-runtime-isolation',
  lite_public_result_model: 'ingredient-role-first',
  lite_legacy_safety_drives_results: false,
  lite_shared_canonical_merge: true,
  fastscan_legacy_safety_exposed_to_results: false,
  fastscan_public_result_model: 'ingredient-role-first',
  fastscan_public_guides_revive_legacy_safety_or_translation: false,
  fastscan_internal_docs_isolate_legacy_safety: true,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
