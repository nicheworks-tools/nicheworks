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
  + "\n  globalThis.__test = { parseFilenameLines, buildRows, setNames: (names) => { originalNames = names; } };" + closing;
const dedupe = { checked: true };
const context = {
  document: {
    documentElement: { lang: "ja" },
    getElementById(id) { return id === "optDeduplicate" ? dedupe : null; }
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

const build = (names) => {
  context.__test.setNames(names);
  return Array.from(context.__test.buildRows()).map(row => ({
    original: row.original,
    normalized: row.normalized,
    duplicate: row.duplicate,
    fixed: row.duplicateFixed
  }));
};
const collision = build(["report.txt", "report.txt", "report_2.txt", "REPORT.TXT"]);
assert.equal(collision[0].normalized, "report.txt");
assert.equal(collision[1].normalized, "report_3.txt",
  "numbered candidates must avoid even later pre-existing names");
assert.equal(collision[2].normalized, "report_2.txt");
assert.equal(new Set(collision.map(row=>row.normalized.toLowerCase())).size,4,
  "case-insensitive outputs must be unique when dedupe is enabled");
assert.equal(collision.filter(row => row.fixed).length,2,
  "only duplicates that need suffixes should be marked as fixed");
assert.equal(build(["file.txt","file.txt"])[1].normalized,"file_2.txt",
  "ordinary duplicate still gets the first available suffix");
assert.equal(build(["report_2.txt","report.txt","report.txt"])[2].normalized,"report_3.txt");
dedupe.checked = false;
const unchanged = build(["report.txt", "report.txt"]);
assert.deepEqual(unchanged.map(row => row.normalized), ["report.txt","report.txt"],
  "disabling dedupe must preserve duplicate names and warnings");
assert.equal(unchanged[0].duplicate,true);
assert.equal(unchanged[1].duplicate,true);
dedupe.checked = true;

console.log("PASS: Rename Wizard bounded JA/EN pasted filename lists and output control parity");
