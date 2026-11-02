'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const start = source.indexOf('const validateRange = (value) => {');
const end = source.indexOf('\nconst updateModeUI =', start);
assert.ok(start >= 0 && end > start, 'range validator exists');
const context = vm.createContext({ pdfDoc: { numPages: 10 } });
const validate = vm.runInContext(source.slice(start, end) + '\nvalidateRange;', context);

test('accepts complete ranges and deduplicates overlapping pages', () => {
  assert.deepEqual(Array.from(validate('1-3,2,5').pages), [1, 2, 3, 5]);
  assert.equal(validate('').pages.length, 10);
});
test('rejects malformed ranges instead of silently accepting partial input', () => {
  for (const input of ['1,,2', ',1', '1,', '1-2-3', '1--2', '1-', '-2', '0', '3-2', '1.5', '1e2']) {
    assert.equal(validate(input).valid, false, input);
  }
});
test('rejects out-of-bounds pages', () => {
  for (const input of ['11', '9-11']) {
    assert.equal(validate(input).valid, false, input);
    assert.equal(validate(input).error.what, 'error.rangeOut.what');
  }
});
