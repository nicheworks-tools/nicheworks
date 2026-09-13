import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');
const code = fs.readFileSync('tools/inci-fastscan/js/core_analyze.js', 'utf8');
const context = { NWCosmeticIngredientParser: parser, console };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(code, context, { filename: 'core_analyze.js' });

const repair = context.repairWrappedIngredientFragments;
assert.equal(typeof repair, 'function', 'repairWrappedIngredientFragments must be available');

const dict = [
  { en: 'Water', jp: ['水'], alias: [] },
  { en: 'Glycerin', jp: ['グリセリン'], alias: [] },
  { en: 'Alcohol', jp: ['エタノール'], alias: [] },
  { en: 'Cetearyl Alcohol', jp: ['セテアリルアルコール'], alias: [] },
  {
    en: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine',
    jp: ['ビスエチルヘキシルオキシフェノールメトキシフェニルトリアジン'],
    alias: ['Bemotrizinol', 'Tinosorb S']
  },
  { en: 'Sodium Hyaluronate', jp: ['ヒアルロン酸Na'], alias: [] }
];

let result = repair(
  ['Bis-Ethylhexyloxyphenol', 'Methoxyphenyl Triazine', 'Water'],
  dict
);
assert.deepEqual(
  Array.from(result.list),
  ['Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', 'Water'],
  'two individually unknown OCR fragments must rejoin when their combined name is an exact maintained name'
);
assert.equal(result.repairs.length, 1, 'one exact line-wrap repair should be recorded');

result = repair(['Sodium-', 'Hyaluronate', 'Glycerin'], dict);
assert.deepEqual(
  Array.from(result.list),
  ['Sodium Hyaluronate', 'Glycerin'],
  'a trailing OCR wrap hyphen may be removed only when the resulting name exactly matches the dictionary'
);

result = repair(['Cetearyl', 'Alcohol', 'Water'], dict);
assert.deepEqual(
  Array.from(result.list),
  ['Cetearyl Alcohol', 'Water'],
  'an exact combined identity may be repaired when only one fragment is independently known'
);
assert.equal(result.repairs.length, 1, 'one-known-fragment exact repair should be recorded');

result = repair(['Unknown Alpha', 'Unknown Beta'], dict);
assert.deepEqual(
  Array.from(result.list),
  ['Unknown Alpha', 'Unknown Beta'],
  'unknown adjacent lines must never be guessed into a combined ingredient'
);
assert.equal(result.repairs.length, 0, 'no repair should be recorded for non-exact joins');

result = repair(['Unknown Alpha', 'Alcohol'], dict);
assert.deepEqual(
  Array.from(result.list),
  ['Unknown Alpha', 'Alcohol'],
  'one known fragment must not trigger a merge unless the combined identity is exact'
);
assert.equal(result.repairs.length, 0, 'no repair should be recorded without an exact combined identity');

result = repair(['Water', 'Glycerin'], dict);
assert.deepEqual(
  Array.from(result.list),
  ['Water', 'Glycerin'],
  'already known adjacent ingredients must never be merged'
);

console.log('FastScan OCR exact line-repair regression checks passed');
