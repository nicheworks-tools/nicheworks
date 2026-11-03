const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), images = [], urls = [], revoked = [];
  let displayedLogo = null, savedLogo = null;
  const preview = {
    width: 1200, height: 630,
    getContext() {
      return {
        clearRect() { displayedLogo = null; },
        fillRect() {}, strokeRect() {}, fillText() {}, setLineDash() {},
        drawImage(image) { displayedLogo = image; },
        measureText(text) { return { width: String(text).length * 14 }; },
        createLinearGradient() { return { addColorStop() {} }; }
      };
    },
    toDataURL(type) { assert.equal(type, 'image/png'); savedLogo = displayedLogo; return 'data:image/png;base64,AA=='; }
  };
  const get = id => {
    if (id === 'preview') return preview;
    if (!nodes.has(id)) nodes.set(id, {
      value: '', checked: false, files: [], style: {}, dataset: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, fn) { events.set(id + ':' + name, fn); },
      async emit(name, e = {}) { await events.get(id + ':' + name)?.({ target: this, ...e }); }
    });
    return nodes.get(id);
  };
  // Native HTML defaults. syncState() reads the selected template/theme on load.
  get('templateSelect').value = 'minimal';
  get('themeSelect').value = 'light';
  get('bgColorInput').value = '#ffffff';
  get('gradientStartInput').value = '#3b82f6';
  get('gradientEndInput').value = '#1d4ed8';
  get('textAlignSelect').value = 'left';
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll() { return []; },
    getElementById: get,
    addEventListener(name, fn) {
      if (!events.has('document:' + name)) events.set('document:' + name, []);
      events.get('document:' + name).push(fn);
    },
    body: { appendChild() {} },
    createElement() { return { style: {}, click() {}, remove() {} }; }
  };
  class ImageStub {
    constructor() { this.width = 100; this.height = 50; images.push(this); }
    set src(url) { this._src = url; }
    get src() { return this._src; }
  }
  const navigator = { language: 'en' };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = {};
  const URL = {
    createObjectURL(file) { const url = 'blob:logo-' + (urls.length + 1); urls.push({ url, file }); return url; },
    revokeObjectURL(url) { revoked.push(url); }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, navigator, window, localStorage, Image: ImageStub, URL,
    confirm: () => true,
    setTimeout() { return 1; }, clearTimeout() {}, console
  });
  for (const fn of events.get('document:DOMContentLoaded') || []) fn();
  return { get, images, urls, revoked, displayedLogo: () => displayedLogo, savedLogo: () => savedLogo };
}

test('second selected logo wins even if first image finishes after second selection', async () => {
  const h = harness();
  const logo = h.get('logoInput');
  logo.files = [{ name: 'old.png' }];
  await logo.emit('change');
  assert.equal(h.images.length, 1);
  logo.files = [{ name: 'new.png' }];
  await logo.emit('change');
  assert.equal(h.images.length, 2);
  assert.deepEqual(h.revoked, ['blob:logo-1']);
  h.images[0].onload();
  assert.equal(h.displayedLogo(), null);
  h.images[1].onload();
  assert.equal(h.displayedLogo(), h.images[1]);
  assert.deepEqual(h.revoked, ['blob:logo-1', 'blob:logo-2']);
  await h.get('downloadBtn').emit('click');
  assert.equal(h.savedLogo(), h.images[1]);
});

test('pending logo is removed on reset and old image is excluded while replacement loads', async () => {
  const h = harness();
  const logo = h.get('logoInput');
  logo.files = [{ name: 'first.png' }];
  await logo.emit('change');
  h.images[0].onload();
  assert.equal(h.displayedLogo(), h.images[0]);
  logo.files = [{ name: 'second.png' }];
  await logo.emit('change');
  assert.equal(h.displayedLogo(), null);
  await h.get('downloadBtn').emit('click');
  assert.equal(h.savedLogo(), null);
  await h.get('resetBtn').emit('click');
  assert.ok(h.revoked.includes('blob:logo-2'));
  h.images[1].onload();
  assert.equal(h.displayedLogo(), null);
  logo.files = [];
  await logo.emit('change');
  assert.equal(h.displayedLogo(), null);
  assert.equal(h.urls.length, 2);
});
