import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = `  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();`;
assert.ok(source.includes(exportNeedle), 'light-check test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { state, explainCameraError, clamp, pct, castLabel, castLabelToText, contrastLabel, contrastLabelToText, stabilityLabel, stabilityLabelToText, buildAdvice, buildCopyText };\n})();`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    hidden: false,
    disabled: false,
    srcObject: null,
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    querySelectorAll() { return []; },
    load() {},
    async play() {},
  };
}

const elements = new Map();
const documentStub = {
  readyState: 'loading',
  documentElement: { lang: 'en' },
  body: { ...makeElement(), setAttribute() {} },
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelectorAll() { return []; },
  createElement() { return makeElement(); },
  addEventListener() {},
  execCommand() { return true; },
};

const storage = new Map();
const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en', clipboard: { async writeText() {} }, mediaDevices: null },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  setTimeout,
  clearTimeout,
};
sandbox.window = { addEventListener() {}, clearTimeout, setTimeout };

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/light-check/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.equal(api.clamp(-1, 0, 1), 0);
assert.equal(api.clamp(0.5, 0, 1), 0.5);
assert.equal(api.clamp(2, 0, 1), 1);
assert.equal(api.pct(-0.2), '0');
assert.equal(api.pct(0.504), '50');
assert.equal(api.pct(2), '100');

assert.equal(api.castLabel({ r: 120, g: 122, b: 118 }), 'neutral');
assert.equal(api.castLabel({ r: 170, g: 155, b: 130 }), 'warm');
assert.equal(api.castLabel({ r: 120, g: 140, b: 170 }), 'cool');
assert.equal(api.castLabel({ r: 120, g: 160, b: 120 }), 'green');
assert.equal(api.castLabel({ r: 160, g: 120, b: 160 }), 'magenta');
assert.equal(api.castLabelToText('warm', 'en'), 'warm');
assert.equal(api.castLabelToText('green', 'ja'), '緑かぶり傾向');

assert.equal(api.contrastLabel(0.12), 'flat');
assert.equal(api.contrastLabel(0.2), 'normal');
assert.equal(api.contrastLabel(0.29), 'hard');
assert.equal(api.contrastLabelToText('hard', 'en'), 'high / hard shadows');

api.state.meanHistory = Array(7).fill(0.5);
api.state.fpsEMA = 30;
assert.equal(api.stabilityLabel(0.01), 'unknown', 'fewer than eight history samples should defer stability judgment');
api.state.meanHistory = Array(8).fill(0.5);
api.state.fpsEMA = 7.9;
assert.equal(api.stabilityLabel(0.01), 'unknown', 'low FPS should defer stability judgment');
api.state.fpsEMA = 30;
assert.equal(api.stabilityLabel(0.056), 'unstable');
assert.equal(api.stabilityLabel(0.055), 'ok');
assert.equal(api.stabilityLabelToText('unstable', 'en'), 'variable');

const permission = api.explainCameraError({ name: 'NotAllowedError', message: '' });
assert.match(permission.en, /Camera permission was denied/);
const secure = api.explainCameraError({ name: 'SecurityError', message: '' });
assert.match(secure.en, /HTTPS or another secure context is required/);

const metric = {
  brightness: 0.2,
  castLabel: 'warm',
  contrastLabel: 'hard',
  stabilityLabel: 'unstable',
  stabilityValue: 0.08,
  fps: 29.94,
  sample: '160×120',
  mode: 'Normal',
};
const advice = api.buildAdvice(metric, 'en');
assert.match(advice, /Brightness is low/);
assert.match(advice, /looks warm/);
assert.match(advice, /Shadows look hard/);
assert.match(advice, /not confirmed flicker/i);

documentStub.documentElement.lang = 'en';
api.state.latest = null;
const emptyCopy = api.buildCopyText();
assert.match(emptyCopy, /No result yet/);
assert.match(emptyCopy, /Not a lux, color temperature, or flicker meter/);
api.state.latest = metric;
const copy = api.buildCopyText();
assert.match(copy, /Brightness: 20 \/ 100/);
assert.match(copy, /Cast: warm/);
assert.match(copy, /Contrast: high \/ hard shadows/);
assert.match(copy, /Stability \/ F: variable/);
assert.match(copy, /FPS: 29\.9/);
assert.match(copy, /Mode: Normal/);

console.log('Light Check behavior test passed.');
