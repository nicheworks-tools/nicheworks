import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app-meaning-v4.js', import.meta.url), 'utf8');
source = source.replace(/\n\}\)\(\);\s*$/, `
  globalThis.__test = {
    getCodePoints,
    buildEntries,
    getFilteredEntries,
    detectOldForms,
    buildExportRows,
    csvEscape,
    toConverterUrl,
    loadStoredList,
    isValidDisplayMode,
    loadData,
    setMeta(entries, popularOrder = []) { metaCache = { entries, popularOrder }; },
    setSearch({ query = '', mode = 'all', filter = 'all', preset = '' } = {}) {
      currentQuery = query;
      currentSearchMode = mode;
      currentFilter = filter;
      activePreset = preset;
    },
    getEntries() { return entriesCache; }
  };
})();
`);

const storage = new Map();
let fetchImpl = async () => ({ ok: false, async json() { return {}; } });
const sandbox = {
  console,
  document: {
    documentElement: { lang: 'ja' },
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementById() { return null; },
    createElement() { return {}; },
    body: { appendChild() {} },
    execCommand() { return true; },
  },
  window: { innerWidth: 1024 },
  navigator: { clipboard: { async writeText() {} } },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  fetch: (...args) => fetchImpl(...args),
  URLSearchParams,
  URL,
  Blob,
  Date,
  setTimeout,
  clearTimeout,
};
sandbox.window.window = sandbox.window;
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/old-kanji-reference/app-meaning-v4.js' });
const api = context.__test;
assert.ok(api, 'reference test exports should be available');

api.setMeta({
  '舊': { verified: true, readingJa: 'きゅう', readingEn: 'kyu', meaningJa: '古い', meaningEn: 'old', category: 'document' },
  '學': { verified: false, readingJa: 'がく', readingEn: 'gaku', meaningJa: '学ぶ', meaningEn: 'study', category: 'common' },
});
api.buildEntries({ old_to_new: { '舊': '旧', '學': '学', '神': '神' } });
assert.equal(api.getEntries().length, 3);

api.setSearch({ query: '舊', mode: 'old' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['舊']);
api.setSearch({ query: '学', mode: 'new' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['學']);
api.setSearch({ query: 'きゅう', mode: 'reading' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['舊']);
api.setSearch({ query: 'old', mode: 'meaning' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['舊']);
api.setSearch({ query: api.getCodePoints('舊'), mode: 'unicode' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['舊']);
api.setSearch({ filter: 'verified' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['舊']);
api.setSearch({ filter: 'pairOnly' });
assert.deepEqual(Array.from(api.getFilteredEntries(), e => e.oldChar), ['神']);

const detected = api.detectOldForms('A舊舊學B');
assert.deepEqual(detected.map(item => [item.entry.oldChar, item.count]), [['舊', 2], ['學', 1]]);
const largeDetected = api.detectOldForms('舊'.repeat(10000) + '學');
assert.equal(largeDetected.find(item => item.entry.oldChar === '舊').count, 10000);
assert.equal(largeDetected.find(item => item.entry.oldChar === '學').count, 1);

const exported = api.buildExportRows(api.getEntries());
assert.equal(exported.find(row => row.old === '舊').dataStatus, 'verified');
assert.equal(
  exported.find(row => row.old === '學').dataStatus,
  'pair-only',
  'unverified metadata must not be exported as verified',
);
assert.equal(api.csvEscape('a,b'), '"a,b"');
assert.equal(api.csvEscape('a"b'), '"a""b"');

const handoffText = '  舊\n學  ';
const handoff = new URL(api.toConverterUrl(handoffText), 'https://nicheworks.app/tools/old-kanji-reference/');
assert.equal(handoff.pathname, '/tools/kanji-modernizer/');
assert.equal(
  handoff.searchParams.get('q'),
  handoffText,
  'Reference → Modernizer handoff must preserve boundary whitespace/newlines',
);

storage.set('valid-list', JSON.stringify(['舊', '', 3, '學']));
assert.deepEqual(Array.from(api.loadStoredList('valid-list')), ['舊', '學']);
storage.set('bad-list', '{not json');
assert.deepEqual(Array.from(api.loadStoredList('bad-list')), []);
assert.equal(api.isValidDisplayMode('compact'), true);
assert.equal(api.isValidDisplayMode('table'), true);
assert.equal(api.isValidDisplayMode('broken'), false);

fetchImpl = async (url) => {
  if (url === './dict.json') return { ok: false, async json() { return {}; } };
  return { ok: true, async json() { return { entries: {} }; } };
};
await assert.rejects(() => api.loadData(), /Failed to load \.\/dict\.json/);

fetchImpl = async (url) => {
  if (url === './dict.json') {
    return { ok: true, async json() { return { old_to_new: { '舊': '旧' }, new_to_old: { '旧': ['舊'] } }; } };
  }
  if (String(url).startsWith('./meta.json')) {
    return { ok: true, async json() { return { entries: {}, popularOrder: [] }; } };
  }
  return { ok: false, async json() { return {}; } };
};
const optionalFailureDict = await api.loadData();
assert.equal(
  optionalFailureDict.old_to_new['舊'],
  '旧',
  'optional metadata failures must not block the primary dictionary',
);

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /id="referenceRetryBtn"/, 'primary dictionary failure must expose an explicit retry control');
assert.match(source, /referenceRetryBtn\.addEventListener\("click", loadReferenceData\)/);

console.log('Old Kanji Reference behavior test passed.');
