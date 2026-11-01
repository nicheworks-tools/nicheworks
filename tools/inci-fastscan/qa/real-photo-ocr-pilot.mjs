/**
 * External real-photo Tesseract.js baseline (not a mobile/browser acceptance test).
 * Corpus: https://github.com/ki-iw/toxfox-ocr (GPL-3.0), pinned at 5ba39a7...
 * Source JPG/YAML are downloaded transiently by CI, never committed/uploaded.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { createWorker } from 'tesseract.js';
import YAML from 'yaml';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const corpusCommit = '5ba39a7b06c59ff1edb30a396fdd640f82506742';
const datasetDir = process.env.FASTSCAN_PHOTO_CORPUS_DIR;
const outputFile = process.env.FASTSCAN_PHOTO_REPORT;
if (!datasetDir || !outputFile) throw new Error('Set FASTSCAN_PHOTO_CORPUS_DIR and FASTSCAN_PHOTO_REPORT');
assert.equal(process.env.FASTSCAN_PHOTO_CORPUS_COMMIT, corpusCommit,
  'Ground truth and image samples must come from the pinned public repository commit');

const ids = Object.freeze([
  '0083800047833', '0085805190880', '0768614212331', '0842101102074',
  '11112140153911', '3253581766538', '3253581780039', '3367729117264',
  '3499320013727', '3499320014854', '3574661563312', '3574661588353'
]);
assert.equal(new Set(ids).size, 12, 'photo sample identifiers must be unique');
const metricContext = {};
vm.runInNewContext(fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_metrics.js', 'utf8'),
  metricContext, { filename: 'photo_ocr_metrics.js' });
const metric = metricContext.NWFastScanPhotoMetrics;
const postContext = {};
vm.runInNewContext(
  fs.readFileSync('tools/inci-fastscan/js/core_ocr_post.js', 'utf8') +
  '\nglobalThis.FastScanOCRPost = { coreProcessOCRText, postProcessOcrText };',
  postContext, { filename: 'core_ocr_post.js' });
const processText = postContext.FastScanOCRPost;
assert.ok(metric?.score && processText?.postProcessOcrText,
  'Use the production FastScan OCR text postprocessor and QA accuracy metrics');

function aggregate(rows, field) {
  let referenceChars = 0;
  let edits = 0;
  let referenceIngredients = 0;
  let recognizedIngredients = 0;
  let hits = 0;
  let elapsedMs = 0;
  for (const row of rows) {
    const m = row[field];
    referenceChars += m.referenceCharacters;
    edits += m.characterEdits;
    referenceIngredients += m.referenceIngredients;
    recognizedIngredients += m.recognizedIngredients;
    hits += m.exactIngredientHits;
    if (field === 'annotatedListMetrics') elapsedMs += row.durationMs;
  }
  return {
    photos: rows.length,
    referenceCharacters: referenceChars,
    characterEdits: edits,
    pooledCharacterErrorRate: referenceChars ? edits / referenceChars : null,
    referenceIngredients,
    recognizedIngredients,
    exactIngredientHits: hits,
    pooledExactIngredientRecall: referenceIngredients ? hits / referenceIngredients : null,
    pooledExactIngredientPrecision: recognizedIngredients ? hits / recognizedIngredients : null,
    ...(field === 'annotatedListMetrics' ? { totalOcrDurationMs: elapsedMs } : {})
  };
}
// A/B only: never use the ground-truth annotations to pick OCR output at runtime.
const experimental = { singleBlock: [], sparseText: [] };
const worker = await createWorker('eng');
try {
  for (const id of ids) {
    const imageFile = path.join(datasetDir, id + '.jpg');
    const truthFile = path.join(datasetDir, id + '.yaml');
    assert.ok(fs.statSync(imageFile).size > 1000, id + ': empty/non-photo fixture');
    const gt = YAML.parse(fs.readFileSync(truthFile, 'utf8'));
    assert.ok(gt?.image_name === id + '.jpg', id + ': annotation/photo correspondence failed');
    assert.ok(Array.isArray(gt.INCI_list) && gt.INCI_list.length >= 4, id + ': too few annotated ingredients');
    assert.ok(typeof gt.raw_ingredients_list === 'string' && gt.raw_ingredients_list.trim().length >= 20,
      id + ': missing source-transcribed label');

    const started = performance.now();
    const recognized = await worker.recognize(imageFile);
    const durationMs = Math.round(performance.now() - started);
    const normalizedOcr = processText.postProcessOcrText(
      processText.coreProcessOCRText(recognized?.data?.text || ''), { langHint: 'en' });
    const annotatedListMetrics = metric.score(gt.INCI_list.join('\n'), normalizedOcr, parser.splitIngredients);
    const rawTranscriptionMetrics = metric.score(gt.raw_ingredients_list, normalizedOcr, parser.splitIngredients);
    // Positive control: score a source annotation transcription against its
    // own canonical INCI_list without any photo OCR. This quantifies the strict
    // evaluator's alias/parenthesis/punctuation mismatch on this corpus.
    // It is not an OCR prediction and must not be counted as OCR accuracy.
    const annotatedRaw = processText.postProcessOcrText(
      processText.coreProcessOCRText(gt.raw_ingredients_list), { langHint: 'en' });
    const annotationOracleMetrics = metric.score(
      gt.INCI_list.join('\n'), annotatedRaw, parser.splitIngredients);

    results.push({
      id,
      referenceIngredientCount: gt.INCI_list.length,
      durationMs,
      annotatedListMetrics,
      rawTranscriptionMetrics,
      annotationOracleMetrics,
      rawDirectMetrics: metric.score(gt.raw_ingredients_list, recognized?.data?.text || '', parser.splitIngredients)
    });
    console.log([
      'PHOTO', id, 'annotated ingredients', gt.INCI_list.length,
      'recognized', annotatedListMetrics.recognizedIngredients,
      'exact recall', (100 * annotatedListMetrics.exactIngredientRecall).toFixed(2) + '%',
      'annotation-only control recall', (100 * annotationOracleMetrics.exactIngredientRecall).toFixed(2) + '%',
      'character error', (100 * rawTranscriptionMetrics.characterErrorRate).toFixed(2) + '%',
      'duration', durationMs + 'ms'
    ].join(' | '));
  }

  // Fixed, explicit Tesseract page-segmentation experiments on the SAME twelve
  // unmodified photos and independent reference transcriptions. This is an
  // offline A/B measurement; no best-per-photo oracle selection is deployed.
  for (const variant of [
    { key: 'singleBlock', pageSegMode: '6' },
    { key: 'sparseText', pageSegMode: '11' }
  ]) {
    await worker.setParameters({ tessedit_pageseg_mode: variant.pageSegMode });
    for (const id of ids) {
      const imageFile = path.join(datasetDir, id + '.jpg');
      const gt = YAML.parse(fs.readFileSync(path.join(datasetDir, id + '.yaml'), 'utf8'));
      const started = performance.now();
      const recognized = await worker.recognize(imageFile);
      const durationMs = Math.round(performance.now() - started);
      const directText = recognized?.data?.text || '';
      const processedText = processText.postProcessOcrText(
        processText.coreProcessOCRText(directText), { langHint: 'en' });
      const annotatedListMetrics = metric.score(gt.INCI_list.join('\\n'), processedText, parser.splitIngredients);
      const rawTranscriptionMetrics = metric.score(gt.raw_ingredients_list, processedText, parser.splitIngredients);
      experimental[variant.key].push({
        id,
        durationMs,
        annotatedListMetrics,
        rawTranscriptionMetrics,
        rawDirectMetrics: metric.score(gt.raw_ingredients_list, directText, parser.splitIngredients)
      });
      console.log([
        'EXPERIMENT', variant.key, id,
        'exact recall', (100 * annotatedListMetrics.exactIngredientRecall).toFixed(2) + '%',
        'CER', (100 * rawTranscriptionMetrics.characterErrorRate).toFixed(2) + '%',
        'raw OCR CER', (100 * experimental[variant.key].at(-1).rawDirectMetrics.characterErrorRate).toFixed(2) + '%'
      ].join(' | '));
    }
  }
} finally {
  await worker.terminate();
}

assert.equal(results.length, 12, 'all twelve real-photo baseline samples must finish');
assert.equal(experimental.singleBlock.length, 12, 'all single-block photos must finish');
assert.equal(experimental.sparseText.length, 12, 'all sparse-text photos must finish');
const report = {
  schema: 'fastscan-external-real-photo-pilot-v1',
  corpus: {
    repository: 'https://github.com/ki-iw/toxfox-ocr',
    commit: corpusCommit,
    license: 'GPL-3.0',
    imagesAndTranscriptionsRepublished: false,
    language: 'eng',
    sampleCount: results.length
  },
  method: {
    model: 'Tesseract.js 5.0.3 eng worker, unmodified photos; baseline default PSM, fixed PSM6/11 experiments',
    productionSharedModules: [
      'tools/inci-fastscan/js/core_ocr_post.js',
      'tools/inci-fastscan/qa/photo_ocr_metrics.js',
      'tools/_shared/cosmetic-ingredient-parser.js'
    ],
    caveat: 'Exploratory Tesseract.js real-photo baseline. Does NOT exercise browser image preprocessing, phone cameras, Japanese OCR or full live FastScan UI. External annotations may contain spelling and alias variations. The annotation-only positive control estimates strict scoring disagreement on source ground truths without photo OCR.',
    passCriteria: 'All 12 photographs processed with real OCR and a per-photo numeric result; there is no fabricated accuracy threshold.'
  },
  aggregateAnnotatedList: aggregate(results, 'annotatedListMetrics'),
  aggregateRawTranscription: aggregate(results, 'rawTranscriptionMetrics'),
  aggregateAnnotationOnlyControl: aggregate(results, 'annotationOracleMetrics'),
  baselineRawUnprocessed: aggregate(results, 'rawDirectMetrics'),
  experimentalPageSegmentation: Object.fromEntries(Object.entries(experimental).map(([name, rows]) => [name, {
    mode: name === 'singleBlock' ? 'PSM6 - assume a single uniform text block' : 'PSM11 - sparse text',
    aggregateAnnotatedList: aggregate(rows, 'annotatedListMetrics'),
    aggregateRawTranscription: aggregate(rows, 'rawTranscriptionMetrics'),
    rawUnprocessed: aggregate(rows, 'rawDirectMetrics'),
    samples: rows,
    caveat: 'Diagnostic only. No ground-truth oracle used at runtime; no production PSM changed.'
  }])),
  samples: results
};
fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n', 'utf8');
const a = report.aggregateAnnotatedList;
const r = report.aggregateRawTranscription;
console.log('FASTSCAN_REAL_PHOTO_PILOT=' + JSON.stringify({
  status: 'MEASURED_NOT_CERTIFIED',
  photos: results.length,
  annotatedListExactRecallPercent: +(100*a.pooledExactIngredientRecall).toFixed(2),
  rawTranscriptionCerPercent: +(100*r.pooledCharacterErrorRate).toFixed(2),
  annotationOnlyControlRecallPercent: +(100*report.aggregateAnnotationOnlyControl.pooledExactIngredientRecall).toFixed(2),
  report: outputFile
}));

for (const [name, group] of Object.entries(report.experimentalPageSegmentation)) {
  console.log('FASTSCAN_PSM_EXPERIMENT=' + JSON.stringify({
    variant: name,
    photos: group.aggregateAnnotatedList.photos,
    exactIngredientRecallPercent: +(100 * group.aggregateAnnotatedList.pooledExactIngredientRecall).toFixed(2),
    rawTranscriptionCerPercent: +(100 * group.aggregateRawTranscription.pooledCharacterErrorRate).toFixed(2),
    baselineExactRecallPercent: +(100 * a.pooledExactIngredientRecall).toFixed(2),
    baselineCerPercent: +(100 * r.pooledCharacterErrorRate).toFixed(2),
    rawPreCleanupCerPercent: +(100 * group.rawUnprocessed.pooledCharacterErrorRate).toFixed(2)
  }));
}
