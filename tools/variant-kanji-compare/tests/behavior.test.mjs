import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
source += '\nglobalThis.__test = { state, parseInputCharacters, buildReverseLookupFromOldToNew, getUtf16CodeUnits, getMetadataFields, getCategoryLabel, getShapeHint, getStrokeText, renderCompatibilityNote, compareCharacters, toCsv };\n';

const documentStub = {
  documentElement: { lang: 'ja' },
  addEventListener() {},
  querySelectorAll() { return []; },
  getElementById() { return null; },
  createElement() { return {}; },
  body: { appendChild() {} },
  execCommand() { return true; },
};
const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: { async writeText() {} } },
  window: {},
  fetch: async () => ({ async json() { return {}; } }),
  encodeURIComponent,
  setTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/variant-kanji-compare/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.deepEqual(
  Array.from(api.parseInputCharacters(' 高,髙 / 高、𠮷 ')),
  ['高', '髙', '𠮷'],
  'input parsing should remove separators, preserve supplementary characters, and deduplicate',
);

const reverse = api.buildReverseLookupFromOldToNew({
  舊: '旧',
  髙: ['高', '高'],
  邊: ['辺', '邊'],
});
assert.deepEqual(Array.from(reverse['旧']), ['舊']);
assert.deepEqual(Array.from(reverse['高']), ['髙'], 'reverse lookup should deduplicate repeated modern mappings');
assert.deepEqual(Array.from(reverse['辺']), ['邊']);
assert.deepEqual(Array.from(reverse['邊']), ['邊']);

assert.equal(api.getUtf16CodeUnits('髙'), '9AD9');
assert.equal(api.getUtf16CodeUnits('𠮷'), 'D842 DFB7');

api.state.lang = 'en';
assert.deepEqual(
  JSON.parse(JSON.stringify(api.getMetadataFields({ readingJa: 'さい', readingEn: 'sai', meaningJa: 'old', usageEn: 'names' }))),
  { reading: 'sai', meaning: 'old', usage: 'names' },
);
assert.equal(api.getCategoryLabel('name'), 'Names / Places');
assert.equal(api.getCategoryLabel('custom'), 'custom');
assert.equal(api.getShapeHint({ structureJa: 'ja', differenceEn: 'en difference' }), 'en difference');
assert.equal(api.getStrokeText({ oldStrokes: 18, modernStrokes: 10, difference: 8 }), 'Stroke count: old 18 / modern 10 / difference 8');

api.state.compatibilityNotes = {
  髙: { summaryEn: 'Explicit rendering note', copyNoteEn: 'Copy carefully' },
};
assert.equal(api.renderCompatibilityNote('髙', 0x9ad9), 'Explicit rendering note / Copy carefully');
assert.equal(api.renderCompatibilityNote(String.fromCodePoint(0xf900), 0xf900), 'CJK Compatibility Ideograph range');
assert.equal(api.renderCompatibilityNote('𠮷', 0x20bb7), 'Supplementary Plane character');
assert.equal(api.renderCompatibilityNote('高', 0x9ad8), '');

api.state.dict = { old_to_new: { 髙: '高' } };
api.state.reverseLookup = { 高: ['髙'] };
api.state.metadata = { 髙: { category: 'name', readingEn: 'taka' } };
api.state.shapeNotes = { 髙: { differenceEn: 'upper component differs' } };
api.state.strokeCounts = { 髙: { oldStrokes: 11, modernStrokes: 10, difference: 1 } };
api.state.compatibilityNotes = {};
const compared = JSON.parse(JSON.stringify(api.compareCharacters(['髙', '高', '𠮷'])));
assert.equal(compared[0].unicode, 'U+9AD9');
assert.equal(compared[0].htmlHex, '&#x9AD9;');
assert.equal(compared[0].oldToModern, '高');
assert.deepEqual(compared[1].modernCandidates, ['髙']);
assert.equal(compared[2].utf16, 'D842 DFB7');
assert.equal(compared[2].compatibility, 'Supplementary Plane character');

const csv = api.toCsv(api.compareCharacters(['髙', '高']));
assert.match(csv, /^"character","unicode","html_hex"/);
assert.match(csv, /"髙","U\+9AD9"/);
assert.match(csv, /"高","U\+9AD8"/);

console.log('Variant Kanji Compare behavior test passed.');
