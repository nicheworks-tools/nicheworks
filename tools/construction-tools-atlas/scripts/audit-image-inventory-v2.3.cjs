const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SNAPSHOT_PATH = path.join(DATA, 'image-inventory-v2.3.json');
const EXCEPTIONS_PATH = path.join(DATA, 'image-inventory-exceptions-v2.3.json');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const RESOLUTIONS_PATH = path.join(DATA, 'image-identity-resolutions-v2.3.json');
const FORMAL_STATES = new Set(['reviewed', 'verified']);
const EXCEPTION_STATES = new Set(['not_required', 'unobtainable']);
const args = new Set(process.argv.slice(2));

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hashLines(lines) {
  return crypto.createHash('sha256').update(lines.join('\n') + '\n', 'utf8').digest('hex');
}
function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function corpusFiles(manifest) {
  const files = [];
  for (const source of array(manifest.base)) files.push(String(source).replace(/^\.\/data\//, ''));
  for (const pack of array(manifest.packs)) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) files.push(String(source).replace(/^\.\/data\//, ''));
  }
  return files;
}
function normalizeType(row) {
  return text(row?.type || row?.t || 'unknown') || 'unknown';
}
function loadCorpus() {
  const manifest = readJson(MANIFEST_PATH);
  const entries = new Map();
  for (const rel of corpusFiles(manifest)) {
    const file = path.join(DATA, rel);
    if (!fs.existsSync(file)) throw new Error(`Corpus source missing: ${rel}`);
    for (const row of rowsFrom(readJson(file))) {
      const id = text(row?.id || row?.slug);
      if (!id) throw new Error(`${rel}: corpus row missing id/slug`);
      if (entries.has(id)) throw new Error(`Duplicate corpus ID during inventory: ${id}`);
      entries.set(id, { id, type: normalizeType(row), source_file: rel });
    }
  }
  return { manifest, entries };
}
function discoverSourceLedgers() {
  return fs.readdirSync(DATA)
    .filter((name) => /^image-wave\d+-sources-v2\.3\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en'));
}
function sourceLedgerState() {
  const ledgers = [];
  let totalItems = 0;
  const ids = new Set();
  for (const name of discoverSourceLedgers()) {
    const ledger = readJson(path.join(DATA, name));
    if (!Array.isArray(ledger.items)) throw new Error(`${name}: items must be an array`);
    for (const item of ledger.items) {
      const id = text(item?.entry_id);
      if (!id) throw new Error(`${name}: item missing entry_id`);
      if (ids.has(id)) throw new Error(`Duplicate source-ledger entry_id: ${id}`);
      ids.add(id);
    }
    totalItems += ledger.items.length;
    ledgers.push({ file: name, version: text(ledger.version), items: ledger.items.length });
  }
  return { ledgers, totalItems };
}
function loadExceptions(corpusIds, formalIds) {
  const raw = readJson(EXCEPTIONS_PATH);
  if (raw.schema !== 'cta-image-inventory-exceptions-v2.3') throw new Error('Unexpected image inventory exception schema');
  const byId = new Map();
  for (const item of array(raw.items)) {
    const id = text(item?.entry_id);
    const state = text(item?.state);
    if (!id) throw new Error('Image inventory exception missing entry_id');
    if (!EXCEPTION_STATES.has(state)) throw new Error(`${id}: invalid image inventory exception state ${state}`);
    if (!corpusIds.has(id)) throw new Error(`${id}: image inventory exception is outside current corpus`);
    if (formalIds.has(id)) throw new Error(`${id}: formal image entry must not also be an exception`);
    if (byId.has(id)) throw new Error(`${id}: duplicate image inventory exception`);
    if (!text(item?.reason)) throw new Error(`${id}: image inventory exception requires reason`);
    byId.set(id, state);
  }
  return { raw, byId };
}
function buildInventory() {
  const { manifest, entries } = loadCorpus();
  const registry = readJson(REGISTRY_PATH);
  if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) throw new Error('Unexpected image registry schema');
  const corpusIds = new Set(entries.keys());
  const formalIds = new Set();
  for (const item of registry.items) {
    const id = text(item?.entry_id);
    if (!id || !corpusIds.has(id)) continue;
    const formal = FORMAL_STATES.has(item.image_state)
      && item.subject_match === 'matched'
      && text(item.primary?.display)
      && text(item.primary?.thumbnail)
      && text(item.primary?.source);
    if (formal) formalIds.add(id);
  }
  const { raw: exceptions, byId: exceptionById } = loadExceptions(corpusIds, formalIds);
  const classes = [];
  const byType = {};
  let formal = 0;
  let missing = 0;
  let notRequired = 0;
  let unobtainable = 0;
  for (const id of [...corpusIds].sort((a, b) => a.localeCompare(b, 'en'))) {
    const type = entries.get(id).type;
    let status;
    if (formalIds.has(id)) { status = 'formal_image'; formal += 1; }
    else if (exceptionById.get(id) === 'not_required') { status = 'not_required'; notRequired += 1; }
    else if (exceptionById.get(id) === 'unobtainable') { status = 'unobtainable'; unobtainable += 1; }
    else { status = 'missing_formal_image'; missing += 1; }
    classes.push({ id, status, type });
    if (!byType[type]) byType[type] = { corpus: 0, formal_image: 0, missing_formal_image: 0, not_required: 0, unobtainable: 0 };
    byType[type].corpus += 1;
    byType[type][status] += 1;
  }
  const sourceLedgers = sourceLedgerState();
  const resolutions = fs.existsSync(RESOLUTIONS_PATH) ? readJson(RESOLUTIONS_PATH) : { holds: [] };
  const summary = {
    corpus_entries: classes.length,
    formal_image_entries: formal,
    missing_formal_image_entries: missing,
    not_required_entries: notRequired,
    unobtainable_entries: unobtainable,
    classified_entries: formal + missing + notRequired + unobtainable,
    formal_coverage_percent: Number(((formal / classes.length) * 100).toFixed(4)),
    registry_items: registry.items.length,
    source_ledger_items: sourceLedgers.totalItems,
    identity_holds: array(resolutions.holds).length
  };
  if (summary.classified_entries !== summary.corpus_entries) throw new Error('Inventory classification total does not equal corpus size');
  return {
    schema: 'cta-image-inventory-v2.3',
    version: '2026-09-15-freeze-1',
    policy: {
      formal_image_states: ['reviewed', 'verified'],
      formal_subject_match: 'matched',
      requires_local_source_and_separate_webp_derivatives: true,
      legacy_svg_counts_as_final: false,
      default_without_formal_image_or_exception: 'missing_formal_image',
      exception_states: ['not_required', 'unobtainable']
    },
    sources: {
      quality_manifest_version: text(manifest.version),
      image_registry_version: text(registry.version),
      exception_ledger_version: text(exceptions.version),
      source_ledgers: sourceLedgers.ledgers
    },
    summary,
    by_type: Object.fromEntries(Object.entries(byType).sort(([a], [b]) => a.localeCompare(b, 'en'))),
    hashes: {
      corpus_id_sha256: hashLines(classes.map((row) => row.id)),
      formal_image_id_sha256: hashLines(classes.filter((row) => row.status === 'formal_image').map((row) => row.id)),
      missing_formal_image_id_sha256: hashLines(classes.filter((row) => row.status === 'missing_formal_image').map((row) => row.id)),
      classification_sha256: hashLines(classes.map((row) => `${row.id}\t${row.status}`))
    },
    missing_sample: classes.filter((row) => row.status === 'missing_formal_image').slice(0, 25).map((row) => row.id)
  };
}

const computed = buildInventory();
console.log(`CTA_IMAGE_INVENTORY_SUMMARY=${JSON.stringify(computed.summary)}`);
console.log(`CTA_IMAGE_INVENTORY_HASHES=${JSON.stringify(computed.hashes)}`);
console.log(`CTA_IMAGE_INVENTORY_BY_TYPE=${JSON.stringify(computed.by_type)}`);
console.log(`CTA_IMAGE_INVENTORY_SNAPSHOT=${JSON.stringify(computed)}`);

if (args.has('--write')) {
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(computed, null, 2)}\n`);
  console.log(`CTA_IMAGE_INVENTORY_WRITTEN=${SNAPSHOT_PATH}`);
}

if (args.has('--check')) {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error('Construction Tools Atlas image inventory: FAIL');
    console.error('- data/image-inventory-v2.3.json is missing; run with --write');
    process.exit(1);
  }
  const saved = readJson(SNAPSHOT_PATH);
  if (JSON.stringify(saved) !== JSON.stringify(computed)) {
    console.error('Construction Tools Atlas image inventory: FAIL');
    console.error('- frozen inventory is stale; run audit-image-inventory-v2.3.cjs --write and review the delta');
    process.exit(1);
  }
  console.log('Construction Tools Atlas image inventory: PASS');
  console.log(`- ${computed.summary.formal_image_entries}/${computed.summary.corpus_entries} canonicals have formal representative images`);
  console.log(`- ${computed.summary.missing_formal_image_entries} canonicals remain in the formal image backlog`);
  console.log(`- identity holds: ${computed.summary.identity_holds}`);
}
