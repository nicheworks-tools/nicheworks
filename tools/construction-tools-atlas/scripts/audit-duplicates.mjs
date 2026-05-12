import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const manifestPath = path.join(dataDir, 'quality-manifest.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, ' ')
    .replace(/[／]/g, '/')
    .trim();
}

function compactToFull(row, qualityBatch) {
  return {
    id: String(row?.id || '').trim(),
    term: {
      ja: String(row?.ja || row?.term?.ja || '').trim(),
      en: String(row?.en || row?.term?.en || '').trim(),
    },
    meta: { quality_batch: row?.quality_batch || qualityBatch || '' },
  };
}

function entriesFrom(raw, source, qualityBatch) {
  if (Array.isArray(raw)) return raw.map((entry) => ({ ...entry, __source: source }));
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw?.rows)) {
    return raw.rows.map((row) => ({ ...compactToFull(row, raw.quality_batch || qualityBatch), __source: source }));
  }
  if (Array.isArray(raw?.entries)) return raw.entries.map((entry) => ({ ...entry, __source: source }));
  if (Array.isArray(raw?.data)) return raw.data.map((entry) => ({ ...entry, __source: source }));
  return [];
}

function add(map, key, entry) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(entry);
}

const manifest = readJson(manifestPath);
const files = [
  ...(manifest.base || []),
  ...(manifest.packs || []).map((pack) => typeof pack === 'string' ? pack : pack.path),
]
  .filter(Boolean)
  .map((p) => p.replace(/^\.\/data\//, ''));

const all = [];
for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`missing: ${file}`);
    continue;
  }
  const raw = readJson(filePath);
  all.push(...entriesFrom(raw, file));
}

const byId = new Map();
const byJaEn = new Map();
const byJa = new Map();
const byEn = new Map();

for (const entry of all) {
  const id = String(entry?.id || '').trim();
  const ja = normalize(entry?.term?.ja || entry?.ja || '');
  const en = normalize(entry?.term?.en || entry?.en || '');
  add(byId, id, entry);
  add(byJaEn, ja || en ? `${ja}::${en}` : '', entry);
  add(byJa, ja, entry);
  add(byEn, en, entry);
}

function duplicates(map) {
  return [...map.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      count: entries.length,
      entries: entries.map((entry) => ({
        id: entry.id,
        ja: entry?.term?.ja || entry?.ja || '',
        en: entry?.term?.en || entry?.en || '',
        source: entry.__source,
      })),
    }));
}

const report = {
  total_entries_before_runtime_dedupe: all.length,
  duplicate_ids: duplicates(byId),
  duplicate_exact_terms_ja_en: duplicates(byJaEn),
  duplicate_ja_terms_review_needed: duplicates(byJa),
  duplicate_en_terms_review_needed: duplicates(byEn),
};

console.log(JSON.stringify(report, null, 2));

if (report.duplicate_ids.length || report.duplicate_exact_terms_ja_en.length) {
  process.exitCode = 1;
}
