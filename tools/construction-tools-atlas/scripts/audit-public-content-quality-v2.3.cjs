const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const PUBLICATION_PATH = path.join(DATA, 'publication-inventory-v2.3.json');
const ENRICHMENT_PATH = path.join(DATA, 'content-enrichment-v2.3.json');
const ENRICHMENT_MANIFEST_PATH = path.join(DATA, 'content-enrichment-manifest-v2.3.json');
const SNAPSHOT_PATH = path.join(DATA, 'public-content-quality-v2.3.json');
const args = new Set(process.argv.slice(2));

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function nonEmptyArray(value) { return Array.isArray(value) && value.some((item) => text(item)); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hashLines(lines) { return crypto.createHash('sha256').update(lines.join('\n') + '\n').digest('hex'); }
function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function manifestSources(manifest) {
  const out = [];
  for (const pack of array(manifest.packs)) {
    const source = typeof pack === 'string' ? pack : pack?.path;
    if (source) out.push(String(source).replace(/^\.\//, ''));
  }
  for (const base of array(manifest.base)) if (base) out.push(String(base).replace(/^\.\//, ''));
  return out;
}
function localFile(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
function idOf(row) { return text(row?.id || row?.slug); }
function typeOf(row) { return text(row?.type || row?.t || 'unknown') || 'unknown'; }
function bilingualPair(row, nested, compactJa, compactEn, flatJa, flatEn) {
  const ja = text(row?.[nested]?.ja || row?.[compactJa] || row?.[flatJa]);
  const en = text(row?.[nested]?.en || row?.[compactEn] || row?.[flatEn]);
  return { ja, en, ok: Boolean(ja && en) };
}
function bilingualArrays(row, nested, compactJa, compactEn, flatJa, flatEn) {
  const ja = row?.[nested]?.ja || row?.[compactJa] || row?.[flatJa];
  const en = row?.[nested]?.en || row?.[compactEn] || row?.[flatEn];
  return { ja: nonEmptyArray(ja), en: nonEmptyArray(en), ok: nonEmptyArray(ja) && nonEmptyArray(en) };
}
function sourceQuality(row, enrichment) {
  const identity = bilingualPair(row, 'term', 'ja', 'en', 'name_ja', 'name_en');
  const definition = {
    ja: text(row?.description?.ja || row?.summary?.ja || row?.dj || row?.description_ja || row?.summary_ja),
    en: text(row?.description?.en || row?.summary?.en || row?.de || row?.description_en || row?.summary_en)
  };
  definition.ok = Boolean(definition.ja && definition.en);
  const detail = enrichment
    ? { ja: text(enrichment.detail_ja), en: text(enrichment.detail_en), ok: Boolean(text(enrichment.detail_ja) && text(enrichment.detail_en)) }
    : bilingualPair(row, 'detail', 'nj', 'ne', 'detail_ja', 'detail_en');
  const bullets = enrichment
    ? { ja: nonEmptyArray(enrichment.bullets_ja), en: nonEmptyArray(enrichment.bullets_en), ok: nonEmptyArray(enrichment.bullets_ja) && nonEmptyArray(enrichment.bullets_en) }
    : bilingualArrays(row, 'bullets', 'bj', 'be', 'bullets_ja', 'bullets_en');
  const examples = enrichment
    ? { ja: nonEmptyArray(enrichment.examples_ja), en: nonEmptyArray(enrichment.examples_en), ok: nonEmptyArray(enrichment.examples_ja) && nonEmptyArray(enrichment.examples_en) }
    : bilingualArrays(row, 'examples', 'ej', 'ee', 'examples_ja', 'examples_en');
  const aliases = bilingualArrays(row, 'aliases', 'aj', 'ae', 'aliases_ja', 'aliases_en');
  const categories = array(row?.categories).length > 0 || Boolean(text(row?.c || row?.category));
  const tasks = array(row?.tasks).length > 0 || Boolean(text(row?.task || row?.tsk));
  const fallbackFields = [];
  if (!detail.ok) fallbackFields.push('detail');
  if (!bullets.ok) fallbackFields.push('bullets');
  if (!examples.ok) fallbackFields.push('examples');
  let status = 'fallback_independent_core';
  if (!identity.ok || !definition.ok) status = 'missing_core_bilingual_content';
  else if (fallbackFields.length) status = 'runtime_fallback_dependent';
  return { identity: identity.ok, definition: definition.ok, detail: detail.ok, bullets: bullets.ok, examples: examples.ok, aliases: aliases.ok, categories, tasks, fallbackFields, status, enriched: Boolean(enrichment) };
}

async function runLoader() {
  const source = fs.readFileSync(LOADER_PATH, 'utf8');
  const windowObject = {};
  windowObject.fetch = async (input) => {
    const file = localFile(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  const documentStub = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, createElement() { return { setAttribute() {} }; }, head: { appendChild() {} } };
  vm.runInNewContext(source, { window: windowObject, document: documentStub, console: { info() {}, warn() {}, error: console.error }, Set, Map }, { filename: 'quality-loader.js' });
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return { entries, diagnostics: windowObject.CTA_DATA_DIAGNOSTICS || {} };
}

function readEnrichment(publicIds) {
  const manifest = fs.existsSync(ENRICHMENT_MANIFEST_PATH) ? readJson(ENRICHMENT_MANIFEST_PATH) : null;
  let sources = [];
  let version = '';
  if (manifest) {
    if (manifest?.schema !== 'cta-content-enrichment-manifest-v2.3') throw new Error('Unexpected content enrichment manifest schema');
    version = text(manifest.version);
    sources = array(manifest.packs).map((pack) => typeof pack === 'string' ? pack : pack?.path).map(text).filter(Boolean);
    if (!sources.length) throw new Error('Content enrichment manifest has no packs');
  } else if (fs.existsSync(ENRICHMENT_PATH)) {
    sources = ['./data/content-enrichment-v2.3.json'];
  } else {
    return { version: '', byId: new Map(), count: 0 };
  }

  const byId = new Map();
  for (const source of sources) {
    const file = path.resolve(ROOT, source.replace(/^\.\//, ''));
    if (!fs.existsSync(file)) throw new Error(`Missing content enrichment pack: ${source}`);
    const raw = readJson(file);
    if (raw?.schema !== 'cta-content-enrichment-v2.3') throw new Error(`Unexpected content enrichment schema: ${source}`);
    if (!version) version = text(raw.version);
    for (const patch of array(raw.entries)) {
      const id = text(patch?.id);
      if (!id) throw new Error(`Content enrichment entry missing id in ${source}`);
      if (byId.has(id)) throw new Error(`Duplicate content enrichment id across packs: ${id}`);
      if (!publicIds.has(id)) throw new Error(`Content enrichment targets non-public id: ${id}`);
      if (!text(patch?.detail_ja) || !text(patch?.detail_en)) throw new Error(`${id}: enrichment requires bilingual detail`);
      if (!nonEmptyArray(patch?.bullets_ja) || !nonEmptyArray(patch?.bullets_en)) throw new Error(`${id}: enrichment requires bilingual bullets`);
      if (!nonEmptyArray(patch?.examples_ja) || !nonEmptyArray(patch?.examples_en)) throw new Error(`${id}: enrichment requires bilingual examples`);
      byId.set(id, { ...patch, __source: source });
    }
  }
  return { version, byId, count: byId.size };
}

async function compute() {
  const manifest = readJson(MANIFEST_PATH);
  const publication = readJson(PUBLICATION_PATH);
  const runtimeResult = await runLoader();
  const runtime = runtimeResult.entries;
  if (runtime.length !== publication.summary?.published_runtime_entries) throw new Error(`Public runtime count mismatch: ${runtime.length}`);
  const runtimeIds = runtime.map((row) => idOf(row)).sort((a, b) => a.localeCompare(b, 'en'));
  const runtimeHash = hashLines(runtimeIds);
  if (runtimeHash !== publication.hashes?.published_id_sha256) throw new Error('Public runtime ID hash does not match publication inventory');
  const publicIds = new Set(runtimeIds);
  const enrichment = readEnrichment(publicIds);
  if (runtimeResult.diagnostics.contentEnrichmentMissingTargets) throw new Error(`Runtime reports ${runtimeResult.diagnostics.contentEnrichmentMissingTargets} missing enrichment targets`);
  if (runtimeResult.diagnostics.contentEnrichmentDuplicateTargets) throw new Error(`Runtime reports ${runtimeResult.diagnostics.contentEnrichmentDuplicateTargets} duplicate enrichment targets`);
  if ((runtimeResult.diagnostics.contentEnriched || 0) !== enrichment.count) throw new Error(`Runtime enrichment count mismatch: ${runtimeResult.diagnostics.contentEnriched || 0} != ${enrichment.count}`);

  const sourceById = new Map();
  for (const rel of manifestSources(manifest)) {
    const file = path.resolve(ROOT, rel);
    for (const row of rowsFrom(readJson(file))) {
      const id = idOf(row);
      if (id && !sourceById.has(id)) sourceById.set(id, { row, source: rel });
    }
  }

  const counts = {
    public_entries: runtime.length,
    fallback_independent_core: 0,
    runtime_fallback_dependent: 0,
    missing_core_bilingual_content: 0,
    explicit_bilingual_identity: 0,
    explicit_bilingual_definition: 0,
    explicit_bilingual_detail: 0,
    explicit_bilingual_bullets: 0,
    explicit_bilingual_examples: 0,
    explicit_bilingual_aliases: 0,
    content_enriched_entries: enrichment.count,
    has_category_context: 0,
    has_task_context: 0
  };
  const fallbackFieldCounts = { detail: 0, bullets: 0, examples: 0 };
  const byType = {};
  const statuses = [];
  const samples = { fallback_independent_core: [], runtime_fallback_dependent: [], missing_core_bilingual_content: [] };

  for (const publicEntry of runtime) {
    const id = idOf(publicEntry);
    const source = sourceById.get(id);
    if (!source) throw new Error(`${id}: public entry has no source row`);
    const patch = enrichment.byId.get(id) || null;
    const q = sourceQuality(source.row, patch);
    const type = typeOf(publicEntry);
    counts[q.status] += 1;
    if (q.identity) counts.explicit_bilingual_identity += 1;
    if (q.definition) counts.explicit_bilingual_definition += 1;
    if (q.detail) counts.explicit_bilingual_detail += 1;
    if (q.bullets) counts.explicit_bilingual_bullets += 1;
    if (q.examples) counts.explicit_bilingual_examples += 1;
    if (q.aliases) counts.explicit_bilingual_aliases += 1;
    if (q.categories) counts.has_category_context += 1;
    if (q.tasks) counts.has_task_context += 1;
    for (const field of q.fallbackFields) fallbackFieldCounts[field] += 1;
    if (!byType[type]) byType[type] = { public_entries: 0, fallback_independent_core: 0, runtime_fallback_dependent: 0, missing_core_bilingual_content: 0 };
    byType[type].public_entries += 1;
    byType[type][q.status] += 1;
    statuses.push({ id, status: q.status, fallback: q.fallbackFields.join(',') || '-', enriched: q.enriched ? 'yes' : 'no' });
    if (samples[q.status].length < 25) samples[q.status].push({ id, source: source.source, enrichment: q.enriched ? text(patch?.__source) : null, fallback_fields: q.fallbackFields });
  }

  const sortedStatuses = statuses.sort((a, b) => a.id.localeCompare(b.id, 'en'));
  return {
    schema: 'cta-public-content-quality-v2.3',
    version: '2026-09-16-q012-content-complete-1',
    policy: {
      purpose: 'Measure source-backed or canonical-ID-enriched core content separately from runtime generic fallback copy.',
      fallback_independent_core_requires: ['bilingual identity', 'bilingual definition', 'explicit bilingual detail', 'explicit bilingual bullets', 'explicit bilingual examples'],
      canonical_content_enrichment_counts_as_explicit: true,
      fallback_independent_core_is_not_automatic_reviewed_status: true,
      aliases_and_relationships_require_subject_specific_review: true
    },
    sources: {
      publication_inventory_version: text(publication.version),
      publication_id_sha256: runtimeHash,
      quality_manifest_version: text(manifest.version),
      content_enrichment_version: enrichment.version
    },
    summary: counts,
    fallback_field_counts: fallbackFieldCounts,
    by_type: Object.fromEntries(Object.entries(byType).sort(([a], [b]) => a.localeCompare(b, 'en'))),
    hashes: {
      content_status_sha256: hashLines(sortedStatuses.map((row) => `${row.id}\t${row.status}\t${row.fallback}\t${row.enriched}`)),
      fallback_independent_id_sha256: hashLines(sortedStatuses.filter((row) => row.status === 'fallback_independent_core').map((row) => row.id)),
      fallback_dependent_id_sha256: hashLines(sortedStatuses.filter((row) => row.status === 'runtime_fallback_dependent').map((row) => row.id)),
      missing_core_id_sha256: hashLines(sortedStatuses.filter((row) => row.status === 'missing_core_bilingual_content').map((row) => row.id)),
      content_enriched_id_sha256: hashLines(sortedStatuses.filter((row) => row.enriched === 'yes').map((row) => row.id))
    },
    samples
  };
}

async function main() {
  const computed = await compute();
  console.log(`CTA_PUBLIC_CONTENT_SUMMARY=${JSON.stringify(computed.summary)}`);
  console.log(`CTA_PUBLIC_CONTENT_FALLBACK_FIELDS=${JSON.stringify(computed.fallback_field_counts)}`);
  console.log(`CTA_PUBLIC_CONTENT_BY_TYPE=${JSON.stringify(computed.by_type)}`);
  console.log(`CTA_PUBLIC_CONTENT_HASHES=${JSON.stringify(computed.hashes)}`);
  console.log(`CTA_PUBLIC_CONTENT_SNAPSHOT=${JSON.stringify(computed)}`);
  if (args.has('--write')) fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(computed, null, 2)}\n`);
  if (args.has('--check')) {
    if (!fs.existsSync(SNAPSHOT_PATH)) throw new Error('data/public-content-quality-v2.3.json is missing');
    if (JSON.stringify(readJson(SNAPSHOT_PATH)) !== JSON.stringify(computed)) throw new Error('Frozen public content-quality inventory is stale');
  }
  console.log('Construction Tools Atlas public content quality v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas public content quality v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
