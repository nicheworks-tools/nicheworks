// Regression: URL decoding must not silently rewrite literal + to spaces.
// Run: node scripts/check-redirect-unwrapper-plus.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../tools/redirect-unwrapper/app.js'), 'utf8');
const sandbox = { document: { addEventListener() {} }, URL, Set };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
for (const [input, expected] of [
  ['https%3A%2F%2Fexample.com%2Fa%2Bb', 'https://example.com/a+b'],
  ['https%253A%252F%252Fexample.com%252Fa%252Bb', 'https://example.com/a+b'],
  ['https://example.com/a+b', 'https://example.com/a+b'],
]) {
  assert.equal(vm.runInContext('decodeRepeated(' + JSON.stringify(input) + ')', sandbox), expected);
}
console.log('Redirect Unwrapper: 3 plus-preservation regressions passed');
