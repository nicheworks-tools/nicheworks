import assert from 'node:assert/strict';
import { DEFAULT_XLSX_VENDOR_URL, EXPECTED_XLSX_VERSION, isXlsxAvailable, isExpectedXlsxVersion, readXlsxFile, tableFromXlsx, createResultsWorkbook, resultsWorkbookBytes } from '../xlsx-adapter.mjs';

const calls = [];
const fake = {
  version: EXPECTED_XLSX_VERSION,
  read(buffer, options) {
    calls.push(['read', buffer.byteLength, options.type, options.cellDates]);
    return { SheetNames: ['Sheet1', 'Other'], Sheets: { Sheet1: { fake: true }, Other: { fake: true } } };
  },
  write(workbook, options) {
    calls.push(['write', workbook.names.length, options.bookType, options.type]);
    return new Uint8Array([1, 2, 3]).buffer;
  },
  utils: {
    sheet_to_json(sheet, options) {
      calls.push(['sheet_to_json', sheet.fake, options.header, options.raw, options.dateNF]);
      return [['Date', 'Amount'], ['2026-09-01', '100']];
    },
    book_new() { return { names: [], sheets: [] }; },
    aoa_to_sheet(rows) { return { kind: 'aoa', rows }; },
    json_to_sheet(rows, options) { return { kind: 'json', rows, options }; },
    book_append_sheet(workbook, sheet, name) { workbook.names.push(name); workbook.sheets.push(sheet); }
  }
};

assert.equal(EXPECTED_XLSX_VERSION, '0.20.3');
assert.equal(DEFAULT_XLSX_VENDOR_URL, './vendor/xlsx.mini.min.js');
assert.equal(isXlsxAvailable(fake), true);
assert.equal(isExpectedXlsxVersion(fake), true);
assert.equal(isExpectedXlsxVersion({ ...fake, version: '0.20.2' }), false);
assert.equal(isXlsxAvailable(null), false);

const file = { name: 'sample.xlsx', size: 100, async arrayBuffer() { return new Uint8Array([1, 2]).buffer; } };
const source = await readXlsxFile(file, fake);
assert.deepEqual(source.sheetNames, ['Sheet1', 'Other']);
const table = tableFromXlsx(source, 'Sheet1', 1, fake);
assert.deepEqual(table.headers, ['Date', 'Amount']);
assert.equal(table.rows[0].values.Amount, '100');

const results = [
  { status: 'exact_match', relation: '1:1', aRows: [2], bRows: [2], amount: 100, date: '2026-09-01', reason: 'Amount exact' },
  { status: 'conflict', relation: '1:1', aRows: [3], bRows: [3], amount: 200, date: '2026-09-02', reason: 'Same reference' }
];
const context = {
  generatedAt: '2026-09-12T00:00:00.000Z',
  fileA: 'a.xlsx',
  fileB: 'b.xlsx',
  fileAType: 'xlsx',
  fileBType: 'xlsx',
  headerRow: 2,
  rowsA: [
    { sourceRow: 2, values: { Amount: '100.00', Date: '2026/09/01', Reference: 'A-100', Description: 'Sale A' } },
    { sourceRow: 3, values: { Amount: '200.00', Date: '2026/09/02', Reference: 'A-200', Description: 'Sale B' } }
  ],
  rowsB: [
    { sourceRow: 2, values: { Total: '100', TxDate: '2026-09-01', ID: 'A-100', Memo: 'Deposit A' } },
    { sourceRow: 3, values: { Total: '250', TxDate: '2026-09-02', ID: 'A-200', Memo: 'Deposit B' } }
  ],
  mappingA: { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' },
  mappingB: { amount: 'Total', date: 'TxDate', reference: 'ID', description: 'Memo' },
  options: {
    dateToleranceDays: 1,
    amountTolerance: 5,
    dateMode: 'ymd',
    signMode: 'invert_b',
    groupMatching: true,
    maxGroupSize: 4
  }
};
const workbook = createResultsWorkbook(results, context, fake);
assert.deepEqual(workbook.names, ['Summary', 'Matches', 'Candidates', 'A Only', 'B Only', 'Duplicates', 'Conflicts']);
const summaryRows = workbook.sheets[0].rows;
assert.ok(summaryRows.some((row) => row[0] === 'A mapping: amount' && row[1] === 'Amount'));
assert.ok(summaryRows.some((row) => row[0] === 'B mapping: reference' && row[1] === 'ID'));
assert.ok(summaryRows.some((row) => row[0] === 'Sign mode' && row[1] === 'invert_b'));
assert.ok(summaryRows.some((row) => row[0] === 'Group matching' && row[1] === 'true'));
assert.ok(summaryRows.some((row) => row[0] === 'Max group size' && row[1] === 4));

const matchRow = workbook.sheets[1].rows[0];
assert.equal(matchRow.a_amount_original, '100.00');
assert.equal(matchRow.a_reference_original, 'A-100');
assert.equal(matchRow.b_amount_original, '100');
assert.equal(matchRow.b_description_original, 'Deposit A');

const bytes = resultsWorkbookBytes(results, context, fake);
assert.equal(bytes.byteLength, 3);
assert.ok(calls.some((entry) => entry[0] === 'read'));
assert.ok(calls.some((entry) => entry[0] === 'write'));

console.log('xlsx-adapter tests: OK');