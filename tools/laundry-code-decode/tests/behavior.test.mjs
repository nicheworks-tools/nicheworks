import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const storage = new Map();

const documentStub = {
  documentElement: { lang: 'en' },
  getElementById() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() {
    return {
      dataset: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {},
      appendChild() {},
      removeChild() {},
      remove() {},
      select() {},
      addEventListener() {},
      textContent: '',
      value: '',
    };
  },
  body: { appendChild() {}, removeChild() {} },
  execCommand() { return false; },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en', clipboard: null },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  URL,
  Blob,
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn) { return setTimeout(fn, 0); },
};
sandbox.window = {
  SYMBOLS: [],
  addEventListener() {},
};

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/laundry-code-decode/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

assert.equal(evaluate(`sanitizeCode(' p ')`), 'P');
assert.equal(evaluate(`sanitizeCode('x')`), '', 'unsupported dry-clean code should be discarded');
assert.equal(evaluate(`sanitizeTemp('40')`), 40);
assert.equal(evaluate(`sanitizeTemp(201)`), null, 'temperature above supported range should be rejected');
assert.equal(evaluate(`sanitizeCount(4, 0, 3)`), 3);
assert.equal(evaluate(`sanitizeCount(-2, 0, 3)`), 0);

const washSvg = evaluate(`renderSymbolSVG({ cat: 'wash', m: { temp: 40, underline: 2, no: true } })`);
assert.ok(washSvg.includes('>40</text>'), 'wash symbol should render the sanitized temperature');
assert.ok(washSvg.includes('M20 56 H44') && washSvg.includes('M20 60 H44'), 'two underline marks should render');
assert.ok(washSvg.includes('M14 14 L50 50') && washSvg.includes('M50 14 L14 50'), 'prohibition cross should render');

const dryCleanSvg = evaluate(`renderSymbolSVG({ cat: 'dryclean', m: { code: 'f', underline: 1 } })`);
assert.ok(dryCleanSvg.includes('>F</text>'), 'dry-clean code should be normalized and rendered');
assert.ok(dryCleanSvg.includes('M20 52 H44'), 'dry-clean underline should render');

const invalidDryCleanSvg = evaluate(`renderSymbolSVG({ cat: 'dryclean', m: { code: 'x' } })`);
assert.equal(invalidDryCleanSvg.includes('>X</text>'), false, 'invalid dry-clean code must not be rendered');

const searchText = evaluate(`symbolSearchText({ id: 'wash-40', cat: 'wash', m: { temp: 40 }, ja: { summary: '40度洗い', detail: '弱い洗濯' }, en: { summary: 'Wash at 40', detail: 'gentle cycle' } })`);
assert.ok(searchText.includes('wash-40'));
assert.ok(searchText.includes('40度洗い'));
assert.ok(searchText.includes('wash at 40'));
assert.ok(searchText.includes('gentle cycle'));

assert.ok(evaluate(`cautionText()` ).includes('garment label'), 'English safety guidance should be selected from browser language');

console.log('Laundry Code Decode behavior test passed.');
