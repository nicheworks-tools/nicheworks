const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  const nodes = new Map(), events = new Map(), storage = new Map();
  let printed = 0;
  class Node {
    constructor(id) {
      this.id = id; this.value = ''; this.textContent = '';
      this.hidden = true; this.checked = false;
      this.children = []; this.dataset = {}; this.style = {};
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    get firstChild() { return this.children[0] || null; }
    addEventListener(event, fn) { events.set(this.id + ':' + event, fn); }
    emit(event) { return events.get(this.id + ':' + event)?.(); }
    appendChild(child) { this.children.push(child); }
    removeChild(child) { this.children = this.children.filter(x => x !== child); }
    getAttribute() { return null; }
  }
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, new Node(id));
    return nodes.get(id);
  };
  get('household').value = 'solo';
  get('homeType').value = 'rental';
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    querySelectorAll() { return []; },
    createElement(tag) { return new Node(tag + '-' + nodes.size); }
  };
  const localStorage = {
    getItem(k) { return storage.get(k) || null; },
    setItem(k,v) { storage.set(k,String(v)); },
    removeItem(k) { storage.delete(k); },
    key(i) { return [...storage.keys()][i]; },
    get length() { return storage.size; }
  };
  const window = { print() { printed++; }, setTimeout() { return 1; }, clearTimeout() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, navigator: { language: 'ja' }, window, localStorage, Date,
    setTimeout() { return 1; }, clearTimeout() {}
  });
  return { get, storage, printCount: () => printed };
}

test('changing move date immediately clears old tasks and prevents printing stale checklist', () => {
  const h = harness();
  h.get('moveDate').value = '2026-11-20';
  h.get('btnGenerate').emit('click');
  assert.ok(h.get('checklist').children.length > 0);
  h.get('btnPrint').emit('click');
  assert.equal(h.printCount(), 1);
  h.get('moveDate').value = '2026-12-20';
  h.get('moveDate').emit('change');
  assert.equal(h.get('checklist').children.length, 0);
  assert.equal(h.get('progressSummary').hidden, true);
  h.get('btnPrint').emit('click');
  assert.equal(h.printCount(), 1);
  h.get('btnGenerate').emit('click');
  h.get('btnPrint').emit('click');
  assert.equal(h.printCount(), 2);
  assert.match(h.get('printMeta').textContent, /2026-12-20/);
});

test('household and home conditions invalidate old output, while print-only memo updates locally', () => {
  const h = harness();
  h.get('moveDate').value = '2026-11-20';
  h.get('btnGenerate').emit('click');
  h.get('printNote').value = 'Unit 12B';
  h.get('printNote').emit('input');
  assert.match(h.get('printMeta').textContent, /Unit 12B/);
  assert.ok(h.get('checklist').children.length > 0);
  const count = h.printCount();
  h.get('household').value = 'family';
  h.get('household').emit('change');
  assert.equal(h.get('checklist').children.length, 0);
  h.get('btnPrint').emit('click');
  assert.equal(h.printCount(), count);
  h.get('btnGenerate').emit('click');
  assert.ok(h.get('checklist').children.length > 0);
  h.get('homeType').value = 'owned';
  h.get('homeType').emit('input');
  assert.equal(h.get('checklist').children.length, 0);
});

test('invalid calendar days never generate a checklist or allow print', () => {
  const h = harness();
  for (const d of ['2026-02-30', '2026-04-31', '2026-13-01', 'not-a-date']) {
    h.get('moveDate').value = d;
    h.get('btnGenerate').emit('click');
    assert.equal(h.get('checklist').children.length, 0, d);
    h.get('btnPrint').emit('click');
    assert.equal(h.printCount(), 0, d);
  }
  h.get('moveDate').value = '2024-02-29';
  h.get('btnGenerate').emit('click');
  assert.ok(h.get('checklist').children.length > 0);
});
