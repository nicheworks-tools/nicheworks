import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const read = (path) => fs.readFileSync(path, 'utf8');

const RUNTIME_FILES = [
  'tools/inci-fastscan/js/core_ocr_post.js',
  'tools/inci-fastscan/js/core_parser.js',
  'tools/inci-fastscan/js/core_matcher.js',
  'tools/inci-fastscan/js/core_analyze.js'
];

const context = {
  console,
  NWCosmeticIngredientParser: parser
};
context.globalThis = context;
vm.createContext(context);

for (const file of RUNTIME_FILES) {
  vm.runInContext(read(file), context, { filename: file });
}

const postProcess = context.postProcessOcrText;
const repair = context.repairWrappedIngredientFragments;
const analyze = context.coreAnalyzeIngredients;
const match = context.coreMatchIngredients;

assert.equal(typeof postProcess, 'function', 'postProcessOcrText must be available');
assert.equal(typeof repair, 'function', 'repairWrappedIngredientFragments must be available');
assert.equal(typeof analyze, 'function', 'coreAnalyzeIngredients must be available');
assert.equal(typeof match, 'function', 'coreMatchIngredients must be available');

const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];
const dict = parser.mergeDictionaryRecords(
  DATA_FILES.flatMap((file) => JSON.parse(read(file)))
);
const corpus = JSON.parse(read('tools/_shared/cosmetics-real-label-corpus.json'));

function boundaryKey(value) {
  return parser.normalizeBaseKey(value).replace(/\s+/g, '');
}

// Source-backed round-trip: reshape each maintained real label into an OCR-like
// line stream and verify that cleanup does not lose, invent, or merge boundaries.
let corpusIngredientCount = 0;
let sourceKnownCount = 0;
let roundTripKnownCount = 0;
for (const item of corpus) {
  const sourceParts = parser.splitIngredients(item.analysis_label);
  corpusIngredientCount += sourceParts.length;
  const langHint = item.label_language === 'ja' ? 'jp' : 'en';
  const start = langHint === 'jp' ? '全成分' : 'INGREDIENTS';
  const stop = langHint === 'jp' ? '内容量 120mL' : 'WARNING For external use only';
  const body = sourceParts
    .map((part, index) => `${part}${index % 2 === 0 ? '，' : '；'}`)
    .join('\n');
  const cleaned = postProcess(`${start}\n${body}\n${stop}`, { langHint });
  const roundTrip = parser.splitIngredients(cleaned);

  assert.deepEqual(
    roundTrip.map(boundaryKey),
    sourceParts.map(boundaryKey),
    `${item.id}: OCR cleanup changed real-label ingredient boundaries`
  );

  const sourceMatches = await match(sourceParts, dict);
  const roundTripMatches = await match(roundTrip, dict);
  const sourceKnown = sourceMatches.filter((result) => result.found).length;
  const roundTripKnown = roundTripMatches.filter((result) => result.found).length;
  sourceKnownCount += sourceKnown;
  roundTripKnownCount += roundTripKnown;
  assert.ok(
    roundTripKnown >= sourceKnown,
    `${item.id}: safe OCR cleanup reduced exact dictionary recognition (${sourceKnown} -> ${roundTripKnown})`
  );
}

// Numeric locants and header/trailer extraction must remain deterministic.
const englishProcessed = postProcess(
  'FRONT LABEL\nINGREDIENTS\nWater， Glycerin；\nSodium\nHyaluronate\n1,2-Hexanediol\nWARNING Keep out of reach',
  { langHint: 'en' }
);
assert.deepEqual(
  parser.splitIngredients(englishProcessed),
  ['Water', 'Glycerin', 'Sodium', 'Hyaluronate', '1,2-Hexanediol'],
  'English OCR cleanup must preserve line candidates and numeric locant commas'
);

