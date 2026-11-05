/**
 * Two distinct exact Japanese name/INCI additions from documented cosmetic
 * nomenclature; a source-list match is NOT a validated photograph OCR score.
 * Do not merge lemon fruit with peel/leaf, nor cypress leaf with mixed parts.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const rows = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')]
  .flatMap(path => JSON.parse(fs.readFileSync(path, 'utf8')));
const expected = [
  {
    id: 'jp_source_20261105_w12_citrus_limon_fruit_extract',
    jp: 'レモン果実エキス', en: 'Citrus Limon (Lemon) Fruit Extract',
    role: 'skin conditioning',
    source: 'https://www.ichimaru.co.jp/cosmetics/63'
  },
  {
    id: 'jp_source_20261105_w12_cupressus_sempervirens_leaf_oil',
    jp: 'イタリアイトスギ葉油', en: 'Cupressus Sempervirens Leaf Oil',
    role: 'fragrance',
    source: 'https://waphyto.com/pages/glossary'
  }
];
const scorer = createProductionLabelScorer();
assert.equal(expected.length, 2);
for (const item of expected) {
  const row = rows.find(x => x.id === item.id);
  assert.ok(row, item.en + ': missing verified canonical identity');
  assert.equal(row.en, item.en);
  assert.deepEqual(row.jp, [item.jp]);
  assert.equal(row.category, item.role);
  assert.equal(row.safety, 'unrated');
  assert.equal(row.note_verified, true);
  assert.ok(row.note_short?.length >= 95);
  assert.ok(row.note_sources?.length >= 2);
  assert.ok(row.note_sources.includes(item.source));
  assert.ok(row.note_sources.every(url => new URL(url).protocol === 'https:'));
  assert.equal(rows.filter(x => parser.canonicalIdentityKey(x.en) === parser.canonicalIdentityKey(item.en)).length, 1);
  assert.equal(rows.filter(x => (x.jp || []).some(jp => parser.normalizeKey(jp) === parser.normalizeKey(item.jp))).length, 1);
  assert.ok(japaneseRealPhotoSources.some(p => p.ingredientList.includes(item.jp)));
  const scored = await scorer.assess(item.jp, [item.en]);
  assert.equal(scored.eligibleReferenceUniqueNames, 1);
  assert.equal(scored.afterRepair.exactReferenceHits, 1);
  assert.equal(scored.afterRepair.extraMatchesNotInAnnotation, 0);
}
for (const [a, b] of [
  ['Citrus Limon (Lemon) Fruit Extract', 'Citrus Limon (Lemon) Peel Extract'],
  ['Cupressus Sempervirens Leaf Oil', 'Cupressus Sempervirens Leaf/Nut/Stem Oil']
]) assert.notEqual(parser.canonicalIdentityKey(a), parser.canonicalIdentityKey(b));
// These labels still need distinct-source or historic-name resolution, and
// MUST NOT be silently redirected to a tempting but non-unique INCI record.
for (const ambiguous of ['ハマメリス水', 'プラセンタエキス', '白金', 'オレンジ油']) {
  assert.ok(!rows.some(x => (x.jp || []).some(jp => parser.normalizeKey(jp) === parser.normalizeKey(ambiguous))),
    'Never assign an ambiguous Japanese label a guessed sole INCI: ' + ambiguous);
}
let total = 0, supported = 0;
for (const photo of japaneseRealPhotoSources) {
  total += photo.ingredientList.length;
  const scored = await scorer.assess(photo.ingredients, photo.ingredientList);
  supported += scored.eligibleReferenceUniqueNames;
  assert.equal(scored.afterRepair.exactReferenceHits, scored.eligibleReferenceUniqueNames,
    'Published source text is a positive control, not OCR from the photo');
}
assert.equal(total, 127);
assert.ok(supported >= 121, 'Wave11 source-label coverage 119 + two exact identities');
console.log('FASTSCAN_JAPANESE_WAVE12=' + JSON.stringify({
  status: 'PASS', newExactIdentities: 2, publishedSourceNames: total,
  dictionarySupportedNames: supported, remainingUnmatched: total - supported,
  ambiguousAutoAliases: 0, photoAccuracyCertified: false,
  exactPhotoFormulaVersionCertified: false, handsetAccuracyCertified: false
}));
