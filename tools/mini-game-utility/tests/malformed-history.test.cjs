// Execute the shipped production script with a minimal browser event harness.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const script = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");

function run(saved) {
  const listeners = {};
  const elements = {};
  for (const id of ["timerDisplay","btnStart","btnPause","btnReset","btnAdd","btnExport","btnClear","playerName","scoreValue","history"]) {
    elements[id] = {
      value: "", textContent: "", style: {}, dataset: {},
      addEventListener(event, fn) { (listeners[id + ":" + event] ||= []).push(fn); },
      setCustomValidity() {}, reportValidity() {}
    };
  }
  const storage = { nw_mini_game_scores: JSON.stringify(saved) };
  const downloads = [];
  const document = {
    documentElement: {},
    addEventListener(event, fn) { (listeners["document:" + event] ||= []).push(fn); },
    querySelectorAll() { return []; },
    getElementById(id) { return elements[id]; }
  };
  const localStorage = {
    getItem(key) { return storage[key] ?? null; },
    setItem(key, value) { storage[key] = value; }
  };
  const context = {
    document, localStorage, navigator: { language: "en" },
    window: {}, setTimeout, clearTimeout, setInterval, clearInterval, Date,
    Blob, URL
  };
  vm.runInNewContext(script, context, { filename: "app.js" });
  context.window.NW.downloadText = (...args) => downloads.push(args);
  for (const fn of listeners["document:DOMContentLoaded"] || []) fn();
  return { elements, storage, downloads, click(id) { for (const fn of listeners[id + ":click"] || []) fn(); } };
}

const initial = [null, 7, "broken", [], { name: "Valid", score: 4, time: "now" }, { name: "Old", score: "oops", time: "then" }];
const app = run(initial);
assert.match(app.elements.history.textContent, /Valid \| 4/);
assert.doesNotMatch(app.elements.history.textContent, /undefined \|/);
app.click("btnExport");
assert.equal(app.downloads.length, 1);
assert.match(app.downloads[0][1], /"Valid",4,"now"/);
assert.match(app.downloads[0][1], /"Old",0,"then"/);
assert.deepEqual(JSON.parse(app.storage.nw_mini_game_scores), initial, "reading and exporting must not mutate legacy storage");
const empty = run([null, false, []]);
assert.equal(empty.elements.history.textContent, "-");
empty.click("btnExport");
assert.equal(empty.downloads.length, 0);
console.log("mini-game malformed history production regression: PASS");
