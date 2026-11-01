import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerText: '',
    innerHTML: '',
    disabled: false,
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    setAttribute() {},
    appendChild() {},
    removeAttribute() {},
    click() {},
    scrollIntoView() {},
  };
}

const elements = new Map();
const ids = [
  'file-input','drop-zone','error','file-info','progress','convert-btn','convert-jpeg-btn','result','preview-img','size-info','download-btn','reset-btn',
];
ids.forEach((id) => elements.set(id, makeElement()));

const storage = new Map();
const documentStub = {
  documentElement: { lang: 'en' },
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelectorAll() { return []; },
  createTextNode(text) { return { textContent: text }; },
  createElement() { return makeElement(); },
  body: makeElement(),
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en' },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  URL,
  Blob,
  Image: class {},
  setTimeout,
  clearTimeout,
};
sandbox.window = { scrollTo() {} };

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/webp-avif-converter/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

assert.equal(evaluate(`formatBytes(512)`), '512 B');
assert.equal(evaluate(`formatBytes(1536)`), '1.5 KB');
assert.equal(evaluate(`formatBytes(2 * 1024 * 1024)`), '2.00 MB');
assert.equal(evaluate(`formatBytes(Number.NaN)`), '-');

assert.equal(evaluate(`isSupportedImage({ name: 'sample.webp', type: '' })`), true, 'WEBP extension should be accepted when MIME is absent');
assert.equal(evaluate(`isSupportedImage({ name: 'sample.bin', type: 'image/avif' })`), true, 'AVIF MIME should be accepted even without matching extension');
assert.equal(evaluate(`isSupportedImage({ name: 'sample.PNG', type: 'image/png' })`), false, 'PNG is output-only and should not be accepted as an input');

const errorBox = elements.get('error');
const convertBtn = elements.get('convert-btn');
const convertJpegBtn = elements.get('convert-jpeg-btn');

context.unsupportedFile = { name: 'photo.png', type: 'image/png', size: 2000 };
evaluate(`handleFile(unsupportedFile)`);
assert.ok(errorBox.textContent.includes('Unsupported file type'), 'unsupported input should surface the production error message');
assert.equal(convertBtn.disabled, true);
assert.equal(convertJpegBtn.disabled, true);

context.supportedFile = { name: 'photo.AVIF', type: '', size: 4096 };
evaluate(`handleFile(supportedFile)`);
assert.equal(evaluate(`loadedFile.name`), 'photo.AVIF');
assert.equal(convertBtn.disabled, false, 'valid input should enable PNG conversion');
assert.equal(convertJpegBtn.disabled, false, 'valid input should enable JPEG conversion');

errorBox.textContent = '';
context.twoFiles = [{ name: 'a.webp', type: 'image/webp' }, { name: 'b.webp', type: 'image/webp' }];
evaluate(`handleFileList(twoFiles)`);
assert.ok(errorBox.textContent.includes('one image at a time'), 'multiple-file selection should be rejected explicitly');


// Conversion races: selecting a new source must invalidate earlier decode/encode.
const imageQueue = [];
const blobQueue = [];
const revokedUrls = [];
let nextUrl = 0;
context.URL = {
  createObjectURL() { return 'blob:fake-' + (++nextUrl); },
  revokeObjectURL(url) { revokedUrls.push(url); }
};
context.Image = class {
  naturalWidth = 20;
  naturalHeight = 15;
  set src(url) { this.source = url; imageQueue.push(this); }
};
documentStub.createElement = (tag) => tag === 'canvas'
  ? { width: 0, height: 0,
      getContext() { return { fillRect() {}, drawImage() {} }; },
      toBlob(callback, mime) { blobQueue.push({ callback, mime }); } }
  : makeElement();

context.fileA = { name: 'one.webp', type: 'image/webp', size: 1200 };
context.fileB = { name: 'two.avif', type: 'image/avif', size: 1400 };
evaluate('handleFile(fileA)');
const staleConversion = evaluate('convertImage("png")');
assert.equal(imageQueue.length, 1);
evaluate('handleFile(fileB)');
imageQueue.shift().onload();
await staleConversion;
assert.equal(evaluate('loadedFile.name'), 'two.avif');
assert.equal(evaluate('convertedBlob'), null, 'old image must not complete after new selection');
assert.equal(blobQueue.length, 0, 'obsolete decode must not reach canvas encoder');
assert.ok(revokedUrls.length >= 1, 'local source URLs must be revoked');

const wrongFormat = evaluate('convertImage("jpeg")');
imageQueue.shift().onload();
await Promise.resolve();
assert.equal(blobQueue.length, 1);
assert.equal(blobQueue[0].mime, 'image/jpeg');
blobQueue.shift().callback(new Blob(['image'], { type: 'image/png' }));
await wrongFormat;
assert.equal(evaluate('convertedBlob'), null, 'canvas PNG fallback cannot appear as a JPEG');
assert.match(errorBox.textContent, /different image type|different output image type/);

const correctFormat = evaluate('convertImage("jpeg")');
imageQueue.shift().onload();
await Promise.resolve();
blobQueue.shift().callback(new Blob(['image'], { type: 'image/jpeg' }));
await correctFormat;
assert.equal(evaluate('convertedBlob.type'), 'image/jpeg');
assert.equal(evaluate('currentOutputExt'), 'jpg');

// A reset while Canvas work is pending invalidates the old operation.
const pendingReset = evaluate('convertImage("png")');
imageQueue.shift().onload();
await Promise.resolve();
evaluate('conversionRevision++; loadedFile = null; convertedBlob = null; isConverting = false;');
blobQueue.shift().callback(new Blob(['image'], { type: 'image/png' }));
await pendingReset;
assert.equal(evaluate('convertedBlob'), null);
assert.ok(source.includes('resetBtn.addEventListener("click", () => {\n  ++conversionRevision;'));

console.log('WebP/AVIF Converter behavior test passed.');
