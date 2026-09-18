import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rawSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let source = rawSource;
source = source.replace(/\n\(async function init\(\)\{[\s\S]*$/, `
globalThis.__test = {
  loadData,
  countMatches,
  buildModernText,
  buildConverterHref,
  analyzeDocumentText,
  getFallbackCompatibilityNote,
  setDictionary(value) { state.dict = value || {}; state.dataLoadFailed = false; },
  getDataLoadFailed() { return state.dataLoadFailed; }
};
`);

let fetchImpl = async () => ({ ok: false, async json() { return {}; } });
const sandbox = {
  console,
  fetch: (...args) => fetchImpl(...args),
  encodeURIComponent,
  Map,
  Set,
  Promise,
};
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/old-document-kanji-highlighter/app.js' });
const api = context.__test;
assert.ok(api, 'Highlighter test exports should be available');

api.setDictionary({ '舊': '旧', '學': '学', '體': '体' });
const result = api.analyzeDocumentText('  舊學A舊\n𠮷  ');
assert.equal(result.total, 3);
assert.deepEqual(Object.assign({}, result.counts), { '舊': 2, '學': 1 });
assert.deepEqual(Array.from(result.chars), ['舊', '學']);
assert.equal(result.modern, '  旧学A旧\n𠮷  ');
assert.equal(api.buildModernText('體舊'), '体旧');

const exactText = '  舊學\n  ';
assert.equal(
  api.buildConverterHref(exactText),
  `../kanji-modernizer/?q=${encodeURIComponent(exactText)}`,
  'Highlighter → Modernizer handoff must preserve exact text',
);

assert.match(api.getFallbackCompatibilityNote('﨑').summaryJa, /CJK互換漢字/);
assert.match(api.getFallbackCompatibilityNote('𠮷').summaryJa, /補助平面文字/);

fetchImpl = async () => ({ ok: false, async json() { return {}; } });
assert.equal(await api.loadData(), false);
assert.equal(api.getDataLoadFailed(), true, 'dictionary failure must degrade instead of rejecting initialization');
assert.equal(api.analyzeDocumentText('舊').total, 0);

fetchImpl = async () => ({
  ok: true,
  async json() { return { old_to_new: { '舊': '旧' } }; },
});
assert.equal(await api.loadData(), true);
assert.equal(api.getDataLoadFailed(), false);
assert.equal(api.analyzeDocumentText('舊').modern, '旧');

assert.match(rawSource, /state\.dataLoadFailed\?t\(\)\.loadDataError/);
assert.match(rawSource, /inputText'\)\.addEventListener\('input', analyzeText\)/);
assert.match(rawSource, /copyOld'\)\.onclick=.*copyText/);
assert.match(rawSource, /copyPairs'\)\.onclick=.*copyText/);
assert.match(rawSource, /copyModern'\)\.onclick=.*copyText/);

const fetchTargets = Array.from(rawSource.matchAll(/fetch\(([^)]+)\)/g), match => match[1]);
assert.ok(fetchTargets.length >= 1);
assert.ok(
  fetchTargets.every(target => target.includes('old-kanji-reference')),
  'Highlighter analysis code must only fetch same-site Old Kanji reference assets',
);

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /機械的な置換プレビュー/);
assert.match(indexHtml, /入力内容はブラウザ内で処理され、外部APIには送信しません/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state/, 'unfinished Pro sales panel must not be rendered');

console.log('Old Document Kanji Highlighter behavior test passed.');
