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

const CLAIM_REVIEW_RE = /\b(?:safe|safety|risk|irritat|allerg|sensiti|pregnan|toxic|comedogen|acne|well tolerated|avoid)\b/i;
const EXPECTED_RAW_CLAIM_ROWS = 22;

function normalizeText(value = '') {
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

const rows = DATA_FILES.flatMap((file) => {
  const payload = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (!Array.isArray(payload)) throw new Error(`${file}: dictionary payload must be an array`);
  return payload.map((item, index) => ({ ...item, __file: file, __index: index }));
});

const evidence = parser.verifiedNoteEvidence || {};
const entries = rows
  .filter((item) => CLAIM_REVIEW_RE.test(normalizeText(item.note_short)))
  .map((item) => {
    const canonical = parser.canonicalIdentityKey(item.en);
    return {
      canonical,
      en: normalizeText(item.en),
      file: item.__file,
      index: item.__index,
      legacy_note_short: normalizeText(item.note_short),
      resolved_by_verified_overlay: Object.hasOwn(evidence, canonical),
      verified_note_short: Object.hasOwn(evidence, canonical) ? normalizeText(evidence[canonical].note_short) : null,
      verified_note_sources: Object.hasOwn(evidence, canonical) ? [...(evidence[canonical].note_sources || [])] : []
    };
  })
  .sort((a, b) => a.canonical.localeCompare(b.canonical) || a.file.localeCompare(b.file) || a.index - b.index);

assert.equal(entries.length, EXPECTED_RAW_CLAIM_ROWS, 'frozen PR38 claim-bearing note inventory must remain exactly 22 rows');

const resolved = entries.filter((entry) => entry.resolved_by_verified_overlay);
const unresolved = entries.filter((entry) => !entry.resolved_by_verified_overlay);

console.log(JSON.stringify({
  status: 'pass',
  phase: 'claim-bearing-note-inventory',
  frozen_regex: CLAIM_REVIEW_RE.source,
  raw_claim_bearing_rows: entries.length,
  resolved_rows: resolved.length,
  unresolved_rows: unresolved.length,
  resolved_canonical_identities: [...new Set(resolved.map((entry) => entry.canonical))],
  unresolved_canonical_identities: [...new Set(unresolved.map((entry) => entry.canonical))],
  entries
}, null, 2));
