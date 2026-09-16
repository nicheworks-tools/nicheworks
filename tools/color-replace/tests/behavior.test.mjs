import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const match = source.match(/function parseTolerance\(value\) \{[\s\S]*?\n\}/);
assert.ok(match, 'production tolerance parser must exist');
assert.match(
  source,
  /const tolerance = parseTolerance\(toleranceInput\.value\);/,
  'applyReplacement must use the production tolerance parser',
);

const sandbox = {
  Number,
  Math,
  defaults: { tolerance: 20 },
};
vm.createContext(sandbox);
vm.runInContext(`${match[0]}\nglobalThis.parseTolerance = parseTolerance;`, sandbox);

assert.equal(sandbox.parseTolerance('0'), 0, 'zero tolerance must remain zero');
assert.equal(sandbox.parseTolerance('20'), 20);
assert.equal(sandbox.parseTolerance('100'), 100);
assert.equal(sandbox.parseTolerance('-1'), 0, 'tolerance must clamp to the documented minimum');
assert.equal(sandbox.parseTolerance('101'), 100, 'tolerance must clamp to the documented maximum');
assert.equal(sandbox.parseTolerance(''), 20, 'invalid tolerance should use the documented default');
assert.equal(sandbox.parseTolerance('not-a-number'), 20, 'invalid tolerance should use the documented default');

console.log('Color Replace behavior test passed.');
