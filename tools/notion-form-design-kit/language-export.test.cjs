const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map();
  const callbacks = new Map();
  const downloads = [];
  let clipboard = '';
  let blob;
  const make = id => {
    const node = {
      value: '', textContent: '', dataset: {}, style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, handler) { callbacks.set(id + ':' + event, handler); },
      async fire(event) { await callbacks.get(id + ':' + event)?.(); },
      setAttribute() {}, select() {}, remove() {}, click() {}
    };
    return node;
  };
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, make(id));
    return nodes.get(id);
  };
  const ja = make('lang-ja'), en = make('lang-en');
  ja.dataset.lang = 'ja';
  en.dataset.lang = 'en';
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    querySelectorAll(selector) {
      if (selector === '.nw-lang-switch button') return [ja, en];
      return [];
    },
    addEventListener(name, cb) { callbacks.set('document:' + name, cb); },
    body: { appendChild() {} },
    createElement(tag) {
      return {
        style: {}, value: '', setAttribute() {}, select() {}, remove() {},
        click() { if (tag === 'a') downloads.push({ filename: this.download, text: blob.parts.join('') }); }
      };
    },
    execCommand() { return false; }
  };
  const navigator = { language: 'ja', clipboard: { async writeText(value) { clipboard = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = { isSecureContext: true, setTimeout() { return 1; }, clearTimeout() {} };
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} };
  get('statusFlow').value = 'simple';
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, { document, navigator, localStorage, window, Blob: BlobStub, URL });
  callbacks.get('document:DOMContentLoaded')();
  return { get, ja, en, clipboard: () => clipboard, downloads };
}

test('JP/EN switch updates generated properties, pipeline, message and exported Markdown', async () => {
  const { get, en, ja, clipboard, downloads } = harness();
  get('useCase').value = 'Customer intake';
  await get('generate').fire('click');
  assert.match(get('properties').value, /Notion DB設計案/);
  assert.match(get('pipeline').value, /ステータスパイプライン/);
  await en.fire('click');
  assert.match(get('properties').value, /Notion DB design draft/);
  assert.match(get('pipeline').value, /Status pipeline/);
  assert.match(get('messages').value, /Message templates/);
  assert.doesNotMatch(get('properties').value, /Notion DB設計案/);
  await get('copyAll').fire('click');
  assert.match(clipboard(), /Notion DB design draft/);
  await get('saveMd').fire('click');
  assert.match(downloads[0].filename, /-en-[0-9]{8}[.]md$/);
  assert.match(downloads[0].text, /Status pipeline/);

  await ja.fire('click');
  assert.match(get('properties').value, /Notion DB設計案/);
  await get('saveTxt').fire('click');
  assert.match(downloads[1].filename, /-ja-[0-9]{8}[.]txt$/);
  assert.match(downloads[1].text, /ステータスパイプライン/);
});

test('editing the use case still regenerates in the currently selected language', async () => {
  const { get, en } = harness();
  await get('generate').fire('click');
  await en.fire('click');
  get('useCase').value = 'Incident response';
  await get('useCase').fire('input');
  assert.match(get('properties').value, /Incident response - Notion DB design draft/);
});
