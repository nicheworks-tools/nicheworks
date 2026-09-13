import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    src: '',
    disabled: false,
    dataset: {},
    style: {},
    files: [],
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    click() {},
  };
}

const elements = new Map();
const documentStub = {
  documentElement: { lang: 'en' },
  addEventListener() {},
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en' },
  DataView,
  Uint8Array,
  ArrayBuffer,
  Blob,
  URL,
  Image: class {},
  FileReader: class {},
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/exif-cleaner-mini/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

const jpegExif = Uint8Array.from([
  0xff,0xd8,
  0xff,0xe1,0x00,0x08, 0x45,0x78,0x69,0x66,0x00,0x00,
  0xff,0xd9,
]);
context.jpegExif = jpegExif.buffer;
const jpegScan = JSON.parse(evaluate(`JSON.stringify(scanMetadata(jpegExif, 'jpeg'))`));
assert.deepEqual(jpegScan.containers, [{ type: 'EXIF', count: 1 }], 'JPEG APP1 Exif container should be detected');

const jpegComment = Uint8Array.from([
  0xff,0xd8,
  0xff,0xfe,0x00,0x04,0x41,0x42,
  0xff,0xd9,
]);
context.jpegComment = jpegComment.buffer;
const commentScan = JSON.parse(evaluate(`JSON.stringify(scanMetadata(jpegComment, 'jpeg'))`));
assert.deepEqual(commentScan.containers, [{ type: 'COM', count: 1 }], 'JPEG COM segment should be detected');

const pngExif = Uint8Array.from([
  0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
  0x00,0x00,0x00,0x00, 0x65,0x58,0x49,0x66, 0x00,0x00,0x00,0x00,
]);
context.pngExif = pngExif.buffer;
const pngScan = JSON.parse(evaluate(`JSON.stringify(scanMetadata(pngExif, 'png'))`));
assert.deepEqual(pngScan.containers, [{ type: 'EXIF', count: 1 }], 'PNG eXIf chunk should be detected');

const webpXmp = Uint8Array.from([
  0x52,0x49,0x46,0x46, 0x0c,0x00,0x00,0x00, 0x57,0x45,0x42,0x50,
  0x58,0x4d,0x50,0x20, 0x00,0x00,0x00,0x00,
]);
context.webpXmp = webpXmp.buffer;
const webpScan = JSON.parse(evaluate(`JSON.stringify(scanMetadata(webpXmp, 'webp'))`));
assert.deepEqual(webpScan.containers, [{ type: 'XMP', count: 1 }], 'WebP XMP chunk should be detected');

assert.equal(evaluate(`sniffHeader(jpegExif)`), 'jpeg');
assert.equal(evaluate(`sniffHeader(pngExif)`), 'png');
assert.equal(evaluate(`sniffHeader(webpXmp)`), 'webp');
assert.equal(evaluate(`sniffHeader(Uint8Array.from([1,2,3,4]).buffer)`), null);

assert.equal(
  evaluate(`detectInputFormat({ type: 'image/jpeg' }, pngExif)`),
  'png',
  'sniffed header should take precedence over a misleading MIME type',
);
assert.equal(evaluate(`detectInputFormat({ type: 'image/webp' }, Uint8Array.from([1,2,3]).buffer)`), 'webp');
assert.equal(evaluate(`detectInputFormat({ type: 'image/heic' }, Uint8Array.from([1,2,3]).buffer)`), null);

assert.equal(evaluate(`buildDownloadName('holiday.photo.webp', 'jpeg')`), 'holiday.photo-cleaned.jpg');
assert.equal(evaluate(`buildDownloadName('image', 'png')`), 'image-cleaned.png');
assert.equal(evaluate(`formatFileSize(1536)`), '1.5 KB');

console.log('EXIF Cleaner Mini behavior test passed.');
