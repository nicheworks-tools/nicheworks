const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const BACKLOG_PATH = path.join(DATA, 'image-identity-backlog-v2.3.json');
const RESOLUTIONS_PATH = path.join(DATA, 'image-identity-resolutions-v2.3.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function array(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function compactToFull(row) {
  return {
    id: text(row?.id),
    term: { ja: text(row?.ja || row?.term?.ja), en: text(row?.en || row?.term?.en) },
    aliases: {
      ja: array(row?.aj || row?.aliases_ja || row?.aliases?.ja),
      en: array(row?.ae || row?.aliases_en || row?.aliases?.en)
    }
  };
}

function fullEntry(row) {
  return {
    id: text(row?.id || row?.slug),
    term: { ja: text(row?.term?.ja || row?.ja || row?.jp), en: text(row?.term?.en || row?.en) },
    aliases: {
      ja: array(row?.aliases?.ja || row?.aliases_ja),
      en: array(row?.aliases?.en || row?.aliases_en)
    }
  };
}

function entriesFrom(raw) {
  if (Array.isArray(raw)) return raw.map(fullEntry);
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw?.rows)) return raw.rows.map(compactToFull);
  if (Array.isArray(raw?.entries)) return raw.entries.map(fullEntry);
  if (Array.isArray(raw?.data)) return raw.data.map(fullEntry);
  return [];
}

function loadCanonicalIds() {
  const manifest = readJson(path.join(DATA, 'quality-manifest.json'));
  const files = [];
  for (const source of array(manifest?.base)) files.push(String(source).replace(/^\.\/data\//, ''));
  for (const pack of Array.isArray(manifest?.packs) ? manifest.packs : []) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) files.push(String(source).replace(/^\.\/data\//, ''));
  }
  const ids = new Set();
  for (const rel of files) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) continue;
    for (const entry of entriesFrom(readJson(file))) {
      if (entry.id) ids.add(entry.id);
    }
  }
  return ids;
}

function key(row) {
  return `${text(row?.manifest)}:${Number.isInteger(row?.index) ? row.index : 'invalid'}`;
}

function fail(errors, message) {
  errors.push(message);
}

const backlog = readJson(BACKLOG_PATH);
const ledger = readJson(RESOLUTIONS_PATH);
const errors = [];

if (backlog.schema !== 'cta-image-identity-backlog-v2.3') fail(errors, `Unexpected backlog schema: ${backlog.schema}`);
if (ledger.schema !== 'cta-image-identity-resolutions-v2.3') fail(errors, `Unexpected resolution schema: ${ledger.schema}`);

const backlogRows = [
  ...(Array.isArray(backlog.ambiguous) ? backlog.ambiguous : []),
  ...(Array.isArray(backlog.unresolved) ? backlog.unresolved : [])
];
const backlogMap = new Map();
for (const row of backlogRows) {
  const k = key(row);
  if (!text(row?.manifest) || !Number.isInteger(row?.index)) fail(errors, `Backlog row has invalid key: ${JSON.stringify(row)}`);
  if (backlogMap.has(k)) fail(errors, `Duplicate backlog key: ${k}`);
  backlogMap.set(k, row);
}

if (Number(backlog?.counts?.backlog) !== backlogRows.length) {
  fail(errors, `Backlog count mismatch: counts.backlog=${backlog?.counts?.backlog}, actual=${backlogRows.length}`);
}

const canonicalIds = loadCanonicalIds();
const holdStates = new Set(array(ledger?.policy?.hold_states));
const covered = new Map();
const resolutions = Array.isArray(ledger.resolutions) ? ledger.resolutions : [];
const holds = Array.isArray(ledger.holds) ? ledger.holds : [];

for (const row of resolutions) {
  const k = key(row);
  const source = backlogMap.get(k);
  if (!source) fail(errors, `Resolution points to non-backlog row: ${k}`);
  if (covered.has(k)) fail(errors, `Backlog row covered more than once: ${k}`);
  covered.set(k, 'resolution');
  if (row.state !== 'resolved_existing') fail(errors, `${k}: resolution state must be resolved_existing`);
  const entryId = text(row.entry_id);
  if (!entryId) fail(errors, `${k}: entry_id is required`);
  else if (!canonicalIds.has(entryId)) fail(errors, `${k}: canonical entry_id does not exist: ${entryId}`);
  if (!text(row.rationale)) fail(errors, `${k}: rationale is required`);
  if (source) {
    if (text(row.legacy_ja) && text(row.legacy_ja) !== text(source.ja)) fail(errors, `${k}: legacy_ja does not match backlog (${row.legacy_ja} != ${source.ja})`);
    if (text(row.legacy_en) && text(row.legacy_en) !== text(source.en)) fail(errors, `${k}: legacy_en does not match backlog (${row.legacy_en} != ${source.en})`);
  }
}

for (const row of holds) {
  const k = key(row);
  if (!backlogMap.has(k)) fail(errors, `Hold points to non-backlog row: ${k}`);
  if (covered.has(k)) fail(errors, `Backlog row covered more than once: ${k}`);
  covered.set(k, 'hold');
  const state = text(row.state);
  if (!holdStates.has(state)) fail(errors, `${k}: invalid hold state: ${state || '<missing>'}`);
  if (!text(row.reason)) fail(errors, `${k}: hold reason is required`);
}

for (const k of backlogMap.keys()) {
  if (!covered.has(k)) fail(errors, `Backlog row is not covered by resolution ledger: ${k}`);
}

if (covered.size !== backlogRows.length) {
  fail(errors, `Coverage mismatch: covered=${covered.size}, backlog=${backlogRows.length}`);
}

if (errors.length) {
  console.error('Construction Tools Atlas image identity resolution check: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const holdCounts = {};
for (const row of holds) holdCounts[row.state] = (holdCounts[row.state] || 0) + 1;
console.log('Construction Tools Atlas image identity resolution check: PASS');
console.log(`- backlog rows: ${backlogRows.length}`);
console.log(`- resolved to existing canonical entries: ${resolutions.length}`);
console.log(`- held for review/canonical work: ${holds.length}`);
console.log(`- hold states: ${JSON.stringify(holdCounts)}`);