// Real ingredient labels often separate names with bullets; removing these
// marks as whitespace would merge two correctly recognized ingredients.
const bulletRaw = 'INGREDIENTS: Water • Glycerin ● 1,2-Hexanediol\nWARNING';
const bulletPost = postProcess(context.coreProcessOCRText(bulletRaw), { langHint: 'en' });
assert.deepEqual(
  Array.from(parser.splitIngredients(bulletPost)),
  ['Water', 'Glycerin', '1,2-Hexanediol'],
  'OCR bullets are ingredient delimiters; numeric locant commas are not'
);
assert.deepEqual(
  Array.from(parser.splitIngredients(postProcess('全成分：水•グリセリン●ヒアルロン酸Na', { langHint: 'jp' }))),
  ['水', 'グリセリン', 'ヒアルロン酸Na'],
  'Japanese ingredient bullet separators must not join adjacent names'
);

const japaneseProcessed = postProcess(
  '商品名\n全成分\n水、 グリセリン，ヒアルロン酸 Na\n内容量 120mL',
  { langHint: 'jp' }
);
assert.deepEqual(
  parser.splitIngredients(japaneseProcessed),
  ['水', 'グリセリン', 'ヒアルロン酸Na'],
  'Japanese OCR cleanup must normalize safe label spacing without changing boundaries'
);

// OCR cleanup itself must never guess an ingredient join. Exact dictionary-aware
// joining belongs only to the later analysis stage.
assert.equal(
  postProcess('INGREDIENTS\nSodium\nWater\nWARNING', { langHint: 'en' }),
  'Sodium\nWater',
  'OCR cleanup must preserve adjacent candidate lines instead of heuristic merging'
);

const repairDict = [
  { en: 'Water', jp: ['水'], alias: [] },
  { en: 'Glycerin', jp: ['グリセリン'], alias: [] },
  { en: 'Alcohol', jp: ['エタノール'], alias: [] },
  { en: 'Cetearyl Alcohol', jp: ['セテアリルアルコール'], alias: [] },
  { en: 'Sodium Hyaluronate', jp: ['ヒアルロン酸Na'], alias: [] }
];

let repaired = repair(['Cetearyl', 'Alcohol'], repairDict);
assert.deepEqual(
  Array.from(repaired.list),
  ['Cetearyl Alcohol'],
  'one independently known fragment may participate in an exact dictionary-backed wrapped-name repair'
);
assert.equal(repaired.repairs.length, 1);

repaired = repair(['Water', 'Glycerin'], repairDict);
assert.deepEqual(
  Array.from(repaired.list),
  ['Water', 'Glycerin'],
  'two independently known ingredients must never be merged'
);
assert.equal(repaired.repairs.length, 0);

repaired = repair(['Unknown Alpha', 'Alcohol'], repairDict);
assert.deepEqual(
  Array.from(repaired.list),
  ['Unknown Alpha', 'Alcohol'],
  'an unknown fragment followed by a known ingredient must stay separate unless their combined identity is exact'
);
assert.equal(repaired.repairs.length, 0);

const endToEnd = await analyze(
  postProcess('INGREDIENTS\nSodium\nHyaluronate\nWater\nWARNING', { langHint: 'en' }),
  repairDict
);
assert.deepEqual(
  Array.from(endToEnd.list),
  ['Sodium Hyaluronate', 'Water'],
  'exact dictionary repair must occur only at the analysis stage'
);
assert.equal(endToEnd.results[0].found, true);
assert.equal(endToEnd.results[0].en, 'Sodium Hyaluronate');

// Strict exact multi-ingredient rescue: only a unique full-line decomposition
// into maintained names may split a single unlabeled OCR fragment.
const exactStream = await analyze('Water Glycerin', repairDict);
assert.deepEqual(Array.from(exactStream.list), ['Water', 'Glycerin']);
assert.equal(exactStream.exactSequenceSplits, 1);
assert.equal(exactStream.results.filter(item => item.found).length, 2);

const unresolvedStream = await analyze('Water Glycerin Mystery', repairDict);
assert.deepEqual(Array.from(unresolvedStream.list), ['Water Glycerin Mystery'],
  'Do not discard unknown text just to create known ingredient matches');
assert.equal(unresolvedStream.exactSequenceSplits, 0);

