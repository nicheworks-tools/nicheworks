const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function harness() {
  const nodes = new Map();
  const downloads = [];
  const bytes = [];
  const vendor = { gate: null };
  class Node {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.textContent = '';
      this.innerHTML = '';
      this.disabled = false;
      this.hidden = false;
      this.checked = false;
      this.children = [];
      this.dataset = {};
      this.events = {};
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    addEventListener(type, fn) { this.events[type] = fn; }
    emit(type, event = { target: this }) { return this.events[type]?.(event); }
    appendChild(node) { this.children.push(node); }
    replaceChildren(...children) { this.children = children; this.innerHTML = ''; }
    querySelectorAll() { return []; }
  }
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, new Node(id));
    return nodes.get(id);
  };
  const defaults = {
    encoding: 'auto', delimiter: 'auto', headerRow: '1', dateTolerance: '0',
    dateMode: 'auto', signMode: 'normal', maxGroupSize: '5'
  };
  for (const [id, value] of Object.entries(defaults)) get(id).value = value;
  const document = {
    documentElement: { lang: 'ja' },
    getElementById: get,
    createElement: id => new Node(id),
    querySelectorAll: () => []
  };
  const parseCsvText = (text) => ({
    rows: text.trim().split(/\r?\n/).map(line => line.split(','))
  });
  const tableFromRows = (rawRows, headerRow) => {
    const headers = rawRows[headerRow - 1] || [];
    const rows = rawRows.slice(headerRow).map((cells, i) => ({
      rowNumber: headerRow + i + 1,
      values: Object.fromEntries(headers.map((name, j) => [name, cells[j] || '']))
    }));
    return { headers, rows };
  };
  const stubbedImports = {
    parseCsvText, tableFromRows,
    readCsvFile: file => file.deferred ? file.deferred.promise : Promise.resolve({
      rows: parseCsvText(file.text).rows, name: file.name, size: file.size,
      encoding: 'utf-8', delimiter: ','
    }),
    reconcile: () => [{
      status: 'exact_match', relation: '1:1', aRows: [2], bRows: [2],
      amount: 12800, date: '2026-09-01', reason: 'matched'
    }],
    summarize: () => ({
      exact_match: 1, tolerant_match: 0, candidate: 0, a_only: 0,
      b_only: 0, duplicate: 0, conflict: 0
    }),
    resultsToCsv: (results, run) => run.fileA + '/' + run.fileB + ':' + results.length,
    downloadText: (filename, content) => downloads.push({ filename, content }),
    downloadBytes: (filename, content) => bytes.push({ filename, content }),
    ensureXlsxAvailable: () => vendor.gate ? vendor.gate.promise : Promise.resolve(),
    readXlsxFile: async () => { throw new Error('no xlsx fixture'); },
    tableFromXlsx: () => { throw new Error('no xlsx fixture'); },
    resultsWorkbookBytes: () => new Uint8Array([1, 2]),
    createProfileStore: () => ({
      list: () => [], save() {}, remove() {},
      importBundle() {}, exportBundle: () => '{}'
    })
  };
  const context = {
    ...stubbedImports,
    document,
    navigator: { language: 'ja-JP' },
    localStorage: { getItem: () => null, setItem() {} },
    window: {},
    location: { assign() {} },
    URL, Uint8Array, console
  };
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.mjs'), 'utf8');
  const runtime = source.replace(/^import \{[^\n]+\} from '[^']+';\r?\n/gm, '');
  assert.equal((runtime.match(/^import /gm) || []).length, 0, 'all imported dependencies are stubbed');
  vm.runInNewContext(runtime + '\n;globalThis.__reconcileTest={ state, setProState };', context, { filename: 'app.mjs' });
  return { get, downloads, bytes, vendor, state: context.__reconcileTest.state,
    setProState: context.__reconcileTest.setProState };
}

function generateResults(h) {
  h.get('sampleBtn').emit('click');
  h.get('reconcileBtn').emit('click');
  assert.equal(h.state.results.length, 1, 'valid sample reconciliation must complete');
  assert.ok(h.state.runContext, 'export context must exist');
}

test('changing a mapped amount column invalidates visible results and CSV audit export', () => {
  const h = harness();
  generateResults(h);
  h.get('exportCsvBtn').emit('click');
  assert.equal(h.downloads.length, 1);
  h.get('amountA').value = 'Different Amount';
  h.get('amountA').emit('change');
  assert.equal(h.state.results.length, 0);
  assert.equal(h.state.runContext, null);
  assert.equal(h.get('resultCount').textContent, '0 / 0');
  h.get('exportCsvBtn').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.match(h.get('notice').textContent, /先に照合/);
});

test('changing matching options, header settings, or file selection clears old audit outputs', () => {
  const h = harness();
  generateResults(h);
  h.get('dateTolerance').value = '1';
  h.get('dateTolerance').emit('change');
  assert.equal(h.state.runContext, null);
  generateResults(h);
  h.get('headerRow').value = '1';
  h.get('headerRow').emit('change');
  assert.equal(h.state.results.length, 0);
  generateResults(h);
  h.get('fileA').emit('change', { target: { files: [{ name: 'bad.txt', size: 8 }] } });
  assert.equal(h.state.a, null, 'prior dataset A must not be reused after failed replacement');
  assert.equal(h.state.runContext, null);
  h.get('reconcileBtn').emit('click');
  assert.equal(h.state.results.length, 0);
});

test('invalid regeneration cannot leave previous successful reconciliation visible', () => {
  const h = harness();
  generateResults(h);
  h.get('amountA').value = '';
  h.get('reconcileBtn').emit('click');
  assert.equal(h.state.results.length, 0);
  assert.equal(h.state.runContext, null);
  assert.match(h.get('notice').textContent, /金額列/);
});

test('a slower old CSV load cannot overwrite a newer replacement', async () => {
  const h = harness();
  const old = deferred();
  const next = deferred();
  const input = file => ({ target: { files: [file] } });
  const loadOld = h.get('fileA').emit('change', input({ name: 'old.csv', size: 20, deferred: old }));
  const loadNew = h.get('fileA').emit('change', input({ name: 'fresh.csv', size: 20, deferred: next }));
  next.resolve({
    rows: [['Amount'], ['42']], name: 'fresh.csv', size: 20, encoding: 'utf-8', delimiter: ','
  });
  await loadNew;
  old.resolve({
    rows: [['Amount'], ['1']], name: 'old.csv', size: 20, encoding: 'utf-8', delimiter: ','
  });
  await loadOld;
  assert.equal(h.state.a.name, 'fresh.csv');
  assert.equal(h.state.a.rows[0].values.Amount, '42');
});

test('pending Pro XLSX export does not download an out-of-date result after input changes', async () => {
  const h = harness();
  h.setProState(true);
  generateResults(h);
  const gate = deferred();
  h.vendor.gate = gate;
  const exporting = h.get('exportXlsxBtn').emit('click');
  h.get('dateMode').value = 'mdy';
  h.get('dateMode').emit('change');
  gate.resolve();
  await exporting;
  assert.equal(h.bytes.length, 0, 'no stale Pro workbook should be generated');
  assert.equal(h.state.runContext, null);
});
