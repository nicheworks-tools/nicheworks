// Run: node --test tools/pages-deploy-guide/stale-copy.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('a pending clipboard write discloses stale output after inputs change', async () => {
  const elements = new Map();
  const el = (id) => {
    if (!elements.has(id)) {
      const handlers = {};
      elements.set(id, {
        value: '', textContent: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
        addEventListener(type, cb) { handlers[type] = cb; },
        fire(type) { return handlers[type]?.(); }
      });
    }
    return elements.get(id);
  };
  el('platform').value = 'github';
  el('sourceType').value = 'static';
  el('customDomain').value = 'no';
  el('outputFolder').value = 'dist';
  let resolveCopy;
  let copiedValue;
  const clipboard = { writeText(value) { copiedValue = value; return new Promise(resolve => { resolveCopy = resolve; }); } };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: el,
    querySelectorAll() { return []; },
    addEventListener(type, cb) { if (type === 'DOMContentLoaded') cb(); }
  };
  const context = {
    document, navigator: { language: 'en', clipboard },
    localStorage: { getItem() { return null; }, setItem() {} },
    setTimeout() { return 1; }, clearTimeout() {},
    Date, Blob, URL, console
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), context);
  el('generate').fire('click');
  const pending = el('copyAll').fire('click');
  assert.match(copiedValue, /dist/);
  el('outputFolder').value = 'docs';
  el('outputFolder').fire('change');
  resolveCopy();
  await pending;
  assert.match(el('toast').textContent, /clipboard contains the previous result/);
  const second = el('copyAll').fire('click');
  assert.match(copiedValue, /docs/);
  resolveCopy();
  await second;
  assert.equal(el('toast').textContent, 'Copied all results.');
});
