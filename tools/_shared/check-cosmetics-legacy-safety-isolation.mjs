import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const lite = read('tools/cosmetic-ingredient-checker-lite/app.js');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
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
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
