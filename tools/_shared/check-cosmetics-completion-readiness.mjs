import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const parser = require('./cosmetic-ingredient-parser.js');

const DATA_FILES = [
  'tools/inci-fastscan/data/ingredients.json',
  'tools/inci-fastscan/data/ingredients-extra-1.json',
  'tools/inci-fastscan/data/ingredients-extra-2.json',
  'tools/inci-fastscan/data/ingredients-extra-3.json',
  'tools/inci-fastscan/data/ingredients-extra-4.json',
  'tools/inci-fastscan/data/ingredients-extra-5.json',
  'tools/inci-fastscan/data/ingredients-extra-6.json',
  'tools/inci-fastscan/data/ingredients-extra-7.json',
  'tools/inci-fastscan/data/ingredients-extra-8.json'
];

const EVIDENCE_FIELDS = ['source', 'source_url', 'evidence', 'evidence_url', 'reference', 'references', 'note_sources'];
const PUBLIC_ROLE_CATEGORIES = new Set([
  'humectant', 'moisturizer', 'soothing', 'smoothing', 'active', 'amino acid', 'silicone',
  'film former', 'binder', 'emollient', 'oil', 'solvent', 'preservative', 'fragrance',
  'surfactant', 'cleanser', 'uv filter', 'sunscreen', 'colorant', 'pigment',
  'antioxidant', 'botanical', 'extract', 'plant extract', 'peptide', 'ferment',
  'thickener', 'emulsifier', 'chelator', 'chelating agent', 'ph', 'ph adjuster',
  'viscosity adjuster', 'buffer', 'conditioning', 'skin conditioning',
  'hair conditioning'
]);

// Frozen from main c979c8a06a2a6491d66a0647533cb572a183602d on 2026-09-18 JST.
// These are debt ceilings, not completion targets. Future work may lower them,
// but dictionary growth must not silently create more incomplete public data.
const BASELINE_DEBT_CEILINGS = Object.freeze({
  missing_jp_name: 113,
  missing_alias_array: 343,
  missing_category: 187,
  unsupported_public_role_category: 122,
  missing_note_short: 538,
  missing_evidence_metadata: 725,
  canonical_without_supported_public_role: 191,
  canonical_without_japanese_name: 108,
  canonical_without_note_and_evidence: 599
});

const BASELINE_FLOORS = Object.freeze({
  dictionary_records: 725,
  canonical_identities: 599,
  supported_public_role_records: 416,
  canonical_with_supported_public_role: 408
});

const BASELINE_RUNTIME_PROVENANCE_FLOORS = Object.freeze({
  verified_category_runtime_identities: 119,
  verified_note_runtime_identities: 58,
  strong_runtime_data_identities: 58
});

