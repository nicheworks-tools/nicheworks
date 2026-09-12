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

const duplicateHeader = tableFromRows(parseCsvText('Amount,Amount,Date\n100,200,2026-09-01\n').rows, 1);
assert.deepEqual(duplicateHeader.headers, ['Amount', 'Amount (2)', 'Date']);
assert.equal(duplicateHeader.rows[0].values['Amount (2)'], '200');

const a = table('Date,Reference,Amount\n2026-09-01,A,100\n2026-09-02,B,200\n2026-09-03,C,300\n');
const b = table('Date,Reference,Amount\n2026-09-01,A,100\n2026-09-03,B,200\n2026-09-03,C,350\n');
const results = reconcile({ rowsA:a.rows, rowsB:b.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{dateToleranceDays:1} });
const summary = summarize(results);
assert.equal(summary.exact_match, 1);
assert.equal(summary.tolerant_match, 1);
assert.equal(summary.conflict, 1);

const candidateA = table('Date,Amount\n2026-09-01,100\n');
const candidateB = table('Date,Amount\n2026-09-01,100\n2026-09-02,100\n');
const candidates = reconcile({ rowsA:candidateA.rows, rowsB:candidateB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{dateToleranceDays:1} });
assert.equal(candidates.filter((x)=>x.status==='candidate').length, 1);
assert.equal(candidates.find((x)=>x.status==='candidate').bRows.length, 2);
assert.equal(candidates.filter((x)=>x.status==='exact_match').length, 0);

