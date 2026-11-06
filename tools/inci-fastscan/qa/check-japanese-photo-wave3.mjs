import assert from 'node:assert/strict';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { additionalJapanesePhotoSources } from './japanese-real-photo-expansion.mjs';
import { japanesePhotoWave3 } from './japanese-real-photo-wave3.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';

// Do NOT relabel the preexisting four-source proxy corpus as photograph truth.
assert.equal(japaneseRealPhotoSources.length, 2);
assert.equal(additionalJapanesePhotoSources.length, 2);
assert.equal(japanesePhotoWave3.length, 2);
const all = [...japaneseRealPhotoSources, ...additionalJapanesePhotoSources, ...japanesePhotoWave3];
assert.equal(all.length, 6);
assert.equal(new Set(all.map(row => row.id)).size, all.length, 'Distinct product/photo IDs');
assert.equal(new Set(all.map(row => row.photoUrl)).size, all.length, 'Distinct actual photo URLs');

const muji = japanesePhotoWave3.find(row => row.id.startsWith('muji-'));
const biore = japanesePhotoWave3.find(row => row.id.startsWith('biore-'));
assert.ok(muji && biore, 'Both explicitly identified independent public photos required');
assert.equal(muji.referenceType, 'photo-visual-provisional');
assert.equal(biore.referenceType, 'public-product-page-proxy');
assert.equal(muji.photoFormat, 'png');
assert.equal(biore.photoFormat, 'jpg');
assert.ok(muji.referenceCaveat.includes('second human check'), 'Do not certify machine-vision provisional reading');
assert.ok(biore.referenceCaveat.includes('methylparaben'), 'Document same-JAN older recipe conflict');
assert.ok(biore.referenceCaveat.includes('sodium benzoate'), 'Document same-JAN newer recipe conflict');
assert.ok(muji.packagingVersion.includes('unverified'));
assert.ok(biore.packagingVersion.includes('unverified'));
assert.ok(!japaneseRealPhotoSources.some(row => row.referenceType === 'photo-visual-provisional'));
assert.ok(!additionalJapanesePhotoSources.some(row => row.referenceType === 'photo-visual-provisional'));

const scorer = createProductionLabelScorer();
const results = [];
for (const row of japanesePhotoWave3) {
  for (const field of ['photoUrl', 'photoSourceUrl', 'ingredientSourceUrl']) {
    assert.equal(new URL(row[field]).protocol, 'https:', 'Only sourced HTTPS external photos');
  }
  assert.equal(row.labelClass, 'cosmetic', 'Do not merge quasi-drug name format with cosmetic INCI');
  assert.ok(row.ingredientList.length >= 10, 'Real photo reference must not be trivial');
  assert.equal(new Set(row.ingredientList).size, row.ingredientList.length);
  assert.ok(!row.ingredientList.some(name => name.includes('、')), 'No swallowed ingredient boundaries');
  const control = await scorer.assess(row.ingredients, row.ingredientList);
  assert.equal(control.afterRepair.exactReferenceHits, control.eligibleReferenceUniqueNames);
  assert.ok(control.eligibleReferenceUniqueNames >= 7,
    'Each real photographed product must exercise the production dictionary');
  results.push({ id: row.id, sourceNames: row.ingredientList.length,
    supportedNames: control.eligibleReferenceUniqueNames,
    referenceType: row.referenceType });
}
console.log('FASTSCAN_JAPANESE_PHOTO_WAVE3=' + JSON.stringify({
  status: 'PASS', originalPublicPhotoCount: 4, newPhotoCount: 2,
  totalPublicPhotoCount: 6, newSourceControls: results,
  humanVerifiedSamePackageTranscriptions: 0,
  provisionalVisiblePhotoTranscriptions: 1,
  independentlyVerifiedFormulaLot: false,
  realPhoneBrowserOcrMeasured: false,
  imagesOrTextUploadedToProduct: false
}));
