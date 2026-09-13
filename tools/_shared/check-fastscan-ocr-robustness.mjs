import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const read = (path) => fs.readFileSync(path, 'utf8');

const context = {
  console,
  NWCosmeticIngredientParser: parser
};
context.globalThis = context;
vm.createContext(context);

for (const file of [
  'tools/inci-fastscan/js/core_ocr_post.js',
  'tools/inci-fastscan/js/core_parser.js',
  'tools/inci-fastscan/js/core_matcher.js',
  'tools/inci-fastscan/js/core_analyze.js'
]) {
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

// The real-label corpus is quality evidence, not an affiliate input. The OCR
// benchmark must not reference the affiliate runtime or Amazon destinations.
const source = read('tools/_shared/check-fastscan-ocr-robustness.mjs');
for (const forbidden of ['cosmetics-affiliate-config', 'amazon.co.jp', 'amzn.to', 'affiliate_click']) {
  assert.equal(source.includes(forbidden), false, `OCR robustness benchmark must stay isolated from affiliate logic: ${forbidden}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'fastscan-ocr-robustness',
  source_backed_products: corpus.length,
  source_backed_ingredients_round_tripped: corpusIngredientCount,
  cleanup_preserves_candidate_boundaries: true,
  exact_dictionary_join_stage: 'analysis-only',
  one_known_fragment_exact_join: true,
  ocr_character_confusion_auto_applied: false,
  affiliate_isolated: true
}, null, 2));
