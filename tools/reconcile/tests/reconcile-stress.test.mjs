import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsvText, tableFromRows } from '../parser.mjs';
import { reconcile, summarize } from '../reconcile-engine.mjs';
import { EXPECTED_XLSX_VERSION, readXlsxFile, tableFromXlsx } from '../xlsx-adapter.mjs';

const CSV_ROWS = 100000;
const csvStart = performance.now();
const csvLines = ['Date,Reference,Amount'];
for (let i = 0; i < CSV_ROWS; i += 1) csvLines.push(`2026-09-01,R${i},${i + 1}`);
const parsed = parseCsvText(csvLines.join('\n'));
const csvTable = tableFromRows(parsed.rows, 1);
assert.equal(csvTable.rows.length, CSV_ROWS);
const csvParseMs = performance.now() - csvStart;

const reconcileStart = performance.now();
const rowsB = csvTable.rows.map((row) => ({ sourceRow: row.sourceRow, values: { ...row.values } }));
const matched = reconcile({
  rowsA: csvTable.rows,
  rowsB,
  mappingA: { amount: 'Amount', date: 'Date', reference: 'Reference' },
  mappingB: { amount: 'Amount', date: 'Date', reference: 'Reference' }
});
assert.equal(matched.length, CSV_ROWS);
assert.equal(summarize(matched).exact_match, CSV_ROWS);
const reconcileMs = performance.now() - reconcileStart;

const here = dirname(fileURLToPath(import.meta.url));
const vendorPath = resolve(here, '../vendor/xlsx.mini.min.js');
const vendorBytes = await readFile(vendorPath);
assert.equal(createHash('sha256').update(vendorBytes).digest('hex'), '0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939');
const context = vm.createContext({ console, Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, ArrayBuffer, DataView, TextEncoder, TextDecoder, Date, Math, JSON, Map, Set, RegExp, Error, TypeError, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, escape, unescape });
vm.runInContext(vendorBytes.toString('utf8'), context, { filename: 'xlsx.mini.min.js' });
const XLSX = context.XLSX;
assert.equal(XLSX.version, EXPECTED_XLSX_VERSION);

const XLSX_ROWS = 50000;
const xlsxStart = performance.now();
const aoa = [['Date', 'Reference', 'Amount']];
for (let i = 0; i < XLSX_ROWS; i += 1) aoa.push(['2026-09-01', `X${i}`, i + 1]);
const book = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(aoa), 'Transactions');
const bytes = XLSX.write(book, { bookType: 'xlsx', type: 'array', compression: true });
const file = {
  name: 'stress.xlsx',
  size: bytes.byteLength,
  async arrayBuffer() {
    return bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }
};
const source = await readXlsxFile(file, XLSX);
const xlsxTable = tableFromXlsx(source, 'Transactions', 1, XLSX);
assert.equal(xlsxTable.rows.length, XLSX_ROWS);
const xlsxMs = performance.now() - xlsxStart;

console.log(JSON.stringify({ csvRows: CSV_ROWS, csvParseMs: Math.round(csvParseMs), reconcileMs: Math.round(reconcileMs), xlsxRows: XLSX_ROWS, xlsxBytes: bytes.byteLength, xlsxMs: Math.round(xlsxMs), heapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) }));
console.log('reconcile stress tests: OK');
