import assert from 'node:assert/strict';
import { reconcile, summarize } from '../reconcile-engine.mjs';
import { parseCsvText, tableFromRows } from '../parser.mjs';
import { normalizeAmount, normalizeDate } from '../normalize.mjs';

function table(csv) { return tableFromRows(parseCsvText(csv).rows, 1); }

assert.equal(normalizeAmount('¥12,800'), 12800);
assert.equal(normalizeAmount('(5,000)'), -5000);
assert.equal(normalizeAmount('oops'), null);
assert.equal(normalizeDate('2026/09/12').iso, '2026-09-12');
assert.equal(normalizeDate('03/04/2026').error, 'ambiguous_date');
assert.equal(normalizeDate('03/14/2026').iso, '2026-03-14');

const a = table('Date,Reference,Amount\n2026-09-01,A,100\n2026-09-02,B,200\n2026-09-03,C,300\n');
const b = table('Date,Reference,Amount\n2026-09-01,A,100\n2026-09-03,B,200\n2026-09-03,C,350\n');
const results = reconcile({ rowsA:a.rows, rowsB:b.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{dateToleranceDays:1} });
const summary = summarize(results);
assert.equal(summary.exact_match, 1);
assert.equal(summary.tolerant_match, 1);
assert.equal(summary.conflict, 1);

const candidateA = table('Date,Amount\n2026-09-01,100\n');
const candidateB = table('Date,Amount\n2026-09-01,100\n2026-09-01,100\n');
const candidates = reconcile({ rowsA:candidateA.rows, rowsB:candidateB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{dateToleranceDays:0} });
assert.equal(candidates.filter((x)=>x.status==='candidate').length, 1);
assert.equal(candidates.find((x)=>x.status==='candidate').bRows.length, 2);
assert.equal(candidates.filter((x)=>x.status==='exact_match').length, 0);

const repeated = reconcile({ rowsA:a.rows, rowsB:b.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{dateToleranceDays:1} });
assert.deepEqual(repeated, results);

console.log('reconcile-engine tests: OK');
