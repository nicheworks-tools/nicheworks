import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rawSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
let source = rawSource;
source = source.replace(/\ndocument\.addEventListener\('DOMContentLoaded'[\s\S]*$/, `
globalThis.__test = {
  state,
  loadData,
  buildReverseLookupFromOldToNew,
  getMetadataFields,
  getShapeText,
  getStrokeText,
  getLocalizedCompatibilityFields,
  getFallbackCompatibilityNote,
  buildConverterHref
};
`);

let fetchImpl = async () => ({ ok: false, status: 404, async json() { return {}; } });
const sandbox = {
  console,
  fetch: (...args) => fetchImpl(...args),
  encodeURIComponent,
  Map,
  Set,
  Promise,
};
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/place-old-kanji-checker/app.js' });
const api = context.__test;
assert.ok(api, 'Place checker test exports should be available');

const reverse = api.buildReverseLookupFromOldToNew({
  舊: '旧',
  邊: ['辺', '辺'],
  邉: '辺',
});
assert.deepEqual(Array.from(reverse.get('旧')), ['舊']);
assert.deepEqual(Array.from(reverse.get('辺')), ['邊', '邉'], 'reverse lookup must support array mappings and dedupe candidates');

assert.deepEqual(
  JSON.parse(JSON.stringify(api.getMetadataFields({
    readingJa: 'ひろ',
    readingEn: 'hiro',
    meaningJa: '広い',
    meaningEn: 'wide',
    usageJa: '地名',
    usageEn: 'place names',
    category: 'name'
  }, 'en'))),
  { reading: 'hiro', meaning: 'wide', usage: 'place names', category: 'name' },
  'Place metadata must consume the bilingual Old Kanji Reference schema',
);

assert.equal(
  api.getShapeText({ structureJa: '日本語構造', structureEn: 'English structure' }, 'en'),
  'English structure',
);
assert.equal(
  api.getStrokeText({ oldStrokes: 15, modernStrokes: 5, difference: 10 }, 'ja'),
  '旧字 15 / 新字 5 / 差 10',
);
assert.equal(
  api.getStrokeText({ oldStrokes: 15, modernStrokes: 5, difference: 10 }, 'en'),
  'old 15 / modern 5 / difference 10',
);

const localized = api.getLocalizedCompatibilityFields({
  summaryJa: '日本語要約',
  summaryEn: 'English summary',
  copyNoteJa: '日本語コピー',
  copyNoteEn: 'English copy',
  recommendedCheckJa: '日本語確認',
  recommendedCheckEn: 'English check'
}, 'en');
assert.deepEqual(
  JSON.parse(JSON.stringify(localized)),
  { summary: 'English summary', copyNote: 'English copy', recommended: 'English check' },
  'EN UI must prefer EN compatibility-note fields',
);

const compatibilitySupplement = String.fromCodePoint(0x2f800);
assert.match(api.getFallbackCompatibilityNote(compatibilitySupplement).summaryEn, /Compatibility Ideograph/);
const supplementaryVs = String.fromCodePoint(0xe0100);
assert.equal(api.getFallbackCompatibilityNote(supplementaryVs).summaryEn, 'Variation Selector.');
assert.match(api.getFallbackCompatibilityNote('𠮷').summaryEn, /Supplementary-plane/);

const exactInput = '  廣島\n濱松  ';
assert.equal(
  api.buildConverterHref(exactInput),
  `../kanji-modernizer/?q=${encodeURIComponent(exactInput)}`,
  'Place → Modernizer handoff must preserve exact input text',
);
assert.match(rawSource, /converterAnchor\.href = buildConverterHref\(input\)/);

fetchImpl = async (url) => {
  if (String(url).endsWith('/dict.json')) {
    return { ok: true, status: 200, async json() { return { old_to_new: { 廣: '広', 邊: ['辺'] } }; } };
  }
  return { ok: false, status: 503, async json() { return {}; } };
};
api.state.metadata.clear();
api.state.compatibility.clear();
api.state.shapeNotes.clear();
api.state.strokeCounts.clear();
await api.loadData();
assert.equal(api.state.dataStatus, 'partial_error', 'optional metadata failure must retain the base dictionary');
assert.equal(api.state.dict.old_to_new['廣'], '広');
assert.deepEqual(Array.from(api.state.reverse.get('辺')), ['邊']);

fetchImpl = async () => ({ ok: false, status: 500, async json() { return {}; } });
await assert.rejects(() => api.loadData(), /dict load failed/);
assert.equal(api.state.dataStatus, 'error', 'primary dictionary failure must enter a safe error state');

const fetchTargets = Array.from(rawSource.matchAll(/fetch\(([^)]+)\)/g), match => match[1]);
assert.ok(fetchTargets.length >= 1);
assert.ok(
  fetchTargets.every(target => target.includes('old-kanji-reference')),
  'Place checker analysis data requests must remain same-site Old Kanji Reference assets',
);

assert.match(rawSource, /公式な住所表記や行政上の有効性を判断するものではありません/);
assert.match(rawSource, /do not determine official address spelling or administrative validity/);
assert.match(rawSource, /if \(!state\.dict \|\| state\.dataStatus === 'loading' \|\| state\.dataStatus === 'error'\)/);

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /入力内容はブラウザ内で処理され、外部APIには送信しません/);
assert.match(indexHtml, /正式な住所表記・行政上の地名・登記・郵便・契約書類では/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state|billing-unavailable/, 'unfinished Pro sales panel must not be rendered');

console.log('Place Old Kanji Checker behavior test passed.');
