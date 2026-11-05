"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const handlers = {};
const elements = new Map();
const el = (id) => {
  if (!elements.has(id)) elements.set(id, {
    value: "", textContent: "", disabled: false, placeholder: "",
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(type, cb) { handlers[id + ":" + type] = cb; },
    after() {}, setAttribute() {}, select() {}, remove() {},
    style: {}, dataset: {}
  });
  return elements.get(id);
};
let resolveCopy;
const clipboard = { writeText() { return new Promise((resolve) => { resolveCopy = resolve; }); } };
const document = {
  documentElement: { lang: "" },
  body: { appendChild() {} },
  getElementById: el,
  querySelector() { return el("selector"); },
  querySelectorAll() { return []; },
  createElement() { return el("notice"); },
  addEventListener(type, cb) { handlers["document:" + type] = cb; }
};
const context = vm.createContext({
  document, navigator: { language: "en", clipboard },
  window: { isSecureContext: true, setTimeout },
  localStorage: { getItem() { return null; }, setItem() {} },
  console
});
vm.runInContext(source, context, { filename: "app.js" });
handlers["document:DOMContentLoaded"]();
const run = (code) => vm.runInContext(code, context);
const tick = () => new Promise((resolve) => setImmediate(resolve));
(async () => {
  run('renderResult("old draft")');
  const pending = handlers["copy-btn:click"]();
  assert.equal(typeof resolveCopy, "function");
  run("invalidateGeneratedMessage()");
  resolveCopy();
  await pending;
  assert.equal(el("notice").textContent, "", "stale copy must not announce success");

  run('renderResult("new draft")');
  const pending2 = handlers["copy-btn:click"]();
  resolveCopy();
  await pending2;
  assert.equal(el("notice").textContent, "Copied to clipboard");

  run('renderResult("third draft")');
  const pending3 = handlers["copy-btn:click"]();
  run('renderResult("newer draft")');
  resolveCopy();
  await pending3;
  assert.equal(el("notice").textContent, "Copied to clipboard", "copy completion cannot overwrite newer result");
  console.log("message-generator production clipboard regression: PASS (3 scenarios)");
})().catch((error) => { console.error(error); process.exitCode = 1; });
