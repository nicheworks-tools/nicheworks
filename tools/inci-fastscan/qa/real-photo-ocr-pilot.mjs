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
import sharp from 'sharp';
import { createProductionLabelScorer, aggregateProductionAssessments } from './production-label-scoring.mjs';

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
const productionScorer = createProductionLabelScorer();
const results = [];
// A/B only: never use the ground-truth annotations to pick OCR output at runtime.
const experimental = { singleBlock: [], sparseText: [] };
// Fixed photo preparations evaluated identically on the pinned corpus. Never
// pick the per-photo winner using the reference transcript (data leakage).
const imagePreprocessing = {
  grayscaleNormalize: [],
  grayscaleSharpen: [],
  grayscaleUpscale: []
};
const prepSettings = Object.freeze({
  grayscaleNormalize: 'Grayscale + full-range contrast normalization, native resolution',
  grayscaleSharpen: 'Grayscale + mild 1.25 gain + sigma 0.8 sharpen, native resolution',
  grayscaleUpscale: 'Grayscale + contrast normalization + up to 2x Lanczos3 enlargement (3072px cap)'
});

async function prepareVariant(imageFile, variant) {
  const processor = sharp(imageFile, { failOn: 'error' });
  const metadata = await processor.metadata();
  assert.ok(metadata.width > 0 && metadata.height > 0, 'Valid source image dimensions required');
  if (variant === 'grayscaleNormalize') {
    return processor.grayscale().normalize().png().toBuffer();
  }
  if (variant === 'grayscaleSharpen') {
    return processor.grayscale().linear(1.25, -32).sharpen({ sigma: 0.8 }).png().toBuffer();
  }
  if (variant === 'grayscaleUpscale') {
    const factor = Math.max(1, Math.min(2, 3072 / Math.max(metadata.width, metadata.height)));
    const width = Math.max(1, Math.round(metadata.width * factor));
    const height = Math.max(1, Math.round(metadata.height * factor));
    return processor.grayscale().normalize().resize(width, height, { kernel: 'lanczos3' }).png().toBuffer();
  }
  throw new Error('Unknown fixed preprocessing variant: ' + variant);
}
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
      rawDirectMetrics: metric.score(gt.raw_ingredients_list, recognized?.data?.text || '', parser.splitIngredients),
      analysis: await productionScorer.assess(normalizedOcr, gt.INCI_list),
      transcriptionOnlyAnalysis: await productionScorer.assess(annotatedRaw, gt.INCI_list)
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
      const annotatedListMetrics = metric.score(gt.INCI_list.join('\n'), processedText, parser.splitIngredients);
      const rawTranscriptionMetrics = metric.score(gt.raw_ingredients_list, processedText, parser.splitIngredients);
      experimental[variant.key].push({
        id,
        durationMs,
        annotatedListMetrics,
        rawTranscriptionMetrics,
        rawDirectMetrics: metric.score(gt.raw_ingredients_list, directText, parser.splitIngredients),
        analysis: await productionScorer.assess(processedText, gt.INCI_list)
      });
      console.log([
        'EXPERIMENT', variant.key, id,
        'exact recall', (100 * annotatedListMetrics.exactIngredientRecall).toFixed(2) + '%',
        'CER', (100 * rawTranscriptionMetrics.characterErrorRate).toFixed(2) + '%',
        'raw OCR CER', (100 * experimental[variant.key].at(-1).rawDirectMetrics.characterErrorRate).toFixed(2) + '%'
      ].join(' | '));
    }
  }

  // PSM6 matches the default page segmentation in the baseline. Compare
  // fixed offline pixel transforms under a constant OCR segmentation mode.
  // These sharp transforms are NOT the browser canvas preprocessor. Their
  // results are diagnostic; they cannot silently become mobile defaults.
  await worker.setParameters({ tessedit_pageseg_mode: '6' });
  for (const variant of Object.keys(imagePreprocessing)) {
    for (const id of ids) {
      const imageFile = path.join(datasetDir, id + '.jpg');
      const gt = YAML.parse(fs.readFileSync(path.join(datasetDir, id + '.yaml'), 'utf8'));
      const imageBytes = await prepareVariant(imageFile, variant);
      assert.ok(imageBytes.length > 1000, id + ': processed image must not be empty');
      const started = performance.now();
      const recognized = await worker.recognize(imageBytes);
      const durationMs = Math.round(performance.now() - started);
      const rawText = recognized?.data?.text || '';
      const cleanedText = processText.postProcessOcrText(
        processText.coreProcessOCRText(rawText), { langHint: 'en' });
      const annotatedListMetrics = metric.score(gt.INCI_list.join('\n'), cleanedText, parser.splitIngredients);
      const rawTranscriptionMetrics = metric.score(gt.raw_ingredients_list, cleanedText, parser.splitIngredients);
      const analysis = await productionScorer.assess(cleanedText, gt.INCI_list);
      imagePreprocessing[variant].push({
        id, durationMs, annotatedListMetrics, rawTranscriptionMetrics, analysis
      });
      console.log('PREPROCESS_PHOTO=' + JSON.stringify({
        variant, id,
        exactRecallPercent: +(100 * annotatedListMetrics.exactIngredientRecall).toFixed(2),
        rawTranscriptionCerPercent: +(100 * rawTranscriptionMetrics.characterErrorRate).toFixed(2),
        dictionarySupportedHitsAfterRepair: analysis.afterRepair.exactReferenceHits,
        dictionarySupportedReferenceNames: analysis.eligibleReferenceUniqueNames,
        matchedNamesNotInAnnotation: analysis.afterRepair.extraMatchesNotInAnnotation,
        durationMs
      }));
    }
  }
} finally {
  await worker.terminate();
}

