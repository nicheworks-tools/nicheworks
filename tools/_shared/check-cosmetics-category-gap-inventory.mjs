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

const FROZEN_MISSING_CATEGORY_CEILING = 187;

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function canonicalKey(value = '') {
  return parser.canonicalIdentityKey(value);
}

function splitCategory(value = '') {
  const output = [];
  const seen = new Set();
  for (const part of normalizeText(value).split(/\s*\/\s*/)) {
    const text = normalizeText(part);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

const rows = DATA_FILES.flatMap((file) => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`);
  return payload.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const groups = new Map();
for (const row of rows) {
  const key = canonicalKey(row.en);
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const verifiedCategoryEvidence = parser.verifiedCategoryEvidence || {};
const verifiedEvidenceKeys = new Set(Object.keys(verifiedCategoryEvidence));
const missingRows = rows.filter((row) => !normalizeText(row.category));
const missingCanonicalKeys = new Set();
const entries = [];

let rowsWithCanonicalLegacyCategory = 0;
let rowsRequiringExternalSource = 0;
const canonicalWithLegacyCategory = new Set();
const canonicalRequiringExternalSource = new Set();
const canonicalResolvedByVerifiedEvidence = new Set();
const sourceRequiredUniqueCanonical = new Set();
const sourceRequiredDuplicateCanonical = new Set();

for (const row of missingRows) {
  const key = canonicalKey(row.en);
  if (!key) continue;
  missingCanonicalKeys.add(key);

  const group = groups.get(key) || [row];
  const observedCategories = [];
  const seenCategories = new Set();

  for (const peer of group) {
    for (const category of splitCategory(peer.category)) {
      const normalized = category.toLowerCase();
      if (seenCategories.has(normalized)) continue;
      seenCategories.add(normalized);
      observedCategories.push(category);
    }
  }

  const hasLegacyHint = observedCategories.length > 0;
  const hasVerifiedEvidence = verifiedEvidenceKeys.has(key);
  if (hasVerifiedEvidence) canonicalResolvedByVerifiedEvidence.add(key);

  if (hasLegacyHint) {
    rowsWithCanonicalLegacyCategory += 1;
    canonicalWithLegacyCategory.add(key);
  } else {
    rowsRequiringExternalSource += 1;
    canonicalRequiringExternalSource.add(key);
    if (group.length === 1) sourceRequiredUniqueCanonical.add(key);
    else sourceRequiredDuplicateCanonical.add(key);
  }

  entries.push({
    canonical: key,
    en: normalizeText(row.en),
    file: row.__file,
    index: row.__index,
    canonical_records: group.length,
    observed_legacy_categories: observedCategories,
    verified_category_evidence: hasVerifiedEvidence ? verifiedCategoryEvidence[key].category : null,
    disposition: hasVerifiedEvidence
      ? 'resolved_by_verified_category_evidence'
      : hasLegacyHint
        ? 'legacy_hint_requires_source_verification'
        : 'external_source_required'
  });
}

entries.sort((a, b) =>
  a.disposition.localeCompare(b.disposition)
  || a.canonical.localeCompare(b.canonical)
  || a.file.localeCompare(b.file)
  || a.index - b.index
);

const unresolvedExternalSourceCanonical = new Set(
  [...canonicalRequiringExternalSource].filter((key) => !canonicalResolvedByVerifiedEvidence.has(key))
);

const hardFailures = [];
if (missingRows.length > FROZEN_MISSING_CATEGORY_CEILING) {
  hardFailures.push(`category semantic debt regressed: ${missingRows.length} missing rows exceeds ceiling ${FROZEN_MISSING_CATEGORY_CEILING}`);
}
if (rowsWithCanonicalLegacyCategory + rowsRequiringExternalSource !== missingRows.length) {
  hardFailures.push('category gap disposition does not account for every missing-category row');
}
for (const key of verifiedEvidenceKeys) {
  if (!groups.has(key)) hardFailures.push(`verified category evidence references unknown canonical identity: ${key}`);
}

const report = {
  status: hardFailures.length ? 'fail' : 'pass',
  phase: 'category-gap-inventory',
  dictionary_records: rows.length,
  canonical_identities: groups.size,
  missing_category_rows: missingRows.length,
  missing_category_canonical_identities: missingCanonicalKeys.size,
  rows_with_same_canonical_legacy_category_hint: rowsWithCanonicalLegacyCategory,
  canonical_identities_with_legacy_category_hint: canonicalWithLegacyCategory.size,
  rows_requiring_external_source: rowsRequiringExternalSource,
  canonical_identities_requiring_external_source: canonicalRequiringExternalSource.size,
  verified_category_evidence_canonical_identities: verifiedEvidenceKeys.size,
  missing_category_canonical_identities_resolved_by_verified_evidence: canonicalResolvedByVerifiedEvidence.size,
  unresolved_external_source_canonical_identities_after_verified_overlay: unresolvedExternalSourceCanonical.size,
  source_required_unique_canonical_identities: sourceRequiredUniqueCanonical.size,
  source_required_duplicate_canonical_identities: sourceRequiredDuplicateCanonical.size,
  rule: 'Legacy category values are hints only. Verified canonical category evidence is maintained separately from recognition records.',
  entries,
  hard_failures: hardFailures
};

console.log(JSON.stringify(report, null, 2));
if (hardFailures.length) process.exit(1);
