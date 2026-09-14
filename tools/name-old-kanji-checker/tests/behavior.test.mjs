import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = '  initialize();\n})();';
assert.ok(source.includes(exportNeedle), 'name-old-kanji-checker test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { state, splitCharacters, getCodePointInfo, hasCompatibilityIdeograph, hasSupplementaryPlaneChar, hasVariationSelector, getFallbackCompatibilityNote, mapCategoryLabel, buildReverseLookupFromOldToNew, getMetadataForCharacters };\n})();`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    dataset: {},
    style: {},
    className: '',
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    appendChild() {},
    append() {},
    setAttribute() {},
  };
}

const documentStub = {
  documentElement: { lang: 'ja' },
  getElementById() { return makeElement(); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: { async writeText() {} } },
  window: {},
  fetch: async () => ({ ok: false, status: 404, async json() { return {}; } }),
  encodeURIComponent,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/name-old-kanji-checker/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.deepEqual(Array.from(api.splitCharacters('髙𠮷')), ['髙', '𠮷'], 'supplementary-plane characters should stay intact');

const supplementaryInfo = api.getCodePointInfo('𠮷');
assert.equal(supplementaryInfo.hex, 'U+20BB7');
assert.equal(supplementaryInfo.codePoint, 0x20bb7);
assert.equal(api.hasSupplementaryPlaneChar('𠮷'), true);
assert.equal(api.hasSupplementaryPlaneChar('吉'), false);

const compatibility = String.fromCodePoint(0xf900);
assert.equal(api.hasCompatibilityIdeograph(compatibility), true);
assert.equal(api.hasCompatibilityIdeograph('髙'), false);

const variationSelector = String.fromCodePoint(0xe0100);
assert.equal(api.hasVariationSelector(variationSelector), true);
assert.equal(api.hasVariationSelector('髙'), false);

api.state.lang = 'en';
const fallback = api.getFallbackCompatibilityNote('𠮷');
assert.ok(fallback, 'supplementary-plane character should receive a fallback rendering note');
assert.match(fallback.summaryEn, /Rendering may vary by environment/);
assert.equal(api.getFallbackCompatibilityNote('高'), null, 'ordinary BMP character should not receive a fallback note');
assert.equal(api.mapCategoryLabel('name'), 'Names / Places');
assert.equal(api.mapCategoryLabel('custom-category'), 'custom-category');

api.buildReverseLookupFromOldToNew({
  舊: '旧',
  髙: ['高', '高'],
  邊: '辺',
});
assert.deepEqual(Array.from(api.state.modernToOld.get('旧')), ['舊']);
assert.deepEqual(Array.from(api.state.modernToOld.get('高')), ['髙'], 'reverse lookup should deduplicate repeated modern mappings');
assert.deepEqual(Array.from(api.state.modernToOld.get('辺')), ['邊']);

api.state.metadataByOldChar.clear();
api.state.metadataByOldChar.set('髙', { readingJa: 'たか' });
api.state.metadataByOldChar.set('舊', { readingJa: 'きゅう' });
assert.equal(api.getMetadataForCharacters(['高', '髙', '舊']).readingJa, 'たか', 'first available metadata candidate should win');
assert.equal(api.getMetadataForCharacters(['高', '辺']), null);

console.log('Name Old Kanji Checker behavior test passed.');
