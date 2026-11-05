import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");

function harness({ rejectDownload = false, delayedClipboard = false } = {}) {
  const elements = new Map();
  const listeners = new Map();
  const make = (id = "") => ({
    id, value: "", textContent: "", dataset: {}, style: {}, classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(name, fn) { listeners.set(id + ":" + name, fn); },
    click() { if (rejectDownload) throw Error("download blocked"); },
    select() {}, remove() {}, href: "", download: ""
  });
  for (const id of ["platform", "sourceType", "customDomain", "outputFolder", "output", "errors", "diagnosis", "proPack", "generate", "copyAll", "downloadMd", "toast"]) elements.set(id, make(id));
  elements.get("platform").value = "cloudflare";
  elements.get("sourceType").value = "static";
  elements.get("customDomain").value = "no";
  elements.get("outputFolder").value = "dist";
  let resolveClipboard;
  const copied = [];
  const clipboard = { writeText(value) { copied.push(value); return delayedClipboard ? new Promise(resolve => { resolveClipboard = resolve; }) : Promise.resolve(); } };
  const document = {
    documentElement: { lang: "en" },
    getElementById(id) { return elements.get(id); },
    querySelectorAll() { return []; },
    addEventListener(name, fn) { listeners.set("document:" + name, fn); },
    createElement() { return make(); },
    body: { appendChild() {} },
    execCommand() { return false; }
  };
  const context = { document, navigator: { language: "en", clipboard }, localStorage: { getItem() { return null; }, setItem() {} },
    URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
    Blob, Date, setTimeout() { return 1; }, clearTimeout() {} };
  vm.runInNewContext(source, context);
  listeners.get("document:DOMContentLoaded")();
  return { elements, copied, listeners, finishCopy() { resolveClipboard?.(); }, click(id) { return listeners.get(id + ":click")(); }, change(id, value) { elements.get(id).value = value; listeners.get(id + ":change")(); } };
}

test("copy feedback is suppressed after a newer result is rendered", async () => {
  const h = harness({ delayedClipboard: true });
  h.click("generate");
  const pending = h.click("copyAll");
  assert.equal(h.copied.length, 1);
  h.change("platform", "github");
  h.finishCopy();
  await pending;
  assert.notEqual(h.elements.get("toast").textContent, "Copied all results.");
  assert.match(h.elements.get("output").value, /GitHub Pages/);
});

test("copy success reports only the current result", async () => {
  const h = harness();
  h.click("generate");
  await h.click("copyAll");
  assert.equal(h.elements.get("toast").textContent, "Copied all results.");
});

test("download failure is reported without a false saved notification", () => {
  const h = harness({ rejectDownload: true });
  h.click("generate");
  h.click("downloadMd");
  assert.equal(h.elements.get("toast").textContent, "Could not start download.");
});

test("successful download is described as started, not completed", () => {
  const h = harness();
  h.click("generate");
  h.click("downloadMd");
  assert.equal(h.elements.get("toast").textContent, "Markdown download started.");
});
