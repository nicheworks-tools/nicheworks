import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const rows = [];
for (const suffix of ['', ...Array.from({ length: 8 }, (_, i) => '-extra-' + (i + 1))]) {
  rows.push(...JSON.parse(fs.readFileSync('tools/inci-fastscan/data/ingredients' + suffix + '.json', 'utf8')));
}
const scorer = createProductionLabelScorer();
const expected = [
  {
    id: 'jp_source_20261103_octyldodecyl_myristate',
    en: 'Octyldodecyl Myristate', jp: 'ミリスチン酸オクチルドデシル',
    role: 'emollient',
    primarySource: 'https://chemical.kao.com/ja/products/B0002083_ja/'
  },
  {
    id: 'jp_source_20261103_arachis_hypogaea_peanut_oil',
    en: 'Arachis Hypogaea (Peanut) Oil', jp: 'ピーナッツ油',
    role: 'oil',
    primarySource: 'https://ota-oil.co.jp/business/cosmetic-materials/arachis/'
  },
  {
    id: 'jp_source_20261103_hydrolyzed_sodium_hyaluronate',
    en: 'Hydrolyzed Sodium Hyaluronate', jp: '加水分解ヒアルロン酸Na',
    role: 'humectant',
    primarySource: 'https://www.kewpie.co.jp/finechemical/hyaluronic/habooster.html'
  },
  {
    id: 'jp_source_20261103_sodium_bicarbonate',
    en: 'Sodium Bicarbonate', jp: '炭酸水素Na',
    role: 'buffer',
    primarySource: 'https://cosmileeurope.eu/inci/detail/14564/sodium-bicarbonate/'
  }
];
assert.equal(expected.length, 4);
let verified = 0;
for (const item of expected) {
  const row = rows.find(row => row.id === item.id);
  assert.ok(row, item.id + ': missing full canonical entry');
  assert.equal(row.en, item.en);
  assert.deepEqual(row.jp, [item.jp]);
  assert.equal(row.safety, 'unrated', 'No new unsupported safe/caution/risk verdict may be invented');
  assert.equal(row.category, item.role);
  assert.equal(row.note_verified, true);
  assert.ok(typeof row.note_short === 'string' && row.note_short.length > 30);
  assert.ok(Array.isArray(row.note_sources) && row.note_sources.length >= 2);
  assert.ok(row.note_sources.includes(item.primarySource), 'Must cite precise Japanese/INCI source');
  assert.ok(row.note_sources.every(url => new URL(url).protocol === 'https:'));
  assert.ok(japaneseRealPhotoSources.some(product => product.ingredientList.includes(item.jp)),
    'Only publish an identity actually seen on a real-product source label');
  const identity = parser.canonicalIdentityKey(item.en);
  assert.equal(rows.filter(row => parser.canonicalIdentityKey(row.en) === identity).length, 1,
    'Do not duplicate existing INCI canonical identities');
  assert.equal(rows.filter(row => (row.jp || []).some(name => parser.normalizeKey(name) === parser.normalizeKey(item.jp))).length, 1,
    'Japanese display name may not collide across different INCI identities');
  const result = await scorer.assess(item.jp, [item.en]);
  assert.equal(result.eligibleReferenceUniqueNames, 1);
  assert.equal(result.afterRepair.exactReferenceHits, 1);
  assert.equal(result.afterRepair.extraMatchesNotInAnnotation, 0);
  verified += 1;
}
let sourceNames = 0;
let dictionarySupported = 0;
for (const product of japaneseRealPhotoSources) {
  sourceNames += product.ingredientList.length;
  const a = await scorer.assess(product.ingredients, product.ingredientList);
  assert.equal(a.afterRepair.exactReferenceHits, a.eligibleReferenceUniqueNames,
    'Published-source text self-test only; this is NOT optical recognition');
  dictionarySupported += a.eligibleReferenceUniqueNames;
}
assert.equal(sourceNames, 127);
assert.ok(dictionarySupported >= 83, 'Preserve all first-wave source names (70 → 79 → 83); subsequent verified waves may expand coverage');
const incomplete = sourceNames - dictionarySupported;
assert.ok(incomplete <= 44);
console.log('FASTSCAN_JAPANESE_NEW_IDENTITIES=' + JSON.stringify({
  status: 'PASS', sourcePhotoPairs: 2, newIdentities: verified,
  sourceNames, dictionarySupported, incomplete,
  inventedSafetyRatings: 0, imageAccuracyCertified: false,
  photoVersionVerified: false
}));
