const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), timers = [], downloads = [];
  let copied = '', blob;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
      style: {}, dataset: {}, children: [],
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, getAttribute() { return ''; },
      addEventListener(event, fn) { events.set(id + ':' + event, fn); },
      async emit(event) { await events.get(id + ':' + event)?.(); },
      appendChild(node) { this.children.push(node); },
      append(...items) { this.children.push(...items); }
    });
    return nodes.get(id);
  };
  get('modeSafe').dataset.mode = 'safe';
  get('modeKeep').dataset.mode = 'keep';
  get('modeClean').dataset.mode = 'clean';
  const document = {
    readyState: 'loading',
    documentElement: { lang: 'en', dataset: { proActive: 'false' } },
    getElementById: get,
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener(name, fn) { events.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement(tag) {
      return {
        className: '', textContent: '', value: '', style: {}, children: [],
        append(...items) { this.children.push(...items); },
        appendChild(node) { this.children.push(node); },
        setAttribute() {}, select() {}, remove() {},
        click() { if (tag === 'a') downloads.push({ filename: this.download, text: blob.parts.join('') }); }
      };
    }
  };
  const navigator = { language: 'en', clipboard: { async writeText(value) { copied = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const window = {
    localStorage, addEventListener() {},
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; }
  };
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:mock'; }, revokeObjectURL() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, window, navigator, Blob: BlobStub, URL,
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; },
    clearTimeout() {}, Date
  });
  events.get('document:DOMContentLoaded')();
  function flushProcess() {
    for (const item of timers.filter(x => x.ms === 60)) item.fn();
    for (let i = timers.length - 1; i >= 0; i -= 1) if (timers[i].ms === 60) timers.splice(i, 1);
  }
  return { get, copied: () => copied, downloads, flushProcess };
}

test('editing input cancels delayed old generation and only allows fresh TXT/copy', async () => {
  const h = harness();
  h.get('inputText').value = 'Old application line';
  await h.get('processBtn').emit('click');
  h.get('inputText').value = 'New application line';
  await h.get('inputText').emit('input');
  h.flushProcess();
  assert.equal(h.get('outputText').value, '');
  assert.equal(h.get('progressWrap').hidden, true);
  await h.get('copyBtn').emit('click');
  assert.equal(h.copied(), '');

  await h.get('processBtn').emit('click');
  h.flushProcess();
  assert.match(h.get('outputText').value, /New application line/);
  await h.get('copyBtn').emit('click');
  assert.match(h.copied(), /New application line/);
  await h.get('downloadBtn').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.match(h.downloads[0].text, /New application line/);
  assert.doesNotMatch(h.downloads[0].text, /Old application line/);
});

test('eventless edits, mode switches and reset never copy stale ATS text', async () => {
  const h = harness();
  h.get('inputText').value = 'This has   multiple spaces';
  await h.get('processBtn').emit('click');
  h.flushProcess();
  assert.ok(h.get('outputText').value);
  h.get('inputText').value = 'Silently changed without input event';
  await h.get('downloadBtn').emit('click');
  assert.equal(h.downloads.length, 0);
  assert.equal(h.get('outputText').value, '');

  await h.get('processBtn').emit('click');
  h.flushProcess();
  await h.get('modeKeep').emit('click');
  assert.equal(h.get('outputText').value, '');
  await h.get('copyBtn').emit('click');
  assert.equal(h.copied(), '');

  await h.get('processBtn').emit('click');
  await h.get('resetBtn').emit('click');
  h.flushProcess();
  assert.equal(h.get('inputText').value, '');
  assert.equal(h.get('outputText').value, '');
  assert.equal(h.downloads.length, 0);
});
