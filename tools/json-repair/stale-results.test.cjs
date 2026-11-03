const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createHarness() {
  const nodes = new Map();
  const events = new Map();
  let copied = "";
  const element = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: "", textContent: "", innerHTML: "", dataset: {}, style: {}, hidden: false,
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, fn) { events.set(id + ":" + name, fn); },
      setAttribute() {}, querySelector() { return null; },
      click() {}, focus() {}, select() {}, remove() {}
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: "en", dataset: {} },
    body: { appendChild() {} },
    getElementById: element,
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener(name, fn) { events.set("document:" + name, fn); },
    createElement() {
      return {
        value: "", style: {}, focus() {}, remove() {},
        select() { copied = this.value; },
        click() {}, setAttribute() {}
      };
    },
    execCommand(name) { return name === "copy"; }
  };
  const window = {
    NWPro: { getLocalStatus() { return { active: false, entitlement: "wrong" }; } },
    addEventListener(name, fn) { events.set("window:" + name, fn); }
  };
  const navigator = { language: "en", platform: "MacIntel" };
  const localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  const URL = { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} };
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  vm.runInNewContext(source, {
    document, window, navigator, localStorage, URL, Blob,
    setTimeout() { return 1; }, clearTimeout() {}
  });
  events.get("window:DOMContentLoaded")();
  element("selRepairLevel").value = "safe";
  return { element, events, getCopied: () => copied };
}

test("editing invalidates repair, validation, diff, log and schema displays", () => {
  const { element: el, events } = createHarness();
  const trigger = (id, event = "click") => events.get(id + ":" + event)();
  el("jrInput").value = '{"old": 1,}';
  trigger("jrInput", "input");
  trigger("btnRepair");
  assert.match(el("jrOutput").value, /"old": 1/);
  assert.match(el("jrLog").innerHTML, /Removed trailing commas/);
  el("jrInput").value = '{"fresh":2}';
  trigger("jrInput", "input");
  assert.equal(el("jrOutput").value, "");
  assert.equal(el("jrFormattedOut").value, "");
  assert.equal(el("jrDiff").textContent, "");
  assert.equal(el("jrSchemaOut").textContent, "");
  assert.equal(el("jrValidateOut").textContent, "—");
  assert.equal(el("jrLog").innerHTML, "—");

  el("jrInput").value = '{"bad":';
  trigger("jrInput", "input");
  trigger("btnRepair");
  assert.equal(el("jrOutput").value, "");
  assert.match(el("jrValidateOut").innerHTML, /Invalid JSON/);
});

test("late file reads cannot replace newer input; successful loads invalidate old results", async () => {
  const { element: el, events } = createHarness();
  const trigger = (id, event = "click") => events.get(id + ":" + event)();
  let resolveOld;
  const slowLoad = events.get("fileInput:change")({
    target: { files: [{ text: () => new Promise(resolve => { resolveOld = resolve; }) }] }
  });
  el("jrInput").value = '{"typed":true}';
  trigger("jrInput", "input");
  resolveOld('{"obsolete":true}');
  await slowLoad;
  assert.equal(el("jrInput").value, '{"typed":true}');

  trigger("btnRepair");
  assert.match(el("jrOutput").value, /typed/);
  await events.get("fileInput:change")({
    target: { files: [{ text: async () => '{"loaded":true}' }] }
  });
  assert.equal(el("jrInput").value, '{"loaded":true}');
  assert.equal(el("jrOutput").value, "");
  assert.equal(el("jrValidateOut").textContent, "—");
});

test("copy falls back locally when Clipboard API is unavailable", async () => {
  const { element: el, events, getCopied } = createHarness();
  el("jrInput").value = '{"fresh":true}';
  events.get("jrInput:input")();
  await events.get("btnCopy:click")();
  assert.equal(getCopied(), '{"fresh":true}');
});
