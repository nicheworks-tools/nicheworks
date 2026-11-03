const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), callbacks = new Map(), requests = [];
  class Node {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.textContent = '';
      this.innerHTML = '';
      this.style = {};
      this.disabled = false;
      this.classList = {
        values: new Set(['hidden']),
        add(name) { this.values.add(name); },
        remove(name) { this.values.delete(name); },
        contains(name) { return this.values.has(name); }
      };
    }
    addEventListener(event, fn) { callbacks.set(this.id + ':' + event, fn); }
    async emit(event) { await callbacks.get(this.id + ':' + event)?.(); }
    querySelectorAll() { return []; }
  }
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, new Node(id));
    return nodes.get(id);
  };
  const document = { getElementById: get };
  const alerts = [];
  const fetch = (url, options) => new Promise((resolve, reject) => {
    requests.push({ url, options, resolve, reject });
  });
  class AbortControllerStub {
    constructor() { this.signal = { aborted: false }; }
    abort() { this.signal.aborted = true; }
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, fetch, AbortController: AbortControllerStub,
    navigator: { clipboard: { writeText: async () => {} } },
    alert(s) { alerts.push(s); }
  });
  const finish = (index, title, ok = true) => requests[index].resolve({
    ok, text: async () => '<html><head><title>' + title + '</title></head></html>'
  });
  return { get, requests, alerts, finish };
}

test('Reset cancels current fetch before other URLs are sent and never restores old results', async () => {
  const h = harness();
  h.get('urlInput').value = 'https://one.test\nhttps://two.test';
  const pending = h.get('fetchBtn').emit('click');
  assert.equal(h.get('fetchBtn').disabled, true);
  assert.equal(h.requests.length, 1);
  assert.match(h.requests[0].url, /floral-voice/);
  await h.get('resetBtn').emit('click');
  assert.equal(h.requests[0].options.signal.aborted, true);
  assert.equal(h.get('urlInput').value, '');
  assert.equal(h.get('fetchBtn').disabled, false);
  h.finish(0, 'Old');
  await pending;
  assert.equal(h.requests.length, 1);
  assert.equal(h.get('results').innerHTML, '');
  assert.equal(h.get('exportArea').classList.contains('hidden'), true);
  assert.equal(h.get('progressBar').style.width, '0%');
});

test('editing URL list stops the old batch; a new sequential batch exports only fresh results', async () => {
  const h = harness();
  h.get('urlInput').value = 'https://old.test\nhttps://obsolete.test';
  const old = h.get('fetchBtn').emit('click');
  h.get('urlInput').value = 'https://fresh1.test\nhttps://fresh2.test';
  await h.get('urlInput').emit('input');
  const next = h.get('fetchBtn').emit('click');
  assert.equal(h.requests[0].options.signal.aborted, true);
  assert.equal(h.requests.length, 2);
  h.finish(0, 'Obsolete');
  await old;
  assert.equal(h.get('exportArea').classList.contains('hidden'), true);
  h.finish(1, 'New One');
  for (let i=0; i<8 && h.requests.length<3; i++) await Promise.resolve();
  assert.equal(h.requests.length, 3);
  assert.match(h.requests[2].url, /fresh2/);
  h.finish(2, 'New Two');
  await next;
  assert.equal(h.get('fetchBtn').disabled, false);
  assert.equal(h.get('progressBar').style.width, '100%');
  assert.equal(h.get('countTotal').textContent, '合計: 2');
  assert.equal(h.get('countSuccess').textContent, '成功: 2');
  assert.match(h.get('results').innerHTML, /New One/);
  assert.match(h.get('results').innerHTML, /New Two/);
  assert.doesNotMatch(h.get('results').innerHTML, /Obsolete/);
  assert.equal(h.get('exportArea').classList.contains('hidden'), false);
});

test('non-2xx title extraction and network failures retain distinct status values', async () => {
  const h = harness();
  h.get('urlInput').value = 'https://error.test\nhttps://down.test';
  const pending = h.get('fetchBtn').emit('click');
  h.finish(0, 'Error Page', false);
  for (let i=0; i<8 && h.requests.length<2; i++) await Promise.resolve();
  assert.equal(h.requests.length, 2);
  h.requests[1].reject(new Error('Network down'));
  await pending;
  assert.match(h.get('results').innerHTML, /http-error/);
  assert.match(h.get('results').innerHTML, /network-error/);
  assert.equal(h.get('countFail').textContent, '失敗: 2');
});
