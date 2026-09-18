import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
source += `
globalThis.__test = {
  detectOldKanji,
  getOldToModernText,
  getMetadataFields,
  getCompatibilityNote,
  formatFileSize,
  hasMeaningfulText,
  buildManualHandoffHref,
  loadOldKanjiData,
  setDictionary(value) { oldToNewMap = value || {}; dataLoadFailed = false; },
  getDataLoadFailed() { return dataLoadFailed; }
};
`;

let fetchImpl = async () => ({ ok: false, async json() { return {}; } });
const sandbox = {
  console,
  document: { addEventListener() {} },
  window: { addEventListener() {}, NicheWorksProEntitlement: null },
  navigator: { clipboard: { async writeText() {} } },
  fetch: (...args) => fetchImpl(...args),
  URL: {
    createObjectURL() { return 'blob:test'; },
    revokeObjectURL() {}
  },
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  Map,
  Set,
  Promise,
};
const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/old-kanji-ocr-scanner/app.js' });
const api = context.__test;
assert.ok(api, 'OCR test exports should be available');

api.setDictionary({ '舊': '旧', '學': '学', '體': '体' });
const detected = api.detectOldKanji('舊A學舊𠮷');
assert.equal(detected.total, 3);
assert.equal(detected.unique, 2);
assert.deepEqual(Array.from(detected.items, item => [item.oldChar, item.modern, item.count]), [
  ['舊', '旧', 2],
  ['學', '学', 1],
]);
assert.equal(api.getOldToModernText('體'), '体');
assert.equal(api.getOldToModernText('𠮷'), '');

assert.equal(api.hasMeaningfulText('  \n  '), false);
assert.equal(api.hasMeaningfulText('  舊\n  '), true);
const exactText = '  舊\n學  ';
assert.equal(
  api.buildManualHandoffHref('../kanji-modernizer/', exactText),
  `../kanji-modernizer/?q=${encodeURIComponent(exactText)}`,
  'OCR/manual handoff must preserve exact leading/trailing whitespace and newlines',
);

assert.equal(api.formatFileSize(0), '0 B');
assert.equal(api.formatFileSize(1024), '1.0 KB');
assert.equal(api.formatFileSize(1024 * 1024), '1.00 MB');

fetchImpl = async () => ({ ok: false, async json() { return {}; } });
assert.equal(await api.loadOldKanjiData(), false);
assert.equal(api.getDataLoadFailed(), true, 'primary dictionary failure must enter degraded mode');

fetchImpl = async () => ({
  ok: true,
  async json() { return { old_to_new: { '舊': '旧' } }; },
});
assert.equal(await api.loadOldKanjiData(), true);
assert.equal(api.getDataLoadFailed(), false);
assert.equal(api.getOldToModernText('舊'), '旧');

assert.match(source, /Tesseract\.recognize\(file, 'jpn', \{/);
assert.match(source, /typeof event\?\.progress === 'number'\) setOcrProgress\(event\.progress\)/);
assert.match(source, /const text = result\?\.data\?\.text \|\| '';/, 'recognized OCR text must not be trimmed');
assert.doesNotMatch(source, /result\?\.data\?\.text \|\| ''\)\.trim\(\)/);
assert.match(source, /getMetadataFields\(item\.meta\)/, 'detected cards must render available metadata');
assert.match(source, /getCompatibilityNote\(item\.oldChar\)/, 'detected cards must render compatibility notes');
assert.match(source, /revokeCurrentObjectUrl\(\);\s*currentObjectUrl = URL\.createObjectURL\(file\)/);
assert.match(source, /window\.addEventListener\('beforeunload', revokeCurrentObjectUrl\)/);

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(indexHtml, /cdn\.jsdelivr\.net\/npm\/tesseract\.js@5\/dist\/tesseract\.min\.js/);
assert.match(indexHtml, /外部OCR APIには送信しません/);
assert.doesNotMatch(indexHtml, /\$4\.99|data-okj-pro-state/, 'unfinished Pro sales panel must not be rendered');

console.log('Old Kanji OCR Scanner behavior test passed.');
