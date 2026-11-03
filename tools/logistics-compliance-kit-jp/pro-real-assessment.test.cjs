const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(pro = true) {
  const nodes = new Map(), events = new Map(), downloads = [], alerts = [];
  let copied = '', blob;
  class Node {
    constructor() {
      this.value = ''; this.textContent = ''; this.innerHTML = '';
      this.className = ''; this.style = {}; this.dataset = {};
      this.children = []; this.hidden = false;
    }
    get firstChild() { return this.children[0] || null; }
    appendChild(node) { this.children.push(node); return node; }
    removeChild(node) { this.children = this.children.filter(x => x !== node); }
    remove() {}
    setAttribute() {}
    select() {}
    addEventListener(event, fn) { events.set(this._id + ':' + event, fn); }
    async emit(event) { await events.get(this._id + ':' + event)?.(); }
    click() { if (this.tag === 'a') downloads.push({ name: this.download, body: blob.parts.join('') }); }
  }
  const get = id => {
    if (!nodes.has(id)) {
      const node = new Node();
      node._id = id;
      nodes.set(id, node);
    }
    return nodes.get(id);
  };
  for (const id of ['is_shipper','has_outsourcing','has_waiting','has_strict_window','has_low_visibility','has_congestion']) get(id).value = 'unknown';
  const document = {
    documentElement: { lang: 'ja', dataset: { proActive: pro ? 'true' : 'false' } },
    getElementById: get,
    body: { appendChild() {} },
    createElement(tag) { const node = new Node(); node.tag = tag; return node; },
    createTextNode(text) { const node = new Node(); node.textContent = text; return node; }
  };
  const window = { addEventListener() {} };
  const navigator = { clipboard: { writeText(v) { copied = v; return Promise.resolve(); } } };
  class BlobStub { constructor(parts) { this.parts = parts; blob = this; } }
  const URL = { createObjectURL() { return 'blob:local'; }, revokeObjectURL() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, window, navigator, Blob: BlobStub, URL, Date,
    alert(v) { alerts.push(v); },
    setTimeout() { return 1; }, clearTimeout() {},
    fetch() { return Promise.resolve({ ok: true, json: async () => [] }); }
  });
  return { get, document, downloads, copied: () => copied, alerts };
}

test('Pro JSON before Generate uses actual unknown form, never demo waiting/congestion data', async () => {
  const h = harness();
  await h.get('btn-export-json').emit('click');
  assert.equal(h.downloads.length, 1);
  const payload = JSON.parse(h.downloads[0].body);
  assert.equal(payload.assessment.level, '不明');
  assert.doesNotMatch(payload.assessment.why.join(' '), /荷待ち/);
  assert.match(payload.assessment.markdown, /判定（目安）: 不明/);
  assert.match(h.get('md-preview').value, /判定（目安）: 不明/);
  assert.match(payload.proOutputs.internal, /不明/);
  assert.doesNotMatch(payload.proOutputs.internal, /納品時間帯の厳しさ/);
});

test('input edits invalidate previews; Pro copy/JSON contain only latest assessed conditions', async () => {
  const h = harness();
  h.get('has_waiting').value = 'yes';
  h.get('memo').value = 'OLD MEMO';
  await h.get('btn-generate').emit('click');
  assert.match(h.get('md-preview').value, /OLD MEMO/);
  h.get('has_waiting').value = 'no';
  h.get('memo').value = 'NEW MEMO';
  await h.get('memo').emit('input');
  assert.equal(h.get('md-preview').value, '');
  await h.get('btn-copy-internal').emit('click');
  assert.match(h.copied(), /NEW MEMO/);
  assert.doesNotMatch(h.copied(), /OLD MEMO/);
  assert.doesNotMatch(h.copied(), /荷待ち/);
  await h.get('btn-export-json').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.equal(JSON.parse(h.downloads[0].body).assessment.memo, 'NEW MEMO');
});

test('eventless edits still regenerate Markdown and entitlement gate remains closed when inactive', async () => {
  const h = harness();
  h.get('has_congestion').value = 'yes';
  await h.get('btn-generate').emit('click');
  h.get('has_congestion').value = 'no';
  h.get('memo').value = 'changed without event';
  await h.get('btn-save-markdown').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.match(h.downloads[0].body, /changed without event/);
  assert.doesNotMatch(h.downloads[0].body, /混雑\/詰まり/);

  h.document.documentElement.dataset.proActive = 'false';
  const previousCopy = h.copied();
  await h.get('btn-copy-vendor').emit('click');
  await h.get('btn-export-json').emit('click');
  assert.equal(h.copied(), previousCopy);
  assert.equal(h.downloads.length, 1);
  assert.ok(h.alerts.length >= 2);
});
