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
      value: '', textContent: '', hidden: false, style: {}, dataset: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, fn) { events.set(id + ':' + event, fn); },
      async emit(event) { await events.get(id + ':' + event)?.(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'en', dataset: { proActive: 'false' } },
    getElementById: get,
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement(tag) {
      return { style: {}, value: '', remove() {},
        click() { if (tag === 'a') downloads.push({ filename: this.download, text: blob.parts.join('') }); }
      };
    }
  };
  const navigator = { language: 'en', clipboard: { async writeText(text) { copied = text; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = {};
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:local'; }, revokeObjectURL() {} };
  get('packType').value = 'web';
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, navigator, localStorage, window, Blob: BlobStub, URL,
    setTimeout() { return 1; }, clearTimeout() {}, Date
  });
  events.get('document:DOMContentLoaded')();
  for (const id of ['workType','deliverables','deadline','budget','acceptanceMethod']) get(id).value = id + ' old';
  return { get, document, downloads, copied: () => copied };
}

test('Free spec and clipboard never use obsolete budget and deadline; missing fields clear old output', async () => {
  const { get, copied } = harness();
  await get('generateBtn').emit('click');
  assert.match(get('outputEn').textContent, /budget old/);
  get('budget').value = 'budget new';
  await get('budget').emit('input');
  assert.doesNotMatch(get('outputEn').textContent, /budget old/);
  await get('copyBtn').emit('click');
  assert.match(copied(), /budget new/);
  assert.doesNotMatch(copied(), /budget old/);

  get('deadline').value = 'deadline newer without event';
  await get('copyBtn').emit('click');
  assert.match(copied(), /deadline newer without event/);
  get('acceptanceMethod').value = '';
  await get('generateBtn').emit('click');
  assert.doesNotMatch(get('outputEn').textContent, /budget new/);
  const lastCopy = copied();
  await get('copyBtn').emit('click');
  assert.equal(copied(), lastCopy);
});

test('Pro copies rebuild stale cached packs while wrong entitlement stays locked', async () => {
  const { get, document, copied, downloads } = harness();
  document.documentElement.dataset.proActive = 'true';
  await get('handoffBtn').emit('click');
  await get('copyHandoffBtn').emit('click');
  assert.match(copied(), /budget old/);

  get('budget').value = 'budget new';
  await get('budget').emit('change');
  assert.doesNotMatch(get('proOutputEn').textContent, /budget old/);
  await get('copyHandoffBtn').emit('click');
  assert.match(copied(), /budget new/);
  assert.doesNotMatch(copied(), /budget old/);

  get('deadline').value = 'deadline latest';
  await get('copyHandoffBtn').emit('click');
  assert.match(copied(), /deadline latest/);
  document.documentElement.dataset.proActive = 'false';
  get('budget').value = 'restricted price';
  const lockedCopy = copied();
  await get('copyHandoffBtn').emit('click');
  await get('exportBtn').emit('click');
  assert.equal(copied(), lockedCopy);
  assert.equal(downloads.length, 0);
});
