import assert from 'node:assert/strict';
import { createProductionLabelScorer, aggregateProductionAssessments } from './production-label-scoring.mjs';

const scorer = createProductionLabelScorer();
assert.ok(scorer.dictionaryCount > 599, 'Complete maintained + generated dictionary should load');

const perfect = await scorer.assess('Water\nGlycerin', ['Water', 'Glycerin']);
assert.equal(perfect.eligibleReferenceUniqueNames, 2);
assert.equal(perfect.afterRepair.exactReferenceHits, 2);
assert.equal(perfect.afterRepair.eligibleReferenceRecall, 1);
assert.equal(perfect.afterRepair.extraMatchesNotInAnnotation, 0);
assert.equal(perfect.exactJoinRepairs, 0);

const split = await scorer.assess('Sodium\nHyalu\nronate', ['Sodium Hyaluronate']);
assert.equal(split.eligibleReferenceUniqueNames, 1);
assert.equal(split.beforeRepair.exactReferenceHits, 0);
assert.equal(split.afterRepair.exactReferenceHits, 1);
assert.equal(split.exactJoinRepairs, 1);
assert.equal(split.threePartRepairs, 1);

const unresolved = await scorer.assess('Water\nGlycexrin', ['Water', 'Glycerin']);
assert.equal(unresolved.afterRepair.exactReferenceHits, 1,
  'Fuzzy near-matches must not be silently counted as exact ingredients');
assert.ok(unresolved.afterRepair.unmatchedItems >= 1);
assert.equal(unresolved.exactJoinRepairs, 0);

const extra = await scorer.assess('Water\nGlycerin', ['Water']);
assert.equal(extra.afterRepair.exactReferenceHits, 1);
assert.equal(extra.afterRepair.extraMatchesNotInAnnotation, 1,
  'Extra dictionary matches must be visible rather than treated as true annotations');

const unsupported = await scorer.assess('Water', ['Water', 'TotallyUnknownFabricatedINCI']);
assert.equal(unsupported.annotationDictionaryUnsupportedItems, 1);
assert.equal(unsupported.eligibleReferenceUniqueNames, 1);
assert.equal(unsupported.afterRepair.eligibleReferenceRecall, 1,
  'Unavailable dictionary entries do not count as OCR failures in supported-only recall');

const rows = [{ analysis: perfect }, { analysis: split }, { analysis: unresolved }];
const pooled = aggregateProductionAssessments(rows);
assert.equal(pooled.photos, 3);
assert.equal(pooled.eligibleReferenceUniqueNames, 5);
assert.equal(pooled.beforeRepairHits, 3);
assert.equal(pooled.afterRepairHits, 4);
assert.equal(pooled.threePartRepairs, 1);
assert.ok(pooled.afterRepairRecallOfDictionarySupported > pooled.beforeRepairRecallOfDictionarySupported);
assert.ok(!JSON.stringify(rows).includes('Glycexrin'),
  'No source-recognized ingredient text must leak to metrics output');
assert.ok(!JSON.stringify(rows).includes('Hyaluronate'),
  'No ground-truth ingredient names must leak to metrics output');
assert.throws(() => aggregateProductionAssessments([{ analysis: null }]),
  /completed end-to-end/);

console.log('FASTSCAN_PRODUCTION_LABEL_SCORING=PASS: real production dictionary loaded; strict reference coverage, true 3-line repair, fuzzy rejection, false-match accounting, privacy and pooled counts');
