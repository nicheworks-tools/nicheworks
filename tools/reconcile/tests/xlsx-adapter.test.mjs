import assert from 'node:assert/strict';
import { isXlsxAvailable, readXlsxFile, tableFromXlsx, createResultsWorkbook, resultsWorkbookBytes } from '../xlsx-adapter.mjs';

const calls = [];
const fake = {
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
    json_to_sheet(rows) { return { kind: 'json', rows }; },
    book_append_sheet(workbook, sheet, name) { workbook.names.push(name); workbook.sheets.push(sheet); }
  }
};

assert.equal(isXlsxAvailable(fake), true);
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
const workbook = createResultsWorkbook(results, { fileA: 'a.xlsx', fileB: 'b.xlsx' }, fake);
assert.deepEqual(workbook.names, ['Summary', 'Matches', 'Candidates', 'A Only', 'B Only', 'Duplicates', 'Conflicts']);
const bytes = resultsWorkbookBytes(results, {}, fake);
assert.equal(bytes.byteLength, 3);
assert.ok(calls.some((entry) => entry[0] === 'read'));
assert.ok(calls.some((entry) => entry[0] === 'write'));

console.log('xlsx-adapter tests: OK');
