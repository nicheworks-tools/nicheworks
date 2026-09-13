import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsvText, tableFromRows } from '../parser.mjs';
import { normalizeAmount, normalizeDate } from '../normalize.mjs';
import { reconcile, summarize } from '../reconcile-engine.mjs';

const quoted = parseCsvText('\ufeffDate;Reference;Description;Amount\n2026-09-01;JP-1;"振込, 手数料込み";"¥12,800"\n\n2026-09-02;EU-2;"line 1\nline 2";"1.234,56"\n', ';');
const quotedTable = tableFromRows(quoted.rows, 1);
assert.equal(quotedTable.rows.length, 2);
assert.equal(quotedTable.rows[0].sourceRow, 2);
assert.equal(quotedTable.rows[1].sourceRow, 4);
assert.equal(quotedTable.rows[1].values.Description, 'line 1\nline 2');
assert.equal(normalizeAmount(quotedTable.rows[0].values.Amount), 12800);
assert.equal(normalizeAmount(quotedTable.rows[1].values.Amount), 1234.56);
assert.equal(normalizeAmount('JPY (5,000)'), -5000);
assert.equal(normalizeAmount('1,23,4'), null);
assert.equal(normalizeDate('04/05/2026').error, 'ambiguous_date');
assert.equal(normalizeDate('04/05/2026', 'mdy').iso, '2026-04-05');
assert.equal(normalizeDate('04/05/2026', 'dmy').iso, '2026-05-04');

function table(csv, delimiter = 'auto') {
  const parsed = parseCsvText(csv, delimiter);
  return tableFromRows(parsed.rows, 1);
}

const a = table('Date,Reference,Description,Amount\n2026-09-01,R-1,Exact,100\n2026-09-02,R-2,Tolerant,200\n2026-09-03,R-3,Conflict,300\n2026-09-04,,Candidate,400\n2026-09-05,DUP,Duplicate,500\n2026-09-05,DUP,Duplicate,500\n2026-09-06,R-6,A only,600\n');
const b = table('Date,Reference,Description,Amount\n2026-09-01,R-1,Exact,100\n2026-09-03,R-2,Tolerant,200\n2026-09-03,R-3,Conflict,333\n2026-09-04,,Candidate B1,400\n2026-09-05,,Candidate B2,400\n2026-09-07,R-7,B only,700\n');
const mappings = { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' };
const first = reconcile({ rowsA: a.rows, rowsB: b.rows, mappingA: mappings, mappingB: mappings, options: { dateToleranceDays: 1 } });
const counts = summarize(first);
assert.equal(counts.exact_match, 1);
assert.equal(counts.tolerant_match, 1);
assert.equal(counts.conflict, 1);
assert.equal(counts.duplicate, 1);
assert.ok(counts.candidate >= 1);
assert.ok(counts.a_only >= 1);
assert.ok(counts.b_only >= 1);
assert.deepEqual(reconcile({ rowsA: a.rows, rowsB: b.rows, mappingA: mappings, mappingB: mappings, options: { dateToleranceDays: 1 } }), first);

const signA = table('Date,Amount\n2026-09-01,150\n');
const signB = table('Date,Amount\n2026-09-01,-100\n2026-09-01,-50\n');
const grouped = reconcile({ rowsA: signA.rows, rowsB: signB.rows, mappingA: { amount: 'Amount', date: 'Date' }, mappingB: { amount: 'Amount', date: 'Date' }, options: { signMode: 'invert_b', groupMatching: true, maxGroupSize: 5 } });
assert.ok(grouped.some((row) => row.relation === '1:2' && row.status === 'tolerant_match'));

const here = dirname(fileURLToPath(import.meta.url));
const appSource = await readFile(resolve(here, '../app.mjs'), 'utf8');
const indexSource = await readFile(resolve(here, '../index.html'), 'utf8');
assert.match(appSource, /const RESULT_PAGE_SIZE = 250;/);
assert.match(appSource, /const pageRows = state\.filtered\.slice\(start, start \+ RESULT_PAGE_SIZE\);/);
assert.match(appSource, /sourceFile: file/);
assert.match(appSource, /reparseLoadedCsvs/);
assert.match(indexSource, /id="resultPrevBtn"/);
assert.match(indexSource, /id="resultNextBtn"/);

console.log('reconcile realistic quality tests: OK');
