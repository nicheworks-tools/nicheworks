import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('tools/tools-index.json', 'utf8'));
const matrix = JSON.parse(fs.readFileSync('audits/tool-quality-matrix.json', 'utf8'));
const errors = [];
const finalStates = new Set(['PASS', 'FIX', 'BLOCKED', 'NEEDS_DECISION']);
const layouts = new Set(['mobile-oriented', 'desktop-wide', 'NEEDS_DECISION']);
const helpStates = new Set(['required-and-present', 'required-and-missing', 'recommended-and-present', 'recommended-and-missing', 'optional-present', 'optional-absent', 'not-applicable', 'NEEDS_DECISION']);
const testClasses = new Set(['behavior test', 'regression/contract test', 'data validation', 'build script', 'generator', 'audit script', 'other maintenance tooling']);
const requiredFields = [
  'slug', 'display_name', 'implementation', 'active_state', 'category', 'spec',
  'spec_coverage', 'implementation_exists', 'layout_class', 'language_policy',
  'functional_completeness', 'inputs_summary', 'outputs_summary', 'network_dependency',
  'storage', 'capabilities', 'responsive_status', 'usage_status', 'faq_status',
  'ga4_status', 'adsense_status', 'canonical_status', 'json_ld_status',
  'donation_status', 'privacy_compliance', 'functional_test_status', 'automated_tests',
  'outstanding_issues', 'final_state', 'evidence', 'usage_html_present',
  'usage_en_html_present', 'common_spec_compliance', 'obvious_broken_or_incomplete_behavior',
  'help_documentation', 'test_evidence', 'decision_gaps', 'hard_compliance_gaps',
  'recommendation_only_gaps',
];
const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const records = Array.isArray(matrix.records) ? matrix.records : [];
if (!Array.isArray(matrix.records)) errors.push('matrix.records must be an array');
const registrySlugs = registry.items.map((item) => item.slug);
const recordSlugs = records.map((record) => record.slug);

for (const slug of duplicateValues(recordSlugs)) errors.push(`duplicate matrix record: ${slug}`);
for (const slug of registrySlugs) if (!recordSlugs.includes(slug)) errors.push(`matrix missing registered tool: ${slug}`);
for (const slug of recordSlugs) if (!registrySlugs.includes(slug)) errors.push(`matrix contains unregistered tool: ${slug}`);

for (const record of records) {
  for (const field of requiredFields) if (!(field in record)) errors.push(`${record.slug ?? '<unknown>'}: missing ${field}`);
  if (!finalStates.has(record.final_state)) errors.push(`${record.slug}: invalid final_state ${record.final_state}`);
  if (!layouts.has(record.layout_class)) errors.push(`${record.slug}: invalid layout_class ${record.layout_class}`);
  if (record.spec !== `docs/tools/${record.slug}.md`) errors.push(`${record.slug}: invalid spec path ${record.spec}`);
  if (!fs.existsSync(record.spec)) errors.push(`${record.slug}: specification file does not exist`);
  for (const field of ['usage_status', 'faq_status']) if (!helpStates.has(record[field])) errors.push(`${record.slug}: invalid ${field} ${record[field]}`);
  for (const field of ['outstanding_issues', 'automated_tests', 'test_evidence', 'decision_gaps', 'hard_compliance_gaps', 'recommendation_only_gaps']) {
    if (!Array.isArray(record[field])) errors.push(`${record.slug}: ${field} must be an array`);
  }
  for (const evidencePath of record.evidence) if (!fs.existsSync(evidencePath)) errors.push(`${record.slug}: evidence path does not exist: ${evidencePath}`);
  for (const evidence of record.test_evidence) {
    if (!testClasses.has(evidence.classification)) errors.push(`${record.slug}: invalid test classification ${evidence.classification}`);
    if (!fs.existsSync(evidence.path)) errors.push(`${record.slug}: test evidence path does not exist: ${evidence.path}`);
    if (['build script', 'generator'].includes(evidence.classification) && record.functional_test_status === 'behavior-test-present' && !record.test_evidence.some((item) => item.classification === 'behavior test')) {
      errors.push(`${record.slug}: build/generator evidence cannot establish behavior-test-present`);
    }
  }
  const behaviorPresent = record.test_evidence.some((item) => item.classification === 'behavior test');
  if ((record.functional_test_status === 'behavior-test-present') !== behaviorPresent) errors.push(`${record.slug}: functional_test_status contradicts classified evidence`);
  if (record.automated_tests.some((item) => !record.test_evidence.some((evidence) => evidence.path === item))) errors.push(`${record.slug}: automated_tests contains unclassified evidence`);
  if (record.help_documentation.usage !== record.usage_status || record.help_documentation.faq !== record.faq_status) errors.push(`${record.slug}: help status fields contradict help_documentation`);
  if (record.usage_html_present !== fs.existsSync(`tools/${record.slug}/usage.html`) || record.usage_en_html_present !== fs.existsSync(`tools/${record.slug}/usage-en.html`)) errors.push(`${record.slug}: exact usage-file presence is incorrect`);
  if (record.final_state === 'PASS' && (record.hard_compliance_gaps.length || record.decision_gaps.length)) errors.push(`${record.slug}: PASS contains hard or decision gaps`);
  if (record.final_state === 'FIX' && (!record.hard_compliance_gaps.length || record.decision_gaps.length)) errors.push(`${record.slug}: FIX requires hard gaps and no decision gaps`);
  if (record.final_state === 'NEEDS_DECISION' && !record.decision_gaps.length) errors.push(`${record.slug}: NEEDS_DECISION has no decision_gaps`);
  if (record.final_state !== 'NEEDS_DECISION' && record.decision_gaps.length) errors.push(`${record.slug}: unresolved decision is hidden by ${record.final_state}`);
  if (record.final_state === 'FIX' && !record.hard_compliance_gaps.length && record.recommendation_only_gaps.length) errors.push(`${record.slug}: recommendation-only gaps cannot produce FIX`);
  const specText = fs.readFileSync(record.spec, 'utf8');
  if (record.decision_gaps.length && !specText.includes('`NEEDS_DECISION`')) errors.push(`${record.slug}: decision gaps are absent from its specification`);
  if (!record.decision_gaps.length && specText.includes('`NEEDS_DECISION`')) errors.push(`${record.slug}: specification hides an unrecorded NEEDS_DECISION marker`);
}

const actualCounts = Object.fromEntries([...finalStates].map((state) => [state, records.filter((record) => record.final_state === state).length]));
for (const state of finalStates) if (matrix.counts?.[state] !== actualCounts[state]) errors.push(`${state} count mismatch`);
if (matrix.registered_tool_count !== registry.items.length) errors.push('registered_tool_count does not match registry');
if (matrix.record_count !== records.length) errors.push('record_count does not match records');
if (registry.items.length !== records.length) errors.push(`count mismatch: registry=${registry.items.length}, matrix=${records.length}`);

if (errors.length) {
  console.error(`Tool quality contract: FAIL (${errors.length} issues)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Tool quality contract: OK (${records.length} records; ${[...finalStates].map((state) => `${state}=${actualCounts[state]}`).join(', ')})`);
}
