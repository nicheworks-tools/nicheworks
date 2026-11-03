const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map();
  const handlers = new Map();
  const downloads = [];
  let clipboard = '';
  let lastBlob = null;
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', disabled: false, style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, fn) { handlers.set(id + ':' + event, fn); },
      async emit(event) { const fn = handlers.get(id + ':' + event); if (fn) await fn(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    querySelectorAll() { return []; },
    body: { appendChild() {} },
    createElement(tag) {
      return {
        style: {}, value: '',
        select() { clipboard = this.value; },
        remove() {}, click() { if (tag === 'a') downloads.push({ filename: this.download, data: lastBlob.parts.join('') }); }
      };
    },
    addEventListener(event, fn) { handlers.set('document:' + event, fn); },
    execCommand(name) { return name === 'copy'; }
  };
  const navigator = { language: 'en', clipboard: { async writeText(value) { clipboard = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = { setTimeout() { return 1; }, clearTimeout() {} };
  class BlobStub { constructor(parts) { this.parts = parts; lastBlob = this; } }
  const URL = { createObjectURL() { return 'blob:fixture'; }, revokeObjectURL() {} };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, { document, navigator, localStorage, window, Blob: BlobStub, URL });
  handlers.get('document:DOMContentLoaded')();
  return { get, downloads, clipboard: () => clipboard };
}

test('editing any report field invalidates JP/EN drafts and disables stale copy/export', async () => {
  const { get, clipboard, downloads } = harness();
  get('period').value = '2026-W45';
  get('kpi').value = 'Conversions 12';
  await get('btnBuild').emit('click');
  assert.match(get('outputEn').textContent, /Conversions 12/);
  assert.equal(get('btnCopyJa').disabled, false);
  await get('btnCopyEn').emit('click');
  assert.match(clipboard(), /Conversions 12/);

  get('kpi').value = 'Conversions 99';
  await get('kpi').emit('input');
  assert.equal(get('outputEn').textContent, '');
  assert.equal(get('outputJa').textContent, '');
  assert.equal(get('btnCopyJa').disabled, true);
  assert.equal(get('btnSaveMd').disabled, true);
  await get('btnSaveMd').emit('click');
  assert.equal(downloads.length, 0);

  await get('btnBuild').emit('click');
  assert.match(get('outputEn').textContent, /Conversions 99/);
  assert.doesNotMatch(get('outputEn').textContent, /Conversions 12/);
});

test('copy and exports reject changes without input events; valid regeneration downloads new data', async () => {
  const { get, clipboard, downloads } = harness();
  get('period').value = '2026-W45';
  get('nextActions').value = 'Deploy A';
  await get('btnBuild').emit('click');
  get('nextActions').value = 'Deploy B';
  await get('btnCopyJa').emit('click');
  assert.equal(clipboard(), '');
  assert.equal(get('outputEn').textContent, '');
  await get('btnSaveMd').emit('click');
  assert.equal(downloads.length, 0);

  await get('btnBuild').emit('click');
  await get('btnSaveMd').emit('click');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].data, /Deploy B/);
  assert.doesNotMatch(downloads[0].data, /Deploy A/);
  assert.match(downloads[0].filename, /\.md$/);

  get('period').value = '';
  await get('btnBuild').emit('click');
  assert.equal(get('outputEn').textContent, '');
  assert.equal(get('btnSaveEn').disabled, true);
});
