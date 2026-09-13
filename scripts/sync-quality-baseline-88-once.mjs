import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
};

const registry = JSON.parse(read('tools/tools-index.json'));
if (registry.total !== 88 || !registry.items.some((item) => item.slug === 'reconcile')) {
  throw new Error(`Expected the current 88-tool registry with reconcile; got total=${registry.total}`);
}

// 1) Close Reconcile's mandatory common-spec support gap without touching product behavior.
{
  const rel = 'tools/reconcile/index.html';
  let html = read(rel);
  if (!html.includes('/assets/nw-support.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/nw-support.css">\n</head>');
  }
  if (!html.includes('https://ofuse.me/nicheworks') || !html.includes('https://ko-fi.com/nicheworks')) {
    const block = `    <section class="nw-donate" aria-label="Support NicheWorks">\n      <p class="nw-donate-text"><span data-i18n="ja">このツールが役に立ったら、NicheWorks の開発継続をご支援いただけます。</span><span data-i18n="en">If this tool helps, you can support ongoing NicheWorks development.</span></p>\n      <div class="nw-donate-links">\n        <a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a>\n        <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a>\n      </div>\n    </section>\n`;
    html = html.replace('  </main>\n\n  <footer', `${block}  </main>\n\n  <footer`);
  }
  write(rel, html);
}

