import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const script = read('tools/inci-fastscan/js/image_preprocess.js');
const html = read('tools/inci-fastscan/index.html');
const ocr = read('tools/inci-fastscan/js/web_ocr.js');
const app = read('tools/inci-fastscan/js/app.js');
const enhancements = read('tools/inci-fastscan/enhancements.js');

function harness(naturalWidth, naturalHeight, failDecode = false) {
  const calls = [];
  const canvas = {
    width: 0,
    height: 0,
    getContext(type) {
      assert.equal(type, '2d');
      return {
        translate: (...args) => calls.push(['translate', ...args]),
        rotate: angle => calls.push(['rotate', angle]),
        drawImage: (...args) => calls.push(['drawImage', ...args.slice(1)])
      };
    },
    toBlob(callback, type) {
      calls.push(['toBlob', type]);
      callback({ type, transformed: true });
    }
  };
  class FakeImage {
    naturalWidth = naturalWidth;
    naturalHeight = naturalHeight;
    set src(value) {
      calls.push(['src', value]);
      queueMicrotask(() => failDecode ? this.onerror?.() : this.onload?.());
    }
  }
  const sandbox = {
    URL: {
      createObjectURL() { calls.push(['createURL']); return 'blob:local-test'; },
      revokeObjectURL(value) { calls.push(['revokeURL', value]); }
    },
    Image: FakeImage,
    document: { createElement: tag => { assert.equal(tag, 'canvas'); return canvas; } }
  };
  vm.runInNewContext(script, sandbox, { filename: 'image_preprocess.js' });
  return { calls, canvas, prepare: sandbox.prepareFastScanOcrImage };
}

const sample = { type: 'image/jpeg' };
const original = harness(1200, 800);
assert.equal(await original.prepare(sample, 0), sample, 'unrotated OCR must use the unchanged source file');
assert.deepEqual(original.calls, [], 'unrotated input must avoid encoding and canvas memory');

const clockwise = harness(1200, 800);
const rotated = await clockwise.prepare(sample, 1);
assert.equal(rotated.type, 'image/png');
assert.equal(clockwise.canvas.width, 800);
assert.equal(clockwise.canvas.height, 1200);
assert.deepEqual(clockwise.calls.find(call => call[0] === 'translate'), ['translate', 400, 600]);
assert.equal(clockwise.calls.find(call => call[0] === 'rotate')[1], Math.PI / 2);
assert.equal(clockwise.calls.find(call => call[0] === 'drawImage').length, 5);
assert.equal(clockwise.calls.at(-1)[0], 'revokeURL', 'temporary source URLs must be revoked');

const counterclockwise = harness(1200, 800);
await counterclockwise.prepare(sample, -1);
assert.equal(counterclockwise.calls.find(call => call[0] === 'rotate')[1], Math.PI * 1.5);

const large = harness(9000, 3000);
await large.prepare(sample, 1);
assert.equal(large.canvas.width, 1365);
assert.equal(large.canvas.height, 4096);

const invalid = harness(1200, 800, true);
await assert.rejects(invalid.prepare(sample, 1), /decode/);
assert.equal(invalid.calls.at(-1)[0], 'revokeURL', 'failed decoding must revoke its source URL');

const prepAsset = html.indexOf('js/image_preprocess.js?v=');
const ocrAsset = html.indexOf('js/web_ocr.js?v=');
assert.ok(prepAsset > 0 && prepAsset < ocrAsset, 'image preparation must load before OCR');
assert.match(ocr, /prepareFastScanOcrImage\(imageFile, turns\)/, 'OCR must use actual rotated image pixels');
assert.match(app, /fastScanImageRotation\("ocr-file-fast"\)/, 'English OCR must send its rotation');
assert.match(app, /fastScanImageRotation\("ocr-file"\)/, 'Japanese OCR must send its rotation');
assert.match(enhancements, /data-ocr-rotate="-1"/);
assert.match(enhancements, /data-ocr-rotate="1"/);
assert.match(enhancements, /requestId !== previewVersion/, 'obsolete previews must not replace newer input');
assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon/.test(script), 'rotation must remain browser-local');

console.log('FASTSCAN_IMAGE_ROTATION=PASS: original input, +/-90°, downscale, failure cleanup, both OCR modes, and wiring');
