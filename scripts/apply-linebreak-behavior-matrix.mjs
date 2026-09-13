import fs from 'node:fs';

const testPath = 'tools/linebreak-doctor/tests/behavior.test.mjs';
const missingMessage = 'Behavior-level automated tests are absent.';

const matrixPath = 'audits/tool-quality-matrix.json';
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const record = matrix.records.find((item) => item.slug === 'linebreak-doctor');
if (!record) throw new Error('linebreak-doctor matrix record not found');
if (record.functional_test_status !== 'behavior-test-missing') {
  throw new Error(`unexpected LineBreak behavior status: ${record.functional_test_status}`);
}

record.functional_test_status = 'behavior-test-present';
record.automated_tests = [...new Set([...(record.automated_tests || []), testPath])];
record.test_evidence = [...(record.test_evidence || []).filter((item) => item.path !== testPath), {
  path: testPath,
  classification: 'behavior test',
}];
record.outstanding_issues = (record.outstanding_issues || []).filter((item) => item !== missingMessage);
record.recommendation_only_gaps = (record.recommendation_only_gaps || []).filter((item) => item !== missingMessage);
fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`);

const mdPath = 'audits/tool-quality-matrix.md';
let md = fs.readFileSync(mdPath, 'utf8');
const summaryFrom = '- Behavior-level tests missing: **83**';
const summaryTo = '- Behavior-level tests missing: **82**';
if (!md.includes(summaryFrom)) throw new Error('current behavior-test summary baseline not found');
md = md.replace(summaryFrom, summaryTo);
const rowFrom = '| [linebreak-doctor](../docs/tools/linebreak-doctor.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |';
const rowTo = '| [linebreak-doctor](../docs/tools/linebreak-doctor.md) | mobile-oriented | optional-absent | optional-present | behavior-test-present | 0 | 0 | **PASS** |';
if (!md.includes(rowFrom)) throw new Error('LineBreak matrix row baseline not found');
md = md.replace(rowFrom, rowTo);
fs.writeFileSync(mdPath, md);

console.log('LineBreak Doctor behavior matrix synchronized from the 83-missing baseline.');
