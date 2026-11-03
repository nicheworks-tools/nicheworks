const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const registry = new Map();
  const events = new Map();
  const downloads = [];
  let copied = '';
  const register = (node, id) => { if (id) registry.set(id, node); };
  class Node {
    constructor(tag = 'div') {
      this.tagName = tag;
      this.value = '';
      this.checked = false;
      this._textContent = '';
      this.children = [];
      this.dataset = {};
      this.style = {};
      this.classList = { add() {}, remove() {}, toggle() {} };
      this.handlers = {};
    }
    set id(value) { this._id = value; register(this, value); }
    get id() { return this._id; }
    set textContent(value) { this._textContent = String(value); this.children = []; }
    get textContent() { return this._textContent; }
    append(...nodes) { this.children.push(...nodes); }
    appendChild(node) { this.children.push(node); return node; }
    replaceChildren(...nodes) { this.children = [...nodes]; }
    querySelector(selector) { return document.querySelector(selector); }
    addEventListener(name, fn) {
      this.handlers[name] ||= [];
      this.handlers[name].push(fn);
    }
    async fire(name, event = {}) {
      for (const fn of this.handlers[name] || []) await fn(event);
    }
    setAttribute(name, value) { this[name] = value; }
    select() { copied = this.value; }
    focus() {}
    remove() {}
    click() { if (this.tagName === 'a') downloads.push({ filename: this.download, blob: lastBlob }); }
  }
  let lastBlob;
  const get = (id) => {
    if (!registry.has(id)) { const node = new Node(); node.id = id; }
    return registry.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' },
    body: new Node('body'),
    createElement: tag => new Node(tag),
    createDocumentFragment: () => new Node('fragment'),
    querySelector(selector) { return selector.startsWith('#') ? get(selector.slice(1)) : null; },
    querySelectorAll() { return []; },
    addEventListener(name, fn) { events.set(name, fn); },
    execCommand(name) { return name === 'copy'; }
  };
  class BlobStub {
    constructor(parts, opts) { this.parts = parts; this.opts = opts; lastBlob = this; }
    async text() { return this.parts.join(''); }
  }
  const URL = { createObjectURL() { return 'blob:local'; }, revokeObjectURL() {} };
  const navigator = { clipboard: { async writeText(value) { copied = value; } } };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const match = html.match(/<script>\s*(\(\(\) => \{[\s\S]+?\}\)\(\);)\s*<\/script>\s*<\/body>/);
  assert.ok(match, 'inline production script must be found');
  vm.runInNewContext(match[1], {
    document, navigator, localStorage, URL, Blob: BlobStub,
    clearTimeout() {}, setTimeout() { return 1; }, Date
  });
  get('presetSelect').value = 'seo';
  events.get('DOMContentLoaded')();
  return { get, downloads, getCopied: () => copied };
}

test('editing KPIs or notes clears the generated draft and blocks stale downloads', async () => {
  const { get, downloads, getCopied } = harness();
  await get('exampleOnly').fire('click');
  assert.match(get('logOutput').textContent, /サンプル成長ログ/);
  get('notesInput').value = 'secret revised notes';
  await get('toolRoot').fire('input', { target: get('notesInput') });
  assert.doesNotMatch(get('logOutput').textContent, /サンプル成長ログ/);
  await get('downloadLogMd').fire('click');
  await get('copyLog').fire('click');
  assert.equal(downloads.length, 0);
  assert.equal(getCopied(), '');

  await get('exampleOnly').fire('click');
  assert.match(get('logOutput').textContent, /サンプル成長ログ/);
  get('field-pv').value = '99999';
  await get('toolRoot').fire('change', { target: get('field-pv') });
  assert.doesNotMatch(get('logOutput').textContent, /サンプル成長ログ/);
});

test('copy and Markdown/TXT exports refuse changes even when input events do not fire', async () => {
  const { get, downloads, getCopied } = harness();
  await get('exampleOnly').fire('click');
  get('hypothesisInput').value = 'unsent changed hypothesis';
  await get('copyLog').fire('click');
  await get('downloadLogTxt').fire('click');
  assert.equal(getCopied(), '');
  assert.equal(downloads.length, 0);

  await get('exampleOnly').fire('click');
  await get('downloadLogMd').fire('click');
  await get('downloadLogTxt').fire('click');
  assert.equal(downloads.length, 2);
  assert.match(downloads[0].filename, /\.md$/);
  assert.match(downloads[1].filename, /\.txt$/);
  await get('copyLog').fire('click');
  assert.match(getCopied(), /サンプル成長ログ/);
});
