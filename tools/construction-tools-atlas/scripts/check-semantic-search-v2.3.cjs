const fs = require('node:fs');
const path = require('node:path');
const core = require('../semantic-search-core.js');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function compactToFull(row) {
  const ja = safeText(row?.ja || row?.term?.ja);
  const en = safeText(row?.en || row?.term?.en);
  const descJa = safeText(row?.dj || row?.description_ja || row?.summary_ja);
  const descEn = safeText(row?.de || row?.description_en || row?.summary_en);
  return {
    id: safeText(row?.id),
    type: safeText(row?.t || row?.type),
    term: { ja, en },
    aliases: {
      ja: safeArray(row?.aj || row?.aliases_ja || row?.aliases?.ja),
      en: safeArray(row?.ae || row?.aliases_en || row?.aliases?.en),
    },
    description: { ja: descJa, en: descEn },
    summary: { ja: descJa, en: descEn },
    detail: {
      ja: safeText(row?.nj || row?.detail_ja),
      en: safeText(row?.ne || row?.detail_en),
    },
    categories: safeArray(row?.categories || row?.c || row?.category),
    tasks: safeArray(row?.tasks || row?.task || row?.tsk),
    fuzzy: safeArray(row?.fuzzy).concat([ja, en, safeText(row?.c), safeText(row?.task || row?.tsk)]).filter(Boolean),
    region: safeArray(row?.region),
  };
}

function normalizeFull(row) {
  return {
    id: safeText(row?.id || row?.slug),
    type: safeText(row?.type),
    term: {
      ja: safeText(row?.term?.ja || row?.ja || row?.jp),
      en: safeText(row?.term?.en || row?.en),
    },
    aliases: {
      ja: safeArray(row?.aliases?.ja || row?.aliases_ja),
      en: safeArray(row?.aliases?.en || row?.aliases_en),
    },
    description: {
      ja: safeText(row?.description?.ja || row?.description_ja || row?.summary?.ja || row?.summary_ja),
      en: safeText(row?.description?.en || row?.description_en || row?.summary?.en || row?.summary_en),
    },
    summary: {
      ja: safeText(row?.summary?.ja || row?.summary_ja || row?.description?.ja || row?.description_ja),
      en: safeText(row?.summary?.en || row?.summary_en || row?.description?.en || row?.description_en),
    },
    detail: {
      ja: safeText(row?.detail?.ja || row?.detail_ja),
      en: safeText(row?.detail?.en || row?.detail_en),
    },
    categories: safeArray(row?.categories || row?.category),
    tasks: safeArray(row?.tasks || row?.task),
    fuzzy: safeArray(row?.fuzzy),
    region: safeArray(row?.region),
  };
}

function asEntries(raw) {
  if (Array.isArray(raw)) return raw.map(normalizeFull);
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw?.rows)) return raw.rows.map(compactToFull);
  if (Array.isArray(raw?.entries)) return raw.entries.map(normalizeFull);
  if (Array.isArray(raw?.data)) return raw.data.map(normalizeFull);
  return [];
}

