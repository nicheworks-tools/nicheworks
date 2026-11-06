'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('tools/unitmaster/app.js', 'utf8');
function extract(name, next) {
  const start = source.indexOf('function ' + name + '(');
  const end = source.indexOf('function ' + next + '(', start);
  assert.ok(start >= 0 && end > start, 'production function boundaries: ' + name);
  return source.slice(start, end);
}
// Execute the real production functions with a deterministic timer/storage harness.
const history = extract('clearHistory', 'loadHistory');
const category = extract('applyCategory', 'convertTemperature');
let pending = new Set([42]);
let removed = [];
let writes = 0;
const ctx = {
  historyTimer: 42,
  clearTimeout(id) { pending.delete(id); },
  localStorage: { removeItem(k) { removed.push(k); } },
  HISTORY_KEY: 'unitmaster_history',
  loadHistory() { writes++; },
  categoryKeys: ['length'], categorySelect: {value:'length'},
  fromSel: {value:'m'}, toSel: {value:'cm'},
  tabs: [], clearOptions() {}, units: {length:{m:1,cm:0.01}},
  addOption() {}, unitLabel(c,u) {return u;},
  autoCalc: {checked:false}, clearManualResult() {},
  calculate() {}, latestValidResult:null, scheduleHistorySave() {},
};
vm.createContext(ctx);
vm.runInContext(history + '\n' + category, ctx);
ctx.clearHistory();
assert.equal(ctx.historyTimer, null);
assert.equal(pending.size, 0, 'clear must cancel scheduled save');
assert.deepEqual(removed, ['unitmaster_history']);
assert.equal(writes, 1);
ctx.historyTimer = 77; pending.add(77);
ctx.applyCategory('length');
assert.equal(ctx.historyTimer, null);
assert.equal(pending.size, 0, 'category switch must cancel old save');
assert.equal(ctx.categorySelect.value, 'length');
console.log('UnitMaster production history cancellation: PASS');