// 2) Add the canonical 15-section Phase 1 specification for registered tool #88.
const reconcileDoc = `# NicheWorks Reconcile — canonical tool specification

- **Slug:** \`reconcile\`
- **Display name (JA):** NicheWorks Reconcile
- **Display name (EN):** NicheWorks Reconcile
- **Implementation:** \`tools/reconcile/\`
- **Registry state:** active (registered implementation present)
- **Category:** reconcile, finance, csv, xlsx
- **Common specification:** \`common-spec/spec-ja.md\`
- **Audit state:** \`PASS\`

## 1. Identity

This record is the canonical per-tool contract for the registered \`reconcile\` implementation at \`/tools/reconcile/\`. It supplements the detailed implementation contract in \`tools/reconcile/SPEC.md\` and does not authorize unrelated runtime changes.

## 2. Purpose

Reconcile two user-supplied CSV/XLSX transaction datasets locally in the browser, classify deterministic matches and exceptions, and reduce the set of records requiring human review. It is a reconciliation aid, not an accounting system or autonomous financial decision-maker.

## 3. Inputs

- File A and File B in CSV or XLSX format.
- CSV encoding: Auto, UTF-8, or Shift_JIS; delimiter: Auto, comma, tab, or semicolon; header row 1–20.
- XLSX worksheet selection.
- Required amount-column mapping plus optional date, reference/transaction ID, and description mappings.
- Free date tolerance and ambiguous-date-order controls.
- Verified Reconcile Pro may additionally use amount tolerance, sign mode, bounded 1:n / n:1 settings, and saved rule-profile controls.
- JP/EN UI selection.

## 4. Processing behavior

- Parse CSV/XLSX locally and normalize supported values conservatively; ambiguous or malformed values are not silently coerced into confident matches.
- Prioritize deterministic reference/exact relationships and only auto-confirm mutually unique relationships; ambiguous relationships remain review candidates.
- Classify results as \`exact_match\`, \`tolerant_match\`, \`candidate\`, \`a_only\`, \`b_only\`, \`duplicate\`, or \`conflict\`.
- Enforce bounded candidate/group-search limits and fail/degrade safely rather than allowing combinatorial matching to run unbounded.
- Free limits are 500 rows and 5 MB per file. Verified Reconcile Pro raises limits to CSV 100,000 rows / 50 MB and XLSX 50,000 rows / 25 MB per file and enables the documented additive Pro operations.
- Reconcile Pro authority is product-scoped: product \`reconcile.pro_v1\` with required feature \`reconcile_pro_v1\`. Shared \`nicheworks_pro\` alone must not unlock Reconcile.

## 5. Outputs

- Reconciliation summary, filter/search controls, paged review table, statuses, relations, amounts, dates, and reason text.
- Free CSV audit export.
- Verified-Pro XLSX report plus saved-rule JSON import/export and profile management.

Observed delivery capabilities: clipboard-copy-specific result action **not established**; download/export **present**.

## 6. Error behavior

- Missing/invalid files, unsupported data, missing required mappings, over-limit input, ambiguous dates, and bounded-search overflow are surfaced as non-success states rather than fabricated matches.
- Re-parsing follows the selected CSV parsing settings while the selected File object remains page-memory only.
- Missing or unverified Pro entitlement fails closed to Free behavior; a URL/local-only/shared-Pro state is not authoritative for \`reconcile_pro_v1\`.
- XLSX parsing/export uses the pinned local SheetJS CE 0.20.3 vendor; vendor/parser failures do not upload source transaction data as a fallback.
- Existing input remains available for correction where the runtime can safely retain it; transaction rows are not persisted as a recovery mechanism.

## 7. Privacy/data handling

CSV/XLSX parsing, normalization, matching, result generation, CSV/XLSX export, and transaction-row handling are browser-local. Transaction rows, descriptions, amounts, references, source files, and generated reconciliation results must not be sent to NicheWorks servers, Stripe, analytics, or advertising systems. Billing/entitlement traffic is limited to fixed product/feature/session metadata. Saved rule profiles may persist parser/mapping/matching configuration in localStorage, but not transaction rows or source files.

Network-capable product behavior is limited to same-origin billing/entitlement requests and the explicit checkout flow; suite-wide analytics/advertising and support links load separately from reconciliation processing.

## 8. Responsive contract

- **Layout class:** \`desktop-wide\` (source tool SPEC class: \`pc-oriented\`).
- Two-file mapping, reconciliation tables, and review workflows benefit from wide screens; narrow viewports must remain usable without forcing the whole product into a universal 600px shell.
- Current static audit established no concrete responsive hard defect.

## 9. Language contract

- **Policy:** \`bilingual single-page\`.
- The public tool supports same-page JP/EN UI switching. Existing languages must be preserved.
- The current separate usage page is Japanese-led; absence of a separate English usage file is not itself a hard compliance failure.

## 10. SEO contract

The public page must retain a tool-specific title/description, exactly one self-referencing canonical for \`https://nicheworks.app/tools/reconcile/\`, index/follow robots state, and valid WebApplication JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve current GA4 and AdSense identifiers/code. Ads must remain outside file-selection, mapping, reconciliation, checkout, and result-action flows. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve the footer-near OFUSE + Ko-fi support block independently from the Reconcile Pro purchase CTA. Donation/support must not be presented as purchase or entitlement. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** \`required-and-present\`.
- **Usage documentation:** \`recommended-and-present\`. Evidence: \`tools/reconcile/usage.html\`.
- **FAQ:** \`optional-absent\`. FAQ remains conditional and its absence is not a hard failure.
- Exact-file coverage: Japanese usage file **present**; separate English usage file **absent**.

## 14. Functional acceptance tests

- [ ] CSV and XLSX inputs within Free limits parse locally and can be mapped without uploading transaction data.
- [ ] Deterministic 1:1 matching preserves ambiguity as candidate/conflict rather than assigning by input order.
- [ ] Free limits and verified-Pro CSV/XLSX limits remain enforced.
- [ ] Reconcile Pro activates only from server-verified \`reconcile.pro_v1\` / \`reconcile_pro_v1\`; shared \`nicheworks_pro\` alone remains insufficient.
- [ ] CSV audit export reflects the full reconciliation result set even when the review table is paged.
- [ ] Saved profiles persist settings only and never transaction rows/files.
- [ ] Bounded candidate/group searches stop safely on pathological inputs.
- [ ] The pinned local XLSX vendor remains usable without a runtime CDN dependency.

Automated behavior-test evidence: \`tools/reconcile/tests/export.test.mjs\`, \`normalize.test.mjs\`, \`parser.test.mjs\`, \`reconcile-engine.test.mjs\`, \`reconcile-quality.test.mjs\`, \`reconcile-stress.test.mjs\`, \`rules-store.test.mjs\`, \`xlsx-adapter.test.mjs\`, and \`xlsx-real-vendor.test.mjs\`. Behavior-level status: **behavior-test-present**.

## 15. Explicit tool-specific exceptions

- Reconcile is a standalone paid-product exception to the shared NicheWorks Pro bundle: a Reconcile Pro purchase may grant shared Pro, but shared Pro does not grant Reconcile Pro.
- No fully-offline claim is made for the whole page because analytics, advertising, billing/entitlement, checkout, and support links may use network requests; transaction processing itself remains local.
- No additional language or layout exception is established beyond the contracts above.

### Implementation evidence

- \`tools/reconcile/index.html\`
- \`tools/reconcile/app.mjs\`
- \`tools/reconcile/styles.css\`
- \`tools/reconcile/SPEC.md\`
- \`tools/reconcile/usage.html\`
- \`tools/reconcile/parser.mjs\`
- \`tools/reconcile/normalize.mjs\`
- \`tools/reconcile/reconcile-engine.mjs\`
- \`tools/reconcile/export.mjs\`
- \`tools/reconcile/xlsx-adapter.mjs\`
- \`tools/reconcile/tests/\`
`;
write('docs/tools/reconcile.md', reconcileDoc);