const alreadyCanonical = await analyze('Cetearyl Alcohol', repairDict);
assert.deepEqual(Array.from(alreadyCanonical.list), ['Cetearyl Alcohol']);
assert.equal(alreadyCanonical.exactSequenceSplits, 0);

const syntheticCompound = await analyze('Water Glycerin',
  [...repairDict, { en: 'Water Glycerin', jp: [], alias: [] }]);
assert.deepEqual(Array.from(syntheticCompound.list), ['Water Glycerin'],
  'Do not split a complete maintained multiword INCI identity');
assert.equal(syntheticCompound.exactSequenceSplits, 0);

const japaneseSpacing = await analyze('水 グリセリン', repairDict);
assert.deepEqual(Array.from(japaneseSpacing.list), ['水 グリセリン'],
  'Experimental Latin-word segmentation must not alter Japanese OCR text');

// Source labels sometimes use spaced dashes as ingredient delimiters.
// Preserve PEG-20, numeric ranges, slash compounds and ordinary OCR defaults.
const dashRaw = 'INGREDIENTS: WATER - GLYCERIN - PEG-20 - C12-15 ALKYL BENZOATE';
const spaced = postProcess(dashRaw, { langHint: 'en', spacedDashDelimiter: true });
assert.deepEqual(Array.from(parser.splitIngredients(spaced)),
  ['WATER', 'GLYCERIN', 'PEG-20', 'C12-15 ALKYL BENZOATE']);
assert.equal(postProcess(dashRaw, { langHint: 'en' }).includes('WATER - GLYCERIN'), true,
  'Flag-free compatibility default remains unchanged');
assert.equal(postProcess('全成分：水 - グリセリン',
  { langHint: 'jp', spacedDashDelimiter: true }),
  postProcess('全成分：水 - グリセリン', { langHint: 'jp' }));
assert.deepEqual(Array.from(parser.splitIngredients(postProcess(
  'INGREDIENTS: PEG/PPG-9/2 DIMETHYL ETHER - WATER',
  { langHint: 'en', spacedDashDelimiter: true }))),
  ['PEG/PPG-9/2 DIMETHYL ETHER', 'WATER']);

// Character-confusion handling stays review-only: the input remains unmatched,
// while a conservative OCR hint may be exposed to the user.
const confusionDict = [
  { en: 'Phenoxyethanol', jp: ['フェノキシエタノール'], alias: [] },
  { en: 'Glycerin', jp: ['グリセリン'], alias: [] },
  { en: 'Niacinamide', jp: ['ナイアシンアミド'], alias: [] }
];
const confusionResults = await match(
  ['PhenoxyethanoI', 'Glycerln', 'Niacinamlde', 'Phenoxyethanox'],
  confusionDict
);
for (const result of confusionResults.slice(0, 3)) {
  assert.equal(result.found, false, 'OCR character confusion must never become an automatic exact match');
  assert.ok(result.ocr_confusion, 'common OCR character confusion should remain visible as a review hint');
}
assert.equal(confusionResults[3].found, false);
assert.equal(
  confusionResults[3].ocr_confusion,
  null,
  'ordinary spelling edits must not be mislabeled as OCR character confusion'
);

// OCR runtime remains independent from the live Amazon layer.
const ocrRuntime = RUNTIME_FILES.map(read).join('\n');
for (const forbidden of ['cosmetics-affiliate-config', 'amazon.co.jp', 'amzn.to', 'affiliate_click']) {
  assert.equal(ocrRuntime.includes(forbidden), false, `OCR runtime must stay isolated from affiliate logic: ${forbidden}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'fastscan-ocr-robustness',
  source_backed_products: corpus.length,
  source_backed_ingredients_round_tripped: corpusIngredientCount,
  exact_known_before_cleanup: sourceKnownCount,
  exact_known_after_cleanup: roundTripKnownCount,
  cleanup_preserves_candidate_boundaries: true,
  exact_dictionary_join_stage: 'analysis-only',
  one_known_fragment_exact_join: true,
  ocr_character_confusion_auto_applied: false,
  affiliate_isolated: true
}, null, 2));
