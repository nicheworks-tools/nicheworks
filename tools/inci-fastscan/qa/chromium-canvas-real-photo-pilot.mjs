/**
 * Actual Chromium browser canvas photo preparation, followed by the same
 * Tesseract.js 5.0.3 English OCR and FastScan production dictionary pipeline.
 * Public images/YAML are ephemeral; the output report contains numbers only.
 * 360px viewport emulation is NOT certification on a physical smartphone.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';
import { createWorker } from 'tesseract.js';
import YAML from 'yaml';
import { createProductionLabelScorer, aggregateProductionAssessments } from './production-label-scoring.mjs';
import { createOcrLossDiagnostics, summarizeOcrLoss } from './real-photo-loss-diagnostics.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const corpusCommit = '5ba39a7b06c59ff1edb30a396fdd640f82506742';
const corpusDir = process.env.FASTSCAN_PHOTO_CORPUS_DIR;
const reportFile = process.env.FASTSCAN_PHOTO_REPORT;
assert.ok(corpusDir && reportFile && process.env.FASTSCAN_PHOTO_CORPUS_COMMIT === corpusCommit,
  'A pinned external photo corpus, source SHA and numeric-only report location are required');

const ids = [
  '0083800047833', '0085805190880', '0768614212331', '0842101102074',
  '11112140153911', '3253581766538', '3253581780039', '3367729117264',
  '3499320013727', '3499320014854', '3574661563312', '3574661588353'
];
assert.equal(new Set(ids).size, 12);

const metricScope = {};
vm.runInNewContext(fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_metrics.js', 'utf8'),
  metricScope, { filename: 'photo_ocr_metrics.js' });
const score = metricScope.NWFastScanPhotoMetrics.score;
const postScope = {};
vm.runInNewContext(
  fs.readFileSync('tools/inci-fastscan/js/core_ocr_post.js', 'utf8') +
  '\nglobalThis.FastScanPost = { coreProcessOCRText, postProcessOcrText };',
  postScope, { filename: 'core_ocr_post.js' });
const post = postScope.FastScanPost;
const scorer = createProductionLabelScorer();
const lossDiagnostics = createOcrLossDiagnostics();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2
});
const page = await context.newPage();
const worker = await createWorker('eng');
const results = [];
// Compare fixed browser-pixel recipes on actual public photos. No per-photo
// reference-guided selection, and NO change to production enhancement default.
const pixelRecipes = Object.freeze([
  { key: 'cssContrast140', description: 'Actual FastScan enhanceForOcr with browser contrast(140%)' },
  { key: 'otsuBinary', description: 'Otsu global grayscale threshold on actual FastScan enhanced PNG' },
  { key: 'invertGray', description: 'Fixed inversion of actual FastScan enhanced grayscale PNG' }
]);
// Fixed, annotation-independent segmentation trials on the SAME
// Chromium-canvas-enhanced PNG as PSM6 production. No runtime oracle.
const alternatePsm = Object.freeze([
  { key: 'singleColumn', mode: '4' },
  { key: 'sparseText', mode: '11' }
]);
try {
  await page.goto('about:blank');
  // Load the ACTUAL product image processor into Chromium without a site/CDN.
  await page.addScriptTag({ path: path.resolve('tools/inci-fastscan/js/image_preprocess.js') });
  assert.equal(await page.evaluate(() => typeof window.prepareFastScanOcrImage), 'function');

  for (const id of ids) {
    // The worker persists parameters across photos; reset the baseline before
    // every sample so previous candidate PSM never contaminates production.
    await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const imageFile = path.join(corpusDir, id + '.jpg');
    const annotation = YAML.parse(fs.readFileSync(path.join(corpusDir, id + '.yaml'), 'utf8'));
    assert.equal(annotation.image_name, id + '.jpg');
    assert.ok(Array.isArray(annotation.INCI_list) && annotation.INCI_list.length >= 4);
    assert.ok(typeof annotation.raw_ingredients_list === 'string');

    const baselineStart = performance.now();
    const baselineOcr = await worker.recognize(imageFile);
    const baselineDurationMs = Math.round(performance.now() - baselineStart);
    const baselineText = post.postProcessOcrText(
      post.coreProcessOCRText(baselineOcr?.data?.text || ''), { langHint: 'en' });
    const baselineDashText = post.postProcessOcrText(
      post.coreProcessOCRText(baselineOcr?.data?.text || ''),
      { langHint: 'en', spacedDashDelimiter: true });
    const baseline = {
      spacedDash: await scorer.assess(baselineDashText, annotation.INCI_list),
      sourceExtraAudit: await scorer.auditAnnotationExtras(baselineDashText, annotation.INCI_list, annotation.raw_ingredients_list),
      durationMs: baselineDurationMs,
      annotatedMetrics: score(annotation.INCI_list.join('\n'), baselineText, parser.splitIngredients),
      rawTranscriptionMetrics: score(annotation.raw_ingredients_list, baselineText, parser.splitIngredients),
      analysis: await scorer.assess(baselineText, annotation.INCI_list),
      loss: await lossDiagnostics.assess(baselineOcr?.data?.text || '', baselineText, annotation.INCI_list)
    };

    const inputBase64 = fs.readFileSync(imageFile).toString('base64');
    const processedBase64 = await page.evaluate(async (sourceBase64) => {
      const raw = atob(sourceBase64);
      const inputBytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) inputBytes[i] = raw.charCodeAt(i);
      const localFile = new File([inputBytes], 'external-public-label.jpg', { type: 'image/jpeg' });
      const prepared = await window.prepareFastScanOcrImage(localFile, 0, {
        enhanceForOcr: true, contrastPercent: 100, deskewDegrees: 0,
        crop: { left: 0, right: 0, top: 0, bottom: 0 }
      });
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not serialize browser-local processed image'));
        reader.onload = () => resolve(String(reader.result || '').split(',')[1]);
        reader.readAsDataURL(prepared);
      });
    }, inputBase64);
    assert.ok(typeof processedBase64 === 'string' && processedBase64.length > 1000);
    const enhancedStart = performance.now();
    const enhancedOcr = await worker.recognize(Buffer.from(processedBase64, 'base64'));
    const enhancedDurationMs = Math.round(performance.now() - enhancedStart);
    const enhancedText = post.postProcessOcrText(
      post.coreProcessOCRText(enhancedOcr?.data?.text || ''), { langHint: 'en' });
    const enhancedDashText = post.postProcessOcrText(
      post.coreProcessOCRText(enhancedOcr?.data?.text || ''),
      { langHint: 'en', spacedDashDelimiter: true });
    const enhanced = {
      spacedDash: await scorer.assess(enhancedDashText, annotation.INCI_list),
      sourceExtraAudit: await scorer.auditAnnotationExtras(enhancedDashText, annotation.INCI_list, annotation.raw_ingredients_list),
      durationMs: enhancedDurationMs,
      annotatedMetrics: score(annotation.INCI_list.join('\n'), enhancedText, parser.splitIngredients),
      rawTranscriptionMetrics: score(annotation.raw_ingredients_list, enhancedText, parser.splitIngredients),
      analysis: await scorer.assess(enhancedText, annotation.INCI_list),
      loss: await lossDiagnostics.assess(enhancedOcr?.data?.text || '', enhancedText, annotation.INCI_list)
    };
    const segmentation = {};
    for (const variant of alternatePsm) {
      await worker.setParameters({ tessedit_pageseg_mode: variant.mode });
      const started = performance.now();
      const altOcr = await worker.recognize(Buffer.from(processedBase64, 'base64'));
      const durationMs = Math.round(performance.now() - started);
      const cleaned = post.postProcessOcrText(
        post.coreProcessOCRText(altOcr?.data?.text || ''),
        { langHint: 'en', spacedDashDelimiter: true });
      segmentation[variant.key] = {
        durationMs,
        annotatedMetrics: score(annotation.INCI_list.join('\n'), cleaned, parser.splitIngredients),
        rawTranscriptionMetrics: score(annotation.raw_ingredients_list, cleaned, parser.splitIngredients),
        analysis: await scorer.assess(cleaned, annotation.INCI_list),
        sourceExtraAudit: await scorer.auditAnnotationExtras(cleaned, annotation.INCI_list, annotation.raw_ingredients_list)
      };
      console.log('CHROMIUM_PSM_PHOTO=' + JSON.stringify({
        id, variant: variant.key, mode: variant.mode,
        durationMs, referenceNames: segmentation[variant.key].analysis.eligibleReferenceUniqueNames,
        hits: segmentation[variant.key].analysis.afterRepair.exactReferenceHits,
        extras: segmentation[variant.key].analysis.afterRepair.extraMatchesNotInAnnotation
      }));
    }
    // Reset explicitly after optional PSM4/PSM11 probes. The image-only trial
    // must run identical OCR segmentation mode PSM6 for every candidate.
    await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const pixelExperiments = {};
    for (const candidate of pixelRecipes) {
      const transformedBase64 = await page.evaluate(async ({ sourceBase64, enhancedBase64, kind }) => {
        if (kind === 'cssContrast140') {
          const raw = atob(sourceBase64);
          const bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
          const file = new File([bytes], 'public-sample.jpg', { type: 'image/jpeg' });
          const processed = await window.prepareFastScanOcrImage(file, 0, {
            enhanceForOcr: true, contrastPercent: 140, deskewDegrees: 0,
            crop: { left: 0, right: 0, top: 0, bottom: 0 }
          });
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Local canvas encoding failed'));
            reader.onload = () => resolve(String(reader.result || '').split(',')[1]);
            reader.readAsDataURL(processed);
          });
        }
        const image = new Image();
        image.src = 'data:image/png;base64,' + enhancedBase64;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Missing 2d canvas for offline QA');
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        let threshold = 128;
        if (kind === 'otsuBinary') {
          const histogram = new Uint32Array(256);
          let total = 0;
          let weightedTotal = 0;
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i];
            histogram[gray] += 1;
            total += 1;
            weightedTotal += gray;
          }
          let leftCount = 0;
          let leftWeighted = 0;
          let bestVariance = -1;
          for (let gray = 0; gray < 256; gray += 1) {
            leftCount += histogram[gray];
            leftWeighted += gray * histogram[gray];
            const rightCount = total - leftCount;
            if (!leftCount || !rightCount) continue;
            const leftMean = leftWeighted / leftCount;
            const rightMean = (weightedTotal - leftWeighted) / rightCount;
            const variance = leftCount * rightCount * (leftMean - rightMean) ** 2;
            if (variance > bestVariance) {
              bestVariance = variance;
              threshold = gray;
            }
          }
        }
        if (kind !== 'otsuBinary' && kind !== 'invertGray') {
          throw new Error('Unknown fixed browser pixel experiment');
        }
        for (let i = 0; i < data.length; i += 4) {
          const next = kind === 'otsuBinary'
            ? (data[i] <= threshold ? 0 : 255) : 255 - data[i];
          data[i] = next;
          data[i + 1] = next;
          data[i + 2] = next;
          data[i + 3] = 255;
        }
        ctx.putImageData(pixels, 0, 0);
        return canvas.toDataURL('image/png').split(',')[1];
      }, { sourceBase64: inputBase64, enhancedBase64: processedBase64, kind: candidate.key });

      assert.ok(transformedBase64 && transformedBase64.length > 1000);
      const started = performance.now();
      const recognized = await worker.recognize(Buffer.from(transformedBase64, 'base64'));
      const durationMs = Math.round(performance.now() - started);
      const recognizedText = post.postProcessOcrText(
        post.coreProcessOCRText(recognized?.data?.text || ''),
        { langHint: 'en', spacedDashDelimiter: true });
      const analysis = await scorer.assess(recognizedText, annotation.INCI_list);
      const evidence = await scorer.auditAnnotationExtras(recognizedText,
        annotation.INCI_list, annotation.raw_ingredients_list);
      pixelExperiments[candidate.key] = {
        durationMs, analysis, sourceExtraAudit: evidence,
        annotatedMetrics: score(annotation.INCI_list.join('\n'), recognizedText, parser.splitIngredients),
        rawTranscriptionMetrics: score(annotation.raw_ingredients_list, recognizedText, parser.splitIngredients)
      };
      console.log('FASTSCAN_BROWSER_PIXEL_PHOTO=' + JSON.stringify({
        id, variant: candidate.key, durationMs,
        hits: analysis.afterRepair.exactReferenceHits,
        referenceNames: analysis.eligibleReferenceUniqueNames,
        extras: analysis.afterRepair.extraMatchesNotInAnnotation
      }));
    }
    results.push({ id, referenceIngredientCount: annotation.INCI_list.length,
      baseline, enhanced, segmentation, pixelExperiments });
    console.log('CHROMIUM_CANVAS_PHOTO=' + JSON.stringify({
      id,
      baselineDictionaryHits: baseline.analysis.afterRepair.exactReferenceHits,
      enhancedDictionaryHits: enhanced.analysis.afterRepair.exactReferenceHits,
      eligibleReferenceNames: enhanced.analysis.eligibleReferenceUniqueNames,
      baselineCerPercent: +(100 * baseline.rawTranscriptionMetrics.characterErrorRate).toFixed(2),
      enhancedCerPercent: +(100 * enhanced.rawTranscriptionMetrics.characterErrorRate).toFixed(2),
      baselineDurationMs, enhancedDurationMs
    }));
  }
} finally {
  await worker.terminate();
  await context.close();
  await browser.close();
}
assert.equal(results.length, 12);

function summarizeSourceExtraAudits(rows) {
  const summary = { photos: rows.length, extras: 0,
    mentionedInSourceTranscription: 0, notMentionedInSourceTranscription: 0 };
  for (const row of rows) {
    assert.equal(row.extras, row.mentionedInSourceTranscription + row.notMentionedInSourceTranscription);
    for (const k of ['extras', 'mentionedInSourceTranscription', 'notMentionedInSourceTranscription']) {
      summary[k] += row[k];
    }
  }
  return summary;
}

function aggregatePhotoMetrics(rows, slot, key) {
  const metrics = rows.map(row => row[slot][key]);
  const refChars = metrics.reduce((sum, x) => sum + x.referenceCharacters, 0);
  const edits = metrics.reduce((sum, x) => sum + x.characterEdits, 0);
  const refItems = metrics.reduce((sum, x) => sum + x.referenceIngredients, 0);
  const hits = metrics.reduce((sum, x) => sum + x.exactIngredientHits, 0);
  return {
    photos: rows.length,
    referenceCharacters: refChars,
    characterEdits: edits,
    pooledCharacterErrorRate: refChars ? edits / refChars : null,
    referenceIngredients: refItems,
    exactIngredientHits: hits,
    pooledExactIngredientRecall: refItems ? hits / refItems : null
  };
}

const baseline = aggregateProductionAssessments(results.map(row => ({ analysis: row.baseline.analysis })));
const enhanced = aggregateProductionAssessments(results.map(row => ({ analysis: row.enhanced.analysis })));
assert.equal(baseline.eligibleReferenceUniqueNames, enhanced.eligibleReferenceUniqueNames,
  'Original and canvas-enhanced experiments must score the same supported annotation names');
assert.equal(baseline.photos, 12);
const report = {
  schema: 'fastscan-chromium-canvas-photo-pilot-v1',
  source: {
    repository: 'https://github.com/ki-iw/toxfox-ocr',
    commit: corpusCommit, language: 'eng', license: 'GPL-3.0',
    photos: 12, rawPhotoOrTextUploaded: false
  },
  environment: {
    browser: 'Playwright Chromium headless; 360px viewport emulation, NOT real phone hardware',
    imageProcessor: 'tools/inci-fastscan/js/image_preprocess.js, enhanceForOcr=true',
    ocr: 'Tesseract.js 5.0.3 eng Node worker, identical for both fixed arms',
    parser: 'FastScan production core_parser -> core_analyze exact wrap repair -> core_matcher',
    selection: 'fixed arm for all 12 photos; no per-photo ground-truth oracle',
    limitation: 'Chromium produces the actual enhanced pixels, but Tesseract worker runs in Node rather than a mobile browser. Not Japanese or physical-device OCR certification.'
  },
  productionDictionaryRecords: scorer.dictionaryCount,
  productionDictionaryBaseline: baseline,
  productionDictionaryEnhancedCanvas: enhanced,
  pixelProcessingExperiment: Object.fromEntries(pixelRecipes.map(candidate => {
    const rows = results.map(row => row.pixelExperiments[candidate.key]);
    const production = aggregateProductionAssessments(rows.map(row => ({ analysis: row.analysis })));
    return [candidate.key, {
      recipe: candidate.description,
      engine: 'Actual Chromium canvas pixels and pinned Tesseract.js ENG PSM6',
      productionDictionary: production,
      sourceExtraAudit: summarizeSourceExtraAudits(rows.map(row => row.sourceExtraAudit)),
      strictAnnotated: aggregatePhotoMetrics(results.map(row => ({
        candidate: row.pixelExperiments[candidate.key]
      })), 'candidate', 'annotatedMetrics'),
      rawTranscription: aggregatePhotoMetrics(results.map(row => ({
        candidate: row.pixelExperiments[candidate.key]
      })), 'candidate', 'rawTranscriptionMetrics'),
      perPhoto: rows.map((row, i) => ({ id: ids[i], ...row }))
    }];
  })),
  photoSegmentationExperiment: Object.fromEntries(alternatePsm.map(variant => {
    const rows = results.map(row => row.segmentation[variant.key]);
    const numeric = aggregateProductionAssessments(rows.map(analysis => ({ analysis: analysis.analysis })));
    return [variant.key, {
      pageSegMode: variant.mode,
      photoCount: 12,
      comparisonBaseline: 'chromiumCanvas with default PSM6, spaced-dash production cleanup',
      productionDictionary: numeric,
      sourceExtraAudit: summarizeSourceExtraAudits(rows.map(row => row.sourceExtraAudit)),
      pooledStrictAnnotated: aggregatePhotoMetrics(results.map((row) => ({
        candidate: row.segmentation[variant.key]
      })), 'candidate', 'annotatedMetrics'),
      pooledTranscription: aggregatePhotoMetrics(results.map((row) => ({
        candidate: row.segmentation[variant.key]
      })), 'candidate', 'rawTranscriptionMetrics'),
      perPhoto: rows.map((row, i) => ({ id: ids[i], durationMs: row.durationMs, analysis: row.analysis,
        annotatedMetrics: row.annotatedMetrics, rawTranscriptionMetrics: row.rawTranscriptionMetrics }))
    }];
  })),
  sourceExtraAudit: {
    original: summarizeSourceExtraAudits(results.map(row => row.baseline.sourceExtraAudit)),
    chromiumCanvas: summarizeSourceExtraAudits(results.map(row => row.enhanced.sourceExtraAudit)),
    interpretation: 'Counting source-transcribed mentions of annotation-absent recognized dictionary names is diagnostic only, not a verified true/false positive classification.'
  },
  spacedDashExperiment: {
    original: aggregateProductionAssessments(results.map(row => ({ analysis: row.baseline.spacedDash }))),
    chromiumCanvas: aggregateProductionAssessments(results.map(row => ({ analysis: row.enhanced.spacedDash }))),
    note: 'Gated experiment only. Replaces spaces-enclosed dash/en/em dash in English product label lines with ingredient separators. Preserves in-name nonspaced hyphens. No production default has changed, and reference annotations are never used to decide splits.'
  },
  extractionLossFunnel: {
    original: summarizeOcrLoss(results.map(row => row.baseline.loss), 'original'),
    chromiumCanvas: summarizeOcrLoss(results.map(row => row.enhanced.loss), 'chromiumCanvas'),
    caveat: 'Searches exact known dictionary aliases in OCR words as a rough diagnostic, not OCR correctness proof; whole-line exact dictionary-sequence splitter is RESEARCH ONLY and not enabled in the user interface. Metrics contain no image/ingredient strings. No annotation supplied to the splitter.'
  },
  strictAnnotatedBaseline: aggregatePhotoMetrics(results, 'baseline', 'annotatedMetrics'),
  strictAnnotatedEnhancedCanvas: aggregatePhotoMetrics(results, 'enhanced', 'annotatedMetrics'),
  transcriptionCerBaseline: aggregatePhotoMetrics(results, 'baseline', 'rawTranscriptionMetrics'),
  transcriptionCerEnhancedCanvas: aggregatePhotoMetrics(results, 'enhanced', 'rawTranscriptionMetrics'),
  samples: results
};
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n', 'utf8');
for (const [name, row] of [['original', baseline], ['chromiumCanvas', enhanced]]) {
  console.log('FASTSCAN_CHROMIUM_CANVAS_REAL_PHOTO=' + JSON.stringify({
    name,
    photos: row.photos,
    dictionaryRecords: scorer.dictionaryCount,
    supportedReferenceNames: row.eligibleReferenceUniqueNames,
    exactDictionaryHits: row.afterRepairHits,
    recallPercent: +(100 * row.afterRepairRecallOfDictionarySupported).toFixed(2),
    extraMatchesNotInAnnotations: row.afterRepairExtraNotInAnnotation,
    exactJoinRepairs: row.exactJoinRepairs,
    threePartRepairs: row.threePartRepairs,
    report: reportFile
  }));
}

for (const [name, totals] of Object.entries(report.extractionLossFunnel)) {
  if (!totals || typeof totals !== 'object' || !('supportedReferences' in totals)) continue;
  console.log('FASTSCAN_OCR_LOSS_FUNNEL=' + JSON.stringify(totals));
}

for (const [name, scores] of Object.entries(report.spacedDashExperiment)) {
  if (!scores || typeof scores !== 'object' || !('supportedReferences' in scores) && !('eligibleReferenceUniqueNames' in scores)) continue;
  console.log('FASTSCAN_SPACED_DASH_EXPERIMENT=' + JSON.stringify({
    name,
    referenceNames: scores.eligibleReferenceUniqueNames,
    beforeRepairHits: scores.beforeRepairHits,
    afterRepairHits: scores.afterRepairHits,
    recallPercent: +(100 * scores.afterRepairRecallOfDictionarySupported).toFixed(2),
    extraMatchesNotInAnnotation: scores.afterRepairExtraNotInAnnotation,
    defaultHits: name === 'original' ? baseline.afterRepairHits : enhanced.afterRepairHits,
    defaultExtras: name === 'original' ? baseline.afterRepairExtraNotInAnnotation : enhanced.afterRepairExtraNotInAnnotation
  }));
}

for (const [key, row] of Object.entries(report.photoSegmentationExperiment)) {
  const x = row.productionDictionary;
  console.log('FASTSCAN_CHROMIUM_PSM_EXPERIMENT=' + JSON.stringify({
    mode: row.pageSegMode,
    variant: key,
    photos: x.photos,
    supportedNames: x.eligibleReferenceUniqueNames,
    exactHits: x.afterRepairHits,
    recallPercent: +(100 * x.afterRepairRecallOfDictionarySupported).toFixed(2),
    extras: x.afterRepairExtraNotInAnnotation,
    extrasMentionedInRawSource: row.sourceExtraAudit.mentionedInSourceTranscription,
    extrasAbsentFromRawSource: row.sourceExtraAudit.notMentionedInSourceTranscription,
    wrapRepairs: x.exactJoinRepairs,
    sequenceSplits: x.exactSequenceSplits,
    rawTranscriptionCerPercent: +(100 * row.pooledTranscription.pooledCharacterErrorRate).toFixed(2),
    productionPsm6Hits: report.spacedDashExperiment.chromiumCanvas.afterRepairHits,
    productionPsm6Extras: report.spacedDashExperiment.chromiumCanvas.afterRepairExtraNotInAnnotation
  }));
}

for (const [name, row] of Object.entries(report.sourceExtraAudit)) {
  if (!row || typeof row !== 'object' || !('extras' in row)) continue;
  console.log('FASTSCAN_SOURCE_EXTRA_AUDIT=' + JSON.stringify({
    name, photos: row.photos, extras: row.extras,
    mentionedInSourceTranscription: row.mentionedInSourceTranscription,
    notMentionedInSourceTranscription: row.notMentionedInSourceTranscription
  }));
}

for (const [key, reportRow] of Object.entries(report.pixelProcessingExperiment)) {
  const a = reportRow.productionDictionary;
  console.log('FASTSCAN_BROWSER_PIXEL_RECIPE=' + JSON.stringify({
    variant: key,
    photos: a.photos,
    supportedReferenceNames: a.eligibleReferenceUniqueNames,
    hits: a.afterRepairHits,
    recallPercent: +(100 * a.afterRepairRecallOfDictionarySupported).toFixed(2),
    extras: a.afterRepairExtraNotInAnnotation,
    sourceMentionedExtras: reportRow.sourceExtraAudit.mentionedInSourceTranscription,
    sourceNotMentionedExtras: reportRow.sourceExtraAudit.notMentionedInSourceTranscription,
    rawTranscriptionCerPercent: +(100 * reportRow.rawTranscription.pooledCharacterErrorRate).toFixed(2),
    productionEnhancedHits: report.spacedDashExperiment.chromiumCanvas.afterRepairHits,
    productionEnhancedExtras: report.spacedDashExperiment.chromiumCanvas.afterRepairExtraNotInAnnotation
  }));
}