// 3) Add Reconcile to the machine-readable quality baseline and recalculate summary counts.
{
  const rel = 'audits/tool-quality-matrix.json';
  const matrix = JSON.parse(read(rel));
  const tests = [
    'tools/reconcile/tests/export.test.mjs',
    'tools/reconcile/tests/normalize.test.mjs',
    'tools/reconcile/tests/parser.test.mjs',
    'tools/reconcile/tests/reconcile-engine.test.mjs',
    'tools/reconcile/tests/reconcile-quality.test.mjs',
    'tools/reconcile/tests/reconcile-stress.test.mjs',
    'tools/reconcile/tests/rules-store.test.mjs',
    'tools/reconcile/tests/xlsx-adapter.test.mjs',
    'tools/reconcile/tests/xlsx-real-vendor.test.mjs',
  ];
  const record = {
    slug: 'reconcile',
    display_name: { ja: 'NicheWorks Reconcile', en: 'NicheWorks Reconcile' },
    implementation: 'tools/reconcile/',
    active_state: 'active',
    category: ['reconcile', 'finance', 'csv', 'xlsx'],
    spec: 'docs/tools/reconcile.md',
    spec_coverage: 'complete',
    implementation_exists: true,
    layout_class: 'desktop-wide',
    language_policy: 'bilingual single-page',
    functional_completeness: 'documented-current-contract',
    inputs_summary: 'Two local CSV/XLSX transaction files, CSV/XLSX parser settings, column mappings, Free date controls, and verified-Pro matching/profile settings.',
    outputs_summary: 'Deterministic reconciliation statuses and review table, Free CSV audit export, and verified-Pro XLSX report plus saved-rule JSON/profile operations.',
    network_dependency: { status: 'present', external_hosts: ['ofuse.me', 'ko-fi.com'] },
    storage: { localStorage: true, sessionStorage: false },
    capabilities: { copy: false, download: true },
    responsive_status: 'no-observed-defect',
    usage_status: 'recommended-and-present',
    faq_status: 'optional-absent',
    ga4_status: 'present',
    adsense_status: 'present',
    canonical_status: 'present',
    json_ld_status: 'present',
    donation_status: 'present',
    privacy_compliance: 'documented',
    functional_test_status: 'behavior-test-present',
    automated_tests: tests,
    outstanding_issues: [],
    final_state: 'PASS',
    evidence: [
      'tools/reconcile/index.html',
      'tools/reconcile/app.mjs',
      'tools/reconcile/styles.css',
      'tools/reconcile/SPEC.md',
      'tools/reconcile/usage.html',
      'tools/reconcile/parser.mjs',
      'tools/reconcile/normalize.mjs',
      'tools/reconcile/reconcile-engine.mjs',
      'tools/reconcile/export.mjs',
      'tools/reconcile/xlsx-adapter.mjs',
    ],
    usage_html_present: true,
    usage_en_html_present: false,
    common_spec_compliance: 'no-hard-gap-found',
    obvious_broken_or_incomplete_behavior: [],
    help_documentation: {
      main_page_summary: 'required-and-present',
      usage: 'recommended-and-present',
      faq: 'optional-absent',
      usage_evidence: ['tools/reconcile/usage.html'],
      usage_language_coverage: { ja: true, en: false },
    },
    test_evidence: tests.map((testPath) => ({ path: testPath, classification: 'behavior test' })),
    decision_gaps: [],
    hard_compliance_gaps: [],
    recommendation_only_gaps: [],
  };

  matrix.records = matrix.records.filter((item) => item.slug !== 'reconcile');
  matrix.records.push(record);
  matrix.records.sort((a, b) => a.slug.localeCompare(b.slug));
  matrix.registered_tool_count = registry.total;
  matrix.record_count = matrix.records.length;
  const counts = { PASS: 0, FIX: 0, BLOCKED: 0, NEEDS_DECISION: 0 };
  for (const item of matrix.records) counts[item.final_state] += 1;
  matrix.counts = counts;
  write(rel, `${JSON.stringify(matrix, null, 2)}\n`);

  const behaviorMissing = matrix.records.filter((item) => item.functional_test_status === 'behavior-test-missing').length;
  const hardGapTools = matrix.records.filter((item) => (item.hard_compliance_gaps || []).length > 0).length;
  const recommendationGapTools = matrix.records.filter((item) => (item.recommendation_only_gaps || []).length > 0).length;
  const decisionGapTools = matrix.records.filter((item) => (item.decision_gaps || []).length > 0).length;

  let md = read('audits/tool-quality-matrix.md');
  const replacements = new Map([
    ['Registered tools', registry.total],
    ['Specifications', registry.total],
    ['Matrix records', matrix.records.length],
    ['PASS', counts.PASS],
    ['FIX', counts.FIX],
    ['BLOCKED', counts.BLOCKED],
    ['NEEDS_DECISION', counts.NEEDS_DECISION],
    ['Behavior-level tests missing', behaviorMissing],
    ['Hard common-spec violations', `${hardGapTools} tools`],
    ['Recommendation-only documentation gaps', `${recommendationGapTools} tools`],
    ['Remaining unresolved product decision gaps', decisionGapTools],
  ]);
  for (const [label, value] of replacements) {
    md = md.replace(new RegExp(`- ${label}: \\*\\*[^*]+\\*\\*`), `- ${label}: **${value}**`);
  }
  const row = '| [reconcile](../docs/tools/reconcile.md) | desktop-wide | recommended-and-present | optional-absent | behavior-test-present | 0 | 0 | **PASS** |';
  const lines = md.split('\n').filter((line) => !line.startsWith('| [reconcile]('));
  const redirectIndex = lines.findIndex((line) => line.startsWith('| [redirect-unwrapper]('));
  if (redirectIndex < 0) throw new Error('Human matrix redirect-unwrapper row not found');
  lines.splice(redirectIndex, 0, row);
  md = lines.join('\n');
  md = md.replace(/Current matrix state after this repair: \*\*\d+ PASS \/ \d+ FIX \/ \d+ BLOCKED \/ \d+ NEEDS_DECISION\*\*/, `Current matrix state after this repair: **${counts.PASS} PASS / ${counts.FIX} FIX / ${counts.BLOCKED} BLOCKED / ${counts.NEEDS_DECISION} NEEDS_DECISION**`);
  write('audits/tool-quality-matrix.md', md.endsWith('\n') ? md : `${md}\n`);
}