function text(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function category(value = '') {
  return text(value).toLowerCase();
}

function canonicalKey(value = '') {
  if (parser?.canonicalIdentityKey) return parser.canonicalIdentityKey(value);
  if (parser?.normalizeBaseKey) return parser.normalizeBaseKey(value);
  return text(value).toLowerCase();
}

function hasEvidence(item) {
  return EVIDENCE_FIELDS.some((field) => {
    const value = item[field];
    if (Array.isArray(value)) return value.some((entry) => text(entry));
    return Boolean(text(value));
  });
}

function hasJapaneseName(item) {
  return Array.isArray(item.jp) && item.jp.some((value) => text(value));
}

function hasAlias(item) {
  return Array.isArray(item.alias) && item.alias.some((value) => text(value));
}

function topCounts(map, limit = 50) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

const structuralFailures = [];
const rows = DATA_FILES.flatMap((file) => {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    structuralFailures.push(`missing data file: ${file}`);
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (!Array.isArray(parsed)) {
    structuralFailures.push(`${file}: dictionary payload must be an array`);
    return [];
  }
  return parsed.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const groups = new Map();
const unsupportedCategoryCounts = new Map();
const fileCounts = new Map();

const counters = {
  records: rows.length,
  missing_en: 0,
  missing_jp_name: 0,
  missing_alias_array: 0,
  without_any_alias: 0,
  missing_category: 0,
  unsupported_public_role_category: 0,
  supported_public_role: 0,
  missing_note_short: 0,
  with_note_short: 0,
  missing_evidence_metadata: 0,
  with_evidence_metadata: 0,
  with_note_and_evidence: 0
};

for (const item of rows) {
  fileCounts.set(item.__file, (fileCounts.get(item.__file) || 0) + 1);

  const en = text(item.en);
  if (!en) {
    counters.missing_en += 1;
    structuralFailures.push(`${item.__file}[${item.__index}]: missing canonical English name`);
    continue;
  }

  const key = canonicalKey(en);
  if (!key) {
    structuralFailures.push(`${item.__file}[${item.__index}]: canonical identity normalizes to empty for ${en}`);
    continue;
  }
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);

  if (!hasJapaneseName(item)) counters.missing_jp_name += 1;
  if (!Array.isArray(item.alias)) counters.missing_alias_array += 1;
  if (!hasAlias(item)) counters.without_any_alias += 1;

  const roleCategory = category(item.category);
  if (!roleCategory) {
    counters.missing_category += 1;
  } else if (PUBLIC_ROLE_CATEGORIES.has(roleCategory)) {
    counters.supported_public_role += 1;
  } else {
    counters.unsupported_public_role_category += 1;
    unsupportedCategoryCounts.set(roleCategory, (unsupportedCategoryCounts.get(roleCategory) || 0) + 1);
  }

  const note = text(item.note_short);
  if (note) counters.with_note_short += 1;
  else counters.missing_note_short += 1;

  const evidence = hasEvidence(item);
  if (evidence) counters.with_evidence_metadata += 1;
  else counters.missing_evidence_metadata += 1;

  if (note && evidence) counters.with_note_and_evidence += 1;
}

let canonicalWithSupportedRole = 0;
let canonicalWithoutSupportedRole = 0;
let canonicalWithJapaneseName = 0;
let canonicalWithoutJapaneseName = 0;
let canonicalWithNoteAndEvidence = 0;
let canonicalWithoutNoteAndEvidence = 0;

for (const group of groups.values()) {
  const hasRole = group.some((item) => PUBLIC_ROLE_CATEGORIES.has(category(item.category)));
  if (hasRole) canonicalWithSupportedRole += 1;
  else canonicalWithoutSupportedRole += 1;

  const hasJp = group.some(hasJapaneseName);
  if (hasJp) canonicalWithJapaneseName += 1;
  else canonicalWithoutJapaneseName += 1;

  const hasStrongNote = group.some((item) => text(item.note_short) && hasEvidence(item));
  if (hasStrongNote) canonicalWithNoteAndEvidence += 1;
  else canonicalWithoutNoteAndEvidence += 1;
}

const runtimeMerged = parser.mergeDictionaryRecords(rows);
const runtimeRoleReady = runtimeMerged.filter((item) => {
  const categories = Array.isArray(item.categories) ? item.categories : [item.category];
  return categories.some((value) => PUBLIC_ROLE_CATEGORIES.has(category(value)));
}).length;
const runtimeRoleMissing = runtimeMerged.length - runtimeRoleReady;
const runtimeVerifiedCategory = runtimeMerged.filter((item) =>
  item.category_verified === true &&
  Array.isArray(item.category_sources) &&
  item.category_sources.some((value) => text(value))
).length;
const runtimeVerifiedNote = runtimeMerged.filter((item) =>
  item.note_verified === true &&
  text(item.note_short) &&
  Array.isArray(item.note_sources) &&
  item.note_sources.some((value) => text(value))
).length;
const runtimeStrongReady = runtimeMerged.filter((item) => {
  const categories = Array.isArray(item.categories) ? item.categories : [item.category];
  const hasRole = categories.some((value) => PUBLIC_ROLE_CATEGORIES.has(category(value)));
  const hasJp = hasJapaneseName(item);
  const hasVerifiedNote = item.note_verified === true &&
    text(item.note_short) &&
    Array.isArray(item.note_sources) &&
    item.note_sources.some((value) => text(value));
  return hasRole && hasJp && hasVerifiedNote;
}).length;
const runtimeStrongMissing = runtimeMerged.length - runtimeStrongReady;
const runtimeVerifiedNoteNotStrong = runtimeMerged
  .filter((item) => item.note_verified === true && text(item.note_short) && Array.isArray(item.note_sources) && item.note_sources.some((value) => text(value)))
  .filter((item) => {
    const categories = Array.isArray(item.categories) ? item.categories : [item.category];
    const hasRole = categories.some((value) => PUBLIC_ROLE_CATEGORIES.has(category(value)));
    return !(hasRole && hasJapaneseName(item));
  })
  .map((item) => ({
    canonical: canonicalKey(item.en),
    has_japanese_name: hasJapaneseName(item),
    categories: Array.isArray(item.categories) ? item.categories : []
  }));

const measuredDebt = {
  missing_jp_name: counters.missing_jp_name,
  missing_alias_array: counters.missing_alias_array,
  missing_category: counters.missing_category,
  unsupported_public_role_category: counters.unsupported_public_role_category,
  missing_note_short: counters.missing_note_short,
  missing_evidence_metadata: counters.missing_evidence_metadata,
  canonical_without_supported_public_role: canonicalWithoutSupportedRole,
  canonical_without_japanese_name: canonicalWithoutJapaneseName,
  canonical_without_note_and_evidence: canonicalWithoutNoteAndEvidence
};

const measuredFloors = {
  dictionary_records: rows.length,
  canonical_identities: groups.size,
  supported_public_role_records: counters.supported_public_role,
  canonical_with_supported_public_role: canonicalWithSupportedRole
};

for (const [metric, ceiling] of Object.entries(BASELINE_DEBT_CEILINGS)) {
  if (measuredDebt[metric] > ceiling) {
    structuralFailures.push(`completion debt regression ${metric}: ${measuredDebt[metric]} exceeds frozen ceiling ${ceiling}`);
  }
}
for (const [metric, floor] of Object.entries(BASELINE_FLOORS)) {
  if (measuredFloors[metric] < floor) {
    structuralFailures.push(`completion readiness regression ${metric}: ${measuredFloors[metric]} below frozen floor ${floor}`);
  }
}

const runtimeProvenanceMeasured = {
  verified_category_runtime_identities: runtimeVerifiedCategory,
  verified_note_runtime_identities: runtimeVerifiedNote,
  strong_runtime_data_identities: runtimeStrongReady
};
for (const [metric, floor] of Object.entries(BASELINE_RUNTIME_PROVENANCE_FLOORS)) {
  if (runtimeProvenanceMeasured[metric] < floor) {
    structuralFailures.push(`runtime provenance regression ${metric}: ${runtimeProvenanceMeasured[metric]} below frozen floor ${floor}`);
  }
}
if (runtimeVerifiedCategory !== Object.keys(parser.verifiedCategoryEvidence || {}).length) {
  structuralFailures.push('verified category overlay entries must all survive into runtime provenance');
}
if (runtimeVerifiedNote !== Object.keys(parser.verifiedNoteEvidence || {}).length) {
  structuralFailures.push('verified note overlay entries must all survive into runtime provenance');
}
if (runtimeVerifiedNoteNotStrong.length !== 0) {
  structuralFailures.push(`all verified-note identities must satisfy strong runtime readiness; blockers: ${runtimeVerifiedNoteNotStrong.map((item) => item.canonical).join(', ')}`);
}

const report = {
  status: structuralFailures.length ? 'fail' : 'pass',
  phase: 'cosmetics-completion-readiness-inventory',
  baseline_main_sha: 'c979c8a06a2a6491d66a0647533cb572a183602d',
  dictionary_files: DATA_FILES.length,
  dictionary_records: rows.length,
  canonical_identities: groups.size,
  public_role_category_count: PUBLIC_ROLE_CATEGORIES.size,
  record_readiness: {
    ...counters,
    public_role_ready_percent: rows.length ? Number((counters.supported_public_role / rows.length * 100).toFixed(2)) : 0,
    ingredient_note_with_evidence_percent: rows.length ? Number((counters.with_note_and_evidence / rows.length * 100).toFixed(2)) : 0
  },
  runtime_canonical_readiness: {
    merged_canonical_identities: runtimeMerged.length,
    with_supported_public_role: runtimeRoleReady,
    without_supported_public_role: runtimeRoleMissing,
    public_role_ready_percent: runtimeMerged.length ? Number((runtimeRoleReady / runtimeMerged.length * 100).toFixed(2)) : 0,
    verified_category_overlay_identities: Object.keys(parser.verifiedCategoryEvidence || {}).length,
    verified_category_runtime_identities: runtimeVerifiedCategory,
    verified_note_overlay_identities: Object.keys(parser.verifiedNoteEvidence || {}).length,
    verified_note_runtime_identities: runtimeVerifiedNote
  },
  runtime_shared_data_strong_readiness: {
    definition: 'supported public role + maintained Japanese name + source-backed verified ingredient-specific note',
    with_strong_runtime_data: runtimeStrongReady,
    without_strong_runtime_data: runtimeStrongMissing,
    strong_runtime_ready_percent: runtimeMerged.length ? Number((runtimeStrongReady / runtimeMerged.length * 100).toFixed(2)) : 0,
    verified_note_identities_not_strong: runtimeVerifiedNoteNotStrong
  },
  canonical_readiness: {
    with_supported_public_role: canonicalWithSupportedRole,
    without_supported_public_role: canonicalWithoutSupportedRole,
    with_japanese_name: canonicalWithJapaneseName,
    without_japanese_name: canonicalWithoutJapaneseName,
    with_note_and_evidence: canonicalWithNoteAndEvidence,
    without_note_and_evidence: canonicalWithoutNoteAndEvidence,
    public_role_ready_percent: groups.size ? Number((canonicalWithSupportedRole / groups.size * 100).toFixed(2)) : 0,
    ingredient_note_with_evidence_percent: groups.size ? Number((canonicalWithNoteAndEvidence / groups.size * 100).toFixed(2)) : 0
  },
  debt_ceiling: BASELINE_DEBT_CEILINGS,
  readiness_floor: BASELINE_FLOORS,
  runtime_provenance_floor: BASELINE_RUNTIME_PROVENANCE_FLOORS,
  unsupported_public_role_categories: topCounts(unsupportedCategoryCounts),
  records_by_file: topCounts(fileCounts, DATA_FILES.length),
  completion_definition: {
    lite_core: 'canonical identity + supported bilingual public role category; incomplete data stays explicit',
    shared_data_strong: 'canonical identity + maintained Japanese name + supported public role + source-backed verified ingredient-specific note at runtime',
    raw_dictionary_metrics: 'raw record debt only; verified parser overlays are intentionally measured separately and must not be mistaken for zero runtime provenance',
    fastscan_extra: 'Lite/shared-data readiness plus OCR/review usability; match/debug metadata remains secondary'
  },
  structural_failures: structuralFailures
};

console.log(`COSMETICS_COMPLETION_READINESS=${JSON.stringify(report)}`);
console.log(JSON.stringify(report, null, 2));
if (structuralFailures.length) process.exit(1);
