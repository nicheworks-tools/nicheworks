/**
 * Run real jpn+eng Tesseract OCR against independently sourced Japanese package photos.
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
import { additionalJapanesePhotoSources } from './japanese-real-photo-expansion.mjs';
import { japanesePhotoWave3 } from './japanese-real-photo-wave3.mjs';
import { createProductionLabelScorer, aggregateProductionAssessments } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const sourceDir = process.env.FASTSCAN_JA_CORPUS_DIR;
const reportFile = process.env.FASTSCAN_JA_REPORT;
assert.ok(sourceDir && reportFile, 'Transient photo directory and numeric-only report are required');
assert.equal(japaneseRealPhotoSources.length, 2, 'Keep fixed source-backed photo sample');
assert.equal(new Set(japaneseRealPhotoSources.map(x => x.id)).size, 2);
assert.ok(additionalJapanesePhotoSources.length >= 2, 'At least two new independent photo sources required');
assert.equal(japanesePhotoWave3.length, 2, 'Exactly two independently sourced third-wave photos');
const allJapanesePhotoSources = [
  ...japaneseRealPhotoSources, ...additionalJapanesePhotoSources, ...japanesePhotoWave3
];
assert.equal(new Set(allJapanesePhotoSources.map(x => x.id)).size, allJapanesePhotoSources.length,
  'Every actual photograph must be independently identified');

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
// Fixed, ground-truth-independent segmentation comparison on *the same*
// Chromium-enhanced pixel bytes. PSM6 remains the production/control mode.
// NEVER choose a per-photo winner using published source reference names.
const alternatePsm = Object.freeze([
  { key: 'autoPage', mode: '3' },
  { key: 'singleColumn', mode: '4' },
  { key: 'sparseText', mode: '11' }
]);
// Fixed, source-independent pixel recipes. Each uses the SAME production
// prepareFastScanOcrImage implementation as the photo preview and OCR input.
// No reference-informed per-product crop or automatic production promotion.
const edgeCrop5 = Object.freeze({ left: 5, right: 5, top: 5, bottom: 5 });
const zeroCrop = Object.freeze({ left: 0, right: 0, top: 0, bottom: 0 });
const pixelRecipes = Object.freeze([
  { key: 'contrast140', contrastPercent: 140, crop: zeroCrop },
  { key: 'edgeCrop5', contrastPercent: 100, crop: edgeCrop5 },
  { key: 'edgeCrop5Contrast140', contrastPercent: 140, crop: edgeCrop5 }
]);

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
  for (const source of allJapanesePhotoSources) {
    const minReferenceNames = source.referenceType === 'photo-visual-provisional' ? 10 :
      source.referenceType === 'public-product-page-proxy' ? 12 :
      (source.photoFormat === 'webp' ? 20 : 40);
    assert.ok(source.ingredientList.length >= minReferenceNames,
      'Reference must meet its declared annotation-grade sample floor');
    const format = source.photoFormat || 'jpg';
    assert.ok(['jpg', 'webp', 'png'].includes(format), 'Only explicitly validated public photo formats');
    const file = path.join(sourceDir, source.id + '.' + format);
    const image = fs.readFileSync(file);
    assert.ok(image.length > 8000, 'Downloaded public image must be non-trivial');
    const isJpegBytes = image[0] === 0xff && image[1] === 0xd8;
    const isPngBytes = image.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebpBytes = image.toString('latin1', 0, 4) === 'RIFF' &&
      image.toString('latin1', 8, 12) === 'WEBP';
    // Some image CDNs negotiate JPEG bytes even for URLs ending in .webp.
    // Accept only a verified raster signature, never trust the suffix.
    assert.ok(isJpegBytes || isPngBytes || isWebpBytes,
      source.id + ' is neither a JPEG, PNG nor WebP image');
    if (format === 'jpg') assert.ok(isJpegBytes,
      'Pinned JPEG corpus must stay JPEG, not silently change formats');
    const sourceMime = isPngBytes ? 'image/png' : isWebpBytes ? 'image/webp' : 'image/jpeg';
    // Tesseract's Node decoder requires a common raster format. Actual WebP
    // bytes are converted losslessly to PNG via Chromium BEFORE both control
    // and enhanced measurements. CDN-negotiated JPEG bytes remain untouched.
    let unprocessedPixels = image;
    if (isWebpBytes) {
      const png = await page.evaluate(async encoded => {
        const raw = atob(encoded);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'image/webp' });
        const uri = URL.createObjectURL(blob);
        try {
          const visual = new Image();
          visual.src = uri;
          await visual.decode();
          const canvas = document.createElement('canvas');
          canvas.width = visual.naturalWidth;
          canvas.height = visual.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('WebP decoding needs local Chromium canvas');
          ctx.drawImage(visual, 0, 0);
          return canvas.toDataURL('image/png').split(',')[1];
        } finally {
          URL.revokeObjectURL(uri);
        }
      }, image.toString('base64'));
      assert.ok(png.length > 1000);
      unprocessedPixels = Buffer.from(png, 'base64');
    }

    const control = await assessPhoto(unprocessedPixels, source);
    const enhancedBytesBase64 = await page.evaluate(async ({ bytes64, sourceMime }) => {
      const raw = atob(bytes64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const input = new File([bytes], 'public-japanese-label', { type: sourceMime });
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
    }, { bytes64: image.toString('base64'), sourceMime });
    assert.ok(enhancedBytesBase64?.length > 1000);
    const enhancedBytes = Buffer.from(enhancedBytesBase64, 'base64');
    const enhanced = await assessPhoto(enhancedBytes, source);
    const enhancedSegmentation = {};
    for (const variant of alternatePsm) {
      await worker.setParameters({ tessedit_pageseg_mode: variant.mode });
      const began = performance.now();
      const recognized = await worker.recognize(enhancedBytes);
      const durationMs = Math.round(performance.now() - began);
      const prepared = scoreCandidate(recognized?.data?.text || '', source.ingredients);
      enhancedSegmentation[variant.key] = {
        durationMs,
        strict: metric(source.ingredients, prepared, parser.splitIngredients),
        analysis: await scorer.assess(prepared, source.ingredientList)
      };
      console.log('FASTSCAN_JAPANESE_PSM_PHOTO=' + JSON.stringify({
        id: source.id, variant: variant.key, mode: variant.mode,
        durationMs,
        supportedNames: enhancedSegmentation[variant.key].analysis.eligibleReferenceUniqueNames,
        exactSourceMatches: enhancedSegmentation[variant.key].analysis.afterRepair.exactReferenceHits,
        additionalMatches: enhancedSegmentation[variant.key].analysis.afterRepair.extraMatchesNotInAnnotation
      }));
    }
    // Ensure no experimental PSM spills into the next photographed sample.
    await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const fixedPixelExperiments = {};
    for (const candidate of pixelRecipes) {
      const variantBase64 = await page.evaluate(async ({ sourceBase64, contrastPercent, crop, sourceMime }) => {
        const raw = atob(sourceBase64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const input = new File([bytes], 'public-japanese-label', { type: sourceMime });
        const output = await window.prepareFastScanOcrImage(input, 0, {
          enhanceForOcr: true, contrastPercent, deskewDegrees: 0, crop
        });
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Cannot encode local cropped canvas'));
          reader.onload = () => resolve(String(reader.result || '').split(',')[1]);
          reader.readAsDataURL(output);
        });
      }, {
        sourceBase64: image.toString('base64'), contrastPercent: candidate.contrastPercent,
        crop: candidate.crop, sourceMime
      });
      assert.ok(variantBase64?.length > 1000, 'Real adjusted pixels are required');
      const measured = await assessPhoto(Buffer.from(variantBase64, 'base64'), source);
      assert.equal(measured.analysis.eligibleReferenceUniqueNames,
        enhanced.analysis.eligibleReferenceUniqueNames, 'Fixed corpus denominator must not change');
      fixedPixelExperiments[candidate.key] = measured;
      console.log('FASTSCAN_JAPANESE_PIXEL_PHOTO=' + JSON.stringify({
        id: source.id, variant: candidate.key,
        sourceSupportedNames: measured.analysis.eligibleReferenceUniqueNames,
        exactSourceMatches: measured.analysis.afterRepair.exactReferenceHits,
        additionalMatches: measured.analysis.afterRepair.extraMatchesNotInAnnotation,
        durationMs: measured.durationMs
      }));
    }

    // The source-only control checks that parser and dictionary evaluation
    // agrees with its own published factual source reference. NOT OCR.
    const sourceControl = await scorer.assess(source.ingredients, source.ingredientList);
    const row = {
      id: source.id,
      sourceType: source.sourceType,
      referenceType: source.referenceType || 'public-product-page-proxy',
      sourceIngredientCount: source.ingredientList.length,
      sourceVariantVersionVerified: false,
      independentlyHumanTranscribed: false,
      sourceControl,
      original: control,
      enhanced,
      enhancedSegmentation,
      fixedPixelExperiments
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

assert.equal(results.length, allJapanesePhotoSources.length, 'Every real Japanese photo must have genuine OCR');
const sum = field => aggregateProductionAssessments(results.map(row => ({ analysis: row[field].analysis })));
const original = sum('original');
const enhanced = sum('enhanced');
assert.equal(original.eligibleReferenceUniqueNames, enhanced.eligibleReferenceUniqueNames,
  'Compared arms must use the same canonical supported name denominator');
assert.ok(original.eligibleReferenceUniqueNames > 0,
  'Must have actual dictionary-covered Japanese source ingredient identities');
const alternateSummaries = Object.fromEntries(alternatePsm.map(variant => {
  const summary = aggregateProductionAssessments(
    results.map(row => ({ analysis: row.enhancedSegmentation[variant.key].analysis })));
  assert.equal(summary.eligibleReferenceUniqueNames, enhanced.eligibleReferenceUniqueNames,
    'Alternate PSM cannot change the fixed supported-name denominator');
  return [variant.key, { pageSegMode: variant.mode, ...summary }];
}));
const pixelSummaries = Object.fromEntries(pixelRecipes.map(candidate => {
  const summary = aggregateProductionAssessments(results.map(
    row => ({ analysis: row.fixedPixelExperiments[candidate.key].analysis })));
  assert.equal(summary.eligibleReferenceUniqueNames, enhanced.eligibleReferenceUniqueNames,
    'Pixel variation cannot alter the matched-source-name denominator');
  return [candidate.key, {
    contrastPercent: candidate.contrastPercent,
    cropPercentEachEdge: candidate.crop.left,
    ...summary
  }];
}));
const sourceControl = aggregateProductionAssessments(results.map(row => ({ analysis: row.sourceControl })));
assert.equal(sourceControl.afterRepairHits, sourceControl.eligibleReferenceUniqueNames,
  'Published reference token self-match must be complete on supported entries');

const report = {
  schema: 'fastscan-genuine-japanese-label-photo-v1',
  researchOnly: true,
  corpus: {
    photos: results.length,
    language: 'jpn+eng',
    publiclyReferencedSources: allJapanesePhotoSources.map(row => ({
      id: row.id,
      photoSourceUrl: row.photoSourceUrl,
      ingredientSourceUrl: row.ingredientSourceUrl,
      photoUrl: row.photoUrl,
      ingredientCount: row.ingredientList.length,
      packagingVersion: row.packagingVersion,
      referenceCaveat: row.referenceCaveat || null,
      labelClass: row.labelClass || 'cosmetic',
      referenceType: row.referenceType || 'public-product-page-proxy',
      independentHumanCheck: false
    })),
    noImagesOrLabelTextsUploaded: true,
    photoToReferenceVersionIndependentlyVerified: false,
    provisionalPhotoVisualReferences: japanesePhotoWave3.filter(
      row => row.referenceType === 'photo-visual-provisional').length,
    independentlyHumanVerifiedPhotoReferences: 0
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
  enhancedPageSegmentationExperiments: alternateSummaries,
  chromiumFixedPixelExperiments: pixelSummaries,
  samples: results
};
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
for (const candidate of pixelRecipes) {
  const data = pixelSummaries[candidate.key];
  console.log('FASTSCAN_JAPANESE_PIXEL_AGG=' + JSON.stringify({
    variant: candidate.key, photos: data.photos,
    dictionarySupportedSourceReferences: data.eligibleReferenceUniqueNames,
    exactSupportedSourceMatches: data.afterRepairHits,
    sourceBasedRecallPercent: +(data.afterRepairRecallOfDictionarySupported * 100).toFixed(2),
    additionalMatchesNotInPublishedReference: data.afterRepairExtraNotInAnnotation,
    fixedEnhancedPSM6ControlHits: enhanced.afterRepairHits,
    productionDefaultChanged: false, physicalPhoneCertified: false,
    photoAndSourceBatchMatchCertified: false
  }));
}
for (const variant of alternatePsm) {
  const data = alternateSummaries[variant.key];
  console.log('FASTSCAN_JAPANESE_PSM_AGG=' + JSON.stringify({
    variant: variant.key, mode: variant.mode,
    photos: data.photos,
    dictionarySupportedSourceReferences: data.eligibleReferenceUniqueNames,
    exactSupportedSourceMatches: data.afterRepairHits,
    sourceBasedRecallPercent: +(data.afterRepairRecallOfDictionarySupported * 100).toFixed(2),
    additionalMatchesNotInPublishedReference: data.afterRepairExtraNotInAnnotation,
    fixedPSM6ControlHits: enhanced.afterRepairHits,
    productionSettingChanged: false,
    researchOnly: true
  }));
}
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
