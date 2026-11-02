"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

test("editing inputs invalidates visible drafts and cancels pending generation", () => {
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const ids = new Map();
  function element(id) {
    if (!ids.has(id)) ids.set(id, {
      value: "", textContent: "", disabled: false, listeners: {},
      classList: { values: new Set(["hidden"]), add(x) { this.values.add(x); }, remove(x) { this.values.delete(x); }, toggle(x, yes) { if (yes) this.add(x); else this.remove(x); } },
      addEventListener(event, fn) { this.listeners[event] = fn; }
    });
    return ids.get(id);
  }
  const pending = [];
  const document = {
    getElementById: element,
    addEventListener(event, fn) { if (event === "DOMContentLoaded") this.ready = fn; },
    querySelectorAll() { return []; },
    querySelector(selector) {
      if (selector === ".title" || selector === ".subtitle" || selector === "#result-section h2") return element(selector);
      return null;
    },
    documentElement: { lang: "ja" }
  };
  const context = vm.createContext({
    document, navigator: { language: "ja" }, localStorage: { getItem() { return null; }, setItem() {} },
    window: { setTimeout(fn) { pending.push(fn); } }, console
  });
  vm.runInContext(source, context);
  document.ready();
  element("purpose").value = "thank_you";
  element("culture").value = "japan";
  element("formality").value = "medium";
  element("generate-btn").listeners.click();
  assert.equal(pending.length, 1);
  element("keywords").value = "変更後";
  element("keywords").listeners.input();
  pending.shift()();
  assert.equal(element("result-text").textContent, "");
  assert.ok(element("result-section").classList.values.has("hidden"));
  element("generate-btn").listeners.click();
  pending.shift()();
  assert.ok(element("result-text").textContent.includes("変更後"));
  element("purpose").value = "apology";
  element("purpose").listeners.change();
  assert.equal(element("result-text").textContent, "");
  assert.ok(element("result-section").classList.values.has("hidden"));
  assert.equal(vm.runInContext("lastContext", context), null);
  assert.equal(vm.runInContext("currentMessage", context), "");
});
