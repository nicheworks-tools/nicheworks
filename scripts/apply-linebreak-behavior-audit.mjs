import fs from 'node:fs';

const testPath = 'tools/linebreak-doctor/tests/behavior.test.mjs';
const missingMessage = 'Behavior-level automated tests are absent.';

const matrixPath = 'audits/tool-quality-matrix.json';
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const record = matrix.records.find((item) => item.slug === 'linebreak-doctor');
if (!record) throw new Error('linebreak-doctor matrix record not found');

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
const summaryFrom = '- Behavior-level tests missing: **85**';
const summaryTo = '- Behavior-level tests missing: **84**';
if (!md.includes(summaryFrom)) throw new Error('behavior-test summary baseline not found');
md = md.replace(summaryFrom, summaryTo);
const rowFrom = '| [linebreak-doctor](../docs/tools/linebreak-doctor.md) | mobile-oriented | optional-absent | optional-present | behavior-test-missing | 0 | 0 | **PASS** |';
const rowTo = '| [linebreak-doctor](../docs/tools/linebreak-doctor.md) | mobile-oriented | optional-absent | optional-present | behavior-test-present | 0 | 0 | **PASS** |';
if (!md.includes(rowFrom)) throw new Error('linebreak-doctor matrix row baseline not found');
md = md.replace(rowFrom, rowTo);
fs.writeFileSync(mdPath, md);

const canonicalPath = 'docs/tools/linebreak-doctor.md';
let canonical = fs.readFileSync(canonicalPath, 'utf8');
const canonicalFrom = 'Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.';
const canonicalTo = 'Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test) and `tools/linebreak-doctor/tests/behavior.test.mjs` (behavior test, executed by `scripts/run-tool-behavior-tests.mjs`). Behavior-level status: **behavior-test-present**.';
if (!canonical.includes(canonicalFrom)) throw new Error('canonical LineBreak test status baseline not found');
canonical = canonical.replace(canonicalFrom, canonicalTo);
const evidenceAnchor = '- `tools/linebreak-doctor/style.css`';
if (!canonical.includes(evidenceAnchor)) throw new Error('canonical LineBreak evidence anchor not found');
canonical = canonical.replace(evidenceAnchor, `${evidenceAnchor}\n- \`${testPath}\``);
fs.writeFileSync(canonicalPath, canonical);

const runtimeSpecPath = 'tools/linebreak-doctor/SPEC.md';
let runtimeSpec = fs.readFileSync(runtimeSpecPath, 'utf8');
if (!runtimeSpec.includes(evidenceAnchor)) throw new Error('runtime LineBreak evidence anchor not found');
runtimeSpec = runtimeSpec.replace(evidenceAnchor, `${evidenceAnchor}\n- \`${testPath}\``);
fs.writeFileSync(runtimeSpecPath, runtimeSpec);

console.log('LineBreak Doctor behavior-test audit evidence synchronized.');
