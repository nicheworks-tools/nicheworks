import fs from 'node:fs';
import path from 'node:path';
import { buildNonAffiliateWaves } from './non-affiliate-wave-assignment.mjs';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};
const sameSet = (a, b) => a.size === b.size && [...a].every((value) => b.has(value));

const REQUIRED_CATEGORIES = [
  'identity_spec',
  'core_behavior',
  'error_empty_states',
  'data_correctness',
  'privacy_network',
  'persistence',
  'responsive_ui',
  'accessibility',
  'language',
  'seo_technical',
  'seo_content',
  'analytics',
  'monetization_contract',
  'regression_tests'
];
const CATEGORY_STATES = new Set(['PASS', 'ISSUE_MINOR', 'ISSUE_MAJOR', 'BLOCKED', 'NOT_APPLICABLE']);
const OVERALL_STATES = new Set(['PASS', 'MINOR_FIX', 'MAJOR_FIX', 'BLOCKED', 'HOLD_REVIEW']);
const FINDING_SEVERITIES = new Set(['MINOR', 'MAJOR', 'BLOCKER']);
const FINDING_STATUSES = new Set(['OPEN', 'RESOLVED']);

const registry = readJson('tools/tools-index.json');
const scope = readJson('audits/non-affiliate-scope.json');
const classification = readJson('MONETIZATION_CLASSIFICATION.json');
const plan = readJson('audits/non-affiliate-audit-plan.json');

if (plan.totalTools !== scope.inScopeCount) fail(`plan totalTools=${plan.totalTools} must equal scope inScopeCount=${scope.inScopeCount}`);
if (plan.waveSize !== 12) fail(`plan baseline waveSize must be 12, got ${plan.waveSize}`);
if (plan.waveCount !== plan.waveSizes?.length) fail(`plan waveCount must equal waveSizes length, got ${plan.waveCount}`);
if (!Array.isArray(plan.waveSizes) || plan.waveSizes.length !== plan.waveCount) {
  fail('plan waveSizes must contain one entry per wave');
} else if (!Number.isInteger(plan.auditedTools)) fail('plan auditedTools must be an integer');
const pendingSlugs = Array.isArray(plan.pendingSlugs) ? plan.pendingSlugs : [];
if (new Set(pendingSlugs).size !== pendingSlugs.length) fail('pendingSlugs contains duplicates');
if (plan.auditedTools + pendingSlugs.length !== plan.totalTools) fail('auditedTools + pendingSlugs must equal totalTools');
if (plan.waveSizes.reduce((sum, size) => sum + size, 0) !== plan.auditedTools) {
  fail('plan auditedTools must equal the sum of waveSizes');
}
if (plan.assignment !== 'current_registry_order_audited_chunks') {
  fail(`unexpected assignment ${plan.assignment}`);
}
if (!Array.isArray(plan.pendingSlugs)) fail('pendingSlugs must be an array');
if (plan.auditMode !== 'audit_only') fail(`auditMode must be audit_only, got ${plan.auditMode}`);
if (!sameSet(new Set(plan.categories), new Set(REQUIRED_CATEGORIES)) || plan.categories.length !== REQUIRED_CATEGORIES.length) {
  fail('audit category contract drifted from the required 14-category standard');
}
if (!sameSet(new Set(plan.categoryStatusEnum), CATEGORY_STATES)) fail('category status enum drifted');
if (!sameSet(new Set(plan.overallStatusEnum), OVERALL_STATES)) fail('overall status enum drifted');

let scopeOrdered = [];
let ordered = [];
let pending = [];
let waves = [];
try {
  ({ scopeOrdered, ordered, pending, waves } = buildNonAffiliateWaves(registry, scope, plan));
} catch (error) {
  fail(error.message);
}

const inScope = new Set(Object.values(scope.classes).flat());
if (scopeOrdered.length && !sameSet(new Set(scopeOrdered), inScope)) {
  fail('current scope ordering does not exactly equal non-affiliate scope');
}
const auditedPlusPending = new Set([...ordered, ...pending]);
if (auditedPlusPending.size && !sameSet(auditedPlusPending, inScope)) {
  fail('audited + pending slugs do not exactly equal non-affiliate scope');
}

const flattened = waves.flat();
if (flattened.length && (flattened.length !== plan.auditedTools || new Set(flattened).size !== plan.auditedTools)) {
  fail('wave assignment must contain each audited slug exactly once');
}

const classBySlug = new Map();
for (const [className, slugs] of Object.entries(classification.classes)) {
  for (const slug of slugs) classBySlug.set(slug, className);
}



