import assert from 'node:assert/strict';
import { auditExportHeaders, buildAuditRows, resultsToCsv } from '../export.mjs';

const results = [
  {
    status: 'tolerant_match',
    relation: '1:n',
    aRows: [5],
    bRows: [8, 9],
    amount: 1500,
    date: '2026-09-12',
    reason: 'Amount exact · grouped match'
  }
];

const context = {
  rowsA: [
    { sourceRow: 5, values: { Amount: '1,500', Date: '2026/09/12', Reference: 'INV-15', Description: 'Invoice 15' } }
  ],
  rowsB: [
    { sourceRow: 8, values: { Total: '1000', TxDate: '2026-09-12', ID: 'INV-15', Memo: 'Part 1' } },
    { sourceRow: 9, values: { Total: '500', TxDate: '2026-09-12', ID: 'INV-15', Memo: 'Part 2' } }
  ],
  mappingA: { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' },
  mappingB: { amount: 'Total', date: 'TxDate', reference: 'ID', description: 'Memo' }
};

const headers = auditExportHeaders();
assert.ok(headers.includes('a_amount_original'));
assert.ok(headers.includes('b_reference_original'));

const auditRows = buildAuditRows(results, context);
assert.equal(auditRows.length, 1);
assert.equal(auditRows[0].a_amount_original, '1,500');
assert.equal(auditRows[0].a_reference_original, 'INV-15');
assert.equal(auditRows[0].b_amount_original, '1000 || 500');
assert.equal(auditRows[0].b_description_original, 'Part 1 || Part 2');

const csv = resultsToCsv(results, context);
assert.ok(csv.startsWith('\uFEFFstatus,relation,a_rows,b_rows'));
assert.ok(csv.includes('"1,500"'));
assert.ok(csv.includes('1000 || 500'));
assert.ok(csv.includes('INV-15'));
assert.ok(csv.includes('Part 1 || Part 2'));

console.log('export tests: OK');