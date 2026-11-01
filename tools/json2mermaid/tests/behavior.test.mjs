import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const start = app.indexOf("function formatMermaidMarkdown(source) {");
const end = app.indexOf('document.addEventListener("DOMContentLoaded"', start);
assert.ok(start > 0 && end > start, "pure Markdown wrapper must be present");
const context = vm.createContext({});
vm.runInContext(app.slice(start, end), context);
const wrap = (src) => vm.runInContext('formatMermaidMarkdown(' + JSON.stringify(src) + ')', context);
const tick = String.fromCharCode(96);
const three = tick.repeat(3);
assert.equal(wrap("flowchart TD\n  A --> B"),
  three + "mermaid\nflowchart TD\n  A --> B\n" + three + "\n");
assert.equal(wrap("  "), "", "empty output must not produce an empty Markdown file");
const collision = 'flowchart TD\n  A["' + three + '"] --> B';
const safeFence = tick.repeat(4);
assert.equal(wrap(collision), safeFence + "mermaid\n" + collision + "\n" + safeFence + "\n",
  "fence must expand when original source contains backticks");
const longer = 'flowchart LR\n  A["' + tick.repeat(6) + '"] --> B';
assert.ok(wrap(longer).startsWith(tick.repeat(7) + "mermaid\n"));

for (const id of ["copyMarkdownBtn", "downloadMd", "downloadMmd", "downloadTxt", "convertBtn"]) {
  assert.equal(page.split('id="' + id + '"').length - 1, 1, id + " must occur exactly once");
}
assert.match(app, /copyMarkdownBtn\?\.addEventListener\("click", copyMarkdownHandler\)/);
assert.match(app, /downloadMd\?\.addEventListener\("click", \(\) => downloadHandler\("md"\)\)/);
assert.match(app, /extension === "md" \? formatMermaidMarkdown\(source\) : source/,
  "new format must not replace existing raw .mmd/.txt downloads");
assert.match(app, /text\/markdown;charset=utf-8/);
assert.ok(page.includes('data-i18n-key="copyMarkdown"') && page.includes('data-i18n-key="downloadMd"'));
assert.ok(!app.includes('fetch('), "Markdown export cannot transmit private input JSON");

console.log("PASS: free JSON2Mermaid copy/download Markdown with robust fences");
