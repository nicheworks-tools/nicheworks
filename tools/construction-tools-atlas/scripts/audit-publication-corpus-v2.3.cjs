const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const SNAPSHOT_PATH = path.join(DATA, 'publication-inventory-v2.3.json');
const GENERATED_FILLER_BATCH = 'atlas-expand-5000';
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
function isKnownGeneratedFiller(row) {
  return row?.meta?.generated === true && text(row?.meta?.batch) === GENERATED_FILLER_BATCH;
}
function isTemplateLike(row) {
  const ja = text(row?.description?.ja || row?.detail_ja || row?.summary_ja);
  const en = text(row?.description?.en || row?.detail_en || row?.summary_en);
  return ja.includes('現場用語です。用途、材料、周辺部材、安全条件を合わせて確認します。')
    && en.includes('is a construction reference term used around');
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

function computeExpected() {
  const manifest = readJson(MANIFEST_PATH);
  const errors = [];
  const seenIds = new Set();
  const seenTerms = new Set();
  const published = [];
  const generated = [];
  let rawEntries = 0;
  let duplicateIds = 0;
  let duplicateTerms = 0;
  let skippedMissingId = 0;
  let templateLikeGenerated = 0;

  for (const rel of manifestSources(manifest)) {
    const file = path.resolve(ROOT, rel);
    if (!fs.existsSync(file)) throw new Error(`Publication source missing: ${rel}`);
    for (const row of rowsFrom(readJson(file))) {
      rawEntries += 1;
      const id = text(row?.id || row?.slug);
      const type = sourceType(row);
      const generatedMarker = row?.meta?.generated === true;
      const generatedBatch = text(row?.meta?.batch);
      const knownFiller = isKnownGeneratedFiller(row);

      if (!id) {
        skippedMissingId += 1;
        continue;
      }
      if (type === 'generated_term' && !knownFiller) {
        errors.push(`${id}: generated_term lacks the reviewed ${GENERATED_FILLER_BATCH} quarantine provenance`);
      }
      if (generatedMarker && generatedBatch !== GENERATED_FILLER_BATCH) {
        errors.push(`${id}: unknown generated provenance batch ${generatedBatch || '<missing>'}`);
      }
      if (knownFiller) {
        if (type !== 'generated_term') errors.push(`${id}: ${GENERATED_FILLER_BATCH} filler must remain type=generated_term until explicitly curated`);
        if (!id.startsWith('generated_')) errors.push(`${id}: ${GENERATED_FILLER_BATCH} filler must use generated_ ID provenance`);
        if (isTemplateLike(row)) templateLikeGenerated += 1;
        generated.push({ id, type });
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

  if (errors.length) throw new Error(`Publication provenance audit failed:\n- ${errors.join('\n- ')}`);

  const byType = {};
  for (const row of published) byType[row.type] = (byType[row.type] || 0) + 1;
  const publishedIds = published.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));
  const generatedIds = generated.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));

  return {
    manifest,
    publishedIds,
    generatedIds,
    snapshot: {
      schema: 'cta-publication-inventory-v2.3',
      version: '2026-09-15-generated-quarantine-1',
      policy: {
        generated_filler_batch: GENERATED_FILLER_BATCH,
        generated_filler_publication_state: 'quarantined',
        promotion_rule: 'A quarantined generated filler may return to the public corpus only after explicit curation removes generated provenance and gives it a maintained entry type/content.'
      },
      summary: {
        stored_corpus_entries: rawEntries,
        quarantined_generated_entries: generated.length,
        published_runtime_entries: published.length,
        template_like_generated_entries: templateLikeGenerated,
        skipped_missing_id: skippedMissingId,
        duplicate_ids_removed: duplicateIds,
        duplicate_terms_removed: duplicateTerms
      },
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
    console: { info() {}, log() {}, warn() {}, error: console.error }
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
  const runtimeGenerated = runtime.entries.filter((entry) => isKnownGeneratedFiller(entry) || sourceType(entry) === 'generated_term');

  if (runtimeGenerated.length) throw new Error(`Public runtime still exposes ${runtimeGenerated.length} generated filler entries`);
  if (JSON.stringify(runtimeIds) !== JSON.stringify(expected.publishedIds)) {
    throw new Error(`Public runtime ID set does not match audited publication set: runtime=${runtimeIds.length}, expected=${expected.publishedIds.length}`);
  }
  if (runtime.diagnostics.quarantinedGenerated !== expected.generatedIds.length) {
    throw new Error(`Loader quarantine count mismatch: runtime=${runtime.diagnostics.quarantinedGenerated}, expected=${expected.generatedIds.length}`);
  }

  const snapshot = expected.snapshot;
  console.log(`CTA_PUBLICATION_SUMMARY=${JSON.stringify(snapshot.summary)}`);
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
