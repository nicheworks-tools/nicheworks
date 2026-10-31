import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = p => fs.readFileSync(p, 'utf8');
const processor = read('tools/inci-fastscan/js/image_preprocess.js');
const interfaceSource = read('tools/inci-fastscan/enhancements.js');
const ocrSource = read('tools/inci-fastscan/js/web_ocr.js');
const app = read('tools/inci-fastscan/js/app.js');
const html = read('tools/inci-fastscan/index.html');
const sourceFile = { type: 'image/jpeg', size: 125000 };

function harness(naturalWidth = 1200, naturalHeight = 800, opts = {}) {
  const events = [];
  const ctx = {
    filter: 'none',
    fillStyle: 'transparent',
    fillRect(...args) { events.push(['fillRect', this.fillStyle, ...args]); },
    translate(...args) { events.push(['translate', ...args]); },
    rotate(angle) { events.push(['rotate', angle]); },
    drawImage(...args) { events.push(['drawImage', ...args.slice(1)]); }
  };
  const canvas = {
    width: 0, height: 0,
    getContext() { return ctx; },
    toBlob(callback, type) {
      events.push(['toBlob', type]);
      callback(opts.failEncode ? null : { type, processed: true });
    }
  };
  class FakeImage {
    naturalWidth = naturalWidth;
    naturalHeight = naturalHeight;
    set src(url) {
      events.push(['load', url]);
      queueMicrotask(() => opts.failDecode ? this.onerror?.() : this.onload?.());
    }
  }
  const scope = {
    URL: {
      createObjectURL() { events.push(['createURL']); return 'blob:local'; },
      revokeObjectURL(url) { events.push(['revokeURL', url]); }
    },
    Image: FakeImage,
    document: { createElement(tag) {
      assert.equal(tag, 'canvas');
      return canvas;
    } }
  };
  vm.runInNewContext(processor, scope, { filename: 'image_preprocess.js' });
  return { prepare: scope.prepareFastScanOcrImage, canvas, ctx, events };
}

const radians = deg => deg * Math.PI / 180;
const close = (value, expected, label) => assert.ok(Math.abs(value - expected) < 1e-9,
  label + ': expected ' + expected + ', got ' + value);

const untouched = harness();
assert.equal(await untouched.prepare(sourceFile, 0, { deskewDegrees: 0 }), sourceFile);
assert.deepEqual(untouched.events, [], 'default path must not decode or re-encode');

let run = harness();
await run.prepare(sourceFile, 0, { deskewDegrees: 10 });
const w = Math.ceil(1200 * Math.cos(radians(10)) + 800 * Math.sin(radians(10)));
const h = Math.ceil(1200 * Math.sin(radians(10)) + 800 * Math.cos(radians(10)));
assert.equal(run.canvas.width, w, 'deskew must expand instead of clipping source-label corners');
assert.equal(run.canvas.height, h);
close(run.events.find(x => x[0] === 'rotate')[1], radians(10), 'clockwise manual deskew');
assert.deepEqual(run.events.find(x => x[0] === 'translate'), ['translate', w / 2, h / 2]);
assert.deepEqual(run.events.find(x => x[0] === 'fillRect'), ['fillRect', '#fff', 0, 0, w, h],
  'deskew corner pixels must be filled white for OCR');
assert.equal(run.events.at(-1)[0], 'revokeURL');

run = harness();
await run.prepare(sourceFile, 0, { deskewDegrees: -10, crop: { left: 20, top: 10 } });
assert.equal(run.canvas.width, Math.round(w * .8));
assert.equal(run.canvas.height, Math.round(h * .9));
close(run.events.find(x => x[0] === 'rotate')[1], radians(-10), 'counterclockwise manual deskew');
assert.deepEqual(run.events.find(x => x[0] === 'translate'),
  ['translate', w / 2 - w * .2, h / 2 - h * .1],
  'crop coordinates must follow the expanded, deskewed bounding box');

run = harness();
await run.prepare(sourceFile, 1, { deskewDegrees: 5, contrastPercent: 140 });
const ninetyBoxWidth = Math.ceil(800 * Math.cos(radians(5)) + 1200 * Math.sin(radians(5)));
const ninetyBoxHeight = Math.ceil(800 * Math.sin(radians(5)) + 1200 * Math.cos(radians(5)));
assert.equal(run.canvas.width, ninetyBoxWidth);
assert.equal(run.canvas.height, ninetyBoxHeight);
close(run.events.find(x => x[0] === 'rotate')[1], Math.PI / 2 + radians(5), 'quarter-turn plus deskew');
assert.equal(run.ctx.filter, 'contrast(140%)', 'contrast must combine with tilt');

run = harness();
await run.prepare(sourceFile, 0, { deskewDegrees: 100 });
close(run.events.find(x => x[0] === 'rotate')[1], radians(12), 'invalid >12° manual angle clamp');
run = harness();
await run.prepare(sourceFile, 0, { deskewDegrees: -100 });
close(run.events.find(x => x[0] === 'rotate')[1], radians(-12), 'invalid <-12° manual angle clamp');

run = harness(9000, 7000);
await run.prepare(sourceFile, 1, { deskewDegrees: 12 });
assert.ok(Math.max(run.canvas.width, run.canvas.height) <= 4096,
  'expanded 9K-resolution phone image must remain within capped canvas dimensions');

run = harness(1200, 800, { failDecode: true });
await assert.rejects(run.prepare(sourceFile, 0, { deskewDegrees: 5 }), /decode/);
assert.equal(run.events.at(-1)[0], 'revokeURL', 'decoding error must revoke object URL');
run = harness(1200, 800, { failEncode: true });
await assert.rejects(run.prepare(sourceFile, 0, { deskewDegrees: 5 }), /Could not prepare/);
assert.equal(run.events.at(-1)[0], 'revokeURL', 'encoding error must revoke object URL');

assert.match(interfaceSource, /data-ocr-deskew/);
assert.match(interfaceSource, /deskewSlider\.addEventListener\('input'/);
assert.match(interfaceSource, /deskewSlider\.nextElementSibling\.textContent/);
assert.match(interfaceSource, /deskewDegrees: Number\(deskewSlider\.value\)/);
assert.match(interfaceSource, /markOcrTextStale\(\)/);
assert.match(interfaceSource, /previewVersion/, 'stale previews must not replace newer settings');
for (const fileId of ['ocr-file-fast', 'ocr-file']) {
  assert.ok(interfaceSource.includes("fileId: '" + fileId + "'"), 'both OCR tabs must use the updated UI');
  assert.ok(app.includes('fastScanImageOptions("' + fileId + '")'), 'both OCR tabs must forward options');
}
assert.match(ocrSource, /prepareFastScanOcrImage\(imageFile, turns, options\)/,
  'Tesseract must receive the same corrected pixels as preview');
assert.ok(html.includes('js/image_preprocess.js?v='));
assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon/.test(processor),
  'image deskew must be fully local with no new upload/telemetry');
console.log('FASTSCAN_MANUAL_DESKEW=PASS: rotation, bounded canvas, background, crop, contrast, cleanup and bilingual OCR wiring');