function loadCorpus() {
  const manifest = readJson(path.join(DATA, 'quality-manifest.json'));
  const paths = [];
  for (const pack of Array.isArray(manifest?.packs) ? manifest.packs : []) {
    const rel = typeof pack === 'string' ? pack : pack?.path;
    if (rel) paths.push(rel.replace(/^\.\/data\//, ''));
  }
  for (const rel of Array.isArray(manifest?.base) ? manifest.base : ['tools.basic.json']) {
    if (rel) paths.push(String(rel).replace(/^\.\/data\//, ''));
  }

  const merged = [];
  const seenIds = new Set();
  const seenTerms = new Set();
  for (const rel of paths) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) continue;
    for (const entry of asEntries(readJson(file))) {
      if (!entry.id || seenIds.has(entry.id)) continue;
      const termKey = `${core.normalizeText(entry?.term?.ja)}::${core.normalizeText(entry?.term?.en)}`;
      if (termKey !== '::' && seenTerms.has(termKey)) continue;
      seenIds.add(entry.id);
      if (termKey !== '::') seenTerms.add(termKey);
      merged.push(entry);
    }
  }
  return merged;
}

const dictionary = readJson(path.join(DATA, 'search-dictionary-v2.3.json'));
const signals = Array.isArray(dictionary?.signals) ? dictionary.signals : [];
const signalIds = signals.map((signal) => signal?.id).filter(Boolean);
if (new Set(signalIds).size !== signalIds.length) fail('search dictionary contains duplicate signal IDs');
else ok(`search dictionary signal IDs are unique (${signalIds.length})`);

const combinations = Array.isArray(dictionary?.combinations) ? dictionary.combinations : [];
const combinationIds = combinations.map((combo) => combo?.id).filter(Boolean);
if (new Set(combinationIds).size !== combinationIds.length) fail('search dictionary contains duplicate combination IDs');
else ok(`search dictionary combination IDs are unique (${combinationIds.length})`);
for (const combo of combinations) {
  for (const signalId of safeArray(combo?.all_signals)) {
    if (!signalIds.includes(signalId)) fail(`combination ${combo?.id} references unknown signal ${signalId}`);
  }
}

const engine = core.createEngine(dictionary);
const entries = loadCorpus();
if (entries.length < 10) fail(`unexpectedly small legacy corpus: ${entries.length}`);
else ok(`loaded legacy corpus (${entries.length} entries)`);

function signalIdsFor(query, ignored = new Set()) {
  return engine.interpret(query, ignored).map((signal) => signal.id);
}

function expectSignals(query, expected) {
  const actual = signalIdsFor(query);
  for (const id of expected) {
    if (!actual.includes(id)) fail(`query ${JSON.stringify(query)} did not interpret signal ${id}; got ${actual.join(', ')}`);
  }
  if (!process.exitCode) ok(`${JSON.stringify(query)} -> signals ${actual.join(', ')}`);
}

function rank(query) {
  const interpreted = engine.interpret(query, new Set());
  return entries
    .map((entry) => ({ entry, score: engine.scoreEntry(entry, query, interpreted) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || String(a.entry.id).localeCompare(String(b.entry.id)));
}

function expectTop(query, expectedId, limit = 5) {
  const ranked = rank(query);
  const ids = ranked.slice(0, limit).map((row) => row.entry.id);
  if (!ids.includes(expectedId)) {
    fail(`${JSON.stringify(query)} expected ${expectedId} in top ${limit}; got ${ids.join(', ') || '(none)'}`);
    return;
  }
  ok(`${JSON.stringify(query)} -> ${expectedId} in top ${limit} (${ids.join(', ')})`);
}

function expectFirst(query, expectedId) {
  const ranked = rank(query);
  const first = ranked[0]?.entry?.id || '';
  if (first !== expectedId) fail(`${JSON.stringify(query)} expected first ${expectedId}; got ${first || '(none)'}`);
  else ok(`${JSON.stringify(query)} -> first ${expectedId}`);
}

expectSignals('コンクリに穴あける電動のやつ', ['concrete', 'drill', 'electric']);
expectSignals('ネジ締める電動のやつ', ['fasten', 'electric']);
expectSignals('赤い線出すやつ', ['laser-line']);
expectSignals('シリコン押し出すやつ', ['sealant', 'dispense']);
expectSignals('壁の中の柱探すやつ', ['hidden-wall']);

expectFirst('コンクリに穴あける電動のやつ', 'rotary_hammer');
expectTop('コンクリに穴あける電動のやつ', 'hammer_drill', 3);
expectFirst('ネジ締める電動のやつ', 'impact_driver');
expectTop('ネジ締める電動のやつ', 'drill_driver', 3);
expectFirst('研磨する電動のやつ', 'random_orbit_sander');
expectFirst('ドリルドライバー', 'drill_driver');
expectTop('hammer drill', 'hammer_drill', 3);

const originalSignals = signalIdsFor('コンクリに穴あける電動のやつ');
const ignoredSignals = signalIdsFor('コンクリに穴あける電動のやつ', new Set(['concrete']));
if (!originalSignals.includes('concrete') || ignoredSignals.includes('concrete')) fail('ignored interpretation signal was not removed');
else ok('interpretation signal removal works');

if (core.normalizeText('インパクト　ドライバー') !== core.normalizeText('いんぱくと ドライバー')) {
  fail('NFKC/kana/space normalization regression');
} else ok('NFKC/kana/space normalization works');

if (!process.exitCode) console.log('Construction Tools Atlas semantic search v2.3 regression: PASS');
