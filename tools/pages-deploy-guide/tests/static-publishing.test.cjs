"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const production = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
function generate(lang, sourceType, outputFolder) {
  const elements = new Map();
  const el = id => {
    if (!elements.has(id)) elements.set(id, { value: "", dataset: {}, style: {}, classList: { add() {}, remove() {}, toggle() {} }, addEventListener(event, callback) { this[event === "click" ? "clickHandler" : event] = callback; }, click() { if (this.clickHandler) this.clickHandler(); } });
    return elements.get(id);
  };
  el("platform").value = "github";
  el("sourceType").value = sourceType;
  el("outputFolder").value = outputFolder;
  el("customDomain").value = "no";
  const document = {
    documentElement: { lang },
    getElementById: el,
    querySelectorAll() { return []; },
    addEventListener(event, callback) { if (event === "DOMContentLoaded") callback(); }
  };
  vm.runInNewContext(production, { document, navigator: { language: lang }, localStorage: { getItem() { return lang; }, setItem() {} }, setTimeout() {}, clearTimeout() {}, Date, Blob, URL }, { filename: "app.js" });
  el("generate").click();
  return { checklist: el("output").value, diagnosis: el("diagnosis").value, handoff: el("proPack").value };
}
for (const lang of ["ja", "en"]) {
  for (const folder of ["root", "docs"]) {
    test(`GitHub static output ${lang}/${folder} discloses artifact versus branch source`, () => {
      const result = generate(lang, "static", folder);
      assert.match(result.checklist, /GitHub Actions/);
      assert.match(result.checklist, /artifact/);
      assert.match(result.checklist, /docs/);
      assert.match(result.checklist, /root/);
      assert.match(result.checklist, lang === "ja" ? /選択だけでは公開設定にならない/ : /selector alone does not configure publishing/);
      assert.match(result.diagnosis, /artifact/);
      assert.match(result.handoff, /GitHub Actions/);
    });
  }
  for (const folder of ["dist", "public"]) {
    test(`GitHub invalid branch source ${lang}/${folder} still warns`, () => {
      const result = generate(lang, "static", folder);
      assert.match(result.checklist, /GitHub Actions/);
      assert.match(result.checklist, new RegExp(folder));
      assert.match(result.checklist, lang === "ja" ? /source folderにはできない/ : /not a branch-publishing source/);
    });
  }
  test(`GitHub repository source ${lang} keeps branch guidance`, () => {
    assert.match(generate(lang, "repository", "root").checklist, lang === "ja" ? /branch公開なら/ : /If publishing from a branch/);
  });
}