assert.equal(results.length, 12, 'all twelve real-photo baseline samples must finish');
assert.equal(experimental.singleBlock.length, 12, 'all single-block photos must finish');
assert.equal(experimental.sparseText.length, 12, 'all sparse-text photos must finish');
for (const [variant, rows] of Object.entries(imagePreprocessing)) {
  assert.equal(rows.length, 12, variant + ': all 12 photo experiments must finish');
}
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
    model: 'Tesseract.js 5.0.3 eng worker, unmodified photos; baseline PSM6/11, fixed offline sharp image-preprocessing experiments',
    productionSharedModules: [
      'tools/inci-fastscan/js/core_ocr_post.js',
      'tools/inci-fastscan/qa/photo_ocr_metrics.js',
      'tools/_shared/cosmetic-ingredient-parser.js',
      'tools/inci-fastscan/js/core_parser.js',
      'tools/inci-fastscan/js/core_analyze.js',
      'tools/inci-fastscan/js/core_matcher.js',
      'tools/inci-fastscan/js/generated_dictionary.js',
      'tools/inci-fastscan/data/ingredients*.json'
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
  imagePreprocessingExperiment: Object.fromEntries(
    Object.entries(imagePreprocessing).map(([name, rows]) => [name, {
      recipe: prepSettings[name],
      engine: 'Tesseract.js eng, PSM6; sharp Node.js offline transformation (NOT browser canvas parity)',
      aggregateAnnotatedList: aggregate(rows, 'annotatedListMetrics'),
      aggregateRawTranscription: aggregate(rows, 'rawTranscriptionMetrics'),
      dictionary: aggregateProductionAssessments(rows),
      samples: rows,
      caveat: 'Exploratory study on pinned public real photos; no per-photo oracle selection; never claim production gains without separate browser parity and mobile/jpn QA.'
    }])
  ),
  productionDictionaryEvaluation: {
    dictionaryRecords: productionScorer.dictionaryCount,
    baseline: aggregateProductionAssessments(results),
    annotationOnlyControl: aggregateProductionAssessments(results, 'transcriptionOnlyAnalysis'),
    singleBlock: aggregateProductionAssessments(experimental.singleBlock),
    sparseText: aggregateProductionAssessments(experimental.sparseText),
    metricNotes: 'Strict canonical identity of recognized dictionary matches vs independently annotated INCI list; eligible denominator excludes names not found in the production dictionary. Each ingredient counted once after production deduplication. Extra matches not in source annotation are NOT proven false positives (annotation or OCR may be incomplete); user must review. Before/after differences measure only dictionary exact line-wrap repair, never ground-truth-guided correction. Control transcribes source label with no photo OCR; not OCR accuracy.'
  },
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

for (const [variant, scores] of Object.entries(report.productionDictionaryEvaluation)) {
  if (!scores || typeof scores !== 'object' || !('eligibleReferenceUniqueNames' in scores)) continue;
  console.log('FASTSCAN_PRODUCTION_END_TO_END=' + JSON.stringify({
    variant,
    photos: scores.photos,
    dictionaryRecords: productionScorer.dictionaryCount,
    dictionarySupportedReferenceNames: scores.eligibleReferenceUniqueNames,
    dictionaryUnsupportedReferenceItems: scores.dictionaryUnsupportedItems,
    beforeRepairRecallPercent: scores.beforeRepairRecallOfDictionarySupported == null ? null : +(100 * scores.beforeRepairRecallOfDictionarySupported).toFixed(2),
    afterRepairRecallPercent: scores.afterRepairRecallOfDictionarySupported == null ? null : +(100 * scores.afterRepairRecallOfDictionarySupported).toFixed(2),
    beforeRepairExtraMatches: scores.beforeRepairExtraNotInAnnotation,
    afterRepairExtraMatches: scores.afterRepairExtraNotInAnnotation,
    exactJoinRepairs: scores.exactJoinRepairs,
    threePartRepairs: scores.threePartRepairs
  }));
}

for (const [variant, group] of Object.entries(report.imagePreprocessingExperiment)) {
  const m = group.dictionary;
  console.log('FASTSCAN_PREPROCESS_A_B=' + JSON.stringify({
    variant,
    photos: m.photos,
    supportedReferenceNames: m.eligibleReferenceUniqueNames,
    dictionaryHitsBeforeRepair: m.beforeRepairHits,
    dictionaryHitsAfterRepair: m.afterRepairHits,
    dictionaryRecallBeforePercent: +(100 * m.beforeRepairRecallOfDictionarySupported).toFixed(2),
    dictionaryRecallAfterPercent: +(100 * m.afterRepairRecallOfDictionarySupported).toFixed(2),
    strictAnnotatedExactRecallPercent: +(100 * group.aggregateAnnotatedList.pooledExactIngredientRecall).toFixed(2),
    rawTranscriptionCerPercent: +(100 * group.aggregateRawTranscription.pooledCharacterErrorRate).toFixed(2),
    additionalMatchesNotInAnnotations: m.afterRepairExtraNotInAnnotation,
    baselineDefaultDictionaryHitsAfterRepair: report.productionDictionaryEvaluation.baseline.afterRepairHits
  }));
}
