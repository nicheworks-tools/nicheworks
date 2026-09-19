import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCoveragePass } from '../scripts/coverage-pass-lib.mjs';

const pass = JSON.parse(fs.readFileSync(new URL('../coverage-passes/panasonic/jp-lumix-camera-bodies-sitemap.json', import.meta.url), 'utf8'));
const validation = validateCoveragePass(pass);

assert.equal(validation.valid, true);
assert.equal(validation.completionReady, true);
assert.equal(pass.status, 'coverage-pass-complete');
assert.equal(pass.universe.declaredCount, null);
assert.equal(pass.universe.models.length, 27);
assert.equal(new Set(pass.universe.models).size, 27);
assert.equal(validation.summary.capturedPopulation, 27);
assert.equal(validation.summary.reviewedCount, 27);
assert.equal(validation.summary.unreviewedCount, 0);

const scoped = pass.subscopes.flatMap((scope) => scope.models || []);
assert.equal(scoped.length, 27);
assert.equal(new Set(scoped).size, 27);
assert.deepEqual(new Set(scoped), new Set(pass.universe.models));
assert.deepEqual(
  Object.fromEntries(pass.subscopes.map((scope) => [scope.id, scope.models.length])),
  { 's-series': 11, 'g-series': 9, compact: 7 }
);
assert.ok(pass.subscopes.every((scope) => scope.captureState === 'captured' && scope.capturedCount === scope.models.length));
assert.equal(validation.summary.states.direct, 27);
assert.equal(validation.summary.states.shared, 0);
assert.equal(validation.summary.states.support_only, 0);
assert.equal(validation.summary.states.held, 0);
assert.equal(validation.summary.reconciliation, '27 = 27 direct + 0 shared + 0 support_only + 0 held');
assert.equal(pass.review.validationSample.length, 4);
assert.ok(pass.review.validationSample.some((row) => row.model === 'DC-G100D' && row.class === 'secondary-discovery'));

for (const model of ['DC-S5M2', 'DC-S5M2X', 'DC-G99', 'DC-G99D', 'DC-TX2', 'DC-TX2D']) {
  assert.ok(pass.universe.models.includes(model), `${model} must remain an exact Panasonic sitemap identity`);
}

console.log('ManualFinder Panasonic LUMIX coverage-pass universe passed.');
