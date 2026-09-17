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

const ALLOWED_SAFETY = new Set(['safe', 'caution', 'risk']);
const EVIDENCE_FIELDS = ['source', 'source_url', 'evidence', 'evidence_url', 'reference', 'references', 'note_sources'];
const GENERATED_NOTE_RE = /generated dictionary entry|use official ingredient labels for final confirmation/i;
const CLAIM_REVIEW_RE = /\b(?:safe|safety|risk|irritat|allerg|sensiti|pregnan|toxic|comedogen|acne|well tolerated|avoid)\b/i;

// Categories that currently have a bilingual public role label and role-level
// explanation in the answer-first cosmetics UI. This is intentionally narrower
// than the raw dictionary taxonomy: unsupported categories remain explicit
// Information incomplete debt instead of receiving a fabricated explanation.
const PUBLIC_ROLE_CATEGORIES = new Set([
  'humectant', 'moisturizer', 'soothing', 'active', 'amino acid', 'silicone',
  'film former', 'emollient', 'oil', 'solvent', 'preservative', 'fragrance',
  'surfactant', 'cleanser', 'uv filter', 'sunscreen', 'colorant', 'pigment',
  'antioxidant', 'botanical', 'extract', 'peptide', 'ferment', 'thickener',
  'emulsifier', 'chelator', 'chelating agent', 'ph', 'ph adjuster',
  'viscosity adjuster'
]);

// Existing semantic-debt ceilings. These are ceilings, not targets: cleanup may
// reduce them, but later dictionary expansion may not silently increase debt.
const BASELINE_CEILINGS = Object.freeze({
  duplicate_canonical_groups: 120,
  duplicate_canonical_records_beyond_first: 126,
  records_missing_category: 187,
  records_missing_safety: 0,
  records_missing_note_short: 538,
  records_with_generated_placeholder_note: 0,
  records_with_claim_bearing_note_for_review: 22,
  canonical_groups_with_safety_conflict: 16,
  canonical_groups_with_category_conflict: 4,
  canonical_groups_with_note_conflict: 0,
  duplicate_groups_with_incomplete_semantics: 120
});

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function canonicalKey(value = '') {
  if (parser?.canonicalIdentityKey) return parser.canonicalIdentityKey(value);
  if (parser?.normalizeBaseKey) return parser.normalizeBaseKey(value);
  return normalizeText(value).toLowerCase();
}

function normalizeCategory(value = '') {
  return normalizeText(value).toLowerCase();
}

function normalizeSafety(value = '') {
  return normalizeText(value).toLowerCase();
}

function hasEvidence(item) {
  return EVIDENCE_FIELDS.some((field) => {
    const value = item[field];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  });
}

function summarizeGroup(group) {
  const values = (field, normalize = normalizeText) => [...new Set(
    group.map((item) => normalize(item[field])).filter(Boolean)
  )];

  const safety = values('safety', normalizeSafety);
  const category = values('category', normalizeCategory);
  const notes = values('note_short', normalizeText);

  return {
    canonical: canonicalKey(group[0]?.en),
    display_names: [...new Set(group.map((item) => normalizeText(item.en)).filter(Boolean))],
    records: group.length,
    safety,
    category,
    notes,
    files: [...new Set(group.map((item) => item.__file))]
  };
}

const rows = DATA_FILES.flatMap((file) => {
  const parsed = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(parsed)) throw new Error(`${file}: dictionary payload must be an array`);
  return parsed.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const hardFailures = [];
const groups = new Map();
const categoryCounts = new Map();
const safetyCounts = new Map();
const unsupportedPublicCategoryCounts = new Map();

let missingCategory = 0;
let missingSafety = 0;
let missingNote = 0;
let generatedPlaceholderNotes = 0;
let claimBearingNotes = 0;
let evidenceBackedRecords = 0;
let recordsWithPublicRole = 0;
let recordsWithoutPublicRole = 0;

for (const item of rows) {
  const en = normalizeText(item.en);
  if (!en) {
    hardFailures.push(`${item.__file}[${item.__index}]: missing canonical English name`);
    continue;
  }

  const key = canonicalKey(en);
  if (!key) {
    hardFailures.push(`${item.__file}[${item.__index}]: canonical identity normalizes to empty for ${en}`);
    continue;
  }
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);

  const safety = normalizeSafety(item.safety);
  const category = normalizeCategory(item.category);
  const note = normalizeText(item.note_short);

  if (!category) {
    missingCategory += 1;
    recordsWithoutPublicRole += 1;
  } else {
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    if (PUBLIC_ROLE_CATEGORIES.has(category)) recordsWithPublicRole += 1;
    else {
      recordsWithoutPublicRole += 1;
      unsupportedPublicCategoryCounts.set(category, (unsupportedPublicCategoryCounts.get(category) || 0) + 1);
    }
  }

  if (!safety) {
    missingSafety += 1;
  } else {
    safetyCounts.set(safety, (safetyCounts.get(safety) || 0) + 1);
    if (!ALLOWED_SAFETY.has(safety)) {
      hardFailures.push(`${en}: unsupported safety value ${JSON.stringify(item.safety)}`);
    }
  }

  if (!note) missingNote += 1;
  else {
    if (GENERATED_NOTE_RE.test(note)) generatedPlaceholderNotes += 1;
    if (CLAIM_REVIEW_RE.test(note)) claimBearingNotes += 1;
  }

  if (hasEvidence(item)) evidenceBackedRecords += 1;
}

