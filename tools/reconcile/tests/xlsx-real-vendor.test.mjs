import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createResultsWorkbook, EXPECTED_XLSX_VERSION, readXlsxFile, tableFromXlsx } from '../xlsx-adapter.mjs';

const EXPECTED_SIZE = 279523;
const EXPECTED_SHA256 = '0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939';
const EXPECTED_GIT_BLOB_SHA = '5bf1c223ce4bd59685ba711b77dce6da7a9747b8';
const EXPECTED_REPORT_SHEETS = ['Summary', 'Matches', 'Candidates', 'A Only', 'B Only', 'Duplicates', 'Conflicts'];
const here = dirname(fileURLToPath(import.meta.url));
const vendorPath = resolve(here, '../vendor/xlsx.mini.min.js');
const bytes = await readFile(vendorPath);

assert.equal(bytes.byteLength, EXPECTED_SIZE, 'SheetJS vendor byte size drifted');
assert.equal(createHash('sha256').update(bytes).digest('hex'), EXPECTED_SHA256, 'SheetJS vendor SHA-256 drifted');
const gitHeader = Buffer.from(`blob ${bytes.byteLength}\0`);
assert.equal(createHash('sha1').update(gitHeader).update(bytes).digest('hex'), EXPECTED_GIT_BLOB_SHA, 'SheetJS vendor Git blob SHA drifted');

const context = vm.createContext({
  console,
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  ArrayBuffer,
  DataView,
  TextEncoder,
  TextDecoder,
  Date,
  Math,
  JSON,
  Map,
  Set,
  RegExp,
  Error,
  TypeError,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
  escape,
  unescape
});
vm.runInContext(bytes.toString('utf8'), context, { filename: 'xlsx.mini.min.js' });
const XLSX = context.XLSX;
assert.ok(XLSX, 'SheetJS vendor did not expose XLSX');
assert.equal(XLSX.version, EXPECTED_XLSX_VERSION);

const sourceBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(sourceBook, XLSX.utils.aoa_to_sheet([
  ['Date', 'Amount', 'Reference'],
  ['2026-09-01', 100, 'A-100'],
  ['2026-09-02', 250, 'A-200']
]), 'Transactions');
XLSX.utils.book_append_sheet(sourceBook, XLSX.utils.aoa_to_sheet([
  ['Key', 'Value'],
  ['source', 'real-vendor-test']
]), 'Metadata');
const sourceBytes = XLSX.write(sourceBook, { bookType: 'xlsx', type: 'array', compression: true });
const sourceFile = {
  name: 'source.xlsx',
  size: sourceBytes.byteLength,
  async arrayBuffer() {
    return sourceBytes instanceof ArrayBuffer
      ? sourceBytes
      : sourceBytes.buffer.slice(sourceBytes.byteOffset, sourceBytes.byteOffset + sourceBytes.byteLength);
  }
};
const parsedSource = await readXlsxFile(sourceFile, XLSX);
assert.deepEqual(Array.from(parsedSource.sheetNames), ['Transactions', 'Metadata']);
const table = tableFromXlsx(parsedSource, 'Transactions', 1, XLSX);
assert.deepEqual(Array.from(table.headers), ['Date', 'Amount', 'Reference']);
assert.equal(table.rows.length, 2);
assert.equal(table.rows[0].values.Reference, 'A-100');
assert.equal(String(table.rows[1].values.Amount), '250');

const results = [
  { status: 'exact_match', relation: '1:1', aRows: [2], bRows: [2], amount: 100, date: '2026-09-01', reason: 'Amount exact' },
  { status: 'candidate', relation: '1:1', aRows: [3], bRows: [3, 4], amount: 250, date: '2026-09-02', reason: 'Ambiguous candidate' },
  { status: 'a_only', relation: 'unmatched', aRows: [4], bRows: [], amount: 300, date: '2026-09-03', reason: 'No candidate' },
  { status: 'b_only', relation: 'unmatched', aRows: [], bRows: [5], amount: 400, date: '2026-09-04', reason: 'No candidate' },
  { status: 'duplicate', relation: 'duplicate', aRows: [6, 7], bRows: [], amount: 500, date: '2026-09-05', reason: 'Duplicate signature' },
  { status: 'conflict', relation: '1:1', aRows: [8], bRows: [8], amount: 600, date: '2026-09-06', reason: 'Same reference, amount conflict' },
  { status: 'tolerant_match', relation: '1:1', aRows: [9], bRows: [9], amount: 700, date: '2026-09-07', reason: 'Within tolerance' }
];
const makeRows = (rowNumbers, prefix) => rowNumbers.map((sourceRow) => ({
  sourceRow,
  values: {
    Amount: String(sourceRow * 100),
    Date: `2026-09-${String(Math.min(sourceRow - 1, 30)).padStart(2, '0')}`,
    Reference: `${prefix}-${sourceRow}`,
    Description: `${prefix} row ${sourceRow}`
  }
}));
const reportContext = {
  generatedAt: '2026-09-12T00:00:00.000Z',
  fileA: 'a.xlsx',
  fileB: 'b.xlsx',
  fileAType: 'xlsx',
  fileBType: 'xlsx',
  headerRow: 1,
  rowsA: makeRows([2, 3, 4, 6, 7, 8, 9], 'A'),
  rowsB: makeRows([2, 3, 4, 5, 8, 9], 'B'),
  mappingA: { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' },
  mappingB: { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' },
  options: { dateToleranceDays: 1, amountTolerance: 5, dateMode: 'auto', signMode: 'normal', groupMatching: true, maxGroupSize: 5 }
};
const report = createResultsWorkbook(results, reportContext, XLSX);
assert.deepEqual(Array.from(report.SheetNames), EXPECTED_REPORT_SHEETS);
const reportBytes = XLSX.write(report, { bookType: 'xlsx', type: 'array', compression: true });
const reread = XLSX.read(reportBytes, { type: 'array' });
assert.deepEqual(Array.from(reread.SheetNames), EXPECTED_REPORT_SHEETS);
const summary = XLSX.utils.sheet_to_json(reread.Sheets.Summary, { header: 1, defval: '' });
assert.ok(summary.some((row) => row[0] === 'File A' && row[1] === 'a.xlsx'));
assert.ok(summary.some((row) => row[0] === 'Group matching' && row[1] === 'true'));
const matches = XLSX.utils.sheet_to_json(reread.Sheets.Matches, { defval: '' });
assert.equal(matches.length, 2);
const candidates = XLSX.utils.sheet_to_json(reread.Sheets.Candidates, { defval: '' });
assert.equal(candidates.length, 1);

console.log('xlsx real vendor tests: OK');