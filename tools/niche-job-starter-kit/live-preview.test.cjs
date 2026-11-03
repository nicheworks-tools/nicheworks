const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), downloads = [];
  let copied = '', blob = null;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', style: {}, dataset: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, fn) { events.set(id + ':' + event, fn); },
      async emit(event) { await events.get(id + ':' + event)?.(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement(tag) {
      return { value: '', style: {}, select() {}, remove() {},
        click() { if (tag === 'a') downloads.push({ name: this.download, text: blob.parts.join(''), type: blob.type }); }
      };
    }
  };
  const navigator = { language: 'ja', clipboard: { async writeText(text) { copied = text; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  class BlobStub { constructor(parts, options) { this.parts = parts; this.type = options.type; blob = this; } }
  const URL = { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, navigator, localStorage, Blob: BlobStub, URL,
    setTimeout() { return 1; }, clearTimeout() {}
  });
  events.get('document:DOMContentLoaded')();
  return { get, downloads, copied: () => copied };
}

test('role and compensation inputs update both visible job-post drafts without a generate click', async () => {
  const { get, copied, downloads } = harness();
  assert.match(get('extraOutputEn').textContent, /Application Date/);
  get('role').value = 'UX Researcher';
  await get('role').emit('input');
  get('compensation').value = 'JPY 12000/day';
  await get('compensation').emit('change');
  assert.match(get('outputEn').textContent, /UX Researcher/);
  assert.match(get('outputJa').textContent, /UX Researcher/);
  assert.match(get('outputEn').textContent, /JPY 12000\/day/);
  await get('copyBtn').emit('click');
  assert.match(copied(), /JPY 12000\/day/);
  await get('saveTxtBtn').emit('click');
  assert.match(downloads[0].text, /UX Researcher/);
  assert.match(downloads[0].text, /JPY 12000\/day/);
  assert.match(get('extraOutputEn').textContent, /Application Date/);
});

test('variant panel follows role changes; copying CSV columns restores the header-only panel', async () => {
  const { get, downloads, copied } = harness();
  get('role').value = 'Editor';
  await get('variantBtn').emit('click');
  assert.match(get('extraOutputEn').textContent, /Editor/);
  get('role').value = 'Proofreader';
  await get('role').emit('input');
  assert.match(get('extraOutputEn').textContent, /Proofreader/);
  assert.doesNotMatch(get('extraOutputEn').textContent, /Editor/);
  assert.match(get('extraOutputJa').textContent, /Proofreader/);
  await get('copyCsvBtn').emit('click');
  assert.match(copied(), /Application Date/);
  assert.match(get('extraOutputEn').textContent, /Application Date/);
  assert.doesNotMatch(get('extraOutputEn').textContent, /Proofreader/);
  await get('saveCsvBtn').emit('click');
  assert.equal(downloads.length, 1);
  assert.ok(downloads[0].text.startsWith('\uFEFF'));
  assert.match(downloads[0].text, /Application Date/);
  assert.doesNotMatch(downloads[0].text, /Proofreader/);
});
