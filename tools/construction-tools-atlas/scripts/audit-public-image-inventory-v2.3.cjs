const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const PUBLICATION_PATH = path.join(DATA, 'publication-inventory-v2.3.json');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const EXCEPTIONS_PATH = path.join(DATA, 'image-inventory-exceptions-v2.3.json');
const SNAPSHOT_PATH = path.join(DATA, 'public-image-inventory-v2.3.json');
const FORMAL_STATES = new Set(['reviewed', 'verified']);
const EXCEPTION_STATES = new Set(['not_required', 'unobtainable']);
const args = new Set(process.argv.slice(2));

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hashLines(lines) {
  return crypto.createHash('sha256').update(lines.join('\n') + '\n', 'utf8').digest('hex');
}
function localFileFromRuntimePath(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
function normalizeType(entry) {
  return text(entry?.type || entry?.t || 'unknown') || 'unknown';
}
function incrementType(table, type, status) {
  if (!table[type]) table[type] = {
    public_entries: 0,
    formal_image: 0,
    missing_formal_image: 0,
    not_required: 0,
    unobtainable: 0
  };
  table[type].public_entries += 1;
  table[type][status] += 1;
}

async function runPublicLoader() {
  const loaderSource = fs.readFileSync(LOADER_PATH, 'utf8');
  const windowObject = {};
  windowObject.fetch = async (input) => {
    const file = localFileFromRuntimePath(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  const documentStub = {
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    createElement() { return { setAttribute() {}, defer: false, src: '' }; },
    head: { appendChild() {} }
  };
  const sandbox = {
    window: windowObject,
    document: documentStub,
    console: { info() {}, log() {}, warn() {}, error: console.error },
    Set,
    Map
  };
  vm.runInNewContext(loaderSource, sandbox, { filename: 'quality-loader.js' });
  if (!windowObject.CTA_DATA_LOADER?.loadEntries) throw new Error('quality-loader did not expose CTA_DATA_LOADER.loadEntries');
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return {
    entries,
    diagnostics: windowObject.CTA_DATA_DIAGNOSTICS || {},
    resolveCanonicalId: windowObject.CTA_DATA_LOADER.resolveCanonicalId || ((id) => id)
  };
}

function isFormal(item) {
  return FORMAL_STATES.has(item?.image_state)
    && item?.subject_match === 'matched'
    && text(item?.primary?.display)
    && text(item?.primary?.thumbnail)
    && text(item?.primary?.source);
}

function formalRegistryIds(publicIds, resolveCanonicalId) {
  const registry = readJson(REGISTRY_PATH);
  if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) {
    throw new Error('Unexpected image registry schema');
  }

  const formalPublic = new Set();
  const formalOutsidePublic = [];
  const inheritedByTarget = new Map();
  const directPublic = new Set();

  // Direct ownership takes precedence if a surviving canonical already owns
  // a reviewed/verified image.
  for (const item of registry.items) {
    if (!isFormal(item)) continue;
    const rawId = text(item.entry_id);
    const resolvedId = text(resolveCanonicalId(rawId)) || rawId;
    if (rawId === resolvedId && publicIds.has(rawId)) {
      directPublic.add(rawId);
      formalPublic.add(rawId);
    }
  }

  for (const item of registry.items) {
    if (!isFormal(item)) continue;
    const rawId = text(item.entry_id);
    const resolvedId = text(resolveCanonicalId(rawId)) || rawId;
    if (!publicIds.has(resolvedId)) {
      formalOutsidePublic.push(rawId);
      continue;
    }
    if (rawId === resolvedId) continue;
    if (directPublic.has(resolvedId)) continue;
    if (!inheritedByTarget.has(resolvedId)) {
      inheritedByTarget.set(resolvedId, rawId);
      formalPublic.add(resolvedId);
    }
  }

  const inheritedPairs = [...inheritedByTarget]
    .map(([to, from]) => ({ from, to }))
    .sort((a, b) => a.to.localeCompare(b.to, 'en'));

  return {
    registry,
    formalPublic,
    inheritedPairs,
    formalOutsidePublic: formalOutsidePublic.sort((a, b) => a.localeCompare(b, 'en'))
  };
}

function exceptionStates(publicIds, formalPublic, resolveCanonicalId) {
  const raw = readJson(EXCEPTIONS_PATH);
  if (raw.schema !== 'cta-image-inventory-exceptions-v2.3') throw new Error('Unexpected image exception schema');
  const byId = new Map();
  const outsidePublic = [];
  for (const item of array(raw.items)) {
    const rawId = text(item?.entry_id);
    const id = text(resolveCanonicalId(rawId)) || rawId;
    const state = text(item?.state);
    if (!id || !EXCEPTION_STATES.has(state)) throw new Error(`Invalid image exception record: ${id || '<missing>'}`);
    if (!publicIds.has(id)) {
      outsidePublic.push({ entry_id: rawId, resolved_entry_id: id, state });
      continue;
    }
    if (formalPublic.has(id)) throw new Error(`${id}: public formal image cannot also be an image exception`);
    if (byId.has(id)) throw new Error(`${id}: duplicate public image exception after canonical redirect resolution`);
    byId.set(id, state);
  }
  return { raw, byId, outsidePublic };
}

async function compute() {
  const publication = readJson(PUBLICATION_PATH);
  if (publication.schema !== 'cta-publication-inventory-v2.3') throw new Error('Unexpected publication inventory schema');
  const runtime = await runPublicLoader();
  const entries = runtime.entries;
  const idRows = entries.map((entry) => ({ id: text(entry?.id), type: normalizeType(entry) }));
  if (idRows.some((row) => !row.id)) throw new Error('Public runtime contains entry without canonical id');
  const publicIds = new Set(idRows.map((row) => row.id));
  if (publicIds.size !== idRows.length) throw new Error('Public runtime contains duplicate canonical IDs');
  if (idRows.length !== publication.summary?.published_runtime_entries) {
    throw new Error(`Public runtime count mismatch with publication snapshot: runtime=${idRows.length}, snapshot=${publication.summary?.published_runtime_entries}`);
  }
  const runtimeHash = hashLines([...publicIds].sort((a, b) => a.localeCompare(b, 'en')));
  if (runtimeHash !== publication.hashes?.published_id_sha256) {
    throw new Error(`Public runtime ID hash mismatch with publication snapshot: runtime=${runtimeHash}, snapshot=${publication.hashes?.published_id_sha256}`);
  }

  const { registry, formalPublic, inheritedPairs, formalOutsidePublic } = formalRegistryIds(publicIds, runtime.resolveCanonicalId);
  const { raw: exceptions, byId: exceptionById, outsidePublic: exceptionsOutsidePublic } = exceptionStates(publicIds, formalPublic, runtime.resolveCanonicalId);

  const rows = [];
  const byType = {};
  let formal = 0;
  let missing = 0;
  let notRequired = 0;
  let unobtainable = 0;
  for (const row of idRows.sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    let status;
    if (formalPublic.has(row.id)) { status = 'formal_image'; formal += 1; }
    else if (exceptionById.get(row.id) === 'not_required') { status = 'not_required'; notRequired += 1; }
    else if (exceptionById.get(row.id) === 'unobtainable') { status = 'unobtainable'; unobtainable += 1; }
    else { status = 'missing_formal_image'; missing += 1; }
    rows.push({ id: row.id, type: row.type, status });
    incrementType(byType, row.type, status);
  }

  const summary = {
    public_entries: rows.length,
    formal_image_entries: formal,
    missing_formal_image_entries: missing,
    not_required_entries: notRequired,
    unobtainable_entries: unobtainable,
    classified_entries: formal + missing + notRequired + unobtainable,
    formal_coverage_percent: Number(((formal / rows.length) * 100).toFixed(4)),
    registry_items_total: registry.items.length,
    formal_images_inherited_via_redirect: inheritedPairs.length,
    formal_images_outside_public: formalOutsidePublic.length,
    image_exceptions_outside_public: exceptionsOutsidePublic.length,
    quarantined_generated_entries: Number(publication.summary?.quarantined_generated_entries || 0)
  };
  if (summary.classified_entries !== summary.public_entries) throw new Error('Public image classification total mismatch');

  const formalIds = rows.filter((row) => row.status === 'formal_image').map((row) => row.id);
  const missingIds = rows.filter((row) => row.status === 'missing_formal_image').map((row) => row.id);
  return {
    schema: 'cta-public-image-inventory-v2.3',
    version: '2026-09-16-q013-identity-closure-1',
    policy: {
      publication_inventory: 'publication-inventory-v2.3.json',
      image_inventory: 'image-inventory-v2.3.json',
      formal_image_states: ['reviewed', 'verified'],
      formal_subject_match: 'matched',
      canonical_redirect_image_inheritance: 'retired duplicate image is inherited by its surviving canonical unless that target owns a direct formal image',
      acquisition_provenance_remains_on_original_registry_id: true,
      legacy_svg_counts_as_final: false,
      default_without_formal_image_or_exception: 'missing_formal_image',
      quarantined_generated_records_are_not_public_image_backlog: true
    },
    sources: {
      publication_inventory_version: text(publication.version),
      publication_id_sha256: text(publication.hashes?.published_id_sha256),
      image_registry_version: text(registry.version),
      image_exception_ledger_version: text(exceptions.version)
    },
    summary,
    by_type: Object.fromEntries(Object.entries(byType).sort(([a], [b]) => a.localeCompare(b, 'en'))),
    hashes: {
      public_id_sha256: runtimeHash,
      public_formal_image_id_sha256: hashLines(formalIds),
      public_missing_formal_image_id_sha256: hashLines(missingIds),
      public_image_classification_sha256: hashLines(rows.map((row) => `${row.id}\t${row.status}`))
    },
    inherited_formal_images: inheritedPairs,
    formal_images_outside_public: formalOutsidePublic,
    image_exceptions_outside_public: exceptionsOutsidePublic,
    missing_sample: missingIds.slice(0, 25)
  };
}

async function main() {
  const computed = await compute();
  console.log(`CTA_PUBLIC_IMAGE_SUMMARY=${JSON.stringify(computed.summary)}`);
  console.log(`CTA_PUBLIC_IMAGE_HASHES=${JSON.stringify(computed.hashes)}`);
  console.log(`CTA_PUBLIC_IMAGE_INHERITED=${JSON.stringify(computed.inherited_formal_images)}`);
  console.log(`CTA_PUBLIC_IMAGE_BY_TYPE=${JSON.stringify(computed.by_type)}`);
  console.log(`CTA_PUBLIC_IMAGE_SNAPSHOT=${JSON.stringify(computed)}`);

  if (args.has('--write')) {
    fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(computed, null, 2)}\n`);
    console.log(`CTA_PUBLIC_IMAGE_INVENTORY_WRITTEN=${SNAPSHOT_PATH}`);
  }
  if (args.has('--check')) {
    if (!fs.existsSync(SNAPSHOT_PATH)) throw new Error('data/public-image-inventory-v2.3.json is missing; run with --write');
    const saved = readJson(SNAPSHOT_PATH);
    if (JSON.stringify(saved) !== JSON.stringify(computed)) throw new Error('Frozen public image inventory is stale');
  }

  console.log('Construction Tools Atlas public image inventory v2.3: PASS');
  console.log(`- formal images: ${computed.summary.formal_image_entries}/${computed.summary.public_entries}`);
  console.log(`- inherited formal images: ${computed.summary.formal_images_inherited_via_redirect}`);
  console.log(`- public image backlog: ${computed.summary.missing_formal_image_entries}`);
  console.log(`- quarantined generated excluded from public backlog: ${computed.summary.quarantined_generated_entries}`);
}

main().catch((error) => {
  console.error('Construction Tools Atlas public image inventory v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});