const duplicateA = table('Date,Reference,Amount\n2026-09-01,DUP,100\n2026-09-01,DUP,100\n');
const duplicateB = table('Date,Reference,Amount\n');
const duplicateResults = reconcile({ rowsA:duplicateA.rows, rowsB:duplicateB.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'} });
const duplicateOnly = duplicateResults.filter((x)=>x.status==='duplicate');
assert.equal(duplicateOnly.length, 1);
assert.deepEqual(duplicateOnly[0].aRows, [2,3]);
assert.equal(duplicateResults.some((x)=>x.status==='candidate' || x.status==='a_only'), false);

const toleranceA = table('Date,Amount\n2026-09-01,100.00\n');
const toleranceB = table('Date,Amount\n2026-09-01,100.05\n');
const toleranceResults = reconcile({ rowsA:toleranceA.rows, rowsB:toleranceB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{amountTolerance:0.05} });
assert.equal(toleranceResults[0].status, 'tolerant_match');

const referenceToleranceA = table('Date,Reference,Amount\n2026-09-01,R1,100.00\n');
const referenceToleranceB = table('Date,Reference,Amount\n2026-09-01,R1,100.05\n');
const referenceToleranceResults = reconcile({ rowsA:referenceToleranceA.rows, rowsB:referenceToleranceB.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{amountTolerance:0.05} });
assert.equal(referenceToleranceResults[0].status, 'tolerant_match');

const decimalGroupA = table('Date,Amount\n2026-09-01,0.3\n');
const decimalGroupB = table('Date,Amount\n2026-09-01,0.1\n2026-09-01,0.2\n');
const decimalGroupResults = reconcile({ rowsA:decimalGroupA.rows, rowsB:decimalGroupB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{groupMatching:true,maxGroupSize:5} });
assert.ok(decimalGroupResults.some((x)=>x.relation==='1:2' && x.status==='tolerant_match'));

const signA = table('Date,Amount\n2026-09-01,100\n');
const signB = table('Date,Amount\n2026-09-01,-100\n');
const signResults = reconcile({ rowsA:signA.rows, rowsB:signB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{signMode:'invert_b'} });
assert.equal(signResults[0].status, 'exact_match');

const groupA = table('Date,Amount\n2026-09-01,150\n');
const groupB = table('Date,Amount\n2026-09-01,100\n2026-09-01,50\n');
const groupResults = reconcile({ rowsA:groupA.rows, rowsB:groupB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{groupMatching:true,maxGroupSize:5} });
const oneToMany = groupResults.find((x)=>x.relation==='1:2');
assert.ok(oneToMany);
assert.equal(oneToMany.status, 'tolerant_match');
assert.deepEqual(oneToMany.bRows, [2,3]);

const reverseA = table('Date,Amount\n2026-09-01,100\n2026-09-01,50\n');
const reverseB = table('Date,Amount\n2026-09-01,150\n');
const reverseResults = reconcile({ rowsA:reverseA.rows, rowsB:reverseB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{groupMatching:true,maxGroupSize:5} });
const manyToOne = reverseResults.find((x)=>x.relation==='2:1');
assert.ok(manyToOne);
assert.equal(manyToOne.status, 'tolerant_match');
assert.deepEqual(manyToOne.aRows, [2,3]);

const guardedA = table('Date,Amount\n2026-09-01,999\n');
const guardedB = table('Date,Amount\n2026-09-01,1\n2026-09-01,2\n2026-09-01,3\n2026-09-01,4\n2026-09-01,5\n2026-09-01,6\n2026-09-01,7\n2026-09-01,8\n');
const guardedResults = reconcile({ rowsA:guardedA.rows, rowsB:guardedB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{groupMatching:true,maxGroupSize:5,groupSearchNodeLimit:5} });
const guardedCandidate = guardedResults.find((x)=>x.status==='candidate' && x.relation==='1:n?');
assert.ok(guardedCandidate);
assert.match(guardedCandidate.reason, /safety limit reached/);
assert.equal(guardedResults.some((x)=>x.status==='tolerant_match'), false);

const repeated = reconcile({ rowsA:a.rows, rowsB:b.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{dateToleranceDays:1} });
assert.deepEqual(repeated, results);

const contestedA = table('Date,Amount\n2026-09-01,100\n2026-09-02,100\n');
const contestedB = table('Date,Amount\n2026-09-01,100\n');
const contested = reconcile({ rowsA:contestedA.rows, rowsB:contestedB.rows, mappingA:{amount:'Amount',date:'Date'}, mappingB:{amount:'Amount',date:'Date'}, options:{dateToleranceDays:1} });
assert.equal(contested.filter((x)=>x.status==='exact_match').length, 0);
assert.equal(contested.filter((x)=>x.status==='candidate').length, 2);
assert.ok(contested.filter((x)=>x.status==='candidate').every((x)=>x.bRows.length===1 && x.bRows[0]===2));

const priorityA = table('Date,Reference,Amount\n2026-09-01,,100\n2026-09-01,X,100\n');
const priorityAReversed = table('Date,Reference,Amount\n2026-09-01,X,100\n2026-09-01,,100\n');
const priorityB = table('Date,Reference,Amount\n2026-09-01,X,100\n2026-09-01,Y,100\n');
for (const sourceA of [priorityA, priorityAReversed]) {
  const resolved = reconcile({ rowsA:sourceA.rows, rowsB:priorityB.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'} });
  const resolvedSummary = summarize(resolved);
  assert.equal(resolvedSummary.exact_match, 2);
  assert.equal(resolvedSummary.candidate, 0);
  assert.equal(resolvedSummary.a_only, 0);
  assert.equal(resolvedSummary.b_only, 0);
}

const denseRowsA = Array.from({length: 20}, (_, i) => `2026-09-01,${100 + i}`).join('\n');
const denseRowsB = Array.from({length: 20}, (_, i) => `2026-09-01,${100 + i}`).join('\n');
const denseA = table(`Date,Amount\n${denseRowsA}\n`);
const denseB = table(`Date,Amount\n${denseRowsB}\n`);
assert.throws(() => reconcile({
  rowsA:denseA.rows,
  rowsB:denseB.rows,
  mappingA:{amount:'Amount',date:'Date'},
  mappingB:{amount:'Amount',date:'Date'},
  options:{amountTolerance:20,candidateGraphEdgeLimit:100}
}), (error) => error?.code === 'candidate_graph_too_large');

const refRowsA = Array.from({length: 20}, (_, i) => `2026-09-01,R${i},100`).join('\n');
const refRowsB = Array.from({length: 20}, (_, i) => `2026-09-01,R${i},100`).join('\n');
const refDenseA = table(`Date,Reference,Amount\n${refRowsA}\n`);
const refDenseB = table(`Date,Reference,Amount\n${refRowsB}\n`);
const refDenseResults = reconcile({
  rowsA:refDenseA.rows,
  rowsB:refDenseB.rows,
  mappingA:{amount:'Amount',date:'Date',reference:'Reference'},
  mappingB:{amount:'Amount',date:'Date',reference:'Reference'},
  options:{candidateGraphEdgeLimit:100}
});
assert.equal(summarize(refDenseResults).exact_match, 20);

const invalidSafetyOptions = reconcile({ rowsA:a.rows, rowsB:b.rows, mappingA:{amount:'Amount',date:'Date',reference:'Reference'}, mappingB:{amount:'Amount',date:'Date',reference:'Reference'}, options:{candidateGraphEdgeLimit:'bad',groupSearchNodeLimit:'bad',maxGroupSize:'bad',dateToleranceDays:1} });
assert.deepEqual(invalidSafetyOptions, results);

console.log('reconcile-engine tests: OK');