const waveDir = path.join(root, 'audits', 'non-affiliate-waves');
if (fs.existsSync(waveDir)) {
  const files = fs.readdirSync(waveDir)
    .filter((name) => /^wave-\d{2}\.json$/.test(name))
    .sort();

  for (const name of files) {
    const result = readJson(path.join('audits', 'non-affiliate-waves', name));
    const waveNumber = Number(name.match(/wave-(\d{2})\.json/)[1]);
    if (waveNumber < 1 || waveNumber > plan.waveCount) {
      fail(`${name}: wave number outside 1-${plan.waveCount}`);
      continue;
    }
    if (result.wave !== waveNumber) fail(`${name}: wave field ${result.wave} does not match filename`);
    if (result.auditMode !== 'audit_only') fail(`${name}: auditMode must be audit_only`);

    const expectedSize = plan.waveSizes[waveNumber - 1];
    if (!Array.isArray(result.records) || result.records.length !== expectedSize) {
      fail(`${name}: expected ${expectedSize} records`);
      continue;
    }

    const expectedSlugs = new Set(waves[waveNumber - 1] ?? []);
    const actualSlugs = new Set(result.records.map((record) => record.slug));
    if (actualSlugs.size !== result.records.length) fail(`${name}: duplicate record slugs`);
    if (!sameSet(expectedSlugs, actualSlugs)) fail(`${name}: record slugs do not match frozen/late-addition wave assignment`);

    for (const record of result.records) {
      const prefix = `${name}:${record.slug}`;
      if (record.monetization_class !== classBySlug.get(record.slug)) {
        fail(`${prefix}: monetization_class=${record.monetization_class} expected=${classBySlug.get(record.slug)}`);
      }
      if (!OVERALL_STATES.has(record.overall_state)) fail(`${prefix}: invalid overall_state ${record.overall_state}`);
      if (typeof record.last_audited_sha !== 'string' || !/^[0-9a-f]{40}$/.test(record.last_audited_sha)) {
        fail(`${prefix}: last_audited_sha must be a 40-character git SHA`);
      }
      if (typeof record.audited_at !== 'string' || Number.isNaN(Date.parse(record.audited_at))) {
        fail(`${prefix}: audited_at must be an ISO-compatible timestamp`);
      }
      if (!record.categories || typeof record.categories !== 'object' || Array.isArray(record.categories)) {
        fail(`${prefix}: categories must be an object`);
        continue;
      }
      if (!sameSet(new Set(Object.keys(record.categories)), new Set(REQUIRED_CATEGORIES))) {
        fail(`${prefix}: categories must contain exactly the required 14 category ids`);
      }

      let allClean = true;
      for (const categoryId of REQUIRED_CATEGORIES) {
        const category = record.categories[categoryId];
        if (!category || typeof category !== 'object') {
          allClean = false;
          fail(`${prefix}:${categoryId}: missing category record`);
          continue;
        }
        if (!CATEGORY_STATES.has(category.state)) {
          allClean = false;
          fail(`${prefix}:${categoryId}: invalid state ${category.state}`);
        }
        if (!Array.isArray(category.evidence) || category.evidence.length === 0) {
          allClean = false;
          fail(`${prefix}:${categoryId}: at least one evidence entry is required`);
        }
        if (category.state === 'NOT_APPLICABLE' && (typeof category.reason !== 'string' || !category.reason.trim())) {
          allClean = false;
          fail(`${prefix}:${categoryId}: NOT_APPLICABLE requires a reason`);
        }
        if (!['PASS', 'NOT_APPLICABLE'].includes(category.state)) allClean = false;
      }

      if (!Array.isArray(record.findings)) {
        fail(`${prefix}: findings must be an array`);
        continue;
      }
      let openFindings = 0;
      for (const finding of record.findings) {
        if (typeof finding.id !== 'string' || !finding.id.trim()) fail(`${prefix}: finding id is required`);
        if (!FINDING_SEVERITIES.has(finding.severity)) fail(`${prefix}:${finding.id}: invalid severity ${finding.severity}`);
        if (!FINDING_STATUSES.has(finding.status)) fail(`${prefix}:${finding.id}: invalid status ${finding.status}`);
        if (finding.status === 'OPEN') openFindings += 1;
        if (typeof finding.summary !== 'string' || !finding.summary.trim()) fail(`${prefix}:${finding.id}: summary is required`);
        if (typeof finding.repair_direction !== 'string' || !finding.repair_direction.trim()) fail(`${prefix}:${finding.id}: repair_direction is required`);
        if (!Array.isArray(finding.evidence) || finding.evidence.length === 0) fail(`${prefix}:${finding.id}: evidence is required`);
      }

      if (record.overall_state === 'PASS' && (!allClean || openFindings > 0)) {
        fail(`${prefix}: PASS is invalid with unresolved categories or open findings`);
      }
      if (record.overall_state === 'HOLD_REVIEW' && classBySlug.get(record.slug) !== 'HOLD') {
        fail(`${prefix}: HOLD_REVIEW is only valid for canonical HOLD tools`);
      }
    }
  }
}

if (!process.exitCode) {
  console.log(`PASS: strict audit plan valid; tools=${plan.totalTools}, waves=${plan.waveCount}, sizes=${plan.waveSizes.join('/')}`);
  waves.forEach((slugs, index) => console.log(`Wave ${index + 1}: ${slugs.join(', ')}`));
}
