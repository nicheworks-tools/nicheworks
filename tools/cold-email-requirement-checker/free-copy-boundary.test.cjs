const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map();
  const events = new Map();
  let copied = '';
  class Node {
    constructor() {
      this._text = '';
      this.children = [];
      this.value = '';
      this.style = {};
      this.dataset = {};
      this.className = '';
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text; }
    set innerHTML(_value) { this._text = ''; this.children = []; }
    get innerHTML() { return ''; }
    append(...children) { this.children.push(...children); }
    appendChild(node) { this.children.push(node); }
    querySelector(selector) {
      if (selector.startsWith('#')) return get(selector.slice(1));
      return this.children.find(node => node.className.split(' ').includes(selector.slice(1))) || null;
    }
    querySelectorAll(selector) {
      if (selector === '.preset-btn') return [];
      return this.children.filter(node => node.className.split(' ').includes(selector.slice(1)));
    }
    addEventListener(name, fn) { events.set(this._id + ':' + name, fn); }
    async emit(name) { await events.get(this._id + ':' + name)?.(); }
    setAttribute() {}
  }
  const get = (id) => {
    if (!nodes.has(id)) {
      const el = new Node();
      el._id = id;
      nodes.set(id, el);
    }
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: get,
    createElement: () => new Node(),
    querySelectorAll() { return []; },
    addEventListener(name, fn) {
      if (!events.has('document:' + name)) events.set('document:' + name, []);
      events.get('document:' + name).push(fn);
    },
    body: { appendChild() {}, removeChild() {} }
  };
  const navigator = { language: 'en', clipboard: { async writeText(value) { copied = value; } } };
  const window = {};
  const localStorage = { getItem() { return null; }, setItem() {} };
  const timers = [];
  const setTimeout = fn => { timers.push(fn); return timers.length; };
  const clearTimeout = () => {};
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, { document, navigator, window, localStorage, setTimeout, clearTimeout });
  for (const callback of events.get('document:DOMContentLoaded') || []) callback();
  return { get, copied: () => copied };
}

test('Free copied review includes checklist but not score or paid improvement suggestions', async () => {
  const { get, copied } = harness();
  get('emailSubject').value = 'Question about your product';
  get('emailText').value = 'Hello, I am Sam at Company. I saw your product and would you be open to a call? Regards, Sam (sam@example.com).';
  await get('checkBtn').emit('click');
  await get('copyBtn').emit('click');
  assert.match(copied(), /Cold Email Requirement Checker review/);
  assert.match(copied(), /Greeting:/);
  assert.match(copied(), /Opt-out \/ not relevant path:/);
  assert.match(copied(), /does not guarantee legal compliance/);
  assert.doesNotMatch(copied(), /Structure score|\/100/);
  assert.doesNotMatch(copied(), /Example:|Review needed:|Improvement candidate/);
});

test('copy rechecks latest subject/body before debounced analysis completes', async () => {
  const { get, copied } = harness();
  get('emailText').value = 'Hello, I am Sam at Company. I saw your product. Would you be open to a call? Regards, Sam.';
  await get('checkBtn').emit('click');
  await get('copyBtn').emit('click');
  assert.match(copied(), /Overly promotional wording: OK/);
  get('emailText').value += '\nAct now, guaranteed success!';
  await get('emailText').emit('input');
  await get('copyBtn').emit('click');
  assert.match(copied(), /Overly promotional wording: Review/);
  assert.doesNotMatch(copied(), /Structure score|\/100/);
});
