const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map();
  const events = new Map();
  const timers = [];
  const downloads = [];
  let clipboard = '';
  let lastBlob;
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', dataset: {}, style: {}, children: [],
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(name, handler) { events.set(id + ':' + name, handler); },
      async emit(name) { return events.get(id + ':' + name)?.(); },
      querySelectorAll() { return []; },
      appendChild(node) { this.children.push(node); },
      get firstChild() { return this.children[0]; },
      removeChild(node) { this.children = this.children.filter(x => x !== node); },
      getAttribute() { return null; }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: get,
    querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {}, removeChild() {} },
    createElement(tag) {
      return {
        textContent: '', style: {}, dataset: {},
        select() { clipboard = this.value; },
        remove() {},
        click() { if (tag === 'a') downloads.push({ filename: this.download, text: lastBlob.parts.join('') }); }
      };
    },
    execCommand(name) { return name === 'copy'; }
  };
  class BlobStub { constructor(parts) { this.parts = parts; lastBlob = this; } }
  class MutationObserverStub { observe() {} }
  const navigator = { language: 'en', clipboard: { async writeText(value) { clipboard = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const URL = { createObjectURL() { return 'blob:local'; }, revokeObjectURL() {} };
  const setTimeout = fn => { timers.push(fn); return timers.length; };
  const clearTimeout = () => {};
  get('outputTier').value = 'standard';
  const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(code, {
    document, navigator, localStorage, Blob: BlobStub, URL,
    setTimeout, clearTimeout, MutationObserver: MutationObserverStub
  });
  events.get('document:DOMContentLoaded')();
  const required = ['projectType','purpose','deliverables','deadline','budget'];
  for (const id of required) get(id).value = id + '-v1';
  function flush() {
    for (const fn of timers.splice(0)) fn();
  }
  return { get, flush, downloads, clipboard: () => clipboard };
}

test('stale design brief is cleared before debounce and refreshed after valid edits', async () => {
  const { get, flush, downloads, clipboard } = harness();
  await get('btnBuild').emit('click');
  assert.match(get('outputEn').textContent, /budget-v1/);
  get('budget').value = 'budget-v2';
  await get('budget').emit('input');
  assert.doesNotMatch(get('outputEn').textContent, /budget-v1/);
  await get('btnDownloadEn').emit('click');
  assert.equal(downloads.length, 0);
  await get('btnCopyEnFull').emit('click');
  assert.equal(clipboard(), '');
  flush();
  assert.match(get('outputEn').textContent, /budget-v2/);
  await get('btnDownloadEn').emit('click');
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].text, /budget-v2/);
  assert.doesNotMatch(downloads[0].text, /budget-v1/);
});

test('invalid required fields and eventless output-tier edits cannot export prior briefs', async () => {
  const { get, flush, downloads, clipboard } = harness();
  await get('btnBuild').emit('click');
  get('outputTier').value = 'detailed';
  await get('btnCopyJaFull').emit('click');
  assert.equal(clipboard(), '');
  assert.doesNotMatch(get('outputJa').textContent, /projectType-v1/);
  await get('btnBuild').emit('click');
  assert.match(get('outputJa').textContent, /projectType-v1/);

  get('deadline').value = '';
  await get('deadline').emit('change');
  flush();
  assert.doesNotMatch(get('outputEn').textContent, /budget-v1/);
  await get('btnDownloadJa').emit('click');
  assert.equal(downloads.length, 0);
  get('deadline').value = 'deadline-v2';
  await get('deadline').emit('input');
  flush();
  assert.match(get('outputEn').textContent, /deadline-v2/);
});
