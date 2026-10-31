import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const moduleSource = fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_metrics.js', 'utf8');
const runnerSource = fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_runner.js', 'utf8');
const html = fs.readFileSync('tools/inci-fastscan/qa/photo-ocr-benchmark.html', 'utf8');
const ocrSource = fs.readFileSync('tools/inci-fastscan/js/web_ocr.js', 'utf8');
const preprocess = fs.readFileSync('tools/inci-fastscan/js/image_preprocess.js', 'utf8');
const sandbox = {};
vm.runInNewContext(moduleSource, sandbox, { filename: 'photo_ocr_metrics.js' });
const m = sandbox.NWFastScanPhotoMetrics;
assert.ok(m && typeof m.score === 'function');

assert.equal(m.levenshtein('', ''), 0);
assert.equal(m.levenshtein('abc', 'ab'), 1);
assert.equal(m.levenshtein('Water', 'Waler'), 1);
assert.equal(m.levenshtein('👍', ''), 1, 'UTF-16 surrogate pair must be one Unicode character');
assert.equal(m.levenshtein('東京', '東東'), 1);
assert.equal(m.levenshtein('abc', 'xyz'), 3);
assert.equal(m.levenshtein('xyz', 'abc'), 3, 'edit distance is symmetric');
assert.equal(m.normalizedText('  Ｗａｔｅｒ   \n Glycerin  '), 'water glycerin');

const split = parser.splitIngredients;
let result = m.score('Water, Glycerin', 'Water, Glycerin', split);
assert.equal(result.characterErrorRate, 0);
assert.equal(result.characterEdits, 0);
assert.equal(result.referenceIngredients, 2);
assert.equal(result.recognizedIngredients, 2);
assert.equal(result.exactIngredientHits, 2);
assert.equal(result.exactIngredientRecall, 1);
assert.equal(result.exactIngredientPrecision, 1);

// The production OCR cleanup changes comma separators to line breaks.
// Correctly recognized ingredient text must not produce artificial CER.
result = m.score('Water, Glycerin', 'Water\nGlycerin', split);
assert.equal(result.characterEdits, 0, 'OCR delimiter normalization must not inflate CER');
assert.equal(result.characterErrorRate, 0);
result = m.score('水、グリセリン', '水\nグリセリン', split);
assert.equal(result.characterErrorRate, 0, 'Japanese comma/newline layout must be neutral');
result = m.score('1,2-Hexanediol, Glycerin', '1,2-Hexanediol\nGlycerin', split);
assert.equal(result.characterErrorRate, 0, 'numeric locant comma stays within the ingredient name');

result = m.score('Water, Glycerin', 'Waler, Glycerin', split);
assert.equal(result.characterEdits, 1, 'one OCR substitution is one character edit');
assert.equal(result.referenceIngredients, 2);
assert.equal(result.exactIngredientHits, 1);
assert.equal(result.exactIngredientRecall, 0.5);
assert.equal(result.exactIngredientPrecision, 0.5);

result = m.score('Water, Glycerin, Water', 'Water, Water', split);
assert.equal(result.referenceIngredients, 3, 'repeated labels must not be deduplicated');
assert.equal(result.recognizedIngredients, 2);
assert.equal(result.exactIngredientHits, 2);
assert.equal(result.exactIngredientRecall, 2 / 3);
assert.equal(result.exactIngredientPrecision, 1);

result = m.score('1,2-Hexanediol, Glycerin', '1,2-Hexanediol\nGlycerin', split);
assert.equal(result.exactIngredientRecall, 1, 'numeric locant comma must survive shared ingredient parsing');
assert.equal(result.exactIngredientHits, 2);
result = m.score('水、グリセリン', '水、クリセリン', split);
assert.equal(result.characterEdits, 1, 'Japanese OCR mistake must count as one edit');
assert.equal(result.exactIngredientHits, 1);
result = m.score('Water, Glycerin', '', split);
assert.equal(result.characterErrorRate, 1);
assert.equal(result.exactIngredientRecall, 0);
assert.equal(result.exactIngredientPrecision, 0);
assert.throws(() => m.score('', 'Water', split), /transcribed reference/);
assert.throws(() => m.score('a'.repeat(5001), '', split), /5000/);
assert.throws(() => m.score('Water', 'a'.repeat(5001), split), /5000/);

const good = m.score('Water, Glycerin', 'Water, Glycerin', split);
const bad = m.score('Water, Glycerin', 'Waler, Glycerin', split);
const change = m.pairedChange(bad, good);
assert.ok(change.characterErrorRateChange < 0);
assert.equal(change.exactIngredientRecallChange, 0.5);
assert.equal(m.pairedChange(null, good), null);

for (const token of ['id="qa-image"', 'id="qa-reference"', 'id="qa-baseline"', 'id="qa-adjusted"',
  'id="qa-recognized"', 'id="qa-preview"', 'id="qa-copy"', 'id="qa-language"',
  'id="qa-tilt"', 'id="qa-turns"', 'id="qa-contrast"', 'id="qa-crop-left"',
  'id="qa-crop-right"', 'id="qa-crop-top"', 'id="qa-crop-bottom"']) {
  assert.ok(html.includes(token), 'QA page missing '+token);
}
assert.ok(html.includes('meta name="robots" content="noindex, nofollow"'), 'QA page must not be indexed as a public scanner');
assert.ok(html.includes('tesseract.js@5.0.3/dist/tesseract.min.js'),
  'use same browser OCR runtime as FastScan');
assert.ok(html.includes('../js/web_ocr.js?'), 'actual OCR source must be used, not a synthetic recognizer');
assert.ok(html.includes('../js/image_preprocess.js?'), 'must process actual photos');
assert.ok(html.includes('../js/core_ocr_post.js?'), 'must use FastScan source label cleanup');
assert.ok(html.includes('photo_ocr_metrics.js?') && html.includes('photo_ocr_runner.js?'));

for (const token of [
  'root.runOCR(file, selectedLanguage',
  'root.prepareFastScanOcrImage(file, options.quarterTurns, options)',
  'root.postProcessOcrText(raw, {',
  'bench.score(sourceReference, processed, split)',
  'bench.pairedChange(previous.baseline?.metrics, previous.adjusted?.metrics)',
  'referenceInput.addEventListener',
  "imageInput.addEventListener('change'",
  'URL.revokeObjectURL',
  'No result yet.'
]) {
  assert.ok(runnerSource.includes(token) || html.includes(token), 'QA runner missing '+token);
}
assert.ok(ocrSource.includes('prepareFastScanOcrImage(imageFile, turns, options)'));
assert.ok(preprocess.includes('root.prepareFastScanOcrImage = prepareFastScanOcrImage'));
for (const file of [moduleSource, runnerSource, html]) {
  assert.ok(!/sendBeacon|navigator\.geolocation|gtag|google-analytics|pagead2\.googlesyndication|amazon-affiliate/.test(file),
    'QA runner must not contain analytics, geolocation or monetization hooks');
}
assert.ok(runnerSource.includes('rawPhotoOrIngredientTextIncluded: false'));
assert.ok(!/filename\s*:|rawText\s*:|ocrText\s*:/.test(runnerSource),
  'metrics-only report must not serialize private photo or OCR text');

console.log('FASTSCAN_PHOTO_OCR_METRICS=PASS: exact CER/Unicode, repeated-label recall, Japanese, locant punctuation, paired comparison, real runtime wiring and privacy');
