import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    dataset: {},
    style: {},
    children: [],
    classList: {
      add() {}, remove() {}, toggle() {}, contains() { return false; },
    },
    appendChild(child) { this.children.push(child); return child; },
    append(...children) { this.children.push(...children); },
    remove() {},
    addEventListener() {},
    setAttribute() {},
    select() {},
    click() {},
  };
}

const elements = new Map();
const ids = [
  'prefecture','query','search-btn','results','results-title','result-limit-note','output-list','output-title','output-count',
  'download-btn','clear-output-btn','load-error','example-chips','supported-pref-list','supported-pref-count','data-checked-date',
  'official-reference-date','toast',
];
ids.forEach((id) => elements.set(id, makeElement()));

const documentStub = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  createElement() { return makeElement(); },
  createDocumentFragment() { return makeElement(); },
  addEventListener() {},
  execCommand() { return false; },
  body: makeElement(),
};

class OptionStub {
  constructor(text, value) { this.text = text; this.value = value; }
}

const sandbox = {
  console,
  document: documentStub,
  navigator: { clipboard: null },
  window: { isSecureContext: false },
  Option: OptionStub,
  Blob,
  URL,
  Date,
  setTimeout,
  clearTimeout,
  fetch: async () => { throw new Error('network not expected in behavior test'); },
};

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/jp-postal-lite/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

assert.equal(
  evaluate(`normalize('  東京都　新宿区西新宿１―２―３  ')`),
  '東京都新宿区西新宿1-2-3',
  'address normalization should remove spacing, normalize fullwidth digits and hyphens',
);
assert.equal(evaluate(`normalize('ヶ丘')`), 'ケ丘', 'small ke should normalize to ケ');

const rows = [
  { postal_hyphen: '100-0005', full: '東京都千代田区丸の内', city: '千代田区', town: '丸の内' },
  { postal_hyphen: '163-8001', full: '東京都新宿区西新宿', city: '新宿区', town: '西新宿' },
  { postal_hyphen: '160-0023', full: '東京都新宿区西新宿二丁目', city: '新宿区', town: '西新宿二丁目' },
  { postal_hyphen: '150-0002', full: '東京都渋谷区渋谷', city: '渋谷区', town: '渋谷' },
];
context.sampleRows = rows;

const search = JSON.parse(evaluate(`JSON.stringify(filterData(sampleRows, '新宿'))`));
assert.equal(search.total, 2);
assert.deepEqual(search.rows.map((row) => row.postal_hyphen), ['163-8001', '160-0023'], 'prefix city/town matches should be returned');

const containsSearch = JSON.parse(evaluate(`JSON.stringify(filterData(sampleRows, '東京都新宿'))`));
assert.equal(containsSearch.total, 2, 'joined address search should find contained multi-field text');

assert.deepEqual(
  JSON.parse(evaluate(`JSON.stringify(filterData(sampleRows, '東'))`)),
  { total: 0, rows: [] },
  'queries shorter than two normalized characters should not run',
);

const manyRows = Array.from({ length: 60 }, (_, i) => ({ postal_hyphen: `100-${String(i).padStart(4, '0')}`, full: `東京都テスト区町${i}`, city: 'テスト区', town: `町${i}` }));
context.manyRows = manyRows;
const limited = JSON.parse(evaluate(`JSON.stringify(filterData(manyRows, 'テスト'))`));
assert.equal(limited.total, 60);
assert.equal(limited.rows.length, 50, 'visible results should be capped at the production LIMIT');

assert.equal(evaluate(`csvCell('plain')`), 'plain');
assert.equal(evaluate(`csvCell('a,b')`), '"a,b"');
assert.equal(evaluate(`csvCell('a"b')`), '"a""b"');

console.log('JP Postal Lite behavior test passed.');
