import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
function setup({ failDownload = false, delayedCopy = false } = {}) {
  const listeners = new Map();
  const elements = new Map();
  const make = (id = "") => ({
    id, value: "", textContent: "", disabled: false, style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(type, fn) { listeners.set(id + ":" + type, fn); },
    click() { if (failDownload && id === "a") throw Error("blocked"); },
    remove() {}, select() {},
  });
  for (const id of ["toolType", "checklistOutput", "generateChecklist", "copyChecklist", "saveChecklistMd", "saveChecklistTxt", "toast"]) elements.set(id, make(id));
  elements.get("toolType").value = "converter";
  let resolveCopy;
  const document = {
    documentElement: { lang: "en" },
    body: { appendChild() {}, removeChild() {} },
    getElementById(id) { return elements.get(id); },
    querySelectorAll() { return []; },
    createElement(tag) { return make(tag); },
    addEventListener(type, fn) { listeners.set("document:" + type, fn); },
    execCommand() { return true; },
  };
  const context = {
    document, navigator: { language: "en", clipboard: { writeText: () => delayedCopy ? new Promise(resolve => { resolveCopy = resolve; }) : Promise.resolve() } },
    localStorage: { getItem() { return null; }, setItem() {} },
    window: { clearTimeout() {}, setTimeout() { return 1; } },
    Blob, URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
    Date,
  };
  vm.runInNewContext(source, context);
  listeners.get("document:DOMContentLoaded")();
  const fire = (id, type = "click") => listeners.get(id + ":" + type)();
  return { fire, elements, finishCopy: () => resolveCopy() };
}
test("stale clipboard completion does not overwrite feedback after selection changes", async () => {
  const ui = setup({ delayedCopy: true });
  ui.fire("generateChecklist");
  const pending = ui.fire("copyChecklist");
  ui.elements.get("toolType").value = "checker";
  ui.fire("toolType", "change");
  ui.finishCopy();
  await pending;
  assert.equal(ui.elements.get("toast").textContent, "");
  assert.equal(ui.elements.get("copyChecklist").disabled, true);
});
test("download click failure reports failure and never claims success", () => {
  const ui = setup({ failDownload: true });
  ui.fire("generateChecklist");
  ui.fire("saveChecklistMd");
  assert.equal(ui.elements.get("toast").textContent, "Could not start download.");
  ui.fire("saveChecklistTxt");
  assert.equal(ui.elements.get("toast").textContent, "Could not start download.");
});
test("successful export reports initiation rather than completed disk save", () => {
  const ui = setup();
  ui.fire("generateChecklist");
  ui.fire("saveChecklistMd");
  assert.equal(ui.elements.get("toast").textContent, "Download started.");
});
