import assert from 'node:assert/strict';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { additionalJapanesePhotoSources } from './japanese-real-photo-expansion.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

assert.equal(japaneseRealPhotoSources.length, 2, 'Keep the initial fixed two-photo wave');
assert.equal(additionalJapanesePhotoSources.length, 2, 'Two independently sourced added images');
const sources = [...japaneseRealPhotoSources, ...additionalJapanesePhotoSources];
assert.equal(new Set(sources.map(x => x.id)).size, sources.length,
  'Never double-count a package photo by ID');
assert.equal(new Set(sources.map(x => x.photoUrl)).size, sources.length,
  'Never double-count the same actual photograph URL');
const scorer = createProductionLabelScorer();
const counts = [];
for (const row of additionalJapanesePhotoSources) {
  for (const field of ['photoUrl', 'photoSourceUrl', 'ingredientSourceUrl']) {
    const url = new URL(row[field]);
    assert.equal(url.protocol, 'https:', 'Never fetch an insecure package picture or source');
  }
  assert.equal(row.labelClass, 'cosmetic');
  assert.ok(['jpg', 'webp'].includes(row.photoFormat));
  assert.ok(row.packagingVersion.includes('unverified'),
    'Unmatched lot/formula accuracy must not be silently certified');
  assert.ok(row.referenceCaveat.length > 70, 'Document reference limits prominently');
  assert.ok(row.ingredientList.length >= 20, 'Must not count tiny toy formula as real source');
  assert.equal(new Set(row.ingredientList).size, row.ingredientList.length,
    'One unique canonical source reference per product');
  assert.ok(!row.ingredientList.some(v => v.includes('＊') || v.includes('（＋／－）')),
    'Remove source-list organic/optional pigment decorations from matching names');
  const scored = await scorer.assess(row.ingredients, row.ingredientList);
  assert.equal(scored.afterRepair.exactReferenceHits, scored.eligibleReferenceUniqueNames,
    'Actual published source tokens must match themselves before camera OCR');
  assert.ok(scored.eligibleReferenceUniqueNames >= 8,
    'Each independent product must exercise meaningful production dictionary coverage');
  counts.push({ id: row.id, total: row.ingredientList.length,
    dictionarySupported: scored.eligibleReferenceUniqueNames });
}
console.log('FASTSCAN_JAPANESE_EXPANSION_CONTRACT=' + JSON.stringify({
  status: 'PASS', originalPhotos: japaneseRealPhotoSources.length,
  addedPhotos: additionalJapanesePhotoSources.length, totalPhotos: sources.length,
  sources: counts, truePhotoAnnotations: false,
  exactPhotoFormulaVersionCertified: false, physicalHandsetCertified: false,
  packageImagesShippedOrUploaded: false
}));
