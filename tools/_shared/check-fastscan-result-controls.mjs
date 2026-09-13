import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync('tools/inci-fastscan/js/web_ui.js', 'utf8');
const spec = fs.readFileSync('tools/inci-fastscan/SPEC.md', 'utf8');

for (const state of ['all', 'matched', 'review', 'unknown']) {
  assert.ok(ui.includes(`data-result-filter=\"${state}\"`), `missing FastScan result filter: ${state}`);
}

assert.ok(ui.includes('data-result-state'), 'result cards must expose a filterable state');
assert.ok(ui.includes('data-suggestion-value'), 'suggestion controls must carry an explicit replacement value');
assert.ok(ui.includes('data-original-value'), 'suggestion controls must retain the original spelling');
assert.ok(ui.includes('resultInputForContainer'), 'suggestion application must target the active FastScan input');
assert.ok(ui.includes('input.value.indexOf(original)'), 'suggestion application must require the original text to exist');
assert.ok(ui.includes('input.value = `${input.value.slice(0, index)}${replacement}${input.value.slice(index + original.length)}`'), 'suggestion application must be an explicit textarea edit');
assert.ok(ui.includes('button.addEventListener("click"'), 'candidate application must be user-triggered');
assert.ok(!ui.includes('button?.click();\n      if (status) status.textContent = rt("appliedSuggestion"'), 'candidate application must not trigger analysis automatically');
assert.ok(ui.includes('再解析も自動では行いません'), 'Japanese UI must state that analysis is not rerun automatically');
assert.ok(ui.includes('analysis will not rerun automatically'), 'English UI must state that analysis is not rerun automatically');

assert.ok(spec.includes('result cards to be filtered'), 'FastScan SPEC must document result filtering');
assert.ok(spec.includes('does not automatically rerun ingredient analysis'), 'FastScan SPEC must document no automatic rerun after candidate application');
assert.ok(spec.includes('enabled = false'), 'FastScan SPEC must retain disabled Amazon readiness contract');

console.log('FastScan result control regression checks passed');
