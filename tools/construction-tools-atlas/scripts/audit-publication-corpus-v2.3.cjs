const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');
const IDENTITY_PATH = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');
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
function hashLines(lines) { return crypto.createHash('sha256').update(lines.join('\n') + '\n', 'utf8').digest('hex'); }
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
  return String(value || '').toLowerCase().replace(/[\s\u3000]+/g, ' ').replace(/[／]/g, '/').trim();
}
function termKey(row) {
  const ja = normalizeTerm(sourceJa(row));
  const en = normalizeTerm(sourceEn(row));
  return ja || en ? `${ja}::${en}` : '';
}
function generatedBatch(row) { return row?.meta?.generated === true ? text(row?.meta?.batch) : ''; }
function isKnownGeneratedFiller(row) { return GENERATED_FILLER_BATCHES.has(generatedBatch(row)); }
function manifestSources(manifest) {
  const out = [];
  for (const pack of array(manifest.packs)) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) out.push(String(source).replace(/^\.\//, ''));
  }
  for (const base of array(manifest.base)) if (base) out.push(String(base).replace(/^\.\//, ''));
  return out;
}
function localFileFromRuntimePath(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
function increment(object, key) { object[key] = (object[key] || 0) + 1; }
function redirectRows() { return array(readJson(REDIRECT_PATH)?.redirects); }

function buildRedirectMap() {
  const map = new Map();
  for (const row of redirectRows()) {
    const from = text(row?.from);
    const to = text(row?.to);
    if (!from || !to) throw new Error('Canonical redirect must define from and to');
    if (from === to) throw new Error(`${from}: redirect cannot target itself`);
    if (map.has(from)) throw new Error(`${from}: duplicate redirect source`);
    map.set(from, to);
  }
  for (const from of map.keys()) {
    let current = from;
    const seen = new Set();
    while (map.has(current)) {
      if (seen.has(current)) throw new Error(`${from}: canonical redirect cycle detected`);
      seen.add(current);
      current = map.get(current);
    }
  }
  return map;
}

function resolveRedirect(id, map) {
  let current = id;
  const seen = new Set();
  while (map.has(current) && !seen.has(current)) {
    seen.add(current);
    current = map.get(current);
  }
  return current;
}

function computeExpected() {
  const manifest = readJson(MANIFEST_PATH);
  const redirectMap = buildRedirectMap();
  const identity = readJson(IDENTITY_PATH);
  const typeOverrideMap = new Map(array(identity?.type_overrides).map((row) => [text(row?.id), text(row?.to)]).filter(([id, to]) => id && to));
  const seenIds = new Set();
  const seenTerms = new Set();
  const candidates = [];
  const generated = [];
  const quarantineByBatch = {};
  let rawEntries = 0;
  let duplicateIds = 0;
  let duplicateTerms = 0;
  let skippedMissingId = 0;

  for (const rel of manifestSources(manifest)) {
    const file = path.resolve(ROOT, rel);
    if (!fs.existsSync(file)) throw new Error(`Publication source missing: ${rel}`);
    for (const row of rowsFrom(readJson(file))) {
      rawEntries += 1;
      const id = text(row?.id || row?.slug);
      const type = typeOverrideMap.get(id) || sourceType(row);
      const batch = generatedBatch(row);
      const knownFiller = isKnownGeneratedFiller(row);
      if (!id) { skippedMissingId += 1; continue; }
      if ((type === 'generated_term' || row?.meta?.generated === true) && !knownFiller) {
        throw new Error(`${id}: unknown generated provenance (${batch || '<missing>'})`);
      }
      if (knownFiller) {
        const expectedPrefix = GENERATED_ID_PREFIX_BY_BATCH.get(batch);
        if (type !== 'generated_term' || !expectedPrefix || !id.startsWith(expectedPrefix)) {
          throw new Error(`${id}: malformed known generated filler`);
        }
        increment(quarantineByBatch, batch);
        generated.push({ id, type, batch });
        continue;
      }
      if (seenIds.has(id)) { duplicateIds += 1; continue; }
      const key = termKey(row);
      if (key && seenTerms.has(key)) { duplicateTerms += 1; continue; }
      seenIds.add(id);
      if (key) seenTerms.add(key);
      candidates.push({ id, type });
    }
  }

  const candidateIds = new Set(candidates.map((row) => row.id));
  for (const [from, directTo] of redirectMap) {
    const to = resolveRedirect(directTo, redirectMap);
    if (!candidateIds.has(from)) throw new Error(`${from}: redirect source is not in the canonical candidate corpus`);
    if (!candidateIds.has(to)) throw new Error(`${from}: redirect target ${to} is not in the canonical candidate corpus`);
    if (redirectMap.has(to)) throw new Error(`${from}: redirect must resolve directly to a public canonical target`);
  }

  const published = candidates.filter((row) => !redirectMap.has(row.id));
  const byType = {};
  for (const row of published) increment(byType, row.type);
  const publishedIds = published.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));
  const generatedIds = generated.map((row) => row.id).sort((a, b) => a.localeCompare(b, 'en'));
  const redirectPairs = [...redirectMap].map(([from, to]) => `${from}\t${resolveRedirect(to, redirectMap)}`).sort((a, b) => a.localeCompare(b, 'en'));

  return {
    manifest,
    redirectMap,
    publishedIds,
    generatedIds,
    quarantineByBatch,
    snapshot: {
      schema: 'cta-publication-inventory-v2.3',
      version: '2026-09-16-q013-identity-closure-1',
      policy: {
        generated_filler_batches: [...GENERATED_FILLER_BATCHES].sort((a, b) => a.localeCompare(b, 'en')),
        generated_filler_publication_state: 'quarantined',
        canonical_duplicate_publication_state: 'redirected_to_single_canonical',
        unknown_generated_provenance: 'fail_closed',
        redirect_contract: 'Stored duplicate source rows remain available for provenance, but only redirect targets are public canonicals.'
      },
      summary: {
        stored_corpus_entries: rawEntries,
        quarantined_generated_entries: generated.length,
        redirected_duplicate_entries: redirectMap.size,
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
        canonical_redirect_sha256: hashLines(redirectPairs),
        publication_classification_sha256: hashLines([
          ...publishedIds.map((id) => `${id}\tpublished`),
          ...generatedIds.map((id) => `${id}\tquarantined_generated`),
          ...redirectPairs.map((pair) => `${pair}\tredirected_duplicate`)
        ].sort((a, b) => a.localeCompare(b, 'en')))
      },
      redirected_ids: redirectPairs,
      quarantined_sample: generatedIds.slice(0, 25)
    }
  };
}

async function runLoader() {
  const source = fs.readFileSync(LOADER_PATH, 'utf8');
  const windowObject = {};
  windowObject.fetch = async (input) => {
    const file = localFileFromRuntimePath(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  const documentStub = {
    addEventListener() {}, getElementById() { return null; }, querySelector() { return null; },
    createElement() { return { setAttribute() {}, defer: false, src: '' }; }, head: { appendChild() {} }
  };
  vm.runInNewContext(source, { window: windowObject, document: documentStub, console: { info() {}, warn() {}, error: console.error }, Set, Map }, { filename: 'quality-loader.js' });
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return { entries, diagnostics: windowObject.CTA_DATA_DIAGNOSTICS || {}, redirects: windowObject.CTA_CANONICAL_REDIRECTS || {} };
}

async function main() {
  const expected = computeExpected();
  const runtime = await runLoader();
  const runtimeIds = runtime.entries.map((entry) => text(entry?.id)).filter(Boolean).sort((a, b) => a.localeCompare(b, 'en'));
  if (JSON.stringify(runtimeIds) !== JSON.stringify(expected.publishedIds)) {
    throw new Error(`Public runtime ID set does not match audited publication set: runtime=${runtimeIds.length}, expected=${expected.publishedIds.length}`);
  }
  if (runtime.diagnostics.quarantinedGenerated !== expected.generatedIds.length) throw new Error('Loader generated quarantine count mismatch');
  if (runtime.diagnostics.canonicalRedirectsApplied !== expected.redirectMap.size) throw new Error('Loader canonical redirect count mismatch');
  if (runtime.diagnostics.canonicalRedirectMissingSources || runtime.diagnostics.canonicalRedirectMissingTargets) throw new Error('Loader has unresolved canonical redirects');
  const runtimeRedirects = Object.entries(runtime.redirects).sort(([a], [b]) => a.localeCompare(b, 'en'));
  const expectedRedirects = [...expected.redirectMap].map(([from, to]) => [from, resolveRedirect(to, expected.redirectMap)]).sort(([a], [b]) => a.localeCompare(b, 'en'));
  if (JSON.stringify(runtimeRedirects) !== JSON.stringify(expectedRedirects)) throw new Error('Runtime canonical redirect map mismatch');

  const snapshot = expected.snapshot;
  console.log(`CTA_PUBLICATION_SUMMARY=${JSON.stringify(snapshot.summary)}`);
  console.log(`CTA_PUBLICATION_HASHES=${JSON.stringify(snapshot.hashes)}`);
  console.log(`CTA_PUBLICATION_REDIRECTS=${JSON.stringify(snapshot.redirected_ids)}`);
  console.log(`CTA_PUBLICATION_BY_TYPE=${JSON.stringify(snapshot.published_by_type)}`);
  console.log(`CTA_PUBLICATION_SNAPSHOT=${JSON.stringify(snapshot)}`);

  if (args.has('--write')) fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  if (args.has('--check')) {
    if (!fs.existsSync(SNAPSHOT_PATH)) throw new Error('data/publication-inventory-v2.3.json is missing');
    if (JSON.stringify(readJson(SNAPSHOT_PATH)) !== JSON.stringify(snapshot)) throw new Error('Frozen publication inventory is stale');
  }
  console.log('Construction Tools Atlas publication corpus v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas publication corpus v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});