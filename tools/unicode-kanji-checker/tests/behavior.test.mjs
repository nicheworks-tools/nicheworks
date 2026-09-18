import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rawSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let source = rawSource;
source = source.replace(/\n  init\(\);\n\}\)\(\);\s*$/, `
  globalThis.__test = {
    getCodePointInfo,
    getHtmlHexEntity,
    getHtmlDecimalEntity,
    getUtf16CodeUnits,
    hasCompatibilityIdeograph,
    hasSupplementaryPlaneChar,
    hasVariationSelector,
    isCompatibilityIdeographCodePoint,
    isVariationSelectorCodePoint,
    getQueryInput,
    buildReverseLookupFromOldToNew,
    toCsv
  };
})();
`);

const sandbox = { console, URL, Map, Set, Promise };
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/unicode-kanji-checker/app.js' });
const api = context.__test;
assert.ok(api, 'Unicode checker test exports should be available');

assert.equal(api.getCodePointInfo('﨑').hex, 'U+FA11');
assert.equal(api.getHtmlHexEntity('﨑'), '&#xFA11;');
assert.equal(api.getHtmlDecimalEntity('﨑'), '&#64017;');

assert.equal(api.getCodePointInfo('𠮷').hex, 'U+20BB7');
assert.equal(api.getUtf16CodeUnits('𠮷'), 'D842 DFB7');
assert.equal(api.hasSupplementaryPlaneChar('𠮷'), true);

const compatibilitySupplement = String.fromCodePoint(0x2F800);
assert.equal(api.hasCompatibilityIdeograph('﨑'), true);
assert.equal(api.hasCompatibilityIdeograph(compatibilitySupplement), true, 'CJK Compatibility Ideographs Supplement must be recognized');
assert.equal(api.getUtf16CodeUnits(compatibilitySupplement), 'D87E DC00');

assert.equal(api.hasVariationSelector(String.fromCodePoint(0xFE00)), true);
const supplementaryVs = String.fromCodePoint(0xE0100);
assert.equal(api.hasVariationSelector(supplementaryVs), true);
assert.equal(api.hasSupplementaryPlaneChar(supplementaryVs), true);
assert.equal(api.getUtf16CodeUnits(supplementaryVs), 'DB40 DD00');

const reverse = api.buildReverseLookupFromOldToNew({ '舊': '旧', '邊': ['辺'], '邉': '辺' });
assert.deepEqual(Array.from(reverse.get('辺')), ['邊', '邉']);

const exactQuery = '  﨑\n𠮷  ';
const href = `https://nicheworks.app/tools/unicode-kanji-checker/?q=${encodeURIComponent(exactQuery)}`;
assert.equal(api.getQueryInput(href), exactQuery, 'same-site q handoff must preserve exact whitespace and newlines');
assert.equal(api.getQueryInput('https://nicheworks.app/tools/unicode-kanji-checker/'), null);
assert.match(rawSource, /\$\('#inputText'\)\.value = qParam;\s*analyzeInput\(\);/);

const csv = api.toCsv([{
  ch: '"',
  hex: 'U+22',
  decimal: '34',
  htmlHex: '&#x22;',
  htmlDec: '&#34;',
  utf16: '0022',
  oldModern: '',
  oldCandidates: []
}]);
assert.match(csv, /""""/);

const fetchTargets = Array.from(rawSource.matchAll(/fetch\(([^)]+)\)/g), match => match[1]);
assert.ok(fetchTargets.length >= 1);
assert.ok(fetchTargets.every(target => target.includes('base +')), 'Unicode checker data fetches must remain scoped to the same-site reference base');

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /入力内容はブラウザ内で処理され、外部APIには送信しません/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state/, 'unfinished Pro sales panel must not be rendered');

console.log('Unicode Kanji Checker behavior test passed.');
