import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseSourceAliasWave } from './japanese-source-alias-evidence.mjs';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const scorer = createProductionLabelScorer();
const data = [];
for (const suffix of ['', ...Array.from({ length: 8 }, (_, i) => '-extra-' + (i + 1))]) {
  data.push(...JSON.parse(fs.readFileSync('tools/inci-fastscan/data/ingredients' + suffix + '.json', 'utf8')));
}
const expected = new Set(japaneseSourceAliasWave.map(row => parser.normalizeKey(row.jp)));
assert.equal(japaneseSourceAliasWave.length, 8, 'Only eight individually backed aliases belong to this wave');
assert.equal(expected.size, 8, 'No duplicate Japanese aliases');
let successfulAliases = 0;
for (const row of japaneseSourceAliasWave) {
  assert.equal(new URL(row.source).protocol, 'https:');
  assert.ok(row.authority?.length >= 20, 'Describe the source authority');
  assert.ok(row.en && row.jp, 'Every alias needs a full Japanese and INCI identity');
  const matchingIdentity = data.filter(ingredient =>
    parser.canonicalIdentityKey(ingredient.en) === parser.canonicalIdentityKey(row.en));
  assert.ok(matchingIdentity.length, row.en + ': canonical INCI identity must preexist in raw dictionary');
  assert.ok(matchingIdentity.some(ingredient => ingredient.jp?.includes(row.jp)),
    row.en + ': the Japanese name must be added to an existing full canonical record');
  const foreign = data.filter(ingredient =>
    ingredient.jp?.includes(row.jp) &&
    parser.canonicalIdentityKey(ingredient.en) !== parser.canonicalIdentityKey(row.en));
  assert.equal(foreign.length, 0, row.jp + ': alias collides with different canonical ingredient');

  const score = await scorer.assess(row.jp, [row.en]);
  assert.equal(score.eligibleReferenceUniqueNames, 1, row.en + ': source INCI must be known');
  assert.equal(score.afterRepair.exactReferenceHits, 1, row.jp + ': JP exact match must be canonical');
  assert.equal(score.afterRepair.extraMatchesNotInAnnotation, 0,
    row.jp + ': do not create unrelated ingredient matches');
  successfulAliases++;
}
let corpusNames = 0;
let supportedReferences = 0;
for (const product of japaneseRealPhotoSources) {
  corpusNames += product.ingredientList.length;
  for (const row of japaneseSourceAliasWave) {
    if (product.ingredientList.includes(row.jp)) {
      const score = await scorer.assess(row.jp, [row.en]);
      assert.equal(score.afterRepair.exactReferenceHits, 1);
    }
  }
  const score = await scorer.assess(product.ingredients, product.ingredientList);
  assert.equal(score.afterRepair.exactReferenceHits, score.eligibleReferenceUniqueNames,
    'The published source reference is a positive control only, NOT OCR');
  supportedReferences += score.eligibleReferenceUniqueNames;
}
assert.equal(corpusNames, 127);
assert.ok(supportedReferences >= 78, 'The two Japanese product lists must improve from 70 to at least 78 dictionary-supported names');
assert.ok(japaneseSourceAliasWave.every(row =>
  japaneseRealPhotoSources.some(source => source.ingredientList.includes(row.jp))),
  'All eight additions must address actual previously unsupported source ingredient names');
assert.equal(data.filter(item => item.safety === undefined).length, 0,
  'This wave must not add unreviewed canonical entries or change legacy schema');
// A different official display name/INCI identity. Never globally alias
// ダイズステロール to Phytosterols: soy sterols have their own INCI.
const soySterols = japaneseRealPhotoSources[0].ingredientList.includes('ダイズステロール');
assert.ok(soySterols, 'Keep the unresolved soy-specific sterols ingredient under review');
assert.ok(!japaneseSourceAliasWave.some(row => row.jp === 'ダイズステロール'));

console.log('FASTSCAN_JAPANESE_SOURCE_ALIAS_WAVE=' + JSON.stringify({
  status: 'PASS', verifiedAliases: successfulAliases, corpusNames,
  supportedReferences, unsupportedReferences: corpusNames - supportedReferences,
  newCanonicalNamesAdded: 0, legacySafetyReclassified: 0, photoOcrAccuracyCertified: false,
  samePhotoAndFormulaLotVerified: false
}));
