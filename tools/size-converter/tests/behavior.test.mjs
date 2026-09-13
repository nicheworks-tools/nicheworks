import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);\n  else init();\n})();';
assert.ok(source.includes(exportNeedle), 'size-converter test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { els, DATA, CLOTH_CHART, parseDecimal, normalizeSize, parseSizeEntry, findSizeIndex, shoeRange, nearestShoe, widthContext, toCm, rangeDistance, chartEnvelope, nearRangeBoundary };\n})();`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    appendChild() {},
    append() {},
    replaceChildren() {},
    setAttribute() {},
    focus() {},
  };
}

const elements = new Map();
const documentStub = {
  readyState: 'loading',
  documentElement: { lang: 'en' },
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
  addEventListener() {},
  body: makeElement(),
};

const storage = new Map();
const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en', clipboard: { async writeText() {} } },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  window: {},
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/size-converter/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

api.els.category.value = 'shoes';
api.els.gender.value = 'men';
api.els.base.value = 'jp';

assert.equal(api.parseDecimal('12,5'), 12.5, 'comma decimal input should be normalized');
assert.equal(api.parseDecimal('   '), null);
assert.equal(Number.isNaN(api.parseDecimal('abc')), true);
assert.equal(api.normalizeSize('  2–4 cm '), '2-4');
assert.equal(api.normalizeSize(' eu 44 '), 'EU44');

const parsedUs = api.parseSizeEntry('US: 9');
assert.equal(parsedUs.system, 'us');
assert.equal(parsedUs.value, '9');
const parsedDefault = api.parseSizeEntry('27.0');
assert.equal(parsedDefault.system, 'jp');
assert.equal(parsedDefault.value, '27.0');

assert.equal(api.findSizeIndex('jp', '27.0'), 10);
assert.deepEqual(Array.from(api.shoeRange()), [22, 31]);

const nearest = api.nearestShoe(27.25);
assert.equal(nearest.outOfRange, false);
assert.equal(nearest.row.jp, '27.0');
assert.equal(nearest.boundary, true, 'a quarter-centimeter offset should be treated as boundary-adjacent');
assert.deepEqual(Array.from(nearest.near).map((row) => row.jp), ['26.5', '27.0', '27.5']);

const tooSmall = api.nearestShoe(17.9);
assert.equal(tooSmall.outOfRange, true);
assert.deepEqual(Array.from(tooSmall.range), [22, 31]);

const wide = api.widthContext(25, 11);
assert.ok(Math.abs(wide.ratio - 0.44) < 1e-9);
assert.match(wide.text, /wider/i);
const narrow = api.widthContext(25, 8.5);
assert.match(narrow.text, /narrower/i);
const noWidth = api.widthContext(25, Number.NaN);
assert.equal(noWidth.ratio, null);

assert.equal(api.toCm(10, 'inch'), 25.4);
assert.equal(api.toCm(25, 'cm'), 25);
assert.equal(api.rangeDistance(70, [72, 78]), 2);
assert.equal(api.rangeDistance(75, [72, 78]), 0);
assert.equal(api.rangeDistance(80, [72, 78]), 2);

const envelope = api.chartEnvelope(api.CLOTH_CHART.women.tops, 'waist');
assert.deepEqual(Array.from(envelope), [54, 90]);
assert.equal(api.nearRangeBoundary(55, [54, 60]), true);
assert.equal(api.nearRangeBoundary(57, [54, 60]), false);

console.log('Size Converter behavior test passed.');
