const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function harness() {
  const nodes = new Map();
  const events = new Map();
  const downloads = [];
  let copied = "";
  let blob = null;
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: "", textContent: "", placeholder: "", style: {}, disabled: false,
      addEventListener(name, fn) { events.set(id + ":" + name, fn); },
      appendChild() {}, append() {}, setAttribute() {},
      classList: { add() {}, remove() {} }
    });
    return nodes.get(id);
  };
  const document = {
    getElementById: get,
    documentElement: { lang: "ja", dataset: { proActive: "false" } },
    querySelectorAll() { return []; },
    body: { appendChild() {} },
    createElement(tag) {
      return {
        tagName: tag, value: "", textContent: "", style: {},
        appendChild() {}, append() {}, remove() {},
        select() { copied = this.value; },
        click() { downloads.push({ name: this.download, blob }); }
      };
    },
    execCommand(name) { return name === "copy"; }
  };
  const window = { isSecureContext: false, addEventListener(name, fn) { events.set("window:" + name, fn); } };
  const localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  const URL = { createObjectURL(value) { blob = value; return "blob:local"; }, revokeObjectURL() {} };
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  vm.runInNewContext(source, {
    document, window, navigator: { platform: "MacIntel" }, localStorage,
    URL, Blob, setTimeout() { return 1; }, clearTimeout() {}
  });
  return { get, events, downloads, getCopied: () => copied };
}

test("editing meeting fields invalidates prior markdown/SOP and regenerates copy", () => {
  const { get, events, getCopied } = harness();
  get("meetingTitle").value = "Weekly Alpha";
  get("notes").value = "Task: ship release Owner: Alex Due: Nov 9";
  events.get("genBtn:click")();
  assert.match(get("mdPreview").value, /Weekly Alpha/);
  get("meetingTitle").value = "Weekly Beta";
  events.get("meetingTitle:input")();
  assert.equal(get("mdPreview").value, "");
  assert.equal(get("sop").textContent, "—");
  events.get("copyMdBtn:click")();
  assert.match(getCopied(), /Weekly Beta/);
  assert.doesNotMatch(getCopied(), /Weekly Alpha/);
  get("meetingDate").value = "2026-11-03";
  events.get("meetingDate:change")();
  assert.equal(get("mdPreview").value, "");
  get("participants").value = "Alice, Bob";
  events.get("participants:input")();
  assert.equal(get("githubPreview").value.includes("Preview"), true);
});

test("downloads contain only current notes even after edits without input events", async () => {
  const { get, events, downloads, getCopied } = harness();
  get("notes").value = "Task: ship release";
  events.get("genBtn:click")();
  get("notes").value = "Decision: postpone release";
  events.get("notes:input")();
  assert.equal(get("mdPreview").value, "");
  events.get("dlMdBtn:click")();
  assert.equal(downloads.length, 1);
  const text = await downloads[0].blob.text();
  assert.match(text, /postpone release/);
  assert.doesNotMatch(text, /Task: ship release/);

  get("notes").value = "Task: report new decision";
  events.get("copyMdBtn:click")();
  assert.match(getCopied(), /report new decision/);
  assert.doesNotMatch(getCopied(), /postpone release/);
  events.get("pasteExampleBtn:click")();
  assert.equal(get("mdPreview").value, "");
  assert.match(get("githubPreview").value, /Preview/);
  events.get("downloadPackBtn:click")();
  assert.equal(downloads.length, 1, "Pro bundle stays locked");
});
