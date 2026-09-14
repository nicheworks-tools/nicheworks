const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUTPUT = path.join(DATA, 'image-identity-backlog-v2.3.json');
const RUNTIME_MANIFESTS = [
  'image-pilots.json',
  'image-pilots-002.json',
  'image-pilots-003.json',
  'image-pilots-004.json',
  'image-pilots-005.json',
  'image-pilots-006.json',
  'image-pilots-007.json',
  'image-pilots-008.json',
  'image-pilots-009.json',
  'image-pilots-010.json',
  'image-pilots-011.json',
  'image-pilots-012.json'
];

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

function normalize(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/[‐‑‒–—―−]/g, '-')
    .replace(/[／]/g, '/')
    .replace(/[\s\u3000]+/g, ' ')
    .trim();
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

function loadCorpus() {
  const manifest = readJson(path.join(DATA, 'quality-manifest.json'));
  const files = [];
  for (const source of array(manifest?.base)) files.push(String(source).replace(/^\.\/data\//, ''));
  for (const pack of Array.isArray(manifest?.packs) ? manifest.packs : []) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) files.push(String(source).replace(/^\.\/data\//, ''));
  }
  const byId = new Map();
  for (const rel of files) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) continue;
    for (const entry of entriesFrom(readJson(file))) {
      if (entry.id && !byId.has(entry.id)) byId.set(entry.id, entry);
    }
  }
  return [...byId.values()];
}

function candidateScore(item, entry) {
  let score = 0;
  const ja = normalize(item.ja);
  const en = normalize(item.en);
  const termJa = normalize(entry.term.ja);
  const termEn = normalize(entry.term.en);
  const aliasesJa = entry.aliases.ja.map(normalize);
  const aliasesEn = entry.aliases.en.map(normalize);
  if (ja && termJa === ja) score += 7;
  if (en && termEn === en) score += 7;
  if (ja && aliasesJa.includes(ja)) score += 3;
  if (en && aliasesEn.includes(en)) score += 3;
  for (const key of item.keys) {
    const k = normalize(key);
    if (!k) continue;
    if (k === termJa || k === termEn) score += 2;
    else if (aliasesJa.includes(k) || aliasesEn.includes(k)) score += 1;
  }
  return score;
}

function mapCanonical(item, corpus) {
  const ranked = corpus
    .map((entry) => ({ id: entry.id, score: candidateScore(item, entry) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  if (!ranked.length || ranked[0].score < 7) return { state: 'unresolved', candidates: ranked.slice(0, 3) };
  const top = ranked[0].score;
  const tied = ranked.filter((row) => row.score === top);
  if (tied.length !== 1) return { state: 'ambiguous', candidates: tied.slice(0, 5) };
  return { state: 'mapped', entry_id: ranked[0].id, score: top };
}

function parsePilot(row, manifest, index) {
  if (!Array.isArray(row) || row.length < 6) return null;
  const [keys, ja, en, src, captionJa, captionEn] = row;
  if (!keys || !ja || !en || !src) return null;
  return {
    manifest,
    index,
    keys: String(keys).split('|').map((v) => v.trim()).filter(Boolean),
    ja: String(ja).trim(),
    en: String(en).trim(),
    src: String(src).trim(),
    caption_ja: String(captionJa || '').trim(),
    caption_en: String(captionEn || '').trim()
  };
}

function backlogRecord(row) {
  return {
    manifest: row.item.manifest,
    index: row.item.index,
    ja: row.item.ja,
    en: row.item.en,
    keys: row.item.keys,
    src: row.item.src,
    candidates: row.mapping.candidates || []
  };
}

const corpus = loadCorpus();
const items = [];
for (const manifestName of RUNTIME_MANIFESTS) {
  const file = path.join(DATA, manifestName);
  const json = readJson(file);
  const rows = Array.isArray(json?.items) ? json.items : [];
  rows.forEach((row, index) => {
    const item = parsePilot(row, manifestName, index);
    if (item) items.push(item);
  });
}

const canonical = items.map((item) => ({ item, mapping: mapCanonical(item, corpus) }));
const mapped = canonical.filter((row) => row.mapping.state === 'mapped');
const ambiguous = canonical.filter((row) => row.mapping.state === 'ambiguous');
const unresolved = canonical.filter((row) => row.mapping.state === 'unresolved');

const report = {
  schema: 'cta-image-identity-backlog-v2.3',
  algorithm: 'audit-image-assets-v2.3-canonical-mapping',
  runtime_manifest_count: RUNTIME_MANIFESTS.length,
  runtime_items: items.length,
  corpus_entries: corpus.length,
  counts: {
    mapped: mapped.length,
    ambiguous: ambiguous.length,
    unresolved: unresolved.length,
    backlog: ambiguous.length + unresolved.length
  },
  ambiguous: ambiguous.map(backlogRecord),
  unresolved: unresolved.map(backlogRecord)
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(`CTA_IMAGE_IDENTITY_BACKLOG=${OUTPUT}`);
console.log(`CTA_IMAGE_IDENTITY_COUNTS=${JSON.stringify(report.counts)}`);
