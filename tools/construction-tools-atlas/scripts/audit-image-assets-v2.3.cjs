const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const IMAGE_ROOT = path.join(ROOT, 'images');
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
const IMAGE_EXTENSIONS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif']);

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

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else out.push(absolute);
  }
  return out;
}

function extCounts(files) {
  const counts = {};
  for (const file of files) {
    const ext = path.extname(file).toLowerCase() || '(none)';
    counts[ext] = (counts[ext] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort());
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
  if (!Array.isArray(row) || row.length < 6) return { malformed: true, manifest, index };
  const [keys, ja, en, src, captionJa, captionEn] = row;
  if (!keys || !ja || !en || !src) return { malformed: true, manifest, index };
  return {
    malformed: false,
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

const missingManifestFiles = RUNTIME_MANIFESTS.filter((name) => !fs.existsSync(path.join(DATA, name)));
const allManifestFiles = fs.readdirSync(DATA).filter((name) => /^image-pilots?(?:-\d+)?\.json$/i.test(name)).sort();
const inactiveManifestFiles = allManifestFiles.filter((name) => !RUNTIME_MANIFESTS.includes(name));
const items = [];
const malformed = [];

for (const manifestName of RUNTIME_MANIFESTS) {
  const file = path.join(DATA, manifestName);
  if (!fs.existsSync(file)) continue;
  const json = readJson(file);
  const rows = Array.isArray(json?.items) ? json.items : [];
  rows.forEach((row, index) => {
    const item = parsePilot(row, manifestName, index);
    if (item.malformed) malformed.push(item);
    else items.push(item);
  });
}

const imageFiles = walk(IMAGE_ROOT).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
const imageRel = imageFiles.map((file) => path.relative(ROOT, file).replaceAll(path.sep, '/'));
const referenced = [];
const missingRefs = [];
const unsupportedRefs = [];
const refCounts = new Map();

for (const item of items) {
  const srcNoQuery = item.src.split('?')[0];
  if (!srcNoQuery.startsWith('./')) unsupportedRefs.push({ manifest: item.manifest, src: item.src, reason: 'non-local-src' });
  const relative = srcNoQuery.replace(/^\.\//, '');
  const absolute = path.resolve(ROOT, relative);
  const ext = path.extname(absolute).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) unsupportedRefs.push({ manifest: item.manifest, src: item.src, reason: `unsupported-extension:${ext}` });
  if (!fs.existsSync(absolute)) missingRefs.push({ manifest: item.manifest, src: item.src });
  referenced.push(relative.replaceAll(path.sep, '/'));
  refCounts.set(relative, (refCounts.get(relative) || 0) + 1);
}

const duplicateSrcRefs = [...refCounts.entries()].filter(([, count]) => count > 1).map(([src, count]) => ({ src, count }));
const referencedSet = new Set(referenced);
const unreferencedAssets = imageRel.filter((file) => !referencedSet.has(file));
const referenceExtCounts = extCounts(referenced);
const corpus = loadCorpus();
const canonical = items.map((item) => ({ item, mapping: mapCanonical(item, corpus) }));
const mapped = canonical.filter((row) => row.mapping.state === 'mapped');
const ambiguous = canonical.filter((row) => row.mapping.state === 'ambiguous');
const unresolved = canonical.filter((row) => row.mapping.state === 'unresolved');
const uniqueMappedIds = new Set(mapped.map((row) => row.mapping.entry_id));
const duplicateCanonicalMappings = [...uniqueMappedIds].filter((id) => mapped.filter((row) => row.mapping.entry_id === id).length > 1);

const summary = {
  runtime_manifest_count: RUNTIME_MANIFESTS.length,
  discovered_manifest_count: allManifestFiles.length,
  inactive_manifest_files: inactiveManifestFiles,
  missing_runtime_manifest_files: missingManifestFiles,
  runtime_items: items.length,
  malformed_items: malformed.length,
  referenced_format_counts: referenceExtCounts,
  legacy_svg_refs: referenceExtCounts['.svg'] || 0,
  raster_refs: (referenceExtCounts['.png'] || 0) + (referenceExtCounts['.jpg'] || 0) + (referenceExtCounts['.jpeg'] || 0) + (referenceExtCounts['.webp'] || 0) + (referenceExtCounts['.avif'] || 0),
  image_asset_files: imageFiles.length,
  image_asset_format_counts: extCounts(imageRel),
  missing_referenced_assets: missingRefs.length,
  unsupported_references: unsupportedRefs.length,
  duplicate_src_references: duplicateSrcRefs.length,
  unreferenced_assets: unreferencedAssets.length,
  corpus_entries: corpus.length,
  canonical_mapped_items: mapped.length,
  canonical_ambiguous_items: ambiguous.length,
  canonical_unresolved_items: unresolved.length,
  unique_canonical_entry_ids: uniqueMappedIds.size,
  duplicate_canonical_entry_mappings: duplicateCanonicalMappings.length
};

console.log(`CTA_IMAGE_AUDIT_SUMMARY=${JSON.stringify(summary)}`);
if (ambiguous.length) console.log(`CTA_IMAGE_AMBIGUOUS_SAMPLE=${JSON.stringify(ambiguous.slice(0, 12).map((row) => ({ ja: row.item.ja, en: row.item.en, src: row.item.src, candidates: row.mapping.candidates })))}`);
if (unresolved.length) console.log(`CTA_IMAGE_UNRESOLVED_SAMPLE=${JSON.stringify(unresolved.slice(0, 12).map((row) => ({ ja: row.item.ja, en: row.item.en, src: row.item.src, candidates: row.mapping.candidates })))}`);
if (duplicateCanonicalMappings.length) console.log(`CTA_IMAGE_DUPLICATE_CANONICAL_SAMPLE=${JSON.stringify(duplicateCanonicalMappings.slice(0, 20))}`);
if (unreferencedAssets.length) console.log(`CTA_IMAGE_UNREFERENCED_SAMPLE=${JSON.stringify(unreferencedAssets.slice(0, 20))}`);

const fatal = [];
if (missingManifestFiles.length) fatal.push(`missing runtime manifests: ${missingManifestFiles.join(', ')}`);
if (malformed.length) fatal.push(`malformed runtime image rows: ${malformed.length}`);
if (missingRefs.length) fatal.push(`missing referenced image files: ${missingRefs.length}`);
if (unsupportedRefs.length) fatal.push(`unsupported/non-local image references: ${unsupportedRefs.length}`);
if (fatal.length) {
  console.error('Construction Tools Atlas image asset audit: FAIL');
  fatal.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log('Construction Tools Atlas image asset audit: PASS');
console.log(`- ${items.length} runtime image records across ${RUNTIME_MANIFESTS.length} manifests`);
console.log(`- ${summary.legacy_svg_refs} legacy SVG references are migration backlog, not accepted final representative-image format`);
console.log(`- ${mapped.length} records mapped uniquely to current canonical entries; ${ambiguous.length} ambiguous; ${unresolved.length} unresolved`);
