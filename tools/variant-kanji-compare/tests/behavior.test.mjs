import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rawSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let source = rawSource;
source = source.replace(/\ndocument\.addEventListener\('DOMContentLoaded'[\s\S]*$/, `
globalThis.__test = {
  PRESETS,
  parseInputCharacters,
  getUtf16CodeUnits,
  isCompatibilityIdeographCodePoint,
  isVariationSelectorCodePoint,
  renderCompatibilityNote,
  compareCharacters,
  summarizeComparison,
  buildReverseLookupFromOldToNew,
  toCsv,
  setLang(lang) { state.lang = lang; },
  setReferenceData({ oldToNew = {}, metadata = {}, compatibilityNotes = {}, shapeNotes = {}, strokeCounts = {} } = {}) {
    state.dict = { old_to_new: oldToNew };
    state.reverseLookup = buildReverseLookupFromOldToNew(oldToNew);
    state.metadata = metadata;
    state.compatibilityNotes = compatibilityNotes;
    state.shapeNotes = shapeNotes;
    state.strokeCounts = strokeCounts;
  }
};
`);

const sandbox = { console, Map, Set, Promise };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/variant-kanji-compare/app.js' });
const api = context.__test;
assert.ok(api, 'Variant compare test exports should be available');

assert.deepEqual(
  Array.from(api.parseInputCharacters('崎, 﨑/崎 𠮷、邊')),
  ['崎', '﨑', '𠮷', '邊'],
  'custom comparison must strip separators and dedupe by code point',
);
assert.deepEqual(Array.from(api.PRESETS), ['崎 﨑', '高 髙', '吉 𠮷', '辺 邊 邉', '斎 齋 齊', '浜 濱', '沢 澤', '国 國', '学 學']);

api.setLang('ja');
api.setReferenceData({ oldToNew: { '舊': '旧', '邊': '辺', '邉': '辺' } });
const compared = api.compareCharacters(['舊', '旧', '𠮷']);
assert.equal(compared[0].oldToModern, '旧');
assert.deepEqual(Array.from(compared[1].modernCandidates), ['舊']);
assert.equal(compared[2].unicode, 'U+20BB7');
assert.equal(compared[2].utf16, 'D842 DFB7');

const compatibilitySupplement = String.fromCodePoint(0x2F800);
const supplementaryVs = String.fromCodePoint(0xE0100);
const edgeItems = api.compareCharacters(['﨑', compatibilitySupplement, '𠮷', supplementaryVs]);
assert.equal(edgeItems[0].isCompatibilityIdeograph, true);
assert.equal(edgeItems[1].isCompatibilityIdeograph, true, 'supplementary compatibility ideograph must be recognized');
assert.equal(edgeItems[3].isVariationSelector, true);
assert.equal(
  api.renderCompatibilityNote(supplementaryVs, 0xE0100),
  '異体字セレクタ領域',
  'supplementary variation selector must not be downgraded to a generic supplementary-plane note',
);

const summary = api.summarizeComparison(edgeItems);
assert.equal(summary.compared, 4);
assert.equal(summary.compatibility, 2, 'compatibility count must count compatibility ideographs only');
assert.equal(summary.supplementary, 3);
assert.equal(summary.variation, 1);
assert.equal(summary.rendering, 4, 'rendering count is independent from compatibility count');

const csv = api.toCsv(api.compareCharacters(['舊']));
assert.match(csv, /"舊","U\+820A"/);

assert.match(rawSource, /\[\[t\.serif,'glyph-serif'\],\[t\.sans,'glyph-sans'\],\[t\.system,'glyph-system'\]\]/, 'three-font comparison must remain wired');
assert.match(rawSource, /summary\.compatibility/, 'rendered compatibility count must use the dedicated compatibility summary');
assert.match(rawSource, /summary\.rendering/, 'rendering-note count must remain independent');

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /法的な有効性や登録可否を判断するものではありません/);
assert.match(indexHtml, /入力内容はブラウザ内で処理され、外部APIには送信しません/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state/, 'unfinished Pro sales panel must not be rendered');

console.log('Variant Kanji Compare behavior test passed.');
