import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const ja = fs.readFileSync(new URL("index.html", root), "utf8");
const en = fs.readFileSync(new URL("en/index.html", root), "utf8");
const css = fs.readFileSync(new URL("style.css", root), "utf8");
const original = fs.readFileSync(new URL("app.js", root), "utf8");

for (const [language, html] of [["JA", ja], ["EN", en]]) {
  for (const id of [
    "namesInput", "loadNamesButton", "pasteStatus", "fileInput", "runButton",
    "copyTsvButton", "downloadCsvButton", "optDeduplicate", "summaryBox"
  ]) {
    assert.ok(html.includes('id="' + id + '"'), language + " is missing " + id);
  }
  assert.equal((html.match(/id="namesInput"/g) || []).length, 1);
  assert.match(html, /maxlength="100000"/);
  assert.match(html, /id="pasteStatus"[^>]+aria-live="polite"/, "feedback is accessible");
}
assert.ok(css.includes(".filename-paste") && css.includes(".names-input"));
assert.ok(original.includes('loadNamesButton.addEventListener("click", loadPastedNames)'));
assert.ok(original.includes('if (fileInput) fileInput.value = "";'),
  "loading a pasted list should clear any old file selection");
assert.ok(!original.includes("fetch(") && !original.includes("FileReader"),
  "filename paste must not upload or read file contents");

const closing = "\n})();\n";
assert.ok(original.endsWith(closing), "expected local IIFE");
const tested = original.slice(0, -closing.length)
  + "\n  globalThis.__test = { parseFilenameLines };" + closing;
const context = {
  document: {
    documentElement: { lang: "ja" },
    getElementById() { return null; }
  },
  console
};
vm.runInNewContext(tested, context, { filename: "rename-wizard/app.js" });
const parse = context.__test.parseFilenameLines;
const valid = parse("Report 001.PDF\r\n\r\nPhoto 002.JPG\n");
assert.equal(Array.from(valid.names).join("|"), "Report 001.PDF|Photo 002.JPG");
assert.equal(parse(" \n \r\n").error, "pasteEmpty");
assert.equal(parse("A".repeat(100001)).error, "pasteTooLarge");
assert.equal(parse(Array(501).fill("file.txt").join("\n")).error, "pasteTooMany");
assert.equal(parse(Array(500).fill("file.txt").join("\n")).names.length, 500);

console.log("PASS: Rename Wizard bounded JA/EN pasted filename lists and output control parity");
