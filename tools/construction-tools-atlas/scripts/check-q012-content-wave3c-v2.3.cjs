const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-012.json');
const WAVE = path.join(DATA, 'content-enrichment-wave3c-v2.3.json');
const LOADER = path.join(DATA, 'quality-loader.js');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const MANIFEST = path.join(DATA, 'content-enrichment-manifest-v2.3.json');

const EXPECTED = new Set([
  'q012_base_plate','q012_gusset_plate','q012_shim_plate','q012_grout_under_base','q012_non_shrink_grout',
  'q012_epoxy_anchor_adhesive','q012_blow_pump','q012_hole_brush','q012_embed_plate','q012_anchor_template',
  'q012_infrared_thermometer','q012_concrete_test_hammer','q012_slump_cone','q012_air_meter','q012_concrete_cylinder_mold',
  'q012_curing_tank','q012_core_sampler','q012_extension_cord_reel','q012_warning_tape','q012_debris_net'
]);

const COLLISION_REVIEW_IDS = new Set([
  'q012_hex_key','q012_spanner','q012_feeler_gauge','q012_dial_gauge','q012_vernier_caliper',
  'q012_builder_square','q012_framing_square','q012_diamond_blade','q012_cold_chisel','q012_all_thread_rod',
  'q012_concrete_cover_meter','q012_rebar_locator','q012_crack_scale','q012_dust_collector','q012_shop_vacuum',
  'q012_air_compressor','q012_temporary_distribution_box','q012_guardrail','q012_toe_board'
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
function nonEmptyArray(value) { return Array.isArray(value) && value.some((item) => text(item)); }

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
  const wave = readJson(WAVE);
  if (wave?.schema !== 'cta-content-enrichment-v2.3') throw new Error('Unexpected Wave3C enrichment schema');
  const patches = arr(wave.entries);
  if (patches.length !== 20) throw new Error(`Expected 20 Wave3C entries, got ${patches.length}`);
  const actual = new Set();
  for (const patch of patches) {
    const id = text(patch?.id);
    if (!id || actual.has(id)) throw new Error(`Invalid or duplicate Wave3C id: ${id || '<missing>'}`);
    actual.add(id);
    if (!EXPECTED.has(id)) throw new Error(`Unexpected Wave3C id: ${id}`);
    if (COLLISION_REVIEW_IDS.has(id)) throw new Error(`${id}: collision-review entry must not be enriched in safe Wave3C`);
    if (text(patch?.wave) !== 'content-wave-003c' || text(patch?.state) !== 'expanded') throw new Error(`${id}: invalid wave/state`);
    if (!text(patch?.detail_ja) || !text(patch?.detail_en)) throw new Error(`${id}: bilingual detail required`);
    if (!nonEmptyArray(patch?.bullets_ja) || !nonEmptyArray(patch?.bullets_en)) throw new Error(`${id}: bilingual bullets required`);
    if (!nonEmptyArray(patch?.examples_ja) || !nonEmptyArray(patch?.examples_en)) throw new Error(`${id}: bilingual examples required`);
  }
  for (const id of EXPECTED) if (!actual.has(id)) throw new Error(`Missing expected Wave3C id: ${id}`);

  const manifest = readJson(MANIFEST);
  const manifestPack = arr(manifest?.packs).find((row) => text(typeof row === 'string' ? row : row?.path) === './data/content-enrichment-wave3c-v2.3.json');
  if (!manifestPack) throw new Error('Wave3C pack missing from enrichment manifest');

  const redirects = new Set(arr(readJson(REDIRECTS)?.redirects).map((row) => text(row?.from)).filter(Boolean));
  const q012 = rowsFrom(readJson(TARGET)).map((row) => text(row?.id)).filter(Boolean);
  const activeQ012 = q012.filter((id) => !redirects.has(id));
  if (activeQ012.length !== 84) throw new Error(`Expected 84 active q012 rows, got ${activeQ012.length}`);
  for (const id of EXPECTED) if (!activeQ012.includes(id)) throw new Error(`${id}: expected safe id is not an active q012 canonical`);

  const runtime = await runLoader();
  const byId = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  for (const id of EXPECTED) {
    const entry = byId.get(id);
    if (!entry) throw new Error(`${id}: Wave3C id missing from public runtime`);
    if (text(entry?.meta?.content_enrichment_wave) !== 'content-wave-003c') throw new Error(`${id}: runtime wave marker mismatch`);
    if (text(entry?.meta?.content_enrichment_state) !== 'expanded') throw new Error(`${id}: runtime state is not expanded`);
  }
  for (const id of COLLISION_REVIEW_IDS) {
    const entry = byId.get(id);
    if (entry && text(entry?.meta?.content_enrichment_wave) === 'content-wave-003c') throw new Error(`${id}: collision-review hold was incorrectly enriched by Wave3C`);
  }
  if (runtime.diagnostics.contentEnrichmentMissingTargets) throw new Error('Runtime reports missing enrichment targets');
  if (runtime.diagnostics.contentEnrichmentDuplicateTargets) throw new Error('Runtime reports duplicate enrichment targets');
  if ((runtime.diagnostics.contentEnriched || 0) < 97) throw new Error(`Expected at least 97 total enriched runtime entries, got ${runtime.diagnostics.contentEnriched || 0}`);

  console.log(`CTA_Q012_WAVE3C=${JSON.stringify({ active_q012: activeQ012.length, wave3c_entries: actual.size, collision_review_entries_excluded: COLLISION_REVIEW_IDS.size, safe_q012_enriched_total: 65, total_enriched_runtime_entries: runtime.diagnostics.contentEnriched })}`);
  console.log('Construction Tools Atlas q012 content Wave3C v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas q012 content Wave3C v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
