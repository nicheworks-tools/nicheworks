import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rawSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let source = rawSource;
const exportNeedle = '  initialize();\n})();';
assert.ok(source.includes(exportNeedle), 'name-old-kanji-checker test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = {
    state,
    splitCharacters,
    hasMeaningfulText,
    buildConverterHref,
    getCodePointInfo,
    hasCompatibilityIdeograph,
    hasSupplementaryPlaneChar,
    hasVariationSelector,
    getFallbackCompatibilityNote,
    mapCategoryLabel,
    buildReverseLookupFromOldToNew,
    getMetadataForCharacters,
    loadData
  };\n})();`,
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

let fetchImpl = async () => ({ ok: false, status: 404, async json() { return {}; } });
const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: { async writeText() {} } },
  window: {},
  fetch: (...args) => fetchImpl(...args),
  encodeURIComponent,
  Map,
  Set,
  Promise,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/name-old-kanji-checker/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.deepEqual(Array.from(api.splitCharacters('髙𠮷')), ['髙', '𠮷'], 'supplementary-plane characters should stay intact');
assert.equal(api.hasMeaningfulText('  \n  '), false);
assert.equal(api.hasMeaningfulText('  髙\n  '), true);

const exactInput = '  髙橋\n齋藤  ';
assert.equal(
  api.buildConverterHref(exactInput),
  `../kanji-modernizer/?q=${encodeURIComponent(exactInput)}`,
  'Name → Modernizer handoff must preserve exact leading/trailing whitespace and newlines',
);
assert.match(rawSource, /converterLink\.href = buildConverterHref\(exactInput\)/);

const supplementaryInfo = api.getCodePointInfo('𠮷');
assert.equal(supplementaryInfo.hex, 'U+20BB7');
assert.equal(supplementaryInfo.codePoint, 0x20bb7);
assert.equal(api.hasSupplementaryPlaneChar('𠮷'), true);
assert.equal(api.hasSupplementaryPlaneChar('吉'), false);

const compatibility = String.fromCodePoint(0xf900);
const compatibilitySupplement = String.fromCodePoint(0x2f800);
assert.equal(api.hasCompatibilityIdeograph(compatibility), true);
assert.equal(api.hasCompatibilityIdeograph(compatibilitySupplement), true, 'CJK Compatibility Ideographs Supplement must be recognized');
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

fetchImpl = async (url) => {
  if (String(url).endsWith('/dict.json')) {
    return { ok: true, status: 200, async json() { return { old_to_new: { 舊: '旧', 髙: '高' } }; } };
  }
  return { ok: false, status: 503, async json() { return {}; } };
};
api.state.metadataByOldChar.clear();
api.state.compatibilityByChar.clear();
await api.loadData();
assert.equal(api.state.dataStatus, 'partial_error', 'optional data failure must degrade without blocking the base dictionary');
assert.equal(api.state.dict.old_to_new['舊'], '旧');
assert.deepEqual(Array.from(api.state.modernToOld.get('高')), ['髙']);

const fetchTargets = Array.from(rawSource.matchAll(/fetchJson\(([^)]+)\)/g), match => match[1].trim())
  .filter(target => target !== 'url');
assert.ok(fetchTargets.length >= 2);
assert.ok(
  fetchTargets.every(target => target.includes('DICT_URL') || target.includes('old-kanji-reference') || target.includes('COMPATIBILITY_URL')),
  'Name checker data requests must remain scoped to same-site Old Kanji reference assets',
);

assert.match(rawSource, /法的な有効性や登録可否を判断するものではありません/);
assert.match(rawSource, /The candidates shown here do not determine legal validity or registration availability\./);

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /戸籍上の正式な字体や氏名への使用可否を判定するものではありません/);
assert.match(indexHtml, /入力内容はブラウザ内で処理され/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state|billing-unavailable/, 'unfinished Pro sales panel must not be rendered');

console.log('Name Old Kanji Checker behavior test passed.');
