import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

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

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const records = DATA_FILES.flatMap((rel) => JSON.parse(read(rel)));

const keyOwners = new Map();
function addKey(value, canonical) {
  const key = parser.normalizeKey(value);
  if (!key) return;
  if (!keyOwners.has(key)) keyOwners.set(key, new Set());
  keyOwners.get(key).add(canonical);
}

for (const item of records) {
  if (!item?.en) continue;
  addKey(item.en, item.en);
  for (const jp of Array.isArray(item.jp) ? item.jp : []) addKey(jp, item.en);
  for (const alias of Array.isArray(item.alias) ? item.alias : []) addKey(alias, item.en);
}

function exactCanonical(value) {
  const owners = keyOwners.get(parser.normalizeKey(value));
  if (!owners || owners.size !== 1) return null;
  return [...owners][0];
}

function uniqueCandidates(kind) {
  const output = [];
  const seen = new Set();
  const sorted = records
    .filter((item) => item?.en)
    .slice()
    .sort((a, b) => parser.normalizeKey(a.en).localeCompare(parser.normalizeKey(b.en)));

  for (const item of sorted) {
    const values = kind === 'canonical'
      ? [item.en]
      : kind === 'jp'
        ? (Array.isArray(item.jp) ? item.jp : [])
        : (Array.isArray(item.alias) ? item.alias : []);

    for (const value of values) {
      const key = parser.normalizeKey(value);
      if (!key || seen.has(key)) continue;
      if (exactCanonical(value) !== item.en) continue;
      seen.add(key);
      output.push({ value, canonical: item.en });
      break;
    }
  }
  return output;
}

const canonicalCases = uniqueCandidates('canonical').slice(0, 25);
const jpCases = uniqueCandidates('jp').slice(0, 25);
const aliasCases = uniqueCandidates('alias').slice(0, 20);

assert.equal(canonicalCases.length, 25, 'benchmark requires 25 unique canonical cases');
assert.equal(jpCases.length, 25, 'benchmark requires 25 unique Japanese-name cases');
assert.equal(aliasCases.length, 20, 'benchmark requires 20 unique alias cases');

for (const test of [...canonicalCases, ...jpCases, ...aliasCases]) {
  assert.equal(exactCanonical(test.value), test.canonical, `exact dictionary match failed: ${test.value}`);
}

const parserCases = [
  ['Water, Glycerin', ['Water', 'Glycerin']],
  ['水、グリセリン', ['水', 'グリセリン']],
  ['Water\nGlycerin', ['Water', 'Glycerin']],
  ['水；グリセリン', ['水', 'グリセリン']],
  ['Water，Glycerin', ['Water', 'Glycerin']],
  ['1,2-Hexanediol, Water', ['1,2-Hexanediol', 'Water']],
  ['1,3-Butanediol, Glycerin', ['1,3-Butanediol', 'Glycerin']],
  ['PEG/PPG-17/6 Copolymer, Water', ['PEG/PPG-17/6 Copolymer', 'Water']],
  ['ラウロイルメチルアラニンNa・水, グリセリン', ['ラウロイルメチルアラニンNa・水', 'グリセリン']],
  ['Water, water, WATER', ['Water']],
  [' 水 ,  グリセリン ', ['水', 'グリセリン']],
  ['Aqua;Glycerol', ['Aqua', 'Glycerol']],
  ['Alcohol Denat., Water', ['Alcohol Denat.', 'Water']],
  ['EDTA-2Na、BG', ['EDTA-2Na', 'BG']],
  ['PCA-Na\nヒアルロン酸Na', ['PCA-Na', 'ヒアルロン酸Na']],
  ['Sodium Coco-Sulfate, SLS', ['Sodium Coco-Sulfate', 'SLS']],
  ['Olea Europaea (Olive) Fruit Oil, Water', ['Olea Europaea (Olive) Fruit Oil', 'Water']],
  ['β-グルカン, エクトイン', ['β-グルカン', 'エクトイン']],
  ['Vitamin E, Vitamin B3', ['Vitamin E', 'Vitamin B3']],
  ['水\r\nグリセリン\r\nBG', ['水', 'グリセリン', 'BG']]
];

assert.equal(parserCases.length, 20, 'benchmark requires 20 parser edge cases');
for (const [input, expected] of parserCases) {
  assert.deepEqual(parser.splitIngredients(input, { dedupe: true }), expected, `parser case failed: ${input}`);
}

const unknownCases = [
  'Definitely Not An INCI Ingredient',
  'PhenoxyethanoI',
  'Glycerln',
  'Niacinamlde',
  'Sodlum Hyaluronate',
  'Waterrr',
  'グリセリソ',
  'ナイアシソアミド',
  'ヒアル口ン酸Na',
  'OCR_NOISE_123'
];

assert.equal(unknownCases.length, 10, 'benchmark requires 10 unknown/OCR-noise cases');
for (const value of unknownCases) {
  assert.equal(exactCanonical(value), null, `unknown case unexpectedly exact-matched: ${value}`);
}

const liteSource = read('tools/cosmetic-ingredient-checker-lite/app.js');
const fastAppSource = read('tools/inci-fastscan/js/app.js');
const fastParserSource = read('tools/inci-fastscan/js/core_parser.js');

for (const rel of DATA_FILES) {
  const litePath = `/${rel.replace(/^tools\//, 'tools/')}`;
  const fastPath = rel.replace(/^tools\/inci-fastscan\//, '');
  assert.ok(liteSource.includes(litePath), `Lite runtime missing dictionary file ${litePath}`);
  assert.ok(fastAppSource.includes(`"${fastPath}"`), `FastScan runtime missing dictionary file ${fastPath}`);
}
assert.ok(liteSource.includes('sharedParser'), 'Lite must keep using the shared parser');
assert.ok(fastParserSource.includes('NWCosmeticIngredientParser'), 'FastScan must keep using the shared parser');

const caseCount = canonicalCases.length + jpCases.length + aliasCases.length + parserCases.length + unknownCases.length;
assert.equal(caseCount, 100, 'cosmetics benchmark must remain exactly 100 cases');

console.log(JSON.stringify({
  status: 'pass',
  cases: caseCount,
  canonical: canonicalCases.length,
  japanese: jpCases.length,
  aliases: aliasCases.length,
  parser_edges: parserCases.length,
  unknown_or_ocr_noise: unknownCases.length,
  dictionary_records: records.length
}, null, 2));
