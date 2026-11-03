const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const INPUT_IDS = [
  'projectName', 'summary', 'supporters', 'whySupport', 'fundUse',
  'offeredBenefits', 'cannotProvide', 'tierCount', 'priceInput',
  'corpSupport', 'contact', 'logoPolicy', 'refundPolicy'
];

function harness() {
  const nodes = new Map(), events = new Map(), downloads = [];
  let copied = '', blob;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', style: {}, dataset: {},
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(name, fn) { events.set(id + ':' + name, fn); },
      async emit(name) { await events.get(id + ':' + name)?.(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: get, querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement(tag) { return {
      value: '', style: {}, select() {}, remove() {},
      click() { if (tag === 'a') downloads.push({ name: this.download, text: blob.parts.join('') }); }
    }; }
  };
  const navigator = { language: 'en', clipboard: { async writeText(value) { copied = value; } } };
  const window = { clearTimeout() {}, setTimeout() { return 1; } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} };
  const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(code, { document, window, navigator, localStorage, Blob: BlobStub, URL, setTimeout() { return 1; } });
  events.get('document:DOMContentLoaded')();
  return { get, downloads, copied: () => copied };
}

test('new pricing never uses old sponsor tiers in copy/download', async () => {
  const { get, downloads, copied } = harness();
  get('projectName').value = 'Project Alpha';
  get('priceInput').value = '¥500\n¥1500';
  get('tierCount').value = '2';
  get('refundPolicy').value = 'Cancel anytime';
  await get('generateBtn').emit('click');
  assert.match(get('outputEn').textContent, /¥500/);
  await get('copyBtn').emit('click');
  assert.match(copied(), /¥500/);

  get('priceInput').value = '¥900\n¥2000';
  await get('priceInput').emit('input');
  assert.equal(get('outputEn').textContent, 'Enter details, then generate copy.');
  const oldCopy = copied();
  await get('copyBtn').emit('click');
  await get('downloadBtn').emit('click');
  assert.equal(copied(), oldCopy);
  assert.equal(downloads.length, 0);

  await get('generateBtn').emit('click');
  await get('downloadBtn').emit('click');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].text, /¥900/);
  assert.doesNotMatch(downloads[0].text, /¥500/);
  assert.match(downloads[0].name, /sponsor-page-en\.txt/);
});

test('all sponsor fields invalidate; eventless refund edits are rejected', async () => {
  const { get, downloads } = harness();
  get('tierCount').value = '1';
  for (const id of INPUT_IDS) {
    await get('generateBtn').emit('click');
    assert.match(get('outputEn').textContent, /\[Project Summary\]/);
    get(id).value = (get(id).value || 'a') + 'b';
    await get(id).emit('change');
    assert.equal(get('outputEn').textContent, 'Enter details, then generate copy.');
  }
  get('tierCount').value = '2';
  await get('generateBtn').emit('click');
  get('refundPolicy').value = 'Changed without event';
  await get('downloadBtn').emit('click');
  assert.equal(downloads.length, 0);
  assert.equal(get('outputEn').textContent, 'Enter details, then generate copy.');
});
