import fs from 'node:fs';

const matrixPath = 'audits/tool-quality-matrix.json';
const matrixMdPath = 'audits/tool-quality-matrix.md';

const targets = [
  {
    slug: 'inci-fastscan',
    testPath: 'tools/_shared/check-fastscan-ocr-confusion.mjs',
  },
  {
    slug: 'earth-map-suite',
    testPath: 'functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs',
  },
];

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
for (const { slug, testPath } of targets) {
  const record = matrix.records.find((item) => item.slug === slug);
  if (!record) throw new Error(`matrix record not found: ${slug}`);
  if (!fs.existsSync(testPath)) throw new Error(`behavior test path missing: ${testPath}`);

  record.functional_test_status = 'behavior-test-present';
  record.automated_tests ??= [];
  if (!record.automated_tests.includes(testPath)) record.automated_tests.push(testPath);
  record.test_evidence ??= [];
  if (!record.test_evidence.some((item) => item.path === testPath)) {
    record.test_evidence.push({ path: testPath, classification: 'behavior test' });
  } else {
    const evidence = record.test_evidence.find((item) => item.path === testPath);
    evidence.classification = 'behavior test';
  }
  for (const field of ['outstanding_issues', 'recommendation_only_gaps']) {
    record[field] = (record[field] || []).filter((item) => item !== 'Behavior-level automated tests are absent.');
  }
}

fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`);

const missingCount = matrix.records.filter((item) => item.functional_test_status === 'behavior-test-missing').length;
if (missingCount !== 83) throw new Error(`expected 83 behavior-test-missing records after reclassification, got ${missingCount}`);

let md = fs.readFileSync(matrixMdPath, 'utf8');
md = md.replace(/- Behavior-level tests missing: \*\*\d+\*\*/, `- Behavior-level tests missing: **${missingCount}**`);
for (const { slug } of targets) {
  const lines = md.split('\n');
  const index = lines.findIndex((line) => line.startsWith(`| [${slug}](`));
  if (index < 0) throw new Error(`matrix md row not found: ${slug}`);
  lines[index] = lines[index].replace('| behavior-test-missing |', '| behavior-test-present |');
  md = lines.join('\n');
}
fs.writeFileSync(matrixMdPath, md);

const inciPath = 'docs/tools/inci-fastscan.md';
let inci = fs.readFileSync(inciPath, 'utf8');
const inciOld = 'Automated evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/_shared/check-cosmetic-ingredient-parser.mjs` (shared-parser regression/behavior assertions), `tools/inci-fastscan/scripts/validate_dict.js` and `tools/inci-fastscan/validate-dictionary.mjs` (data validation). Phase 1 tool-level behavior-test status remains **behavior-test-missing** because these checks do not exercise the complete OCR/UI workflow.';
const inciNew = 'Automated evidence: `tools/_shared/check-fastscan-ocr-confusion.mjs` is a **behavior test**: it executes the real `core_matcher.js` in a VM with representative exact, OCR-confusion, typo-boundary, and unmatched inputs and asserts the resulting match state. `tools/_shared/check-cosmetic-ingredient-parser.mjs` supplies shared-parser behavior assertions; `scripts/check-tool-runtime-contracts.mjs` is regression/contract evidence; dictionary validators remain data validation. Tool-level behavior-test status is therefore **behavior-test-present**. This does not claim complete browser/OCR end-to-end coverage.';
if (!inci.includes(inciOld)) throw new Error('INCI canonical evidence paragraph changed unexpectedly');
inci = inci.replace(inciOld, inciNew);
if (!inci.includes('- `tools/_shared/check-fastscan-ocr-confusion.mjs`')) {
  inci = inci.replace('- `tools/_shared/check-cosmetic-ingredient-parser.mjs`\n', '- `tools/_shared/check-cosmetic-ingredient-parser.mjs`\n- `tools/_shared/check-fastscan-ocr-confusion.mjs`\n');
}
fs.writeFileSync(inciPath, inci);

const earthPath = 'docs/tools/earth-map-suite.md';
let earth = fs.readFileSync(earthPath, 'utf8');
const earthOld = 'Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.';
const earthNew = 'Automated test evidence: `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs` is a **behavior test**: it executes the real precipitation-sample endpoint module with request inputs and controlled upstream probe responses, asserting validation failures, method rejection, readiness blocking, upstream error propagation, provenance/debug fields, and the fail-closed public-output boundary. `scripts/check-tool-runtime-contracts.mjs` remains regression/contract evidence. Behavior-level status is **behavior-test-present**; this does not claim complete browser coverage for Storm / Compare / Card.';
if (!earth.includes(earthOld)) throw new Error('Earth Map Suite canonical evidence paragraph changed unexpectedly');
earth = earth.replace(earthOld, earthNew);
if (!earth.includes('- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`')) {
  earth = earth.replace('- `tools/earth-map-suite/usage.html`', '- `tools/earth-map-suite/usage.html`\n- `functions/api/earth-map-suite/tests/precipitation-sample-real-harness.mjs`');
}
fs.writeFileSync(earthPath, earth);

console.log(JSON.stringify({ reclassified: targets.map((item) => item.slug), behavior_tests_missing: missingCount }, null, 2));