const duplicateGroups = [];
const safetyConflicts = [];
const categoryConflicts = [];
const noteConflicts = [];
const incompleteDuplicateSemantics = [];
let canonicalIdentitiesWithPublicRole = 0;
let canonicalIdentitiesWithoutPublicRole = 0;

for (const group of groups.values()) {
  const categories = [...new Set(group.map((item) => normalizeCategory(item.category)).filter(Boolean))];
  if (categories.some((category) => PUBLIC_ROLE_CATEGORIES.has(category))) canonicalIdentitiesWithPublicRole += 1;
  else canonicalIdentitiesWithoutPublicRole += 1;

  if (group.length <= 1) continue;
  const summary = summarizeGroup(group);
  duplicateGroups.push(summary);
  if (summary.safety.length > 1) safetyConflicts.push(summary);
  if (summary.category.length > 1) categoryConflicts.push(summary);
  if (summary.notes.length > 1) noteConflicts.push(summary);

  const missingKinds = [];
  if (group.some((item) => !normalizeSafety(item.safety))) missingKinds.push('safety');
  if (group.some((item) => !normalizeCategory(item.category))) missingKinds.push('category');
  if (group.some((item) => !normalizeText(item.note_short))) missingKinds.push('note_short');
  if (missingKinds.length) incompleteDuplicateSemantics.push({ ...summary, missing_fields: missingKinds });
}

const measured = {
  duplicate_canonical_groups: duplicateGroups.length,
  duplicate_canonical_records_beyond_first: rows.length - groups.size,
  records_missing_category: missingCategory,
  records_missing_safety: missingSafety,
  records_missing_note_short: missingNote,
  records_with_generated_placeholder_note: generatedPlaceholderNotes,
  records_with_claim_bearing_note_for_review: claimBearingNotes,
  canonical_groups_with_safety_conflict: safetyConflicts.length,
  canonical_groups_with_category_conflict: categoryConflicts.length,
  canonical_groups_with_note_conflict: noteConflicts.length,
  duplicate_groups_with_incomplete_semantics: incompleteDuplicateSemantics.length
};

for (const [metric, ceiling] of Object.entries(BASELINE_CEILINGS)) {
  const actual = measured[metric];
  if (!Number.isInteger(actual)) {
    hardFailures.push(`semantic baseline metric missing: ${metric}`);
  } else if (actual > ceiling) {
    hardFailures.push(`semantic debt regression ${metric}: ${actual} exceeds frozen ceiling ${ceiling}`);
  }
}

if (DATA_FILES.length !== 9) {
  hardFailures.push(`maintained dictionary file count changed: expected 9, found ${DATA_FILES.length}`);
}

function topCounts(map, limit = 30) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function sampleConflicts(items, limit = 25) {
  return items
    .sort((a, b) => b.records - a.records || a.canonical.localeCompare(b.canonical))
    .slice(0, limit)
    .map((item) => ({
      canonical: item.canonical,
      display_names: item.display_names,
      records: item.records,
      safety: item.safety,
      category: item.category,
      note_variants: item.notes.length,
      files: item.files
    }));
}

const report = {
  status: hardFailures.length ? 'fail' : 'pass',
  phase: 'semantic-quality-and-public-role-readiness',
  dictionary_files: DATA_FILES.length,
  dictionary_records: rows.length,
  canonical_identities: groups.size,
  ...measured,
  public_role_categories_supported: PUBLIC_ROLE_CATEGORIES.size,
  records_with_public_role_explanation: recordsWithPublicRole,
  records_without_public_role_explanation: recordsWithoutPublicRole,
  canonical_identities_with_public_role_explanation: canonicalIdentitiesWithPublicRole,
  canonical_identities_without_public_role_explanation: canonicalIdentitiesWithoutPublicRole,
  unsupported_public_category_counts: topCounts(unsupportedPublicCategoryCounts, 50),
  records_with_explicit_evidence_metadata: evidenceBackedRecords,
  frozen_ceiling: BASELINE_CEILINGS,
  safety_values: topCounts(safetyCounts, 20),
  top_categories: topCounts(categoryCounts, 30),
  safety_conflict_samples: sampleConflicts(safetyConflicts),
  category_conflict_samples: sampleConflicts(categoryConflicts),
  note_conflict_samples: sampleConflicts(noteConflicts),
  incomplete_duplicate_samples: sampleConflicts(incompleteDuplicateSemantics),
  hard_failures: hardFailures
};

if (hardFailures.length) console.error(`SEMANTIC_HARD_FAILURES=${JSON.stringify(hardFailures)}`);
console.log(JSON.stringify(report, null, 2));
if (hardFailures.length) process.exit(1);
