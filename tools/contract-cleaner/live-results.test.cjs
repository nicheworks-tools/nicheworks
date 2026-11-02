const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('editing contract text immediately refreshes counters and highlights', () => {
  const listeners = new Map();
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', innerHTML: '', className: '', checked: true,
      addEventListener(event, callback) { listeners.set(id + ':' + event, callback); },
      appendChild() {}, setAttribute() {}, remove() {}, classList: { add() {}, remove() {}, toggle() {} },
    });
    return elements.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: element,
    querySelectorAll() { return []; },
    addEventListener(event, callback) { listeners.set('document:' + event, callback); },
    createElement() { return { className: '', innerHTML: '', textContent: '', appendChild() {}, setAttribute() {}, remove() {} }; },
  };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, { document, navigator: { language: 'en' }, window: { setTimeout() {} }, Blob, URL });
  listeners.get('document:DOMContentLoaded')();
  const input = listeners.get('contractText:input');
  assert.equal(typeof input, 'function');

  element('contractText').value = 'The liability cap applies.';
  input();
  assert.equal(element('totalHits').textContent, '1');
  assert.ok(element('highlightPreview').innerHTML.includes('>liability</mark>'));

  element('contractText').value = 'No relevant terms here.';
  input();
  assert.equal(element('totalHits').textContent, '0');
  assert.equal(element('categoryCount').textContent, '0');
  assert.doesNotMatch(element('highlightPreview').innerHTML, /<mark/);

  element('contractText').value = 'The payment is due.';
  input();
  assert.equal(element('totalHits').textContent, '1');
  assert.match(element('highlightPreview').innerHTML, /payment/);
});
