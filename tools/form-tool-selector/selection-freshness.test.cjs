const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), downloads = [];
  let copied = '', blob;
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', checked: false, textContent: '', style: {}, dataset: {},
      children: [], disabled: false,
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {},
      addEventListener(name, fn) { events.set(id + ':' + name, fn); },
      async emit(name) { await events.get(id + ':' + name)?.(); },
      replaceChildren(...items) { this.children = items; },
      appendChild(item) { this.children.push(item); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: get,
    querySelectorAll() { return []; },
    body: { appendChild() {} },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    createElement(tag) { return {
      className: '', style: {}, dataset: {}, textContent: '', value: '', children: [],
      appendChild(item) { this.children.push(item); },
      setAttribute() {}, select() {}, remove() {},
      click() { if (tag === 'a') downloads.push({ name: this.download, content: blob.parts.join('') }); }
    }; },
    execCommand(name) { return name === 'copy'; }
  };
  const navigator = { language: 'en', clipboard: { async writeText(value) { copied = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:mock'; }, revokeObjectURL() {} };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, {
    document, navigator, localStorage, Blob: BlobStub, URL,
    setTimeout() { return 1; }, clearTimeout() {}
  });
  events.get('document:DOMContentLoaded')();
  return { get, downloads, copied: () => copied };
}

test('editing any selected requirement discards obsolete recommendations and clipboard content', async () => {
  const { get, copied, downloads } = harness();
  await get('btnQuickStart').emit('click');
  assert.equal(get('reqUpload').checked, true);
  assert.equal(get('btnCopyResults').disabled, false);
  await get('btnCopyMemo').emit('click');
  assert.match(copied(), /File upload/);
  const oldCopy = copied();

  get('reqPayments').checked = true;
  await get('reqPayments').emit('change');
  assert.equal(get('btnCopyMemo').disabled, true);
  assert.equal(get('memoOutput').textContent, '-');
  await get('btnCopyMemo').emit('click');
  await get('btnSaveMd').emit('click');
  assert.equal(copied(), oldCopy);
  assert.equal(downloads.length, 0);

  await get('btnSelect').emit('click');
  await get('btnSaveMd').emit('click');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].content, /Payments\/Billing/);
  assert.match(downloads[0].name, /\.md$/);
});

test('eventless checkbox edits cannot export stale files; clearing all selections blocks output', async () => {
  const { get, downloads } = harness();
  get('reqUpload').checked = true;
  await get('btnSelect').emit('click');
  get('reqPrivacy').checked = true;
  await get('btnSaveTxt').emit('click');
  assert.equal(downloads.length, 0);
  assert.equal(get('btnCopyResults').disabled, true);
  await get('btnSelect').emit('click');
  await get('btnSaveTxt').emit('click');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].content, /Privacy-first/);
  for (const id of ['reqUpload','reqPayments','reqNotify','reqMulti','reqFree','reqPrivacy']) get(id).checked = false;
  await get('btnSelect').emit('click');
  assert.equal(get('btnSaveMd').disabled, true);
  await get('btnSaveMd').emit('click');
  assert.equal(downloads.length, 1);
});
