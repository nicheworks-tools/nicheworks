const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const IMAGES = path.join(ROOT, 'images');
const ledger = JSON.parse(fs.readFileSync(path.join(DATA, 'image-wave5-sources-v2.3.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(DATA, 'image-registry-v2.3.json'), 'utf8'));
const attributionPath = path.join(IMAGES, 'ATTRIBUTION.md');
const errors = [];

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function entryIdsFrom(raw) {
  if (Array.isArray(raw)) return raw.map((row) => text(row?.id || row?.slug)).filter(Boolean);
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows.map((row) => text(row?.id)).filter(Boolean);
  if (Array.isArray(raw?.entries)) return raw.entries.map((row) => text(row?.id || row?.slug)).filter(Boolean);
  if (Array.isArray(raw?.data)) return raw.data.map((row) => text(row?.id || row?.slug)).filter(Boolean);
  return [];
}

function loadCorpusIds() {
  const manifest = readJson(path.join(DATA, 'quality-manifest.json'));
  const files = [];
  for (const source of array(manifest.base)) files.push(String(source).replace(/^\.\/data\//, ''));
  for (const pack of array(manifest.packs)) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) files.push(String(source).replace(/^\.\/data\//, ''));
  }
  const ids = new Set();
  for (const rel of files) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) continue;
    for (const id of entryIdsFrom(readJson(file))) ids.add(id);
  }
  return ids;
}

function requireHttps(value, label, id) {
  const raw = text(value);
  if (!raw) {
    errors.push(`${id}: ${label} is required`);
    return null;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') errors.push(`${id}: ${label} must use https`);
    return url;
  } catch (_) {
    errors.push(`${id}: ${label} must be a valid URL`);
    return null;
  }
}

function expectedSource(item) {
  return {
    source_url: text(item.source_url),
    source_page: text(item.source_page),
    license: text(item.license),
    license_url: text(item.license_url),
    author: text(item.author),
    attribution: text(item.attribution),
    source_sha1: text(item.source_sha1)
  };
}

if (ledger.schema !== 'cta-image-wave5-sources-v2.3') errors.push('source ledger schema marker is invalid');
if (!text(ledger.version)) errors.push('source ledger version is required');
if (ledger.policy?.runtime_hotlink !== false) errors.push('policy.runtime_hotlink must be false');
if (!Array.isArray(ledger.items) || ledger.items.length === 0) errors.push('source ledger items must be a non-empty array');
if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) errors.push('canonical registry schema is invalid');

const corpusIds = loadCorpusIds();
const registryById = new Map(array(registry.items).map((item) => [text(item.entry_id), item]));
const markdown = fs.existsSync(attributionPath) ? fs.readFileSync(attributionPath, 'utf8') : '';
const seenIds = new Set();
const seenUrls = new Set();
let staged = 0;
let promoted = 0;

for (const item of array(ledger.items)) {
  const id = text(item.entry_id);
  if (!id) {
    errors.push('source ledger item missing entry_id');
    continue;
  }
  if (seenIds.has(id)) errors.push(`${id}: duplicate entry_id`);
  seenIds.add(id);
  if (!corpusIds.has(id)) errors.push(`${id}: entry_id is not present in the active canonical corpus`);

  const sourceUrl = requireHttps(item.source_url, 'source_url', id);
  const sourcePage = requireHttps(item.source_page, 'source_page', id);
  requireHttps(item.license_url, 'license_url', id);
  if (sourceUrl && sourceUrl.hostname !== 'upload.wikimedia.org') errors.push(`${id}: binary source must be upload.wikimedia.org`);
  if (sourcePage && sourcePage.hostname !== 'commons.wikimedia.org') errors.push(`${id}: source page must be commons.wikimedia.org`);
  if (sourceUrl) {
    if (seenUrls.has(sourceUrl.href)) errors.push(`${id}: duplicate source_url`);
    seenUrls.add(sourceUrl.href);
  }

  for (const field of ['source_filename', 'license', 'author', 'attribution', 'review_note']) {
    if (!text(item[field])) errors.push(`${id}: ${field} is required`);
  }
  if (!/\.(?:jpe?g|png)$/i.test(text(item.source_filename))) errors.push(`${id}: source_filename must be JPEG or PNG raster`);
  if (item.subject_match !== 'matched') errors.push(`${id}: subject_match must be matched before acquisition`);
  if (!['reviewed', 'verified'].includes(item.review_state)) errors.push(`${id}: review_state must be reviewed or verified`);

  const expectedHash = text(item.expected_sha1);
  if (!/^[a-f0-9]{40}$/.test(expectedHash)) errors.push(`${id}: expected_sha1 must be a pinned 40-character lowercase SHA-1`);
  const hash = text(item.source_sha1);
  if (hash && !/^[a-f0-9]{40}$/.test(hash)) errors.push(`${id}: source_sha1 must be 40 lowercase hex characters`);
  if (hash && expectedHash && hash !== expectedHash) errors.push(`${id}: source_sha1 must match expected_sha1`);

  const dir = path.join(IMAGES, id);
  const sourceAsset = path.join(dir, text(item.source_filename));
  const primaryAsset = path.join(dir, 'primary.webp');
  const thumbAsset = path.join(dir, 'thumb.webp');
  const assetFlags = [sourceAsset, primaryAsset, thumbAsset].map((file) => fs.existsSync(file));
  const canonical = registryById.get(id);
  const materialized = Boolean(hash) || assetFlags.some(Boolean) || Boolean(canonical);

  if (!materialized) {
    staged += 1;
    continue;
  }

  if (!hash) errors.push(`${id}: materialized Wave 5 source requires pinned source_sha1`);
  if (!assetFlags.every(Boolean)) errors.push(`${id}: materialized Wave 5 source requires retained source + primary.webp + thumb.webp`);
  if (!canonical) {
    errors.push(`${id}: materialized Wave 5 source must be promoted into the canonical registry`);
    continue;
  }
  promoted += 1;
  if (!['reviewed', 'verified'].includes(canonical.image_state)) errors.push(`${id}: promoted registry image must be reviewed or verified`);
  if (canonical.subject_match !== 'matched') errors.push(`${id}: promoted registry subject_match must be matched`);
  if (canonical.migration_state !== 'promoted') errors.push(`${id}: registry migration_state must be promoted`);
  const expectedPrimary = {
    source: `./images/${id}/${text(item.source_filename)}`,
    display: `./images/${id}/primary.webp`,
    thumbnail: `./images/${id}/thumb.webp`
  };
  for (const [field, value] of Object.entries(expectedPrimary)) {
    if (text(canonical.primary?.[field]) !== value) errors.push(`${id}: registry primary.${field} must equal ${value}`);
  }
  for (const [field, value] of Object.entries(expectedSource(item))) {
    if (text(canonical.source?.[field]) !== value) errors.push(`${id}: registry source.${field} must exactly match Wave 5 source ledger`);
  }

  const attributionFragments = [
    `\`${id}\``,
    text(item.attribution),
    `[${text(item.license)}](${text(item.license_url)})`,
    `[Wikimedia Commons](${text(item.source_page)})`,
    `\`${hash}\``
  ];
  for (const fragment of attributionFragments) {
    if (!markdown.includes(fragment)) errors.push(`${id}: generated attribution is missing ${fragment}`);
  }
}

if (promoted > 0 && !markdown.includes(`\`${text(ledger.version)}\``)) {
  errors.push(`images/ATTRIBUTION.md is missing Wave 5 source ledger version ${ledger.version}`);
}

if (errors.length) {
  console.error('Construction Tools Atlas Wave 5 image source contract: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas Wave 5 image source contract: PASS');
console.log(`- reviewed Wave 5 sources: ${ledger.items.length}`);
console.log(`- staged acquisition rows: ${staged}`);
console.log(`- fully materialized/promoted rows: ${promoted}`);
console.log('- pinned Commons identity, local raster assets, registry provenance, and attribution are gated once materialized');
