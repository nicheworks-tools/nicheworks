/**
 * Japanese photographed-source dictionary expansion, wave 5.
 * Nomenclature and neutral role evidence only. Does not certify photo OCR,
 * source formula-version equivalence or product ingredient safety.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const data = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')]
  .flatMap(path => JSON.parse(fs.readFileSync(path, 'utf8')));
const expected = [
  {
    id: 'jp_source_20261104_w5_salvia_officinalis_leaf_extract',
    en: 'Salvia Officinalis Leaf Extract', jp: 'セージ葉エキス',
    role: 'skin conditioning',
    primary: 'https://beaker.media/jsln_ingredients/557469'
  },
  {
    id: 'jp_source_20261104_w5_saponaria_officinalis_leaf_extract',
    en: 'Saponaria Officinalis Leaf Extract', jp: 'サボンソウ葉エキス',
    role: 'cleanser',
    primary: 'https://www.cosmetic-info.jp/jcln/result.php?-d=desc&-p=all&-r=20&name=%E3%82%A8%E3%82%AD%E3%82%B9&nameOp=cn'
  },
  {
    id: 'jp_source_20261104_w5_calcium_sodium_borosilicate',
    en: 'Calcium Sodium Borosilicate', jp: 'ホウケイ酸（Ca／Na）',
    role: 'bulking agent',
    primary: 'https://cosmetic-material-database.custhelp.com/app/answers/list/p/30'
  },
  {
    id: 'jp_source_20261104_w5_polyglyceryl_6_octastearate',
    en: 'Polyglyceryl-6 Octastearate', jp: 'オクタステアリン酸ポリグリセリル-6',
    role: 'emulsifier',
    primary: 'https://www.ishampoo.jp/kaiseki/ingredients/88143'
  }
];
const scorer = createProductionLabelScorer();
assert.equal(expected.length, 4);
assert.equal(new Set(expected.map(x => parser.canonicalIdentityKey(x.en))).size, 4);
assert.equal(new Set(expected.map(x => parser.normalizeKey(x.jp))).size, 4);
for (const item of expected) {
  const record = data.find(row => row.id === item.id);
  assert.ok(record, item.en + ': missing source-backed record');
  assert.equal(record.en, item.en);
  assert.deepEqual(record.jp, [item.jp]);
  assert.equal(record.category, item.role);
  assert.equal(record.safety, 'unrated', 'Never fabricate a safe or caution grade');
  assert.equal(record.note_verified, true);
  assert.ok(String(record.note_short).length > 45);
  assert.ok(Array.isArray(record.note_sources) && record.note_sources.length >= 2);
  assert.ok(record.note_sources.includes(item.primary));
  for (const u of record.note_sources) assert.equal(new URL(u).protocol, 'https:');
  assert.equal(data.filter(row => parser.canonicalIdentityKey(row.en) === parser.canonicalIdentityKey(item.en)).length, 1,
    'Do not create duplicate raw canonical identities');
  assert.equal(data.filter(row => (row.jp || []).some(n => parser.normalizeKey(n) === parser.normalizeKey(item.jp))).length, 1,
    'No cross-identity Japanese naming collision');
  assert.ok(japaneseRealPhotoSources.some(source => source.ingredientList.includes(item.jp)),
    item.jp + ': must occur on existing public Japanese source-product labels');
  const check = await scorer.assess(item.jp, [item.en]);
  assert.equal(check.eligibleReferenceUniqueNames, 1);
  assert.equal(check.afterRepair.exactReferenceHits, 1);
  assert.equal(check.afterRepair.extraMatchesNotInAnnotation, 0);
}
for (const [a,b] of [
  ['Saponaria Officinalis Leaf Extract', 'Saponaria Officinalis Leaf/Root Extract'],
  ['Calcium Sodium Borosilicate', 'Calcium Aluminum Borosilicate']
]) assert.notEqual(parser.canonicalIdentityKey(a), parser.canonicalIdentityKey(b), 'Do not mix botanical parts or different mineral compositions');
let total = 0, supported = 0;
for (const product of japaneseRealPhotoSources) {
  total += product.ingredientList.length;
  const check = await scorer.assess(product.ingredients, product.ingredientList);
  assert.equal(check.afterRepair.exactReferenceHits, check.eligibleReferenceUniqueNames,
    'Published source text is an exact match control; NOT photograph OCR accuracy');
  supported += check.eligibleReferenceUniqueNames;
}
assert.equal(total, 127);
assert.ok(supported >= 99, 'Wave4 95 source-supported names + 4 independently sourced wave5 names = 99');
assert.ok(data.filter(x => x.safety === 'unrated').length >= 20);
console.log('FASTSCAN_JAPANESE_WAVE5=' + JSON.stringify({
  status: 'PASS', addedExactIdentities: 4, publicReferenceNames: total,
  dictionarySupportedNames: supported, remainingUnmatched: total - supported,
  safetyGradesInferred: 0, imageOcrPrecisionCertified: false,
  actualSmartphoneAccuracyCertified: false, photoFormulaVersionMatched: false
}));