// 4) Replace the one-off eight-tool support checker with a small registry-wide read-only contract.
const supportChecker = `import fs from 'node:fs';\nimport path from 'node:path';\n\nconst root = process.cwd();\nconst registry = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools-index.json'), 'utf8'));\nconst failures = [];\nconst allowed = new Set(['.html', '.js', '.mjs']);\n\nfunction walk(dir) {\n  const out = [];\n  if (!fs.existsSync(dir)) return out;\n  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {\n    const abs = path.join(dir, entry.name);\n    if (entry.isDirectory()) out.push(...walk(abs));\n    else if (allowed.has(path.extname(entry.name))) out.push(abs);\n  }\n  return out;\n}\n\nfor (const item of registry.items) {\n  const dir = path.join(root, 'tools', item.slug);\n  const files = walk(dir);\n  if (!files.length) { failures.push(\`${'${item.slug}'}: no public HTML/JS implementation files found\`); continue; }\n  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\\n');\n  if (!source.includes('https://ofuse.me/nicheworks')) failures.push(\`${'${item.slug}'}: OFUSE support link missing\`);\n  if (!source.includes('https://ko-fi.com/nicheworks')) failures.push(\`${'${item.slug}'}: Ko-fi support link missing\`);\n}\n\nif (failures.length) {\n  console.error(\`Common support contract: ${'${failures.length}'} failure(s) across ${'${registry.items.length}'} registered tools\`);\n  for (const failure of failures) console.error(\`- ${'${failure}'}\`);\n  process.exit(1);\n}\n\nconsole.log(\`Common support contract OK for ${'${registry.items.length}'} registered tools.\`);\n`;
write('scripts/check-common-support-contract.mjs', supportChecker);

console.log('Synced Reconcile into the 88-tool canonical quality baseline.');
