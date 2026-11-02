/**
 * Run real jpn+eng Tesseract OCR against TWO actual Japanese package photos.
 * Source lists are independent published text, NOT OCR-derived annotations.
 * Source/packaging versions may differ. No image, raw transcription or OCR
 * text ever enters logs or the metrics artifact.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';
import { createWorker } from 'tesseract.js';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer, aggregateProductionAssessments } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const sourceDir = process.env.FASTSCAN_JA_CORPUS_DIR;
const reportFile = process.env.FASTSCAN_JA_REPORT;
assert.ok(sourceDir && reportFile, 'Transient photo directory and numeric-only report are required');
assert.equal(japaneseRealPhotoSources.length, 2, 'Keep fixed source-backed photo sample');
assert.equal(new Set(japaneseRealPhotoSources.map(x => x.id)).size, 2);

const context = {};
vm.runInNewContext(fs.readFileSync('tools/inci-fastscan/js/core_ocr_post.js', 'utf8') +
  '\nglobalThis.post = { coreProcessOCRText, postProcessOcrText };',
  context, { filename: 'core_ocr_post.js' });
const metricScope = {};
vm.runInNewContext(fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_metrics.js', 'utf8'),
  metricScope, { filename: 'photo_ocr_metrics.js' });
const scorer = createProductionLabelScorer();
const metric = metricScope.NWFastScanPhotoMetrics.score;
const worker = await createWorker('jpn+eng');
const browser = await chromium.launch({ headless: true });
const browserContext = await browser.newContext({
  viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2
});
const page = await browserContext.newPage();
const results = [];

function scoreCandidate(raw, reference) {
  const prepared = context.post.postProcessOcrText(
    context.post.coreProcessOCRText(raw), { langHint: 'jp' });
  return prepared;
}

async function assessPhoto(bytes, source) {
  const started = performance.now();
  await worker.setParameters({ tessedit_pageseg_mode: '6' });
  const raw = await worker.recognize(bytes);
  const durationMs = Math.round(performance.now() - started);
  const prepared = scoreCandidate(raw?.data?.text || '', source.ingredients);
  return {
    durationMs,
    strict: metric(source.ingredients, prepared, parser.splitIngredients),
    analysis: await scorer.assess(prepared, source.ingredientList)
  };
}

try {
  await page.goto('about:blank');
  await page.addScriptTag({ path: path.resolve('tools/inci-fastscan/js/image_preprocess.js') });
  assert.equal(await page.evaluate(() => typeof window.prepareFastScanOcrImage), 'function');
  for (const source of japaneseRealPhotoSources) {
    assert.ok(source.ingredientList.length >= 45, 'Must use a substantial published ingredient list');
    const file = path.join(sourceDir, source.id + '.jpg');
    const image = fs.readFileSync(file);
    assert.ok(image.length > 8000 && image[0] === 0xff && image[1] === 0xd8,
      source.id + ' is not a valid downloaded real JPEG image');

    const control = await assessPhoto(image, source);
    const enhancedBytesBase64 = await page.evaluate(async bytes64 => {
      const raw = atob(bytes64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const input = new File([bytes], 'public-japanese-label.jpg', { type: 'image/jpeg' });
      const output = await window.prepareFastScanOcrImage(input, 0, {
        enhanceForOcr: true, contrastPercent: 100, deskewDegrees: 0,
        crop: { left: 0, right: 0, top: 0, bottom: 0 }
      });
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Cannot encode local browser canvas'));
        reader.onload = () => resolve(String(reader.result || '').split(',')[1]);
        reader.readAsDataURL(output);
      });
    }, image.toString('base64'));
    assert.ok(enhancedBytesBase64?.length > 1000);
    const enhanced = await assessPhoto(Buffer.from(enhancedBytesBase64, 'base64'), source);

    // The source-only control checks that parser and dictionary evaluation
    // agrees with its own published factual source reference. NOT OCR.
    const sourceControl = await scorer.assess(source.ingredients, source.ingredientList);
    const row = {
      id: source.id,
      sourceType: source.sourceType,
      sourceIngredientCount: source.ingredientList.length,
      sourceVariantVersionVerified: false,
      sourceControl,
      original: control,
      enhanced
    };
    results.push(row);
    console.log('FASTSCAN_JAPANESE_REAL_PHOTO=' + JSON.stringify({
      id: source.id,
      sourceIngredients: source.ingredientList.length,
      sourceDictionarySupported: sourceControl.eligibleReferenceUniqueNames,
      originalDictionaryHits: control.analysis.afterRepair.exactReferenceHits,
      enhancedDictionaryHits: enhanced.analysis.afterRepair.exactReferenceHits,
      originalExactSourceTokenHits: control.strict.exactIngredientHits,
      enhancedExactSourceTokenHits: enhanced.strict.exactIngredientHits,
      originalDurationMs: control.durationMs,
      enhancedDurationMs: enhanced.durationMs
    }));
  }
} finally {
  await worker.terminate();
  await browserContext.close();
  await browser.close();
}

assert.equal(results.length, japaneseRealPhotoSources.length, 'Every real Japanese photo must have genuine OCR');
const sum = field => aggregateProductionAssessments(results.map(row => ({ analysis: row[field].analysis })));
const original = sum('original');
const enhanced = sum('enhanced');
assert.equal(original.eligibleReferenceUniqueNames, enhanced.eligibleReferenceUniqueNames,
  'Compared arms must use the same canonical supported name denominator');
assert.ok(original.eligibleReferenceUniqueNames > 0,
  'Must have actual dictionary-covered Japanese source ingredient identities');
const sourceControl = aggregateProductionAssessments(results.map(row => ({ analysis: row.sourceControl })));
assert.equal(sourceControl.afterRepairHits, sourceControl.eligibleReferenceUniqueNames,
  'Published reference token self-match must be complete on supported entries');

const report = {
  schema: 'fastscan-genuine-japanese-label-photo-v1',
  researchOnly: true,
  corpus: {
    photos: results.length,
    language: 'jpn+eng',
    publiclyReferencedSources: japaneseRealPhotoSources.map(row => ({
      id: row.id,
      photoSourceUrl: row.photoSourceUrl,
      ingredientSourceUrl: row.ingredientSourceUrl,
      photoUrl: row.photoUrl,
      ingredientCount: row.ingredientList.length,
      packagingVersion: row.packagingVersion
    })),
    noImagesOrLabelTextsUploaded: true,
    photoToReferenceVersionIndependentlyVerified: false
  },
  environment: {
    viewport: 'Chromium simulated 360px mobile viewport; NOT physical smartphone',
    worker: 'Pinned Tesseract.js 5.0.3 jpn+eng in Node, NOT in browser',
    imageProcessor: 'Production browser image_preprocess.js; enhanceForOcr true for comparison',
    pipeline: 'Actual production JP core OCR postprocessor and production dictionary/parser/analyzer/matcher',
    interpretation: 'First actual Japanese photographed packaging OCR, compared against independently published product-page lists. Due to possible formulation/package version mismatch, name recall is a source-reference comparison, not definitive photo-ground-truth OCR accuracy.'
  },
  fullProductionDictionaryCount: scorer.dictionaryCount,
  publishedSourceReferenceControl: sourceControl,
  originalPhoto: original,
  chromiumEnhanced: enhanced,
  samples: results
};
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
for (const [name, data] of [['original', original], ['chromiumEnhanced', enhanced]]) {
  console.log('FASTSCAN_JAPANESE_REAL_PHOTO_AGG=' + JSON.stringify({
    variant: name,
    photos: data.photos,
    dictionarySupportedSourceReferences: data.eligibleReferenceUniqueNames,
    exactSupportedSourceMatches: data.afterRepairHits,
    sourceBasedRecallPercent: +(data.afterRepairRecallOfDictionarySupported * 100).toFixed(2),
    matchesNotInSourceList: data.afterRepairExtraNotInAnnotation,
    report: reportFile
  }));
}
