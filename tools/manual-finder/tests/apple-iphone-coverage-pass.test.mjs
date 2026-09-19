import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCoveragePass } from '../scripts/coverage-pass-lib.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/apple/jp-iphone-ios26-guide-models.json',import.meta.url),'utf8'));
const validation=validateCoveragePass(pass);

assert.equal(validation.valid,true);
assert.equal(validation.completionReady,true);
assert.equal(pass.status,'coverage-pass-complete');
assert.equal(pass.universe.declaredCount,31);
assert.equal(pass.universe.models.length,31);
assert.equal(new Set(pass.universe.models).size,31);
assert.equal(validation.summary.capturedPopulation,31);
assert.equal(validation.summary.reviewedCount,31);
assert.equal(validation.summary.unreviewedCount,0);

const scoped=pass.subscopes.flatMap(scope=>scope.models||[]);
assert.equal(scoped.length,31);
assert.equal(new Set(scoped).size,31);
assert.deepEqual(new Set(scoped),new Set(pass.universe.models));
assert.ok(pass.subscopes.every(scope=>scope.captureState==='captured' && scope.capturedCount===scope.models.length));
assert.equal(validation.summary.states.direct,0);
assert.equal(validation.summary.states.shared,31);
assert.equal(validation.summary.states.support_only,0);
assert.equal(validation.summary.states.held,0);
assert.equal(validation.summary.reconciliation,'31 = 0 direct + 31 shared + 0 support_only + 0 held');
assert.equal(pass.review.validationSample.length,5);
assert.equal(pass.review.secondaryDiscovery.result,'all_31_upgraded_to_shared');

for(const model of ['iPhone 11','iPhone SE (2nd generation)','iPhone 16e','iPhone 17','iPhone Air','iPhone 17e']){
  assert.ok(pass.universe.models.includes(model),`${model} must remain in the locked Apple iPhone scope`);
}

console.log('ManualFinder Apple iPhone coverage-pass universe passed.');
