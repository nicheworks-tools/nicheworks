import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
source += `\nglobalThis.__test = {
  getInitialLanguage, setLanguage, updateValues, updateLevel,
  runtime: () => ({ currentLang, prevRTT, graphData: [...graphData], graphColor, measuring })
};\n`;

function makeClassList() {
  const values = new Set();
  return {
    values,
    add(...names) { names.forEach((name) => values.add(name)); },
    remove(...names) { names.forEach((name) => values.delete(name)); },
    toggle(name, force) {
      if (force === true) { values.add(name); return true; }
      if (force === false) { values.delete(name); return false; }
      if (values.has(name)) { values.delete(name); return false; }
      values.add(name); return true;
    },
    contains(name) { return values.has(name); },
  };
}

function makeElement() {
  return {
    value: '',
    textContent: '',
    className: '',
    hidden: false,
    disabled: false,
    dataset: {},
    style: {},
    classList: makeClassList(),
    addEventListener() {},
    setAttribute() {},
    getAttribute(name) { return this.dataset[name] ?? null; },
    querySelectorAll() { return []; },
    getContext() { return null; },
  };
}

const levelJa = makeElement();
levelJa.getAttribute = (name) => name === 'data-lang' ? 'ja' : null;
const levelEn = makeElement();
levelEn.getAttribute = (name) => name === 'data-lang' ? 'en' : null;
const elements = new Map();
const documentStub = {
  documentElement: { lang: 'ja' },
  querySelectorAll() { return []; },
  getElementById(id) {
    if (!elements.has(id)) {
      const el = makeElement();
      if (id === 'levelCard') el.querySelectorAll = (selector) => selector === '.level-text' ? [levelJa, levelEn] : [];
      elements.set(id, el);
    }
    return elements.get(id);
  },
};

const storage = new Map([['wifi-meter-lang', 'en']]);
const localStorageStub = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};
const connection = { rtt: 50, downlink: 25 };
const sandbox = {
  console,
  document: documentStub,
  localStorage: localStorageStub,
  navigator: { language: 'ja', connection },
  setInterval() { return 1; },
  clearInterval() {},
  setTimeout,
  clearTimeout,
};

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/wifi-meter/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.equal(storage.get('nw_lang'), 'en', 'legacy language preference should migrate to the shared language key');
assert.equal(storage.has('wifi-meter-lang'), false, 'legacy language key should be removed after migration');
assert.equal(documentStub.documentElement.lang, 'en');

api.setLanguage('unsupported');
assert.equal(api.runtime().currentLang, 'ja', 'unsupported language values should fall back to Japanese');
assert.equal(storage.get('nw_lang'), 'ja');
api.setLanguage('en');

api.updateValues();
assert.equal(elements.get('rttValue').textContent, '50');
assert.equal(elements.get('fluctValue').textContent, '0');
assert.equal(elements.get('bwValue').textContent, '25');
assert.equal(levelEn.textContent, 'Connection Estimate: Low load');
assert.equal(api.runtime().graphColor, '#4caf50');

connection.rtt = 120;
connection.downlink = 18;
api.updateValues();
assert.equal(elements.get('fluctValue').textContent, '70');
assert.equal(levelEn.textContent, 'Connection Estimate: Medium load');
assert.equal(api.runtime().graphColor, '#ffb300');

connection.rtt = 300;
api.updateValues();
assert.equal(elements.get('fluctValue').textContent, '180');
assert.equal(levelEn.textContent, 'Connection Estimate: High load');
assert.equal(api.runtime().graphColor, '#e53935');

connection.rtt = undefined;
connection.downlink = undefined;
api.updateValues();
assert.equal(elements.get('rttValue').textContent, 'Not supported');
assert.equal(elements.get('fluctValue').textContent, 'Not supported');
assert.equal(elements.get('bwValue').textContent, 'Not supported');
assert.equal(levelEn.textContent, 'Connection Estimate: Not supported');
assert.match(elements.get('statusMessage').textContent, /does not provide estimated RTT or downlink values/);

connection.downlink = 10;
for (let i = 0; i < 55; i += 1) {
  connection.rtt = 90 + i;
  api.updateValues();
}
assert.equal(api.runtime().graphData.length, 50, 'in-memory graph history should stay capped at MAX_POINTS');
assert.equal(api.runtime().graphData.at(-1), 144);

api.updateLevel(null, null, false);
assert.equal(levelEn.textContent, 'Connection Estimate: ---');
assert.equal(api.runtime().graphColor, '#999999');

console.log('WiFi Meter behavior test passed.');
