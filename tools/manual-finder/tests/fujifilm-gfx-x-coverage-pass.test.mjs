import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCoveragePass } from '../scripts/coverage-pass-lib.mjs';

const pass=JSON.parse(fs.readFileSync(new URL('../coverage-passes/fujifilm/jp-gfx-x-camera-manual-index.json',import.meta.url),'utf8'));
const validation=validateCoveragePass(pass);
assert.equal(validation.valid,true);
assert.equal(validation.completionReady,false);
assert.equal(pass.status,'reviewing');
assert.equal(pass.universe.declaredCount,null);
assert.equal(pass.universe.models.length,56);
assert.equal(new Set(pass.universe.models).size,56);
assert.equal(validation.summary.capturedPopulation,56);
assert.equal(validation.summary.reviewedCount,0);
assert.equal(validation.summary.unreviewedCount,56);

const scoped=pass.subscopes.flatMap(scope=>scope.models||[]);
assert.equal(scoped.length,56);
assert.equal(new Set(scoped).size,56);
assert.deepEqual(new Set(scoped),new Set(pass.universe.models));
assert.deepEqual(Object.fromEntries(pass.subscopes.map(scope=>[scope.id,scope.models.length])),{gfx:9,'x-mirrorless':32,'x-fixed':15});
assert.ok(pass.subscopes.every(scope=>scope.captureState==='captured'&&scope.capturedCount===scope.models.length));

for(const model of ['GFX100 II','GFX100RF','GFX ETERNA 55','X-H2S','X-T30 III','X-E2','X100VI','X half','X-S1']){
  assert.ok(pass.universe.models.includes(model),`${model} must remain in the locked Fujifilm manual-index scope`);
}
console.log('ManualFinder Fujifilm GFX/X coverage-pass universe passed.');
