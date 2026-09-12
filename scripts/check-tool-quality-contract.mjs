import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('tools/tools-index.json', 'utf8'));
const matrix = JSON.parse(fs.readFileSync('audits/tool-quality-matrix.json', 'utf8'));
const errors = [];
const finalStates = new Set(['PASS', 'FIX', 'BLOCKED', 'NEEDS_DECISION']);
const layouts = new Set(['mobile-oriented', 'desktop-wide', 'NEEDS_DECISION']);
const presence = new Set(['present', 'missing']);
const requiredFields = [
  'slug', 'display_name', 'implementation', 'active_state', 'category', 'spec',
  'spec_coverage', 'implementation_exists', 'layout_class', 'language_policy',
  'functional_completeness', 'inputs_summary', 'outputs_summary', 'network_dependency',
  'storage', 'capabilities', 'responsive_status', 'usage_status', 'faq_status',
  'ga4_status', 'adsense_status', 'canonical_status', 'json_ld_status',
  'donation_status', 'privacy_compliance', 'functional_test_status', 'automated_tests',
  'outstanding_issues', 'final_state', 'evidence', 'usage_html_present',
  'usage_en_html_present', 'common_spec_compliance', 'obvious_broken_or_incomplete_behavior',
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
  for (const field of ['faq_status', 'ga4_status', 'adsense_status', 'canonical_status', 'json_ld_status', 'donation_status', 'functional_test_status']) {
    if (!presence.has(record[field])) errors.push(`${record.slug}: invalid ${field} ${record[field]}`);
  }
  if (!Array.isArray(record.outstanding_issues) || !Array.isArray(record.automated_tests)) {
    errors.push(`${record.slug}: issue and test fields must be arrays`);
  }
  if (record.final_state === 'PASS' && record.outstanding_issues.length) errors.push(`${record.slug}: PASS record has outstanding issues`);
  if (record.final_state === 'FIX' && !record.outstanding_issues.length) errors.push(`${record.slug}: FIX record has no outstanding issues`);
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
