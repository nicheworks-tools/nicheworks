const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function harness(scriptName) {
  const nodes = new Map(), events = new Map(), timers = [], cancelled = new Set(), storage = new Map();
  class Node {
    constructor(tag = 'div') {
      this.tag = tag; this.value = ''; this.textContent = ''; this.style = {};
      this.dataset = {}; this.children = []; this.options = this.children;
      this.checked = false;
      this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    }
    replaceChildren(...children) {
      this.children = children;
      this.options = this.children;
      if (this.tag === 'select') this.value = '';
    }
    appendChild(child) {
      this.children.push(child);
      if (this.tag === 'select' && this.children.length === 1) this.value = child.value;
    }
    addEventListener(name, fn) { events.set(this._id + ':' + name, fn); }
    emit(name) { return events.get(this._id + ':' + name)?.(); }
    setAttribute() {}
    getAttribute() { return null; }
    querySelector() { return null; }
  }
  const get = (id) => {
    if (!nodes.has(id)) {
      const node = new Node(['categorySelect','fromUnit','toUnit'].includes(id) ? 'select' : 'div');
      node._id = id;
      nodes.set(id, node);
    }
    return nodes.get(id);
  };
  get('categorySelect').value = 'length';
  get('inputValue').value = '2';
  get('autoCalc').checked = false;
  const document = {
    documentElement: { lang: 'en', classList: { toggle() {}, contains() { return false; } } },
    getElementById: get,
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement(tag) { return new Node(tag); },
    createDocumentFragment() { return new Node('fragment'); },
    body: { appendChild() {} }
  };
  const localStorage = { getItem(k) { return storage.get(k) || null; }, setItem(k,v) { storage.set(k,String(v)); }, removeItem(k) { storage.delete(k); } };
  const unitData = {
    units: {
      length: { m: 1, cm: 0.01, km: 1000 },
      weight: { kg: 1, g: 0.001 },
      temp: ['c','f','k'],
      volume: { l: 1, ml: 0.001 },
      area: { m2: 1, cm2: 0.0001 },
      speed: { ms: 1, kmh: 1/3.6 },
      pressure: { pa: 1, kpa: 1000 }
    },
    unitLabels: { en: {length:{m:'m',cm:'cm',km:'km'}}, ja: {length:{m:'m',cm:'cm',km:'km'}} },
    categoryKeys: ['length','weight','temp','volume','area','speed','pressure']
  };
  const window = { UnitMasterRuntimeAdapter: { adaptUnitMasterData: () => unitData } };
  const script = fs.readFileSync(path.join(__dirname, scriptName), 'utf8');
  vm.runInNewContext(script, {
    document, navigator: { language: 'en' }, localStorage, window,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout(id) { cancelled.add(id); },
    console: { warn() {} }
  });
  for (let i=0; i<8; i++) await Promise.resolve();
  return { get, storage, timers, cancelled };
}

for (const file of ['app-json-runtime.js', 'app.js']) {
  test(file + ': manual mode clears old results on source/category edits until Calculate', async () => {
    const h = await harness(file);
    assert.doesNotMatch(h.get('resultBox').textContent, /=/);
    assert.match(h.get('resultBox').textContent, /Calculate/);
    h.get('calcBtn').emit('click');
    assert.match(h.get('resultBox').textContent, /2.*=.*200/);
    h.get('inputValue').value = '3';
    h.get('inputValue').emit('input');
    assert.doesNotMatch(h.get('resultBox').textContent, /=/);
    assert.match(h.get('resultBox').textContent, /Calculate/);
    assert.equal(h.get('bulkBox').children.length, 0);
    h.get('calcBtn').emit('click');
    assert.match(h.get('resultBox').textContent, /3.*=.*300/);
    h.get('toUnit').value = 'km';
    h.get('toUnit').emit('change');
    assert.match(h.get('resultBox').textContent, /Calculate/);
    h.get('categorySelect').value = 'temp';
    h.get('categorySelect').emit('change');
    assert.match(h.get('resultBox').textContent, /Calculate/);
    assert.doesNotMatch(h.get('resultBox').textContent, /=/);
  });

  test(file + ': turning auto ON recalculates, turning it OFF invalidates and cancels saved timer', async () => {
    const h = await harness(file);
    h.get('autoCalc').checked = true;
    h.get('autoCalc').emit('change');
    assert.match(h.get('resultBox').textContent, /2.*=.*200/);
    h.get('inputValue').value = '4';
    h.get('inputValue').emit('input');
    assert.match(h.get('resultBox').textContent, /4.*=.*400/);
    assert.ok(h.timers.length >= 1);
    h.get('autoCalc').checked = false;
    h.get('autoCalc').emit('change');
    assert.match(h.get('resultBox').textContent, /Calculate/);
    assert.equal(h.get('bulkBox').children.length, 0);
    assert.ok(h.cancelled.size >= 1);
    h.get('inputValue').value = '5';
    h.get('inputValue').emit('input');
    assert.match(h.get('resultBox').textContent, /Calculate/);
    assert.doesNotMatch(h.get('resultBox').textContent, /=/);
  });
}
