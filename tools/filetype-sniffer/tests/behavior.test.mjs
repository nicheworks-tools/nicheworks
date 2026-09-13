import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const documentStub = {
  documentElement: { lang: 'en' },
  getElementById() { return null; },
  querySelector() { return null; },
  createElement() {
    return {
      dataset: {},
      style: {},
      classList: { add() {}, remove() {} },
      setAttribute() {},
      select() {},
      textContent: '',
      value: '',
    };
  },
  body: { appendChild() {}, removeChild() {} },
  execCommand() { return false; },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: null },
  DataView,
  Uint8Array,
  ArrayBuffer,
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/filetype-sniffer/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

const png = JSON.parse(evaluate(`JSON.stringify(detect(new DataView(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]).buffer)))`));
assert.equal(png.detectedName, 'PNG');
assert.equal(png.detectedExt, 'png');
assert.equal(png.detectedMime, 'image/png');
assert.equal(png.confidence, 0.99);

const pdf = JSON.parse(evaluate(`JSON.stringify(detect(new DataView(Uint8Array.from([0x25,0x50,0x44,0x46,0x2d,0x31,0x2e,0x37]).buffer)))`));
assert.equal(pdf.detectedExt, 'pdf');
assert.equal(pdf.evidence.bytes, '25 50 44 46 2d');

const zip = JSON.parse(evaluate(`JSON.stringify(detect(new DataView(Uint8Array.from([0x50,0x4b,0x03,0x04,0,0,0,0]).buffer)))`));
assert.equal(zip.detectedExt, 'zip');
assert.ok(zip.expectedExtensions.includes('docx'));
assert.equal(evaluate(`isExpected('docx', ${JSON.stringify(zip)})`), true, 'ZIP signature should be accepted for DOCX container extension');

const docxMeta = JSON.parse(evaluate(`JSON.stringify(getMeta({ name: 'report.docx', size: 1200 }, ${JSON.stringify(zip)}, 8))`));
assert.equal(docxMeta.extensionMismatch, false);
assert.equal(docxMeta.executableLike, false);
assert.ok(docxMeta.containerNote.includes('DOCX'), 'DOCX should surface a ZIP-container explanation');

const mismatchMeta = JSON.parse(evaluate(`JSON.stringify(getMeta({ name: 'photo.jpg', size: 12 }, ${JSON.stringify(png)}, 12))`));
assert.equal(mismatchMeta.extensionMismatch, true, 'extension/signature mismatch should be detected');

const mz = JSON.parse(evaluate(`JSON.stringify(detect(new DataView(Uint8Array.from([0x4d,0x5a,0,0,0,0,0,0]).buffer)))`));
const executableMeta = JSON.parse(evaluate(`JSON.stringify(getMeta({ name: 'payload.jpg', size: 8 }, ${JSON.stringify(mz)}, 8))`));
assert.equal(executableMeta.extensionMismatch, true);
assert.equal(executableMeta.executableLike, true, 'MZ signature should be treated as executable-like even with a misleading extension');

assert.equal(evaluate(`fileExt('photo.JPEG')`), 'jpg');
assert.equal(evaluate(`fileExt('archive')`), '');

console.log('FileType Sniffer behavior test passed.');
