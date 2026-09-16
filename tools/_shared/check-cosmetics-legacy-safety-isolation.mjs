import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const lite = read('tools/cosmetic-ingredient-checker-lite/app.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const fastscanGuideJa = read('tools/inci-fastscan/howto/index.html');
const fastscanGuideEn = read('tools/inci-fastscan/howto/en/index.html');
const dictionaryPolicy = read('tools/inci-fastscan/DICTIONARY.md');
const testingGuide = read('tools/inci-fastscan/docs/testing.md');
const contract = read('tools/_shared/COSMETICS_LEGACY_SAFETY_ISOLATION.md');

const liteReviewStart = lite.indexOf('function isReviewCandidate');
const liteReviewEnd = lite.indexOf('\n}\n', liteReviewStart);
assert.ok(liteReviewStart >= 0 && liteReviewEnd > liteReviewStart, 'Lite review-candidate function must exist');
const liteReviewFunction = lite.slice(liteReviewStart, liteReviewEnd + 3);
assert.ok(!/safety/i.test(liteReviewFunction), 'Lite review state must not be driven by legacy safety metadata');
assert.ok(liteReviewFunction.includes("flag.key === 'acid'"), 'Lite must retain its explicit neutral acid/function review cue');
assert.ok(lite.includes('sharedParser.mergeDictionaryRecords(loaded)'), 'Lite must use the same canonical merge layer as FastScan');

const foundStart = matcher.indexOf('function found');
const foundEnd = matcher.indexOf('\n}\n', foundStart);
assert.ok(foundStart >= 0 && foundEnd > foundStart, 'FastScan found() result builder must exist');
const foundFunction = matcher.slice(foundStart, foundEnd + 3);
assert.ok(!foundFunction.includes('safety:'), 'FastScan result objects must not expose legacy safety metadata');
assert.ok(foundFunction.includes('category: item.category'), 'FastScan must retain neutral functional category metadata');

assert.ok(ui.includes('安全性・刺激性・製品適合性の判定ではありません'), 'FastScan must retain the Japanese non-safety disclaimer');
assert.ok(ui.includes('not a safety, irritation, or product-suitability judgment'), 'FastScan must retain the English non-safety disclaimer');

for (const required of [
  '「辞書一致」「追加確認」「未一致」',
  '危険判定ではありません',
  '日本語を英語へ機械翻訳する機能ではありません',
  'SAFE / CAUTION / RISKのような安全性ランクで判定するツールではありません'
]) {
  assert.ok(fastscanGuideJa.includes(required), `FastScan Japanese public guide missing current neutral contract: ${required}`);
}

for (const forbidden of [
  '成分を貼る / 撮る → 翻訳 → 安全性の目安',
  '日本語成分を英語に翻訳し、同じ基準で安全性ランクを表示',
  '<code>Check Safety</code>',
  '<code>Translate &amp; Check Safety</code>',
  'ランクは 3段階'
]) {
  assert.ok(!fastscanGuideJa.includes(forbidden), `FastScan Japanese public guide revived legacy safety/translation copy: ${forbidden}`);
}

for (const required of [
  'Dictionary match, Additional review, or Unmatched',
  'It is not a danger rating.',
  'It is not a machine-translation feature.',
  'does not assign SAFE / CAUTION / RISK safety ranks'
]) {
  assert.ok(fastscanGuideEn.includes(required), `FastScan English public guide missing current neutral contract: ${required}`);
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
  'current user-facing contract is neutral dictionary/reference state',
  'No SAFE / CAUTION / RISK safety ranking is shown as the current result contract',
  'It is not a machine-translation test.',
  'legacy `safety` field remains part of the stored dictionary schema for compatibility'
]) {
  assert.ok(testingGuide.includes(required), `FastScan testing guide missing current neutral contract: ${required}`);
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
  lite_legacy_safety_drives_review: false,
  lite_shared_canonical_merge: true,
  fastscan_legacy_safety_exposed_to_results: false,
  fastscan_public_guides_use_neutral_contract: true,
  fastscan_public_guides_revive_legacy_safety_or_translation: false,
  fastscan_internal_docs_isolate_legacy_safety: true,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
