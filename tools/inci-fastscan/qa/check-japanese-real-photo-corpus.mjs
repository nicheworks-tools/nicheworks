import assert from 'node:assert/strict';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

const scorer = createProductionLabelScorer();
assert.equal(japaneseRealPhotoSources.length, 2);
let japaneseSources = 0;
let supported = 0;
for (const row of japaneseRealPhotoSources) {
  for (const field of ['photoUrl', 'photoSourceUrl', 'ingredientSourceUrl']) {
    const url = new URL(row[field]);
    assert.equal(url.protocol, 'https:', 'Require sourced public secure photo/reference URLs');
  }
  assert.ok(row.ingredients.length > 200, 'A full product formula is required');
  assert.ok(row.ingredientList.length >= 45, 'No small synthetic toy reference lists');
  assert.equal(row.ingredientList.length, row.ingredients.split('、').length);
  assert.equal(new Set(row.ingredientList).size, row.ingredientList.length,
    'The source ingredient list must not duplicate an ingredient accidentally');
  assert.ok(row.packagingVersion.includes('unverified'), 'Photo/formula version mismatch must remain disclosed');
  const test = await scorer.assess(row.ingredients, row.ingredientList);
  assert.equal(test.afterRepair.exactReferenceHits, test.eligibleReferenceUniqueNames,
    'Reference-only scoring must recognize each dictionary-supported source name without fake OCR');
  assert.ok(test.eligibleReferenceUniqueNames >= 20, 'At least 20 real Japanese source names must be covered');
  japaneseSources += row.ingredientList.length;
  supported += test.eligibleReferenceUniqueNames;
}
assert.equal(japaneseSources, 127);
assert.ok(supported >= 50);
console.log('FASTSCAN_JAPANESE_CORPUS_CONTRACT=' + JSON.stringify({
  status: 'PASS', photos: japaneseRealPhotoSources.length,
  referenceNames: japaneseSources, dictionarySupported: supported,
  physicalPhoneCertified: false, sourceAndPhotoSameLotVerified: false,
  imagesShippedToNicheWorks: false
}));
