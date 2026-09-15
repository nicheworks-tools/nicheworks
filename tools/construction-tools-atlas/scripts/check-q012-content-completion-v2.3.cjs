const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-012.json');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const LOADER = path.join(DATA, 'quality-loader.js');
const EXPECTED_WAVE3D = new Set([
  'q012_spanner',
  'q012_framing_square',
  'q012_cold_chisel',
  'q012_toe_board'
]);

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function arr(value) { return Array.isArray(value) ? value : []; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function localFile(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
async function runLoader() {
  const source = fs.readFileSync(LOADER, 'utf8');
  const windowObject = {};
  windowObject.fetch = async (input) => {
    const file = localFile(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  const documentStub = {
    addEventListener() {}, getElementById() { return null; }, querySelector() { return null; },
    createElement() { return { setAttribute() {} }; }, head: { appendChild() {} }
  };
  vm.runInNewContext(source, { window: windowObject, document: documentStub, console: { info() {}, warn() {}, error: console.error }, Set, Map }, { filename: 'quality-loader.js' });
  return { entries: await windowObject.CTA_DATA_LOADER.loadEntries(), diagnostics: windowObject.CTA_DATA_DIAGNOSTICS || {} };
}

async function main() {
  const redirects = new Map(arr(readJson(REDIRECTS)?.redirects).map((row) => [text(row?.from), text(row?.to)]).filter(([from, to]) => from && to));
  const activeIds = rowsFrom(readJson(TARGET)).map((row) => text(row?.id)).filter((id) => id && !redirects.has(id));
  if (activeIds.length !== 69) throw new Error(`Expected 69 active q012 canonicals, got ${activeIds.length}`);

  const runtime = await runLoader();
  const byId = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  const missing = [];
  const notExpanded = [];
  const waveCounts = {};
  for (const id of activeIds) {
    const entry = byId.get(id);
    if (!entry) {
      missing.push(id);
      continue;
    }
    const wave = text(entry?.meta?.content_enrichment_wave);
    const state = text(entry?.meta?.content_enrichment_state);
    if (!wave || state !== 'expanded') notExpanded.push(id);
    if (wave) waveCounts[wave] = (waveCounts[wave] || 0) + 1;
  }
  if (missing.length) throw new Error(`Active q012 entries missing from runtime: ${missing.join(', ')}`);
  if (notExpanded.length) throw new Error(`Active q012 entries still rely on generic fallback: ${notExpanded.join(', ')}`);

  const wave3dActual = new Set(activeIds.filter((id) => text(byId.get(id)?.meta?.content_enrichment_wave) === 'content-wave-003d'));
  const missingWave3d = [...EXPECTED_WAVE3D].filter((id) => !wave3dActual.has(id));
  const unexpectedWave3d = [...wave3dActual].filter((id) => !EXPECTED_WAVE3D.has(id));
  if (missingWave3d.length || unexpectedWave3d.length) {
    throw new Error(`Wave3D membership mismatch: missing=${missingWave3d.join(',') || '-'} unexpected=${unexpectedWave3d.join(',') || '-'}`);
  }
  if ((waveCounts['content-wave-003a'] || 0) !== 25) throw new Error('Wave3A active q012 count must remain 25');
  if ((waveCounts['content-wave-003b'] || 0) !== 20) throw new Error('Wave3B active q012 count must remain 20');
  if ((waveCounts['content-wave-003c'] || 0) !== 20) throw new Error('Wave3C active q012 count must remain 20');
  if ((waveCounts['content-wave-003d'] || 0) !== 4) throw new Error('Wave3D active q012 count must be 4');
  if (runtime.diagnostics.contentEnrichmentMissingTargets) throw new Error('Runtime reports missing content enrichment targets');
  if (runtime.diagnostics.contentEnrichmentDuplicateTargets) throw new Error('Runtime reports duplicate content enrichment targets');

  console.log(`CTA_Q012_CONTENT_COMPLETION=${JSON.stringify({ active_q012: activeIds.length, enriched_q012: activeIds.length, wave_counts: waveCounts, wave3d_entries: wave3dActual.size })}`);
  console.log('Construction Tools Atlas q012 content completion v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas q012 content completion v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
