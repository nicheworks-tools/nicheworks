"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "app-sdrc.js"), "utf8");

test("SQL edits recheck findings, and empty SQL clears the cached result", () => {
  assert.match(source, /els\.sqlInput\.addEventListener\("input", onCheck\)/);
  assert.match(source, /if \(!sql\) \{ lastResult = null; resetResultText\(\); renderProOutput\(\);/);
  const start = source.indexOf("function onCheck()");
  const end = source.indexOf("function buildSummary(", start);
  assert.ok(start >= 0 && end > start);
  const events = [];
  const context = {
    els: { sqlInput: { value: "DELETE FROM customers;" }, warningsList: { innerHTML: "" } },
    lastResult: { stale: true },
    analyze: (sql) => ({ sql }),
    renderResult: (result) => events.push(["render", result.sql]),
    resetResultText: () => events.push(["reset"]),
    renderProOutput: () => events.push(["pro"]),
    escapeHtml: (value) => value,
    t: () => "Empty"
  };
  vm.runInNewContext(source.slice(start, end) + "; onCheck();", context);
  assert.deepEqual(events, [["render", "DELETE FROM customers;"]]);
  context.els.sqlInput.value = "  ";
  vm.runInNewContext("onCheck();", context);
  assert.equal(context.lastResult, null);
  assert.deepEqual(events.slice(1), [["reset"], ["pro"]]);
});
