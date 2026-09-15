const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const SNAPSHOT_PATH = path.join(DATA, 'publication-inventory-v2.3.json');
const GENERATED_FILLER_BATCHES = new Set(['direct-5000', 'atlas-expand-5000']);
const GENERATED_ID_PREFIX_BY_BATCH = new Map([
  ['direct-5000', 'term_'],
  ['atlas-expand-5000', 'generated_']
]);
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
function sourceType(row) { return text(row?.type || row?.t || 'unknown') || 'unknown'; }
function sourceJa(row) { return text(row?.term?.ja || row?.ja || row?.summary?.ja); }
function sourceEn(row) { return text(row?.term?.en || row?.en || row?.summary?.en); }
function normalizeTerm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, ' ')
    .replace(/[／]/g, '/')
    .trim();
}
function termKey(row) {
  const ja = normalizeTerm(sourceJa(row));
  const en = normalizeTerm(sourceEn(row));
  return ja || en ? `${ja}::${en}` : '';
}
function generatedBatch(row) {
  return row?.meta?.generated === true ? text(row?.meta?.batch) : '';
}
function isKnownGeneratedFiller(row) {
  return GENERATED_FILLER_BATCHES.has(generatedBatch(row));
}
function manifestSources(manifest) {
  const out = [];
  for (const pack of array(manifest.packs)) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) out.push(String(source).replace(/^\.\//, ''));
  }
  for (const base of array(manifest.base)) {
    if (base) out.push(String(base).replace(/^\.\//, ''));
  }
  return out;
}
function localFileFromRuntimePath(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
function increment(object, key) {
  object[key] = (object[key] || 0) + 1;
}
function pushSample(list, value, limit = 20) {
  if (list.length < limit) list.push(value);
}

function computeExpected() {
  const manifest = readJson(MANIFEST_PATH);
  const seenIds = new Set();
  const seenTerms = new Set();
  const published = [];
  const generated = [];
  const quarantineByBatch = {};
  const unknownGeneratedByBatch = {};
  const unknownGeneratedSample = [];
  const malformedKnownGeneratedSample = [];
  let rawEntries = 0;
  let duplicateIds = 0;
  let duplicateTerms = 0;
  let skippedMissingId = 0;
  let unknownGeneratedCount = 0;
  let malformedKnownGeneratedCount = 0;

  for (const rel of manifestSources(manifest)) {
    const file = path.resolve(ROOT, rel);
    if (!fs.existsSync(file)) throw new Error(`Publication source missing: ${rel}`);
    for (const row of rowsFrom(readJson(file))) {
      rawEntries += 1;
      const id = text(row?.id || row?.slug);
      const type = sourceType(row);
      const batch = generatedBatch(row);
      const knownFiller = isKnownGeneratedFiller(row);

      if (!id) {
        skippedMissingId += 1;
        continue;
      }

      if (type === 'generated_term' || row?.meta?.generated === true) {
        if (!knownFiller) {
          unknownGeneratedCount += 1;
          increment(unknownGeneratedByBatch, batch || '<missing>');
          pushSample(unknownGeneratedSample, { id, type, batch: batch || null, source: rel });
          continue;
        }
      }

      if (knownFiller) {
        const expectedPrefix = GENERATED_ID_PREFIX_BY_BATCH.get(batch);
        if (type !== 'generated_term' || !expectedPrefix || !id.startsWith(expectedPrefix)) {
          malformedKnownGeneratedCount += 1;
          pushSample(malformedKnownGeneratedSample, { id, type, batch, expected_prefix: expectedPrefix || null, source: rel });
          continue;
        }
        increment(quarantineByBatch, batch);
        generated.push({ id, type, batch });
        continue;
      }

      if (seenIds.has(id)) {
        duplicateIds += 1;
        continue;
      }
      const key = termKey(row);
      if (key && seenTerms.has(key)) {
        duplicateTerms += 1;
        continue;
      }
      seenIds.add(id);
      if (key) seenTerms.add(key);
      published.push({ id, type });
    }
  }

  if (unknownGeneratedCount || malformedKnownGeneratedCount) {
    throw new Error(`Publication provenance audit failed: unknown_generated=${unknownGeneratedCount}, malformed_known_generated=${malformedKnownGeneratedCount}, unknown_by_batch=${JSON.stringify(unknownGeneratedByBatch)}, unknown_sample=${JSON.stringify(unknownGeneratedSample)}, malformed_sample=${JSON.stringify(malformedKnownGeneratedSample)}`);
  }

  const byType = {};
  for (const row of published) increment(byType, row.type);
  const publishedIds = published.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));
  const generatedIds = generated.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));

  return {
    manifest,
    publishedIds,
    generatedIds,
    quarantineByBatch,
    snapshot: {
      schema: 'cta-publication-inventory-v2.3',
      version: '2026-09-15-generated-quarantine-2',
      policy: {
        generated_filler_batches: [...GENERATED_FILLER_BATCHES].sort((a, b) => a.localeCompare(b, 'en')),
        generated_filler_publication_state: 'quarantined',
        unknown_generated_provenance: 'fail_closed',
        promotion_rule: 'A quarantined generated filler may return to the public corpus only after explicit curation removes generated provenance and gives it a maintained entry type/content.'
      },
      summary: {
        stored_corpus_entries: rawEntries,
        quarantined_generated_entries: generated.length,
        published_runtime_entries: published.length,
        skipped_missing_id: skippedMissingId,
        duplicate_ids_removed: duplicateIds,
        duplicate_terms_removed: duplicateTerms
      },
      quarantine_by_batch: Object.fromEntries(Object.entries(quarantineByBatch).sort(([a], [b]) => a.localeCompare(b, 'en'))),
      published_by_type: Object.fromEntries(Object.entries(byType).sort(([a], [b]) => a.localeCompare(b, 'en'))),
      hashes: {
        published_id_sha256: hashLines(publishedIds),
        quarantined_generated_id_sha256: hashLines(generatedIds),
        publication_classification_sha256: hashLines([
          ...publishedIds.map((id) => `${id}\tpublished`),
          ...generatedIds.map((id) => `${id}\tquarantined_generated`)
        ].sort((a, b) => a.localeCompare(b, 'en')))
      },
      quarantined_sample: generatedIds.slice(0, 25)
    }
  };
}

