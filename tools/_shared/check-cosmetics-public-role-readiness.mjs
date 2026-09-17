import { spawnSync } from 'node:child_process';

const run = spawnSync(process.execPath, ['tools/_shared/check-cosmetics-semantic-quality.mjs'], {
  encoding: 'utf8'
});

if (run.status !== 0) {
  process.stderr.write(run.stderr || 'semantic quality audit failed\n');
  process.stdout.write(run.stdout || '');
  process.exit(run.status || 1);
}

let report;
try {
  report = JSON.parse(run.stdout);
} catch (error) {
  console.error(`public role readiness: semantic report was not valid JSON: ${error.message}`);
  process.exit(1);
}

const CEILINGS = Object.freeze({
  records_without_public_role_explanation: 366,
  canonical_identities_without_public_role_explanation: 247
});

const FLOORS = Object.freeze({
  records_with_public_role_explanation: 359,
  canonical_identities_with_public_role_explanation: 352
});

const failures = [];
for (const [metric, ceiling] of Object.entries(CEILINGS)) {
  const actual = report[metric];
  if (!Number.isInteger(actual)) failures.push(`${metric} missing from semantic report`);
  else if (actual > ceiling) failures.push(`${metric}: ${actual} exceeds frozen ceiling ${ceiling}`);
}
for (const [metric, floor] of Object.entries(FLOORS)) {
  const actual = report[metric];
  if (!Number.isInteger(actual)) failures.push(`${metric} missing from semantic report`);
  else if (actual < floor) failures.push(`${metric}: ${actual} fell below frozen floor ${floor}`);
}

if (!Array.isArray(report.unsupported_public_category_counts)) {
  failures.push('unsupported_public_category_counts missing from semantic report');
}

if (failures.length) {
  console.error(`Cosmetics public-role readiness gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  baseline: {
    records: { supported: report.records_with_public_role_explanation, incomplete: report.records_without_public_role_explanation },
    canonical_identities: { supported: report.canonical_identities_with_public_role_explanation, incomplete: report.canonical_identities_without_public_role_explanation }
  },
  ceilings: CEILINGS,
  floors: FLOORS,
  next_unsupported_categories: report.unsupported_public_category_counts.slice(0, 12)
}, null, 2));
