const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

test('editing contract text invalidates the prior analysis', () => {
  assert.match(source, /els\.text\?\.addEventListener\("input", clearOutputs\)/);
});
test('changing contract type invalidates the prior analysis', () => {
  assert.match(source, /els\.contractType\?\.addEventListener\("change", clearOutputs\)/);
});
test('example insertion invalidates the prior analysis', () => {
  assert.match(source, /EX_JP : EX_EN; clearOutputs\(\); toast\("Example pasted"\)/);
});
test('language switch invalidates previous-language findings', () => {
  assert.match(source, /if\(MODE !== mode && last\.score\) clearOutputs\(\)/);
});
test('invalidating clears both findings and generated markdown', () => {
  assert.match(source, /function clearOutputs\(\)\{ last = \{ findings: \[\], score: null, type: "" \}; forceAll = false; badge\("UNKNOWN"\); setText\(els\.riskWhy, "—"\); refreshOutputs\(\); \}/);
  assert.match(source, /if\(els\.mdPreview\) els\.mdPreview\.value = md/);
});
