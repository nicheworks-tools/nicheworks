const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), downloads = [];
  let copied = '', blob;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', style: {}, dataset: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, fn) { events.set(id + ':' + name, fn); },
      async emit(name) { await events.get(id + ':' + name)?.(); },
      setAttribute() {}
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    querySelector(sel) { return sel.startsWith('#') ? get(sel.slice(1)) : null; },
    querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement(tag) {
      return { style: {}, value: '',
        select() { copied = this.value; }, remove() {},
        click() { if (tag === 'a') downloads.push({ name: this.download, text: blob.parts.join(''), type: blob.options.type }); }
      };
    },
    execCommand(n) { return n === 'copy'; }
  };
  const navigator = { language: 'ja', clipboard: { async writeText(v) { copied = v; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = {};
  class BlobStub {
    constructor(parts, options) { this.parts = parts; this.options = options; blob = this; }
  }
  const URL = { createObjectURL() { return 'blob:local'; }, revokeObjectURL() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, navigator, localStorage, window, Blob: BlobStub, URL,
    setTimeout() { return 1; }, clearTimeout() {}
  });
  events.get('document:DOMContentLoaded')();
  return { get, downloads, copied: () => copied };
}

test('LP price edits invalidate copy, Markdown and HTML until regeneration', async () => {
  const { get, downloads, copied } = harness();
  get('productName').value = 'Widget';
  get('price').value = 'JPY 100';
  get('guarantee').value = 'Refund within 14 days';
  await get('generate').emit('click');
  assert.match(get('output').value, /JPY 100/);
  await get('copyAll').emit('click');
  assert.match(copied(), /JPY 100/);

  get('price').value = 'JPY 250';
  await get('price').emit('input');
  assert.equal(get('output').value, '');
  const oldCopy = copied();
  await get('copyAll').emit('click');
  await get('downloadMd').emit('click');
  await get('downloadHtml').emit('click');
  assert.equal(copied(), oldCopy);
  assert.equal(downloads.length, 0);

  await get('generate').emit('click');
  await get('downloadHtml').emit('click');
  await get('downloadMd').emit('click');
  assert.equal(downloads.length, 2);
  assert.match(downloads[0].name, /\.html$/);
  assert.match(downloads[0].text, /JPY 250/);
  assert.doesNotMatch(downloads[0].text, /JPY 100/);
  assert.match(downloads[1].name, /\.md$/);
  assert.match(downloads[1].text, /JPY 250/);
});

test('eventless edits and all 12 input events cannot export previous guarantees or claims', async () => {
  const { get, downloads } = harness();
  const ids = ['productName', 'target', 'problem', 'benefits', 'differentiators',
    'price', 'proof', 'steps', 'faq', 'guarantee', 'notes', 'cta'];
  for (const id of ids) {
    await get('generate').emit('click');
    assert.match(get('output').value, /LP骨子/);
    get(id).value = (get(id).value || 'start') + ' changed';
    await get(id).emit('change');
    assert.equal(get('output').value, '');
  }
  await get('generate').emit('click');
  get('guarantee').value = 'New refund terms without input event';
  await get('downloadMd').emit('click');
  assert.equal(downloads.length, 0);
  assert.equal(get('output').value, '');
});
