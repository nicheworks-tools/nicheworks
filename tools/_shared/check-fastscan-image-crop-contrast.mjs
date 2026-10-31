import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(file, 'utf8');
const preprocessor = read('tools/inci-fastscan/js/image_preprocess.js');
const ocrSource = read('tools/inci-fastscan/js/web_ocr.js');
const app = read('tools/inci-fastscan/js/app.js');
const enhancements = read('tools/inci-fastscan/enhancements.js');
const html = read('tools/inci-fastscan/index.html');

function imageHarness({ width = 1200, height = 800, missingFilter = false, failEncoding = false } = {}) {
  const events = [];
  const context = {
    translate: (...args) => events.push(['translate', ...args]),
    rotate: angle => events.push(['rotate', angle]),
    drawImage: (...args) => events.push(['drawImage', ...args.slice(1)])
  };
  if (!missingFilter) context.filter = 'none';

  const canvas = {
    width: 0, height: 0,
    getContext(kind) { assert.equal(kind, '2d'); return context; },
    toBlob(done, type) {
      events.push(['toBlob', type]);
      done(failEncoding ? null : { type, result: true });
    }
  };
  class ImageStub {
    naturalWidth = width;
    naturalHeight = height;
    set src(url) {
      events.push(['imageURL', url]);
      queueMicrotask(() => this.onload?.());
    }
  }
  const sandbox = {
    Image: ImageStub,
    URL: {
      createObjectURL() { events.push(['createURL']); return 'blob:local-image'; },
      revokeObjectURL(value) { events.push(['revokeURL', value]); }
    },
    document: { createElement(tag) { assert.equal(tag, 'canvas'); return canvas; } }
  };
  vm.runInNewContext(preprocessor, sandbox);
  return { prepare: sandbox.prepareFastScanOcrImage, canvas, context, events };
}

const file = { type: 'image/jpeg', name: 'local.jpg' };
let engine = imageHarness();
assert.equal(await engine.prepare(file, 0), file, 'default image must stay original without canvas encoding');
assert.equal(engine.events.length, 0);

engine = imageHarness();
let processed = await engine.prepare(file, 0, {
  crop: { left: 25, right: 10, top: 5, bottom: 15 }, contrastPercent: 150
});
assert.equal(processed.type, 'image/png');
assert.equal(engine.canvas.width, 780);
assert.equal(engine.canvas.height, 640);
assert.deepEqual(engine.events.find(x => x[0] === 'translate'), ['translate', 300, 360]);
assert.equal(engine.context.filter, 'contrast(150%)');
assert.equal(engine.events.at(-1)[0], 'revokeURL', 'crop/contrast must release source URLs');

engine = imageHarness();
await engine.prepare(file, 1, { crop: { left: 25, right: 0, top: 0, bottom: 0 } });
assert.equal(engine.canvas.width, 600, 'crop dimensions are relative to the already rotated image');
assert.equal(engine.canvas.height, 1200);
assert.deepEqual(engine.events.find(x => x[0] === 'translate'), ['translate', 200, 600]);
assert.equal(engine.events.find(x => x[0] === 'rotate')[1], Math.PI / 2);

engine = imageHarness();
await engine.prepare(file, 0, { crop: { left: 80, right: 80, top: 90, bottom: 90 } });
assert.equal(engine.canvas.width, 120, 'opposing trim edges must retain at least 10% image width');
assert.equal(engine.canvas.height, 80, 'opposing trim edges must retain at least 10% image height');

engine = imageHarness({ missingFilter: true });
await assert.rejects(engine.prepare(file, 0, { contrastPercent: 140 }), /Contrast adjustment is unavailable/);
assert.equal(engine.events.at(-1)[0], 'revokeURL');

engine = imageHarness({ failEncoding: true });
await assert.rejects(engine.prepare(file, 0, { crop: { left: 10 } }), /Could not prepare/);
assert.equal(engine.events.at(-1)[0], 'revokeURL');

const calls = [];
const sandbox = {
  Tesseract: {
    async recognize(image, language) {
      calls.push({ image, language });
      return { data: { text: 'Glycerin' } };
    }
  },
  prepareFastScanOcrImage: async (original, turns, options) => {
    calls.push({ original, turns, options });
    return { transformed: true };
  },
  coreProcessOCRText: text => text,
  console: { log() {} }
};
vm.runInNewContext(ocrSource, sandbox);
const options = { quarterTurns: 3, crop: { left: 20, right: 0, top: 0, bottom: 10 }, contrastPercent: 160 };
assert.equal(await sandbox.runOCR(file, 'jpn+eng', null, options), 'Glycerin');
assert.equal(calls[0].turns, 3);
assert.equal(calls[0].options, options);
assert.equal(calls[1].language, 'jpn+eng');
assert.equal(calls[1].image.transformed, true, 'Tesseract must receive processed pixels');
await sandbox.runOCR(file, 'eng', null, options);
assert.equal(calls[3].language, 'eng');

for (const id of ['ocr-file-fast', 'ocr-file']) {
  assert.ok(app.includes('fastScanImageOptions("' + id + '")'), id + ' must use the shared preparation settings');
}
assert.match(enhancements, /data-ocr-crop/);
assert.match(enhancements, /data-ocr-contrast/);
assert.match(enhancements, /root\.fastScanImageOptions/);
assert.match(enhancements, /markOcrTextStale/);
assert.match(enhancements, /requestId !== previewVersion/, 'stale async previews must not overwrite newer images');
assert.ok(html.indexOf('js/image_preprocess.js?v=') < html.indexOf('js/web_ocr.js?v='));
assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon/.test(preprocessor), 'source images must stay in browser');

console.log('FASTSCAN_CROP_CONTRAST=PASS: crop geometry, contrast, error cleanup, OCR pixel parity, and both language modes');
