/**
 * Seven source-backed distinct Japanese INCI names in public package labels.
 * References in raw dictionary notes serve nomenclature/function provenance,
 * NOT proof of ingredient/formula safety or actual OCR image correctness.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { japaneseRealPhotoSources } from './japanese-real-photo-corpus.mjs';
import { createProductionLabelScorer } from './production-label-scoring.mjs';
const require = createRequire(import.meta.url);
const parser = require('../../_shared/cosmetic-ingredient-parser.js');
const expected = [
  ['jp_source_20261103_w3_taurine', 'Taurine', 'タウリン', 'skin conditioning', 'https://fuji-kasei-database.com/materials/1109/'],
  ['jp_source_20261103_w3_leucine', 'Leucine', 'ロイシン', 'skin conditioning', 'https://fuji-kasei-database.com/materials/1109/'],
  ['jp_source_20261103_w3_tyrosine', 'Tyrosine', 'チロシン', 'skin conditioning', 'https://beauty-trendblog.com/nakami/ingredient/tyrosine/'],
  ['jp_source_20261103_w3_sodium_aspartate', 'Sodium Aspartate', 'アスパラギン酸Na', 'humectant', 'https://www.cosmetic-info.jp/jcln/result.php?-d=asc&-f=name&-p=all&-r=20&inci=sodium&inciOp=cn'],
  ['jp_source_20261103_w3_disodium_inosinate', 'Disodium Inosinate', 'イノシン酸2Na', 'skin conditioning', 'https://kcia.or.kr/cid/search/ingd_view.php?no=8447'],
  ['jp_source_20261103_w3_disodium_guanylate', 'Disodium Guanylate', 'グアニル酸2Na', 'humectant', 'https://cosmileeurope.eu/inci/detail/4942/disodium-guanylate/'],
  ['jp_source_20261103_w3_dodecane', 'Dodecane', 'ドデカン', 'fragrance', 'https://cosmileeurope.eu/inci/detail/25844/dodecane/']
];
const paths = ['tools/inci-fastscan/data/ingredients.json',
  ...Array.from({ length: 8 }, (_, i) => 'tools/inci-fastscan/data/ingredients-extra-' + (i + 1) + '.json')];
const data = paths.flatMap(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const scorer = createProductionLabelScorer();
assert.equal(expected.length, 7);
assert.equal(new Set(expected.map(x => parser.normalizeKey(x[2]))).size, 7);
assert.equal(new Set(expected.map(x => parser.canonicalIdentityKey(x[1]))).size, 7);
for (const [id, en, jp, category, source] of expected) {
  const record = data.find(x => x.id === id);
  assert.ok(record, id + ': exact identity must be present');
  assert.equal(record.en, en);
  assert.deepEqual(record.jp, [jp]);
  assert.equal(record.category, category);
  assert.equal(record.safety, 'unrated', 'No unsupported cosmetic safety rank');
  assert.equal(record.note_verified, true, 'Neutral verified role notes only');
  assert.ok(typeof record.note_short === 'string' && record.note_short.length >= 45);
  assert.ok(record.note_sources.length >= 2, 'Each new identity has two independent sources');
  assert.ok(record.note_sources.includes(source));
  assert.ok(record.note_sources.every(url => new URL(url).protocol === 'https:'));
  assert.ok(japaneseRealPhotoSources.some(x => x.ingredientList.includes(jp)),
    'Only address exact names on the preexisting independently published source lists');
  assert.equal(data.filter(x => parser.canonicalIdentityKey(x.en) === parser.canonicalIdentityKey(en)).length, 1,
    'No new duplicate canonical ingredient names');
  assert.equal(data.filter(x => (x.jp || []).some(n => parser.normalizeKey(n) === parser.normalizeKey(jp))).length, 1,
    'No Japanese label collisions with other identities');
  const check = await scorer.assess(jp, [en]);
  assert.equal(check.eligibleReferenceUniqueNames, 1);
  assert.equal(check.afterRepair.exactReferenceHits, 1);
  assert.equal(check.afterRepair.extraMatchesNotInAnnotation, 0);
}
assert.notEqual(parser.canonicalIdentityKey('Dodecane'), parser.canonicalIdentityKey('Isododecane'),
  'Straight chain Dodecane must never resolve to branched Isododecane');
assert.notEqual(parser.canonicalIdentityKey('Leucine'), parser.canonicalIdentityKey('Isoleucine'),
  'Leucine must never silently resolve to a distinct amino-acid isomer');
assert.ok(japaneseRealPhotoSources.some(x => x.ingredientList.includes('アミノカプロン酸')));
// Aminocaproic Acid is outside the individually researched wave3 cohort.
// Do not infer cross-jurisdiction legality or product-level safety here.
assert.ok(!expected.some(row => row[1] === 'Aminocaproic Acid'));
let supported = 0, sourceTotal = 0;
const perSource = [];
for (const source of japaneseRealPhotoSources) {
  const score = await scorer.assess(source.ingredients, source.ingredientList);
  assert.equal(score.afterRepair.exactReferenceHits, score.eligibleReferenceUniqueNames,
    'Published-reference-only positive control, never true image OCR accuracy');
  sourceTotal += source.ingredientList.length;
  supported += score.eligibleReferenceUniqueNames;
  perSource.push({ id: source.id, sourceCount: source.ingredientList.length, supported: score.eligibleReferenceUniqueNames });
}
assert.equal(sourceTotal, 127);
assert.ok(supported >= 90, 'Preserve the seven exact source-backed wave3 identities while allowing further verified waves');
assert.ok(data.filter(x => x.safety === 'unrated').length >= 11,
  'Preserve the four previous and seven wave3 source-verified unrated identities');
console.log('FASTSCAN_JAPANESE_WAVE3=' + JSON.stringify({
  status: 'PASS', newCanonicalIdentities: expected.length,
  maintainedRawRecords: data.length, exactSourceNames: sourceTotal,
  dictionarySupportedNames: supported, unsupportedNames: sourceTotal - supported,
  perSource, inventedSafetyRatings: 0, automaticFuzzyEquivalences: 0,
  photoToFormulaVersionVerified: false, actualPhoneAccuracyCertified: false
}));
