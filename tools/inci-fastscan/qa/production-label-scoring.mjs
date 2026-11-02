/**
 * Actual FastScan browser parser -> conservative wrap repair -> exact dictionary
 * matcher, evaluated without a DOM. All outputs are numbers; neither photos
 * nor recognized/transcribed label content may be returned or persisted.
 *
 * The frozen external corpus is evaluated in real-photo-ocr-pilot.mjs.
 * A reference ingredient absent from the deployed dictionary is NOT counted
 * as an OCR false negative. Unmatched OCR tokens remain visible in the app.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const root = 'tools/inci-fastscan/';

function loadProductionDictionary() {
  const rows = [];
  for (const suffix of ['', ...Array.from({ length: 8 }, (_, i) => '-extra-' + (i + 1))]) {
    const file = root + 'data/ingredients' + suffix + '.json';
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(Array.isArray(data), file + ' must contain an array');
    rows.push(...data);
  }
  const generatedWindow = {};
  vm.runInNewContext(fs.readFileSync(root + 'js/generated_dictionary.js', 'utf8'),
    { window: generatedWindow }, { filename: 'generated_dictionary.js' });
  assert.ok(Array.isArray(generatedWindow.NW_INCI_GENERATED_DICTIONARY));
  rows.push(...generatedWindow.NW_INCI_GENERATED_DICTIONARY);
  // This is the same merge used by app.js after fetch() of the nine files.
  return parser.mergeDictionaryRecords(rows);
}

function createRuntime() {
  const context = { NWCosmeticIngredientParser: parser };
  context.globalThis = context;
  vm.createContext(context);
  for (const filename of ['core_parser.js', 'core_matcher.js', 'core_analyze.js']) {
    vm.runInContext(fs.readFileSync(root + 'js/' + filename, 'utf8'), context,
      { filename });
  }
  assert.equal(typeof context.coreParseIngredients, 'function');
  assert.equal(typeof context.coreMatchIngredients, 'function');
  assert.equal(typeof context.coreAnalyzeIngredients, 'function');
  return context;
}

function identity(value) {
  return parser.canonicalIdentityKey(value);
}

function uniqueMatched(results) {
  return new Set(results.filter(result => result.found === true)
    .map(result => identity(result.en)).filter(Boolean));
}

function compareToReference(results, referenceKeys) {
  const matched = uniqueMatched(results);
  let referenceHits = 0;
  for (const key of referenceKeys) if (matched.has(key)) referenceHits += 1;
  let recognizedNotInAnnotation = 0;
  for (const key of matched) if (!referenceKeys.has(key)) recognizedNotInAnnotation += 1;
  const totalRecognized = matched.size;
  return {
    parsedItems: results.length,
    matchedDictionaryItems: results.filter(result => result.found === true).length,
    unmatchedItems: results.filter(result => result.found !== true).length,
    matchedUniqueDictionaryNames: totalRecognized,
    exactReferenceHits: referenceHits,
    extraMatchesNotInAnnotation: recognizedNotInAnnotation,
    eligibleReferenceRecall: referenceKeys.size ? referenceHits / referenceKeys.size : null,
    matchedNamePrecisionVsAnnotation: totalRecognized
      ? referenceHits / totalRecognized : null
  };
}

export function createProductionLabelScorer() {
  const dictionary = loadProductionDictionary();
  const runtime = createRuntime();
  assert.ok(dictionary.length > 599, 'Must load the full maintained + generated dictionary');

  async function assess(cleanedOcrText, canonicalAnnotationList) {
    assert.equal(typeof cleanedOcrText, 'string');
    assert.ok(Array.isArray(canonicalAnnotationList));
    // Ground truth determines ONLY the evaluation denominator and hit counts.
    // It is NEVER passed to the OCR or to runtime parser repair operations.
    const expected = await runtime.coreMatchIngredients(canonicalAnnotationList, dictionary);
    const expectedSet = uniqueMatched(expected);
    const before = await runtime.coreMatchIngredients(
      runtime.coreParseIngredients(cleanedOcrText), dictionary);
    const after = await runtime.coreAnalyzeIngredients(cleanedOcrText, dictionary);
    const stats = {
      annotationIngredients: canonicalAnnotationList.length,
      annotationDictionarySupportedItems: expected.filter(item => item.found === true).length,
      annotationDictionaryUnsupportedItems: expected.filter(item => item.found !== true).length,
      eligibleReferenceUniqueNames: expectedSet.size,
      beforeRepair: compareToReference(before, expectedSet),
      afterRepair: compareToReference(after.results, expectedSet),
      exactJoinRepairs: after.repairs.length,
      exactSequenceSplits: after.exactSequenceSplits || 0,
      threePartRepairs: after.repairs.filter(repair => repair.from.length === 3).length
    };
    // Metric safety: don't serialize source INCI, original OCR or suggestions.
    assert.ok(Object.values(stats).every(x => typeof x === 'number' || (x && typeof x === 'object')));
    return stats;
  }

  // Count independently annotated-name conflicts without disclosing any names.
  // Source transcriptions can contain spelling and annotation mismatches;
  // "mentioned" is a diagnostic proxy, not proof that an extra is valid.
  const candidateNamesByIdentity = new Map();
  for (const item of dictionary) {
    const key = identity(item.en);
    if (!key) continue;
    if (!candidateNamesByIdentity.has(key)) candidateNamesByIdentity.set(key, []);
    candidateNamesByIdentity.get(key).push(item.en, ...(item.alias || []));
  }
  function tokenize(value) {
    return String(value || '').normalize('NFKC').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  async function auditAnnotationExtras(cleanedOcrText, canonicalAnnotationList, independentRawLabel) {
    assert.equal(typeof cleanedOcrText, 'string');
    assert.ok(Array.isArray(canonicalAnnotationList));
    assert.equal(typeof independentRawLabel, 'string');
    const supported = uniqueMatched(await runtime.coreMatchIngredients(canonicalAnnotationList, dictionary));
    const found = uniqueMatched((await runtime.coreAnalyzeIngredients(cleanedOcrText, dictionary)).results);
    const label = ' ' + tokenize(independentRawLabel) + ' ';
    let extras = 0;
    let mentionedInSourceTranscription = 0;
    let notMentionedInSourceTranscription = 0;
    for (const key of found) {
      if (supported.has(key)) continue;
      extras += 1;
      const candidates = candidateNamesByIdentity.get(key) || [];
      const mentioned = candidates.some(value => {
        const term = tokenize(value);
        return term.length >= 3 && label.includes(' ' + term + ' ');
      });
      if (mentioned) mentionedInSourceTranscription += 1;
      else notMentionedInSourceTranscription += 1;
    }
    assert.equal(extras, mentionedInSourceTranscription + notMentionedInSourceTranscription);
    return { extras, mentionedInSourceTranscription, notMentionedInSourceTranscription };
  }

  return Object.freeze({
    dictionaryCount: dictionary.length,
    assess,
    auditAnnotationExtras
  });
}

export function aggregateProductionAssessments(rows, field = 'analysis') {
  const aggregate = {
    photos: rows.length,
    referenceAnnotatedItems: 0,
    dictionarySupportedItems: 0,
    dictionaryUnsupportedItems: 0,
    eligibleReferenceUniqueNames: 0,
    beforeRepairHits: 0,
    afterRepairHits: 0,
    beforeRepairMatchedNames: 0,
    afterRepairMatchedNames: 0,
    beforeRepairExtraNotInAnnotation: 0,
    afterRepairExtraNotInAnnotation: 0,
    beforeRepairUnmatchedTokens: 0,
    afterRepairUnmatchedTokens: 0,
    exactJoinRepairs: 0,
    exactSequenceSplits: 0,
    threePartRepairs: 0
  };
  for (const row of rows) {
    const item = row[field];
    assert.ok(item && item.beforeRepair && item.afterRepair,
      'Every real-photo row needs a completed end-to-end analysis');
    aggregate.referenceAnnotatedItems += item.annotationIngredients;
    aggregate.dictionarySupportedItems += item.annotationDictionarySupportedItems;
    aggregate.dictionaryUnsupportedItems += item.annotationDictionaryUnsupportedItems;
    aggregate.eligibleReferenceUniqueNames += item.eligibleReferenceUniqueNames;
    aggregate.beforeRepairHits += item.beforeRepair.exactReferenceHits;
    aggregate.afterRepairHits += item.afterRepair.exactReferenceHits;
    aggregate.beforeRepairMatchedNames += item.beforeRepair.matchedUniqueDictionaryNames;
    aggregate.afterRepairMatchedNames += item.afterRepair.matchedUniqueDictionaryNames;
    aggregate.beforeRepairExtraNotInAnnotation += item.beforeRepair.extraMatchesNotInAnnotation;
    aggregate.afterRepairExtraNotInAnnotation += item.afterRepair.extraMatchesNotInAnnotation;
    aggregate.beforeRepairUnmatchedTokens += item.beforeRepair.unmatchedItems;
    aggregate.afterRepairUnmatchedTokens += item.afterRepair.unmatchedItems;
    aggregate.exactJoinRepairs += item.exactJoinRepairs;
    aggregate.exactSequenceSplits += item.exactSequenceSplits;
    aggregate.threePartRepairs += item.threePartRepairs;
  }
  aggregate.beforeRepairRecallOfDictionarySupported = aggregate.eligibleReferenceUniqueNames
    ? aggregate.beforeRepairHits / aggregate.eligibleReferenceUniqueNames : null;
  aggregate.afterRepairRecallOfDictionarySupported = aggregate.eligibleReferenceUniqueNames
    ? aggregate.afterRepairHits / aggregate.eligibleReferenceUniqueNames : null;
  aggregate.beforeRepairPrecisionVsAnnotation = aggregate.beforeRepairMatchedNames
    ? aggregate.beforeRepairHits / aggregate.beforeRepairMatchedNames : null;
  aggregate.afterRepairPrecisionVsAnnotation = aggregate.afterRepairMatchedNames
    ? aggregate.afterRepairHits / aggregate.afterRepairMatchedNames : null;
  return aggregate;
}
