const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const registryPath = path.join(DATA, 'image-registry-v2.3.json');
const schemaPath = path.join(DATA, 'image-registry-v2.3.schema.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const IMAGE_STATES = new Set(['none', 'pilot', 'reviewed', 'verified']);
const SUBJECT_STATES = new Set(['unreviewed', 'matched', 'rejected']);
const MIGRATION_STATES = new Set(['legacy_svg', 'identity_resolved', 'raster_candidate', 'reviewed', 'verified', 'promoted']);
const FORMAL_STATES = new Set(['reviewed', 'verified']);
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

function assetPath(src) {
  if (!text(src)) return null;
  const noQuery = src.split('?')[0];
  if (!noQuery.startsWith('./')) return null;
  return path.resolve(ROOT, noQuery.replace(/^\.\//, ''));
}

function requireWebp(src, label, entryId) {
  if (!text(src).toLowerCase().split('?')[0].endsWith('.webp')) errors.push(`${entryId}: ${label} must be .webp`);
}

function requireExistingLocal(src, label, entryId) {
  const file = assetPath(src);
  if (!file) {
    errors.push(`${entryId}: ${label} must be a local ./ path`);
    return;
  }
  if (!fs.existsSync(file)) errors.push(`${entryId}: ${label} file does not exist: ${src}`);
}

if (registry.schema !== 'cta-image-registry-v2.3') errors.push('registry schema marker must be cta-image-registry-v2.3');
if (!text(registry.version)) errors.push('registry version is required');
if (registry.policy?.primary_format !== 'webp') errors.push('policy.primary_format must be webp');
if (registry.policy?.formal_min_state !== 'reviewed') errors.push('policy.formal_min_state must be reviewed');
if (registry.policy?.wrong_image_behavior !== 'omit') errors.push('policy.wrong_image_behavior must be omit');
if (!Array.isArray(registry.items)) errors.push('registry.items must be an array');

const corpusIds = loadCorpusIds();
const seen = new Set();
for (const item of array(registry.items)) {
  const id = text(item.entry_id);
  if (!id) {
    errors.push('registry item missing entry_id');
    continue;
  }
  if (seen.has(id)) errors.push(`${id}: duplicate registry entry_id`);
  seen.add(id);
  if (!corpusIds.has(id)) errors.push(`${id}: entry_id is not present in current corpus`);
  if (!text(item.alt_ja)) errors.push(`${id}: alt_ja is required`);
  if (!text(item.alt_en)) errors.push(`${id}: alt_en is required`);
  if (!IMAGE_STATES.has(item.image_state)) errors.push(`${id}: invalid image_state ${item.image_state}`);
  if (!SUBJECT_STATES.has(item.subject_match)) errors.push(`${id}: invalid subject_match ${item.subject_match}`);
  if (!MIGRATION_STATES.has(item.migration_state)) errors.push(`${id}: invalid migration_state ${item.migration_state}`);

  if (item.primary) {
    const display = text(item.primary.display);
    const thumbnail = text(item.primary.thumbnail);
    if (!display || !thumbnail) errors.push(`${id}: primary requires display and thumbnail`);
    if (display) {
      requireWebp(display, 'primary.display', id);
      requireExistingLocal(display, 'primary.display', id);
    }
    if (thumbnail) {
      requireWebp(thumbnail, 'primary.thumbnail', id);
      requireExistingLocal(thumbnail, 'primary.thumbnail', id);
    }
    if (display && thumbnail && display === thumbnail) errors.push(`${id}: display and thumbnail must be separate optimized assets`);
  }

  if (FORMAL_STATES.has(item.image_state)) {
    if (item.subject_match !== 'matched') errors.push(`${id}: formal image_state requires subject_match=matched`);
    if (!item.primary) errors.push(`${id}: formal image_state requires primary WebP assets`);
    if (!['reviewed', 'verified', 'promoted'].includes(item.migration_state)) errors.push(`${id}: formal image_state requires reviewed/verified/promoted migration_state`);
  }

  if (item.migration_state === 'promoted' && !FORMAL_STATES.has(item.image_state)) errors.push(`${id}: promoted image must be reviewed or verified`);
  if (item.subject_match === 'rejected' && item.migration_state === 'promoted') errors.push(`${id}: rejected subject cannot be promoted`);
  if (item.legacy?.src) requireExistingLocal(item.legacy.src, 'legacy.src', id);
}

if (errors.length) {
  console.error('Construction Tools Atlas image registry v2.3: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas image registry v2.3: PASS');
console.log(`- current corpus IDs: ${corpusIds.size}`);
console.log(`- canonical registry items: ${array(registry.items).length}`);
console.log('- formal primary images require matched subject + separate display/thumb WebP assets');
console.log('- SVG is allowed only as legacy/diagram input, never as v2.3 primary display/thumbnail');
