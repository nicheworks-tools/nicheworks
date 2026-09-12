import test from 'node:test';
import assert from 'node:assert/strict';
import { detectDelimiter, parseCsvText, tableFromRows } from '../parser.mjs';

test('parses quoted delimiters, escaped quotes and embedded newlines', () => {
  const parsed = parseCsvText('Date,Memo,Amount\n2026-09-01,"hello, ""world""",100\n2026-09-02,"line 1\nline 2",200\n');
  assert.equal(parsed.delimiter, ',');
  assert.deepEqual(parsed.rows[1], ['2026-09-01', 'hello, "world"', '100']);
  assert.equal(parsed.rows[2][1], 'line 1\nline 2');
});

test('rejects an unclosed quoted field', () => {
  assert.throws(() => parseCsvText('A,B\n1,"broken\n'), /csv_unclosed_quote/);
});

test('detects supported delimiters from the first non-empty row', () => {
  assert.equal(detectDelimiter('A;B;C\n1;2;3'), ';');
  assert.equal(detectDelimiter('A\tB\tC\n1\t2\t3'), '\t');
  assert.equal(detectDelimiter('A,B,C\n1,2,3'), ',');
});

test('makes duplicate and blank headers deterministic', () => {
  const table = tableFromRows([
    ['Amount', 'Amount', '', 'Memo'],
    ['1', '2', '3', 'x']
  ]);
  assert.deepEqual(table.headers, ['Amount', 'Amount (2)', 'Column 3', 'Memo']);
  assert.equal(table.rows[0].values['Amount (2)'], '2');
});

test('preserves physical source row numbers when blank rows are skipped', () => {
  const table = tableFromRows([
    ['Date', 'Amount'],
    ['2026-09-01', '100'],
    ['', ''],
    ['2026-09-03', '300'],
    ['   ', ''],
    ['2026-09-05', '500']
  ]);
  assert.deepEqual(table.rows.map((row) => row.sourceRow), [2, 4, 6]);
});

test('header row offset is reflected in physical source row numbers', () => {
  const table = tableFromRows([
    ['Report title'],
    ['Date', 'Amount'],
    ['2026-09-01', '100'],
    [],
    ['2026-09-03', '300']
  ], 2);
  assert.deepEqual(table.headers, ['Date', 'Amount']);
  assert.deepEqual(table.rows.map((row) => row.sourceRow), [3, 5]);
});
