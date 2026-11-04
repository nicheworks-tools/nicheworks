const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Exercise the production script with a minimal browser DOM, not a copied helper.
const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
const oldTZ = process.env.TZ;
process.env.TZ = "Asia/Tokyo";
try {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      const listeners = {};
      elements.set(id, {
        value: id === "toolType" ? "converter" : "",
        disabled: false, textContent: "", dataset: {},
        classList: { toggle() {}, add() {}, remove() {} },
        addEventListener(name, fn) { listeners[name] = fn; },
        click() { if (listeners.click) return listeners.click(); },
        dispatch(name) { if (listeners[name]) return listeners[name](); },
      });
    }
    return elements.get(id);
  };
  let onReady;
  let savedFilename = "";
  const document = {
    documentElement: { lang: "ja" },
    querySelectorAll() { return []; },
    getElementById: element,
    addEventListener(name, fn) { if (name === "DOMContentLoaded") onReady = fn; },
    createElement() { return { style: {}, click() {}, remove() {} }; },
    body: { appendChild() {}, removeChild() {} },
  };
  const OriginalDate = Date;
  class FixedDate extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : ["2026-11-04T15:30:00Z"])); }
  }
  const context = {
    document, navigator: { language: "ja", clipboard: { writeText: async () => {} } },
    localStorage: { getItem() { return null; }, setItem() {} },
    Date: FixedDate, Blob: class { constructor() {} },
    URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
    window: { setTimeout() {}, clearTimeout() {} },
  };
  document.createElement = () => ({
    style: {},
    set download(value) { savedFilename = value; },
    click() {}, remove() {},
  });
  vm.runInNewContext(source, context, { filename: "app.js" });
  assert.equal(typeof onReady, "function");
  onReady();
  element("generateChecklist").click();
  assert.match(element("checklistOutput").textContent, /- Date: 2026-11-05/);
  element("saveChecklistMd").click();
  assert.match(savedFilename, /-20261105\.md$/);
  element("saveChecklistTxt").click();
  assert.match(savedFilename, /-20261105\.txt$/);
  element("toolType").value = "checker";
  element("toolType").dispatch("change");
  assert.equal(element("copyChecklist").disabled, true);
  assert.equal(element("saveChecklistMd").disabled, true);
  console.log("PASS: local date in generated output and both exports; stale output invalidated");
} finally {
  if (oldTZ === undefined) delete process.env.TZ;
  else process.env.TZ = oldTZ;
}
