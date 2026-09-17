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
    saveStoredList,
    loadQuizStats,
    saveQuizStats,
    loadDisplayMode,
    isValidDisplayMode,
    copyWithFallback,
    loadData,
    setMeta(entries, popularOrder = []) { metaCache = { entries, popularOrder }; },
    setSearch({ query = '', mode = 'all', filter = 'all', preset = '' } = {}) {
      currentQuery = query;
      currentSearchMode = mode;
      currentFilter = filter;
      activePreset = preset;
    },
    setQuizStats(stats) { quizState.stats = { answered: stats.answered, correct: stats.correct }; },
    getEntries() { return entriesCache; }
  };
})();
`);

const storage = new Map();
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
    createElement() { return {}; },
    body: { appendChild() {} },
    execCommand() { return true; },
  },
  window: { innerWidth: 1024 },
  navigator: { clipboard: { async writeText(value) { clipboardWrites.push(value); } } },
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
const detectedCounts = new Map(detected.map(item => [item.entry.oldChar, item.count]));
assert.equal(detectedCounts.get('舊'), 2);
assert.equal(detectedCounts.get('學'), 1);
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

await api.copyWithFallback('舊→旧');
assert.equal(clipboardWrites.at(-1), '舊→旧', 'clipboard helper must copy the exact requested value');

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
api.saveStoredList('roundtrip-list', ['舊', '學']);
assert.deepEqual(Array.from(api.loadStoredList('roundtrip-list')), ['舊', '學']);

storage.set('oldKanjiReference.displayMode.v1', 'table');
assert.equal(api.loadDisplayMode(), 'table');
storage.set('oldKanjiReference.displayMode.v1', 'broken');
assert.equal(api.loadDisplayMode(), 'detail', 'invalid display mode must fall back to desktop default');
assert.equal(api.isValidDisplayMode('compact'), true);
assert.equal(api.isValidDisplayMode('table'), true);
assert.equal(api.isValidDisplayMode('broken'), false);

storage.set('oldKanjiReference.quizStats.v1', JSON.stringify({ answered: 7, correct: 5 }));
const loadedStats = api.loadQuizStats();
assert.equal(loadedStats.answered, 7);
assert.equal(loadedStats.correct, 5);
storage.set('oldKanjiReference.quizStats.v1', '{broken');
const fallbackStats = api.loadQuizStats();
assert.equal(fallbackStats.answered, 0);
assert.equal(fallbackStats.correct, 0);
api.setQuizStats({ answered: 9, correct: 6 });
api.saveQuizStats();
assert.deepEqual(JSON.parse(storage.get('oldKanjiReference.quizStats.v1')), { answered: 9, correct: 6 });

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
assert.match(source, /copyDetectedOld\.addEventListener\("click", \(\) => copyDetected\("old"\)\)/);
assert.match(source, /copyDetectedPairs\.addEventListener\("click", \(\) => copyDetected\("pairs"\)\)/);
assert.match(source, /exportCsvBtn\.addEventListener\("click", exportCsv\)/);
assert.match(source, /exportJsonBtn\.addEventListener\("click", exportJson\)/);
assert.match(source, /copyMarkdownBtn\.addEventListener\("click", copyMarkdownTable\)/);
assert.match(source, /printPageBtn\.addEventListener\("click", \(\) => window\.print\(\)\)/);
assert.match(source, /const recentStorageKey = "oldKanjiReference\.recent\.v1"/);
assert.match(source, /const favoritesStorageKey = "oldKanjiReference\.favorites\.v1"/);

console.log('Old Kanji Reference behavior test passed.');
