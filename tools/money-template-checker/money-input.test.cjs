// Regression test for integer JPY input validation. Run: node tools/money-template-checker/money-input.test.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require("node:path").join(__dirname, "app.js"), "utf8");
const start = source.indexOf("  const parseMoneyInput =");
const end = source.indexOf("  const buildWarnings =", start);
assert(start !== -1 && end > start, "money parsers must exist");
const snippet = source.slice(start, end);
const parsers = vm.runInNewContext(`(() => { const MAX_AMOUNT = 999999999; ${snippet}; return [parseMoneyInput, parseMoneyInputEn]; })()`);
for (const parse of parsers) {
  for (const valid of ["0", "1", "1500", "999999999"]) {
    const result = parse({ value: valid }, "Amount", true);
    assert.equal(result.ok, true, valid);
    assert.equal(result.value, Number(valid));
  }
  for (const invalid of ["1.5", "1e3", "1E3", "-1", "+1", "0x10", "1000000000", "NaN", "Infinity", "1,000"]) {
    assert.equal(parse({ value: invalid }, "Amount", true).ok, false, invalid);
  }
  assert.equal(parse({ value: "" }, "Amount", true).ok, false);
  assert.equal(parse({ value: "" }, "Amount", false).ok, true);
}
console.log("Money Template Checker: 32 input cases passed");
