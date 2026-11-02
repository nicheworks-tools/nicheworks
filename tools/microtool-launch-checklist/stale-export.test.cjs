const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("changing a checklist type clears stale output and blocks mismatched exports", async () => {
  const events = new Map();
  const nodes = new Map();
  for (const id of ["toolType", "checklistOutput", "generateChecklist", "copyChecklist",
                    "saveChecklistMd", "saveChecklistTxt", "toast"]) {
    nodes.set(id, {
      value: "", textContent: "", disabled: false, style: {},
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(event, handler) { events.set(id + ":" + event, handler); }
    });
  }
  let ready;
  const downloads = [];
  const document = {
    documentElement: { lang: "en" },
    body: { appendChild() {}, removeChild() {} },
    querySelectorAll() { return []; },
    getElementById(id) { return nodes.get(id) || null; },
    addEventListener(event, handler) { if (event === "DOMContentLoaded") ready = handler; },
    createElement() {
      return {
        style: {}, value: "", setAttribute() {}, select() {},
        click() { downloads.push(this.download); }, remove() {}
      };
    },
    execCommand() { return false; }
  };
  let copied = 0;
  const navigator = { language: "en", clipboard: { async writeText() { copied++; } } };
  const window = { setTimeout() { return 1; }, clearTimeout() {} };
  const urlStub = { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} };
  const storage = { getItem() { return null; }, setItem() {} };
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  vm.runInNewContext(source, { document, navigator, window, URL: urlStub, Blob, localStorage: storage, Date });
  ready();

  const type = nodes.get("toolType");
  const output = nodes.get("checklistOutput");
  const copy = nodes.get("copyChecklist");
  const md = nodes.get("saveChecklistMd");
  const txt = nodes.get("saveChecklistTxt");

  assert.equal(copy.disabled, true);
  type.value = "converter";
  events.get("generateChecklist:click")();
  assert.match(output.textContent, /Additional checks for Converter/);
  assert.equal(copy.disabled, false);

  type.value = "checker";
  events.get("toolType:change")();
  assert.equal(output.textContent, "");
  assert.equal(copy.disabled, true);
  assert.equal(md.disabled, true);
  assert.equal(txt.disabled, true);
  await events.get("copyChecklist:click")();
  events.get("saveChecklistMd:click")();
  assert.equal(copied, 0);
  assert.equal(downloads.length, 0);

  events.get("generateChecklist:click")();
  assert.match(output.textContent, /Additional checks for Checker/);
  assert.doesNotMatch(output.textContent, /Additional checks for Converter/);
  await events.get("copyChecklist:click")();
  assert.equal(copied, 1);
  events.get("saveChecklistMd:click")();
  events.get("saveChecklistTxt:click")();
  assert.equal(downloads.length, 2);
  assert.match(downloads[0], /checklist-checker-[0-9]{8}[.]md$/);
  assert.match(downloads[1], /checklist-checker-[0-9]{8}[.]txt$/);

  for (const next of ["generator", "directory"]) {
    type.value = next;
    events.get("toolType:input")();
    assert.equal(output.textContent, "");
    events.get("generateChecklist:click")();
    assert.match(output.textContent, new RegExp("Additional checks for " + next[0].toUpperCase() + next.slice(1)));
  }
});
