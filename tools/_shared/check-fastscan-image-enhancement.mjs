import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync('tools/inci-fastscan/js/image_preprocess.js', 'utf8');
const ui = fs.readFileSync('tools/inci-fastscan/enhancements.js', 'utf8');
const page = fs.readFileSync('tools/inci-fastscan/index.html', 'utf8');
const qa = fs.readFileSync('tools/inci-fastscan/qa/photo-ocr-benchmark.html', 'utf8');
const runner = fs.readFileSync('tools/inci-fastscan/qa/photo_ocr_runner.js', 'utf8');
const file = { type: 'image/jpeg', name: 'only-local-test.jpg' };

function harness({ width = 2, height = 2, missingPixelApi = false } = {}) {
  const created = [];
  const events = [];
  function createCanvas() {
    const canvas = { width: 0, height: 0, imageData: null };
    const ctx = {
      filter: 'none',
      translate() {},
      rotate() {},
      drawImage(...args) { events.push(['draw', ...args.slice(1)]); },
      putImageData(pixels) {
        canvas.imageData = new Uint8ClampedArray(pixels.data);
        events.push(['writePixels', canvas.imageData.length]);
      },
      getImageData(x, y, w, h) {
        const data = new Uint8ClampedArray(w * h * 4);
        for (let i = 0; i < w * h; i += 1) {
          const value = [0, 80, 170, 255][i % 4];
          const j = i * 4;
          data[j] = value;
          data[j + 1] = Math.min(255, value + 3);
          data[j + 2] = Math.min(255, value + 6);
          data[j + 3] = 255;
        }
        return { data, width: w, height: h };
      }
    };
    if (missingPixelApi) delete ctx.getImageData;
    canvas.getContext = kind => {
      assert.equal(kind, '2d');
      return ctx;
    };
    canvas.toBlob = (done, type) => done({ type, canvasWidth: canvas.width, canvasHeight: canvas.height });
    created.push(canvas);
    return canvas;
  }
  class TestImage {
    naturalWidth = width;
    naturalHeight = height;
    set src(value) { events.push(['img', value]); queueMicrotask(() => this.onload()); }
  }
  const context = {
    Image: TestImage,
    document: { createElement: name => { assert.equal(name, 'canvas'); return createCanvas(); } },
    URL: {
      createObjectURL() { events.push(['createURL']); return 'blob:local-test'; },
      revokeObjectURL(s) { events.push(['revokeURL', s]); }
    }
  };
  vm.runInNewContext(code, context, { filename: 'image_preprocess.js' });
  return { prepare: context.prepareFastScanOcrImage, created, events };
}

let t = harness();
assert.equal(await t.prepare(file, 0), file, 'default must preserve original photo bytes, no canvas');
assert.equal(t.created.length, 0);

t = harness();
let blob = await t.prepare(file, 0, { enhanceForOcr: true });
assert.equal(blob.type, 'image/png');
assert.equal(blob.canvasWidth, 4);
assert.equal(blob.canvasHeight, 4);
assert.equal(t.created.length, 2, 'real pixel preparation and bounded enlarged canvas');
assert.ok(t.events.some(x => x[0] === 'writePixels'));
const data = t.created[0].imageData;
assert.ok(data && data.length === 16, '2x2 pixels must have real image-data processing');
for (let i = 0; i < data.length; i += 4) {
  assert.equal(data[i], data[i + 1]);
  assert.equal(data[i + 1], data[i + 2]);
  assert.equal(data[i + 3], 255);
}
assert.equal(t.events.at(-1)[0], 'revokeURL');

t = harness({ width: 4000, height: 120 });
blob = await t.prepare(file, 0, { enhanceForOcr: true });
assert.ok(blob.canvasWidth <= 3072 && blob.canvasHeight <= 3072,
  'memory cap must not allocate >3072px enhanced output');
assert.equal(t.events.at(-1)[0], 'revokeURL');

t = harness({ missingPixelApi: true });
await assert.rejects(t.prepare(file, 0, { enhanceForOcr: true }),
  /unsupported in this browser/);
assert.equal(t.events.at(-1)[0], 'revokeURL', 'failed image prep must release the local image URL');

assert.ok(ui.includes('data-ocr-enhance') && ui.includes('enhanceForOcr: enhancementToggle.checked'),
  'both OCR modes must offer an explicit opt-in that is passed through to image processing');
assert.ok(ui.includes('enhancementToggle.checked = false'), 'reset to original mode');
assert.ok(ui.includes("enhancementToggle.addEventListener('change'"), 'changing mode invalidates prior OCR');
assert.ok(ui.includes('markOcrTextStale()'), 'changes require a fresh recognition');
assert.ok(qa.includes('id="qa-enhance"') && runner.includes("byId('qa-enhance').checked"),
  'the no-index real-photo QA page must test the actual browser enhancement mode');
assert.ok(page.includes('js/image_preprocess.js?v=20261102-browser-enhance-1'));
assert.ok(page.includes('enhancements.js?v=20261102-browser-enhance-1'));
assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon/.test(code),
  'never transmit the photo to a server');

console.log('FASTSCAN_IMAGE_ENHANCEMENT=PASS: default unchanged, opt-in grayscale/stretch/upscale, 3072px cap, PNG data, stale state, both OCR languages, QA wiring and privacy');
