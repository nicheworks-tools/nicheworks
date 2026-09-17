import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
source = source.replace(/\n\}\)\(\);\s*$/, `
  globalThis.__test = {
    rebuildDict,
    buildExclusionRanges,
    buildSegments,
    pickMappedChar,
    convertText,
    prepareInputText,
    copyToClipboard,
    loadDict,
    resetDictCache() { dictCache = null; },
    setLang(lang) { currentLang = lang; }
  };
})();
`);

const clipboardWrites = [];
let fetchImpl = async () => ({ ok: false, async json() { return {}; } });
const sandbox = {
  console,
  document: {
    documentElement: { lang: 'ja' },
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementById() { return null; },
    createElement() { return { style: {}, setAttribute() {}, select() {}, remove() {} }; },
    body: { appendChild() {} },
    execCommand() { return true; },
  },
  navigator: { language: 'ja', clipboard: { async writeText(value) { clipboardWrites.push(value); } } },
  window: { isSecureContext: true },
  localStorage: { getItem() { return null; }, setItem() {} },
  fetch: (...args) => fetchImpl(...args),
  URLSearchParams,
  URL,
  Promise,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
};
sandbox.window.window = sandbox.window;
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/kanji-modernizer/app.js' });
const api = context.__test;
assert.ok(api, 'modernizer test exports should be available');

const dict = api.rebuildDict({
  old_to_new: { '舊': '旧', '學': '学', '體': '体' },
  new_to_old: { '旧': ['舊', '舊'], '学': ['學'], '辺': ['邊', '邉'] },
});
assert.deepEqual(Array.from(dict.new_to_old['旧']), ['舊']);

const oldToNew = api.convertText('舊舊學𠮷', 'old-to-new', dict, { exclude: false });
assert.equal(oldToNew.plain, '旧旧学𠮷');
assert.deepEqual(
  Array.from(oldToNew.replacements, item => [item.from, item.to, item.count]),
  [['舊', '旧', 2], ['學', '学', 1]],
);

const conservative = api.convertText('辺辺', 'new-to-old', dict, { exclude: false, policy: 'conservative' });
assert.equal(conservative.plain, '辺辺');
assert.equal(conservative.ambiguities[0].action, 'preserved');
assert.equal(conservative.ambiguities[0].count, 2);
assert.deepEqual(Array.from(conservative.ambiguities[0].candidates), ['邊', '邉']);

const first = api.convertText('辺辺', 'new-to-old', dict, { exclude: false, policy: 'first' });
assert.equal(first.plain, '邊邊');
assert.equal(first.ambiguities[0].action, 'selected');
assert.equal(first.ambiguities[0].resultChar, '邊');

const excluded = api.convertText('舊 https://example.com/舊 ```學``` 學', 'old-to-new', dict, { exclude: true });
assert.equal(excluded.plain, '旧 https://example.com/舊 ```學``` 学');
const unexcluded = api.convertText('舊 https://example.com/舊', 'old-to-new', dict, { exclude: false });
assert.equal(unexcluded.plain, '旧 https://example.com/旧');

const prepared = api.prepareInputText('  舊\n學  ');
assert.equal(prepared.hasContent, true);
assert.equal(prepared.text, '  舊\n學  ', 'conversion input must preserve leading/trailing whitespace and newlines');
assert.equal(api.prepareInputText('  \n  ').hasContent, false);
const emptyResult = api.convertText('', 'old-to-new', dict, { exclude: false });
assert.equal(emptyResult.plain, '');
assert.equal(emptyResult.inputHtml, '');
assert.equal(emptyResult.outputHtml, '');
assert.equal(emptyResult.replacements.length, 0);
assert.equal(emptyResult.ambiguities.length, 0);

api.setLang('ja');
const jaResult = api.convertText('舊學', 'old-to-new', dict, { exclude: false }).plain;
api.setLang('en');
const enResult = api.convertText('舊學', 'old-to-new', dict, { exclude: false }).plain;
assert.equal(jaResult, enResult, 'language switching must not alter conversion semantics');

assert.equal(await api.copyToClipboard('  旧\n学  '), true);
assert.equal(clipboardWrites.at(-1), '  旧\n学  ', 'copy must preserve the exact converted text');
assert.equal(await api.copyToClipboard(''), false, 'empty output must not report a successful copy');

fetchImpl = async () => ({ ok: false, async json() { return {}; } });
api.resetDictCache();
await assert.rejects(() => api.loadDict(), /Failed to load dict\.json/);
fetchImpl = async () => ({
  ok: true,
  async json() { return { old_to_new: { '舊': '旧' }, new_to_old: { '旧': ['舊'] } }; },
});
api.resetDictCache();
const loaded = await api.loadDict();
assert.equal(loaded.old_to_new['舊'], '旧');

const referenceDict = JSON.parse(fs.readFileSync(new URL('../../old-kanji-reference/dict.json', import.meta.url), 'utf8'));
const modernizerDict = JSON.parse(fs.readFileSync(new URL('../dict.json', import.meta.url), 'utf8'));
assert.deepEqual(modernizerDict, referenceDict, 'Reference and Modernizer parsed dictionaries must remain synchronized');

assert.match(source, /let pendingAutoConvert = Boolean\(qParam\)/, '?q= must be queued until dictionary readiness');
assert.match(
  source,
  /pendingAutoConvert = false;[\s\S]*Promise\.resolve\(\)\.then\(\(\) => \{ if \(!convertBtn\.disabled\) convertBtn\.click\(\); \}\)/,
);
assert.doesNotMatch(
  source,
  /if \(qParam && convertBtn\) convertBtn\.click\(\);/,
  'must not click a disabled converter before dictionary initialization',
);
assert.match(source, /retryBtn\.addEventListener\("click", \(\) => \{[\s\S]*dictCache = null;[\s\S]*initDict\(\)/);
assert.match(source, /copyTextBtn\.addEventListener\("click", async \(\) =>/);
assert.match(source, /copyTableBtn\.addEventListener\("click", async \(\) =>/);
assert.match(source, /cleanUrl\.searchParams\.delete\("q"\)/, 'Reset should clear q handoff state from the URL');

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /正式表記や固有名詞の正確性は保証しません。/);
assert.match(indexHtml, /It does not verify official names, context, or proper nouns\./);

console.log('Kanji Modernizer behavior test passed.');
