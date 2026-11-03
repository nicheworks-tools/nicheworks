const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function harness(language = 'en') {
  const elements = new Map();
  const handlers = new Map();
  let selectedText = '';
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag;
      this.children = [];
      this.listeners = new Map();
      this.dataset = {};
      this.style = {};
      this.value = '';
      this.hidden = false;
      this._text = '';
      this.classes = new Set();
      this.classList = {
        add: (name) => this.classes.add(name),
        remove: (name) => this.classes.delete(name),
        toggle: (name, force) => {
          if (force === undefined ? !this.classes.has(name) : force) this.classes.add(name);
          else this.classes.delete(name);
        },
        contains: (name) => this.classes.has(name)
      };
    }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text; }
    append(...items) { this.children.push(...items); }
    appendChild(item) { this.children.push(item); return item; }
    addEventListener(name, handler) {
      const list = this.listeners.get(name) || [];
      list.push(handler);
      this.listeners.set(name, list);
    }
    async emit(name, event = {}) {
      for (const handler of this.listeners.get(name) || []) await handler(event);
    }
    setAttribute(name, value) { this[name] = value; }
    focus() {}
    select() { selectedText = this.value; }
    remove() {}
    click() { return this.emit('click', { target: this }); }
  }
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const document = {
    documentElement: { lang: language, dataset: { proActive: 'false' } },
    body: new Element('body'),
    createElement: (tag) => new Element(tag),
    getElementById: element,
    addEventListener(name, cb) { handlers.set(name, cb); },
    execCommand(name) { return name === 'copy'; }
  };
  const window = { addEventListener() {}, aiiaToast: null };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const navigator = {};
  const fetch = async () => ({
    json: async () => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'patterns.json'), 'utf8'))
  });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, window, localStorage, navigator, fetch, Blob, URL,
    clearTimeout() {}, setTimeout() { return 1; }
  });
  await handlers.get('DOMContentLoaded')();
  return { element, document, getSelectedText: () => selectedText };
}

test('search only matches actual pattern metadata, including JA labels', async () => {
  const { element } = await harness();
  const search = element('atlas-search');
  search.value = 'citation';
  await search.emit('input', { target: search });
  assert.match(element('result-count').textContent, /^1 /);
  assert.equal(element('pattern-list').children.length, 1);
  search.value = 'nonsense-not-a-pattern';
  await search.emit('input', { target: search });
  assert.match(element('result-count').textContent, /^0 /);

  const ja = await harness('ja');
  const searchJa = ja.element('atlas-search');
  searchJa.value = 'プロンプト欄';
  await searchJa.emit('input', { target: searchJa });
  assert.match(ja.element('result-count').textContent, /^1 /);
});

test('fallback copies a prompt without Clipboard API and keyboard actions do not open detail', async () => {
  const { element, getSelectedText } = await harness();
  const list = element('pattern-list');
  assert.ok(list.children.length > 0);
  const card = list.children[0];
  const buttons = card.children.find((child) => child.className === 'actions').children;
  assert.equal(element('detail-panel').classList.contains('is-open'), false);

  await card.emit('keydown', { key: 'Enter', target: buttons[3], preventDefault() {} });
  assert.equal(element('detail-panel').classList.contains('is-open'), false);
  await buttons[3].emit('click', { target: buttons[3] });
  assert.match(getSelectedText(), /Design a Prompt Box pattern/);
  assert.equal(element('toast').hidden, false);

  let prevented = false;
  await card.emit('keydown', { key: 'Enter', target: card, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(element('detail-panel').classList.contains('is-open'), true);
});
