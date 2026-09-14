const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ledger = JSON.parse(fs.readFileSync(path.join(DATA, 'image-wave1-sources-v2.3.json'), 'utf8'));
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

if (ledger.schema !== 'cta-image-wave1-sources-v2.3') errors.push('source ledger schema marker is invalid');
if (!text(ledger.version)) errors.push('source ledger version is required');
if (ledger.policy?.runtime_hotlink !== false) errors.push('policy.runtime_hotlink must be false');
if (!Array.isArray(ledger.items) || ledger.items.length === 0) errors.push('source ledger items must be a non-empty array');

const corpusIds = loadCorpusIds();
const seenIds = new Set();
const seenUrls = new Set();
for (const item of array(ledger.items)) {
  const id = text(item.entry_id);
  if (!id) {
    errors.push('source ledger item missing entry_id');
    continue;
  }
  if (seenIds.has(id)) errors.push(`${id}: duplicate entry_id`);
  seenIds.add(id);
  if (!corpusIds.has(id)) errors.push(`${id}: entry_id is not present in current corpus`);

  const sourceUrl = requireHttps(item.source_url, 'source_url', id);
  const sourcePage = requireHttps(item.source_page, 'source_page', id);
  requireHttps(item.license_url, 'license_url', id);
  if (sourceUrl && sourceUrl.hostname !== 'upload.wikimedia.org') errors.push(`${id}: Wave 1 binary source must be upload.wikimedia.org`);
  if (sourcePage && sourcePage.hostname !== 'commons.wikimedia.org') errors.push(`${id}: Wave 1 source page must be commons.wikimedia.org`);
  if (sourceUrl) {
    if (seenUrls.has(sourceUrl.href)) errors.push(`${id}: duplicate source_url`);
    seenUrls.add(sourceUrl.href);
  }

  for (const field of ['source_filename', 'license', 'author', 'attribution', 'review_note']) {
    if (!text(item[field])) errors.push(`${id}: ${field} is required`);
  }
  if (!/\.(?:jpe?g|png)$/i.test(text(item.source_filename))) errors.push(`${id}: source_filename must be JPEG or PNG raster`);
  if (item.subject_match !== 'matched') errors.push(`${id}: subject_match must be matched before Wave 1 acquisition`);
  if (!['reviewed', 'verified'].includes(item.review_state)) errors.push(`${id}: review_state must be reviewed or verified`);
  if (text(item.source_sha1) && !/^[a-f0-9]{40}$/.test(item.source_sha1)) errors.push(`${id}: source_sha1 must be 40 lowercase hex characters`);
}

if (errors.length) {
  console.error('Construction Tools Atlas Wave 1 image source ledger: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas Wave 1 image source ledger: PASS');
console.log(`- reviewed acquisition sources: ${ledger.items.length}`);
console.log(`- canonical IDs represented: ${seenIds.size}`);
console.log('- runtime hotlinking: disabled; reviewed source binaries are acquired only by the build pipeline');
