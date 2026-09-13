import fs from 'node:fs';

const path = 'audits/tool-quality-matrix.json';
const matrix = JSON.parse(fs.readFileSync(path, 'utf8'));
const slug = 'phone-quickcheck';

matrix.registered_tool_count = 89;
matrix.record_count = 89;
matrix.spec_coverage_count = 89;
matrix.counts = matrix.counts || {};
matrix.counts.pass = 89;
matrix.counts.pending = 0;
matrix.counts.decision_required = 0;

matrix.records = (matrix.records || []).filter((record) => record.slug !== slug);

const record = {
  slug,
  display_name: {
    ja: 'スマホ QuickCheck',
    en: 'Phone QuickCheck'
  },
  implementation: 'tools/phone-quickcheck/',
  active_state: 'active',
  category: ['phone', 'smartphone', 'charging', 'size', 'battery'],
  spec: 'docs/tools/phone-quickcheck.md',
  spec_coverage: 'complete',
  implementation_exists: true,
  layout_class: 'desktop-wide',
  language_policy: 'bilingual single-page',
  functional_completeness: 'documented-current-contract',
  inputs_summary: '- Phone-model search text. - Manufacturer, charging-port, release-year, and sort selections. - Selected phone record. - JP/EN display language.',
  outputs_summary: '- Phone size/weight/charging quick check. - Verified charger/protocol/wireless guidance. - Approximate 5,000 / 10,000 / 20,000mAh recharge counts when battery capacity is maintained. - Reusable accessory-class guidance. - Official manufacturer specification/manual links.',
  network_dependency: {
    status: 'present',
    external_hosts: [
      'www.apple.com',
      'support.apple.com',
      'store.google.com',
      'support.google.com',
      'www.samsung.com',
      'www.sony.jp',
      'jp.sharp',
      'ofuse.me',
      'ko-fi.com'
    ]
  },
  storage: {
    localStorage: true,
    sessionStorage: false
  },
  capabilities: {
    copy: false,
    download: false
  },
  responsive_status: 'no-observed-defect',
  usage_status: 'recommended-and-missing',
  faq_status: 'optional-absent',
  ga4_status: 'present',
  adsense_status: 'present',
  canonical_status: 'present',
  json_ld_status: 'present',
  donation_status: 'present',
  privacy_compliance: 'documented',
  functional_test_status: 'behavior-test-missing',
  automated_tests: ['scripts/check-tool-runtime-contracts.mjs'],
  outstanding_issues: [
    'Usage documentation is recommended but absent.',
    'Behavior-level automated tests are absent.'
  ],
  final_state: 'PASS',
  evidence: [
    'tools/phone-quickcheck/index.html',
    'tools/phone-quickcheck/app.js',
    'tools/phone-quickcheck/style.css',
    'tools/phone-quickcheck/data/phones.json',
    'tools/phone-quickcheck/data/accessories.json'
  ],
  usage_html_present: false,
  usage_en_html_present: false,
  common_spec_compliance: 'no-hard-gap-found',
  obvious_broken_or_incomplete_behavior: [],
  help_documentation: {
    main_page_summary: 'required-and-present',
    usage: 'recommended-and-missing',
    faq: 'optional-absent',
    usage_evidence: [],
    usage_language_coverage: {
      ja: false,
      en: false
    }
  },
  test_evidence: [
    {
      path: 'scripts/check-tool-runtime-contracts.mjs',
      classification: 'regression/contract test'
    }
  ],
  decision_gaps: [],
  hard_compliance_gaps: [],
  recommendation_only_gaps: [
    'Usage documentation is recommended but absent.',
    'Behavior-level automated tests are absent.'
  ]
};

const insertAfter = matrix.records.findIndex((item) => item.slug === 'pdf2csv-local');
if (insertAfter >= 0) matrix.records.splice(insertAfter + 1, 0, record);
else matrix.records.push(record);

if (matrix.records.length !== 89) {
  throw new Error(`Expected 89 matrix records, got ${matrix.records.length}`);
}

const slugs = matrix.records.map((item) => item.slug);
if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate quality-matrix slug detected');

fs.writeFileSync(path, `${JSON.stringify(matrix, null, 2)}\n`);
console.log(`Synced ${slug}; ${matrix.records.length} records.`);
