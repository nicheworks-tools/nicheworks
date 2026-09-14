import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = '  init();\n})();';
assert.ok(source.includes(exportNeedle), 'unicode-kanji-checker test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { state, buildReverseLookupFromOldToNew, getCodePointInfo, getCodePointHex, getHtmlHexEntity, getHtmlDecimalEntity, getUtf16CodeUnits, hasCompatibilityIdeograph, hasSupplementaryPlaneChar, hasVariationSelector, getFallbackCompatibilityNote, toCsv };\n})();`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    href: '',
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    appendChild() {},
    append() {},
    setAttribute() {},
    select() {},
    remove() {},
  };
}

const documentStub = {
  documentElement: { lang: 'ja' },
  querySelector() { return makeElement(); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
  execCommand() { return true; },
  body: makeElement(),
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: { async writeText() {} } },
  window: {},
  fetch: async () => ({ ok: false, async json() { return {}; } }),
  setTimeout,
  clearTimeout,
  encodeURIComponent,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/unicode-kanji-checker/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

const reverse = api.buildReverseLookupFromOldToNew({
  舊: '旧',
  髙: ['高', '高'],
  邊: '辺',
});
assert.deepEqual(Array.from(reverse.get('旧')), ['舊']);
assert.deepEqual(Array.from(reverse.get('高')), ['髙'], 'reverse lookup should deduplicate old-form candidates');
assert.deepEqual(Array.from(reverse.get('辺')), ['邊']);

const common = api.getCodePointInfo('髙');
assert.equal(common.hex, 'U+9AD9');
assert.equal(common.decimal, String(0x9ad9));
assert.equal(api.getHtmlHexEntity('髙'), '&#x9AD9;');
assert.equal(api.getHtmlDecimalEntity('髙'), `&#${0x9ad9};`);
assert.equal(api.getUtf16CodeUnits('髙'), '9AD9');

const supplementary = '𠮷';
assert.equal(api.getCodePointHex(supplementary), 'U+20BB7');
assert.equal(api.getUtf16CodeUnits(supplementary), 'D842 DFB7');
assert.equal(api.hasSupplementaryPlaneChar(supplementary), true);
assert.equal(api.hasSupplementaryPlaneChar('吉'), false);

const compat = String.fromCodePoint(0xf900);
assert.equal(api.hasCompatibilityIdeograph(compat), true);
assert.equal(api.hasCompatibilityIdeograph('髙'), false);

const variationSelector = String.fromCodePoint(0xe0100);
assert.equal(api.hasVariationSelector(variationSelector), true);
assert.equal(api.hasVariationSelector('髙'), false);

api.state.lang = 'en';
const compatNotes = Array.from(api.getFallbackCompatibilityNote(compat));
assert.equal(compatNotes.length, 1);
assert.equal(compatNotes[0].type, 'compat');
assert.match(compatNotes[0].text, /compatibility ideograph range/i);

const supplementaryNotes = Array.from(api.getFallbackCompatibilityNote(supplementary));
assert.equal(supplementaryNotes.length, 1);
assert.equal(supplementaryNotes[0].type, 'supp');

const csv = api.toCsv([
  {
    ch: '髙',
    hex: 'U+9AD9',
    decimal: String(0x9ad9),
    htmlHex: '&#x9AD9;',
    htmlDec: `&#${0x9ad9};`,
    utf16: '9AD9',
    oldModern: ['高', '高橋"用'],
    oldCandidates: ['髙', '高'],
  },
]);
assert.match(csv, /^"character","unicode","decimal"/);
assert.match(csv, /"高\|高橋""用"/);
assert.match(csv, /"髙\|高"/);

console.log('Unicode Kanji Checker behavior test passed.');
