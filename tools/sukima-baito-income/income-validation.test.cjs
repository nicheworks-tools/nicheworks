const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
function fromProduction(name, context = {}) {
  const match = code.match(new RegExp('^  function ' + name + '\\([^\\n]*\\) \\{[\\s\\S]*?^  \\}', 'm'));
  assert.ok(match, 'production function exists: ' + name);
  return vm.runInNewContext('(' + match[0].trim() + ')', { Date, ...context });
}
const cleanAmount = fromProduction('cleanAmount');
const isRealISODate = fromProduction('isRealISODate');

test('amount accepts actual integer yen and rejects negative/decimal/exponent instead of silently changing it', () => {
  for (const [raw, expected] of [
    ['1000', 1000], ['1,200円', 1200], ['￥１，２００円', 1200],
    ['¥500', 500], [' 2,500 円 ', 2500]
  ]) assert.equal(cleanAmount(raw), expected, raw);
  for (const raw of ['-1200','＋1200','1.5','1e3','5万円','1,2,3','12,34','Infinity','¥-500','-¥1000','9007199254740993']) {
    assert.equal(Number.isNaN(cleanAmount(raw)), true, raw);
  }
});

test('ISO date validation handles real leap days and rejects nonexistent calendar dates', () => {
  for (const date of ['2024-02-29','2026-11-03','2000-02-29','2026-12-31']) {
    assert.equal(isRealISODate(date), true, date);
  }
  for (const date of ['2023-02-29','2026-02-30','2026-04-31','2026-13-01','2026-00-01','2026-11-00','2026-1-03','0000-01-01','2026-11-31']) {
    assert.equal(isRealISODate(date), false, date);
  }
});

test('manual add prevents incorrect yen or impossible dates while allowing a valid record', () => {
  const listeners = {};
  const addBtn = { addEventListener(type, fn) { listeners['add:' + type] = fn; } };
  const amountInput = { value: '-1500', addEventListener(type, fn) { listeners['amount:' + type] = fn; } };
  const dateInput = { value: '2026-02-30' };
  const workplaceInput = { value: '東京', focus() {} };
  const categoryInput = { value: '報酬' };
  const memoInput = { value: 'メモ' };
  const entries = [], errors = [];
  const bind = fromProduction('bindAddButton', {
    addBtn, amountInput, dateInput, workplaceInput, categoryInput, memoInput,
    entries, editingIndex: null, cleanAmount, isRealISODate,
    normalizeWorkplaceName: v => String(v).trim(),
    showError: msg => errors.push(msg),
    bumpWorkplace() {}, clearForm() {}, renderAll() {}
  });
  bind();
  listeners['add:click']();
  assert.equal(entries.length, 0);
  assert.match(errors.at(-1), /日付/);
  dateInput.value = '2026-02-28';
  listeners['add:click']();
  assert.equal(entries.length, 0);
  assert.match(errors.at(-1), /金額/);
  amountInput.value = '¥1,500円';
  listeners['add:click']();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].amount, 1500);
  assert.equal(entries[0].date, '2026-02-28');
});

test('BOM CSV preview skips invalid dates, amounts and extra columns but accepts valid yen', () => {
  let preview, error = '';
  const FileReaderStub = class {
    readAsText(file) { this.onload({ target: { result: file.text } }); }
  };
  const parseCSV = fromProduction('parseCSV');
  const importCSVFile = fromProduction('importCSVFile', {
    FileReader: FileReaderStub, parseCSV, cleanAmount, isRealISODate,
    entries: [], normalizeWorkplaceName: v => String(v).trim(),
    makeDedupeKey: e => [e.date,e.workplace,e.category,e.amount].join('|'),
    openImportPreview(state) { preview = state; },
    emptyRowData() { return { date: '', workplace: '', category: '', amount: 0, memo: '' }; },
    showError(msg) { error = msg; }
  });
  importCSVFile({ text: '\uFEFFdate,workplace,category,amount,memo\n'
    + '2024-02-29,東京,報酬,"1,500",valid\n'
    + '2023-02-29,大阪,報酬,2000,invalid day\n'
    + '2026-03-01,大阪,報酬,-1200,negative\n'
    + '2026-03-02,大阪,報酬,3000,extra,not allowed\n'
    + '2026-03-03,大阪,報酬,1.5,fractional\n'
  });
  assert.equal(error, '');
  assert.equal(preview.summary.okCount, 1);
  assert.equal(preview.summary.skipCount, 4);
  assert.equal(preview.parsedRows[0].data.amount, 1500);
  assert.equal(preview.parsedRows[0].selected, true);
  assert.match(preview.parsedRows[1].reason, /日付/);
  assert.match(preview.parsedRows[2].reason, /金額/);
  assert.match(preview.parsedRows[3].reason, /列数/);
  assert.match(preview.parsedRows[4].reason, /金額/);
});

test('OCR review rejects bad dates and negative detected amounts before commit', () => {
  const ocrPreviewState = { rows: [
    { status: 'ok', selected: true, data: { date: '2026-02-30', workplace: '東京', category: '報酬', amount: 1000, memo: '' } },
    { status: 'ok', selected: true, data: { date: '2026-03-01', workplace: '東京', category: '報酬', amount: '-1000', memo: '' } },
    { status: 'ok', selected: true, data: { date: '2026-03-02', workplace: '東京', category: '報酬', amount: '1,000', memo: '' } }
  ] };
  const collect = fromProduction('collectOcrSelectedRows', {
    ocrPreviewState, cleanAmount, isRealISODate,
    normalizeWorkplaceName: v => String(v).trim()
  });
  const output = collect();
  assert.equal(output.selectedCount, 3);
  assert.equal(output.invalidCount, 2);
  assert.equal(output.rows.length, 1);
  assert.equal(output.rows[0].amount, 1000);
});
