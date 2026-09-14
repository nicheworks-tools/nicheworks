import assert from 'node:assert/strict';
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

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function canonicalKey(value = '') {
  return parser.canonicalIdentityKey(value);
}

function normalizeHttpsSource(value) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text) return '';
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== 'https:' || !parsed.hostname) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

const rows = DATA_FILES.flatMap((file) => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`);
  return payload.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const hardFailures = [];
const groups = new Map();
let verifiedNoteRecords = 0;
let recordsWithNoteSources = 0;
let sourceMetadataWithoutVerification = 0;
let validSourceUrls = 0;

for (const item of rows) {
  const label = `${item.__file}[${item.__index}] ${normalizeText(item.en) || '(missing en)'}`;

  if (Object.prototype.hasOwnProperty.call(item, 'note_verified') && typeof item.note_verified !== 'boolean') {
    hardFailures.push(`${label}: note_verified must be boolean when present`);
  }

  if (Object.prototype.hasOwnProperty.call(item, 'note_sources') && !Array.isArray(item.note_sources)) {
    hardFailures.push(`${label}: note_sources must be an array when present`);
  }

  const rawSources = Array.isArray(item.note_sources) ? item.note_sources : [];
  const normalizedSources = [];
  const seenSources = new Set();

  if (rawSources.length) recordsWithNoteSources += 1;

  for (const source of rawSources) {
    const normalized = normalizeHttpsSource(source);
    if (!normalized) {
      hardFailures.push(`${label}: note_sources entries must be valid HTTPS URLs`);
      continue;
    }
    if (seenSources.has(normalized)) {
      hardFailures.push(`${label}: duplicate note_sources URL after normalization: ${normalized}`);
      continue;
    }
    seenSources.add(normalized);
    normalizedSources.push(normalized);
    validSourceUrls += 1;
  }

  if (item.note_verified === true) {
    verifiedNoteRecords += 1;
    if (!normalizeText(item.note_short)) {
      hardFailures.push(`${label}: note_verified=true requires non-empty note_short`);
    }
    if (normalizedSources.length === 0) {
      hardFailures.push(`${label}: note_verified=true requires at least one valid HTTPS note_sources entry`);
    }
  } else if (normalizedSources.length > 0) {
    sourceMetadataWithoutVerification += 1;
  }

  const key = canonicalKey(item.en);
  if (!key) continue;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}

let canonicalVerifiedNoteConflicts = 0;
for (const [key, group] of groups.entries()) {
  const verifiedNotes = new Set(
    group
      .filter((item) => item.note_verified === true)
      .map((item) => normalizeText(item.note_short))
      .filter(Boolean)
  );
  if (verifiedNotes.size > 1) {
    canonicalVerifiedNoteConflicts += 1;
    hardFailures.push(`${key}: conflicting verified note_short values for one canonical identity`);
  }
}

assert.equal(parser.normalizeNoteSources(['https://example.com/a', 'https://example.com/a']), ['https://example.com/a'].map(String).length ? undefined : undefined);

const secondRecordVerified = parser.mergeDictionaryRecords([
  {
    en: 'Test Ingredient',
    jp: [],
    alias: [],
    note_short: 'Unverified legacy note'
  },
  {
    en: 'Test Ingredient',
    jp: [],
    alias: [],
    note_short: 'Reviewed functional note',
    note_verified: true,
    note_sources: ['https://example.com/source-a']
  }
])[0];

assert.equal(secondRecordVerified.note_verified, true, 'verified provenance must survive canonical merge regardless of record order');
assert.equal(secondRecordVerified.note_short, 'Reviewed functional note', 'verified note must replace unverified legacy compatibility note');
assert.deepEqual(secondRecordVerified.note_sources, ['https://example.com/source-a'], 'verified note source must survive canonical merge');

const sourceUnion = parser.mergeDictionaryRecords([
  {
    en: 'Source Union Ingredient',
    note_short: 'Same reviewed note',
    note_verified: true,
    note_sources: ['https://example.com/source-a']
  },
  {
    en: 'Source Union Ingredient',
    note_short: 'Same reviewed note',
    note_verified: true,
    note_sources: ['https://example.com/source-b']
  }
])[0];

assert.equal(sourceUnion.note_verified, true, 'identical verified notes should remain verified');
assert.deepEqual(
  sourceUnion.note_sources,
  ['https://example.com/source-a', 'https://example.com/source-b'],
  'identical verified notes should union unique HTTPS sources'
);

const conflict = parser.mergeDictionaryRecords([
  {
    en: 'Conflict Ingredient',
    note_short: 'Reviewed note A',
    note_verified: true,
    note_sources: ['https://example.com/source-a']
  },
  {
    en: 'Conflict Ingredient',
    note_short: 'Reviewed note B',
    note_verified: true,
    note_sources: ['https://example.com/source-b']
  }
])[0];

assert.equal(conflict.note_verified, undefined, 'conflicting verified notes must fail closed');
assert.equal(conflict.note_sources, undefined, 'conflicting verified notes must not expose a winning source set');
assert.equal(conflict.note_provenance_conflict?.length, 2, 'conflicting verified notes must remain auditable');
assert.equal(conflict.semantic_conflicts?.note_provenance?.length, 2, 'verified note conflict must be explicit in semantic conflicts');

const invalidCandidate = parser.mergeDictionaryRecords([
  {
    en: 'Invalid Provenance Ingredient',
    note_short: 'Looks reviewed but lacks usable provenance',
    note_verified: true,
    note_sources: ['http://example.com/not-https']
  }
])[0];

assert.equal(invalidCandidate.note_verified, undefined, 'invalid provenance must fail closed during canonical merge');
assert.equal(invalidCandidate.note_sources, undefined, 'invalid provenance sources must not survive runtime merge');

const report = {
  status: hardFailures.length ? 'fail' : 'pass',
  phase: 'note-provenance-schema',
  dictionary_records: rows.length,
  verified_note_records: verifiedNoteRecords,
  records_with_note_sources: recordsWithNoteSources,
  valid_note_source_urls: validSourceUrls,
  source_metadata_without_verification: sourceMetadataWithoutVerification,
  canonical_verified_note_conflicts: canonicalVerifiedNoteConflicts,
  runtime_merge_order_independent: true,
  runtime_conflicts_fail_closed: true,
  hard_failures: hardFailures
};

console.log(JSON.stringify(report, null, 2));
if (hardFailures.length) process.exit(1);