async function runLoader() {
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
    Set
  };
  vm.runInNewContext(loaderSource, sandbox, { filename: 'quality-loader.js' });
  if (!windowObject.CTA_DATA_LOADER?.loadEntries) throw new Error('quality-loader did not expose CTA_DATA_LOADER.loadEntries');
  return {
    entries: await windowObject.CTA_DATA_LOADER.loadEntries(),
    diagnostics: windowObject.CTA_DATA_DIAGNOSTICS || {}
  };
}

async function main() {
  const expected = computeExpected();
  const runtime = await runLoader();
  const runtimeIds = runtime.entries.map((entry) => text(entry?.id)).filter(Boolean).sort((a, b) => a.localeCompare(b, 'en'));
  const runtimeGenerated = runtime.entries.filter((entry) => sourceType(entry) === 'generated_term' || entry?.meta?.generated === true);

  if (runtimeGenerated.length) throw new Error(`Public runtime still exposes ${runtimeGenerated.length} generated entries`);
  if (JSON.stringify(runtimeIds) !== JSON.stringify(expected.publishedIds)) {
    throw new Error(`Public runtime ID set does not match audited publication set: runtime=${runtimeIds.length}, expected=${expected.publishedIds.length}`);
  }
  if (runtime.diagnostics.quarantinedGenerated !== expected.generatedIds.length) {
    throw new Error(`Loader quarantine count mismatch: runtime=${runtime.diagnostics.quarantinedGenerated}, expected=${expected.generatedIds.length}`);
  }
  if (JSON.stringify(runtime.diagnostics.quarantinedGeneratedByBatch || {}) !== JSON.stringify(expected.quarantineByBatch)) {
    throw new Error(`Loader quarantine-by-batch mismatch: runtime=${JSON.stringify(runtime.diagnostics.quarantinedGeneratedByBatch || {})}, expected=${JSON.stringify(expected.quarantineByBatch)}`);
  }

  const snapshot = expected.snapshot;
  console.log(`CTA_PUBLICATION_SUMMARY=${JSON.stringify(snapshot.summary)}`);
  console.log(`CTA_PUBLICATION_QUARANTINE_BY_BATCH=${JSON.stringify(snapshot.quarantine_by_batch)}`);
  console.log(`CTA_PUBLICATION_HASHES=${JSON.stringify(snapshot.hashes)}`);
  console.log(`CTA_PUBLICATION_BY_TYPE=${JSON.stringify(snapshot.published_by_type)}`);
  console.log(`CTA_PUBLICATION_SNAPSHOT=${JSON.stringify(snapshot)}`);

  if (args.has('--write')) {
    fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(`CTA_PUBLICATION_INVENTORY_WRITTEN=${SNAPSHOT_PATH}`);
  }
  if (args.has('--check')) {
    if (!fs.existsSync(SNAPSHOT_PATH)) throw new Error('data/publication-inventory-v2.3.json is missing; run with --write');
    const saved = readJson(SNAPSHOT_PATH);
    if (JSON.stringify(saved) !== JSON.stringify(snapshot)) throw new Error('Frozen publication inventory is stale');
  }

  console.log('Construction Tools Atlas publication corpus v2.3: PASS');
  console.log(`- stored corpus: ${snapshot.summary.stored_corpus_entries}`);
  console.log(`- quarantined generated filler: ${snapshot.summary.quarantined_generated_entries}`);
  console.log(`- public runtime corpus: ${snapshot.summary.published_runtime_entries}`);
}

main().catch((error) => {
  console.error('Construction Tools Atlas publication corpus v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
