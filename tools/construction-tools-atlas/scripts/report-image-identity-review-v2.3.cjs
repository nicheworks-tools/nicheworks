const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function arr(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function normalizeEntry(row) {
  return {
    id: text(row?.id || row?.slug),
    ja: text(row?.ja || row?.term?.ja || row?.jp),
    en: text(row?.en || row?.term?.en),
    description_ja: text(row?.dj || row?.description?.ja || row?.description_ja),
    description_en: text(row?.de || row?.description?.en || row?.description_en),
    aliases_ja: arr(row?.aj || row?.aliases?.ja || row?.aliases_ja),
    aliases_en: arr(row?.ae || row?.aliases?.en || row?.aliases_en),
    type: text(row?.t || row?.type),
    category: text(row?.c || row?.category),
    task: text(row?.task)
  };
}

function entriesFrom(raw) {
  if (Array.isArray(raw)) return raw.map(normalizeEntry);
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows.map(normalizeEntry);
  if (Array.isArray(raw?.entries)) return raw.entries.map(normalizeEntry);
  if (Array.isArray(raw?.data)) return raw.data.map(normalizeEntry);
  return [];
}

function loadCanonical() {
  const manifest = readJson(path.join(DATA, 'quality-manifest.json'));
  const files = [];
  for (const source of arr(manifest.base)) files.push(String(source).replace(/^\.\/data\//, ''));
  for (const pack of Array.isArray(manifest.packs) ? manifest.packs : []) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) files.push(String(source).replace(/^\.\/data\//, ''));
  }
  const map = new Map();
  for (const rel of files) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) continue;
    for (const entry of entriesFrom(readJson(file))) {
      if (entry.id) map.set(entry.id, { ...entry, source_file: rel });
    }
  }
  return map;
}

function key(row) {
  return `${text(row?.manifest)}:${Number.isInteger(row?.index) ? row.index : 'invalid'}`;
}

const backlog = readJson(path.join(DATA, 'image-identity-backlog-v2.3.json'));
const ledger = readJson(path.join(DATA, 'image-identity-resolutions-v2.3.json'));
const canonical = loadCanonical();
const backlogRows = [
  ...(Array.isArray(backlog.ambiguous) ? backlog.ambiguous : []),
  ...(Array.isArray(backlog.unresolved) ? backlog.unresolved : [])
];
const backlogMap = new Map(backlogRows.map((row) => [key(row), row]));
const reviewStates = new Set(['canonical_duplicate_review', 'semantic_scope_review']);

const report = (Array.isArray(ledger.holds) ? ledger.holds : [])
  .filter((hold) => reviewStates.has(text(hold.state)))
  .map((hold) => {
    const source = backlogMap.get(key(hold)) || {};
    const candidateIds = Array.isArray(source.candidates)
      ? source.candidates.map((candidate) => text(candidate?.id || candidate)).filter(Boolean)
      : [];
    return {
      key: key(hold),
      state: text(hold.state),
      reason: text(hold.reason),
      legacy: { ja: text(source.ja), en: text(source.en), src: text(source.src) },
      candidates: candidateIds.map((id) => canonical.get(id) || { id, missing: true })
    };
  });

console.log(`CTA_IMAGE_HOLD_REVIEW=${JSON.stringify(report)}`);
console.log(`- review rows: ${report.length}`);
