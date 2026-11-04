"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "complete.js"), "utf8");

test("generic sample button downloads a real four-column CSV without loading it into the editor", async () => {
  const handlers = new Map();
  const files = [];
  const blobs = [];
  const input = { files: [], dispatchEvent() { throw new Error("generic download should not load a file"); } };
  const button = { addEventListener(name, fn) { handlers.set(name, fn); } };
  const hint = { textContent: "" };
  const document = {
    readyState: "loading",
    addEventListener(name, fn) { handlers.set(name, fn); },
    querySelector(selector) {
      return { "#sampleBtn": button, "#fileInput": input, "#loadHint": hint }[selector] || null;
    },
    querySelectorAll() { return []; },
    body: { appendChild() {} },
    createElement() {
      return { click() { files.push(this.download); }, remove() {} };
    }
  };
  const RuntimeBlob = class extends Blob {
    constructor(content, options) { super(content, options); blobs.push(this); }
  };
  const context = {
    document, navigator: { language: "ja" }, window: {}, Blob: RuntimeBlob,
    URL: { createObjectURL() { return "blob:sample"; }, revokeObjectURL() {} },
    setTimeout(callback) { callback(); }
  };
  vm.runInNewContext(source, context);
  handlers.get("DOMContentLoaded")();
  assert.equal(typeof handlers.get("click"), "function");
  handlers.get("click")();
  assert.deepEqual(files, ["sample-generic.csv"]);
  assert.equal(blobs.length, 1);
  const content = await blobs[0].text();
  const records = content.trim().split("\n").map(row => row.split(","));
  assert.equal(records.length, 3);
  assert.deepEqual(records[0], ["id", "name", "category", "notes"]);
  assert.ok(records.every(row => row.length === 4));
  assert.match(hint.textContent, /ダウンロードしました/);
});
