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
try {
  await page.goto('about:blank');
  // Load the ACTUAL product image processor into Chromium without a site/CDN.
  await page.addScriptTag({ path: path.resolve('tools/inci-fastscan/js/image_preprocess.js') });
  assert.equal(await page.evaluate(() => typeof window.prepareFastScanOcrImage), 'function');

  for (const id of ids) {
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
    const baseline = {
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
    const enhanced = {
      durationMs: enhancedDurationMs,
      annotatedMetrics: score(annotation.INCI_list.join('\n'), enhancedText, parser.splitIngredients),
      rawTranscriptionMetrics: score(annotation.raw_ingredients_list, enhancedText, parser.splitIngredients),
      analysis: await scorer.assess(enhancedText, annotation.INCI_list),
      loss: await lossDiagnostics.assess(enhancedOcr?.data?.text || '', enhancedText, annotation.INCI_list)
    };
    results.push({ id, referenceIngredientCount: annotation.INCI_list.length, baseline, enhanced });
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
