const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), requests = [];
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', alt: '', hidden: true, disabled: false,
      dataset: {}, style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, fn) { events.set(id + ':' + name, fn); },
      async emit(name, e = {}) { await events.get(id + ':' + name)?.(e); },
      hasAttribute(name) { return name === 'hidden' && this.hidden; },
      removeAttribute(name) { if (name === 'src') this.src = ''; },
      scrollIntoView() {}, focus() {}
    });
    return nodes.get(id);
  };
  const document = {
    body: { classList: { add() {}, remove() {} } },
    getElementById: get,
    querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set('document:' + name, fn); }
  };
  class AbortControllerStub {
    constructor() { this.signal = { aborted: false }; }
    abort() { this.signal.aborted = true; }
  }
  class URLStub {
    constructor(value) {
      if (!/^https?:\/\/[^/\s]+/i.test(value)) throw new Error('Invalid URL');
      this.protocol = value.match(/^([a-z]+):/i)[1].toLowerCase() + ':';
    }
  }
  class DOMParserStub { parseFromString() { throw new Error('use regex path'); } }
  const fetch = (url, options) => new Promise((resolve, reject) => {
    requests.push({ url, options, resolve, reject });
  });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, fetch, URL: URLStub, AbortController: AbortControllerStub, DOMParser: DOMParserStub
  });
  events.get('document:DOMContentLoaded')();
  const respond = (i, title) => requests[i].resolve({
    ok: true,
    text: async () => '<html><head><title>' + title + '</title><meta name="description" content="Desc ' + title + '"></head></html>'
  });
  return { get, requests, respond };
}

test('reset cancels in-flight Worker request and prevents stale result/fallback', async () => {
  const h = harness();
  h.get('url-input').value = 'https://one.example';
  const request = h.get('analyze-btn').emit('click');
  assert.equal(h.requests.length, 1);
  assert.match(h.requests[0].url, /curly-meadow/);
  assert.equal(h.requests[0].options.signal.aborted, false);
  await h.get('reset-btn').emit('click');
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.respond(0, 'Old Title');
  await request;
  assert.equal(h.requests.length, 1);
  assert.equal(h.get('url-input').value, '');
  assert.equal(h.get('result-card').hidden, true);
  assert.equal(h.get('res-title').textContent, '');
  assert.equal(h.get('error-text').textContent, '');
});

test('late old request cannot override a newer successful analysis or its loading spinner', async () => {
  const h = harness();
  h.get('url-input').value = 'https://old.example';
  const first = h.get('analyze-btn').emit('click');
  await h.get('reset-btn').emit('click');
  h.get('url-input').value = 'https://new.example';
  const second = h.get('analyze-btn').emit('click');
  assert.equal(h.requests.length, 2);
  h.respond(0, 'Obsolete');
  await first;
  assert.equal(h.get('progress').hidden, false);
  assert.equal(h.get('result-card').hidden, true);
  h.respond(1, 'Latest');
  await second;
  assert.equal(h.get('progress').hidden, true);
  assert.equal(h.get('result-card').hidden, false);
  assert.equal(h.get('res-title').textContent, 'Latest');
  h.get('url-input').value = 'file:///etc/passwd';
  await h.get('analyze-btn').emit('click');
  assert.equal(h.get('result-card').hidden, true);
  assert.equal(h.get('res-title').textContent, '');
  assert.equal(h.requests.length, 2);
});

test('failed Worker request still permits normal AllOrigins fallback', async () => {
  const h = harness();
  h.get('url-input').value = 'https://fallback.example';
  const pending = h.get('analyze-btn').emit('click');
  h.requests[0].resolve({ ok: false, text: async () => '' });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.requests.length, 2);
  assert.match(h.requests[1].url, /api\.allorigins\.win/);
  h.respond(1, 'Fallback');
  await pending;
  assert.equal(h.get('res-title').textContent, 'Fallback');
});
