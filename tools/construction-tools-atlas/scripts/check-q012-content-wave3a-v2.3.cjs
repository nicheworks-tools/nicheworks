const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-012.json');
const WAVE = path.join(DATA, 'content-enrichment-wave3a-v2.3.json');
const LOADER = path.join(DATA, 'quality-loader.js');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');

const EXPECTED = new Set([
  'q012_air_impact_wrench','q012_ratchet_handle','q012_combination_wrench','q012_box_wrench','q012_tap_die_set',
  'q012_thread_gauge','q012_micrometer','q012_depth_gauge','q012_digital_level','q012_water_level',
  'q012_sliding_bevel','q012_marking_gauge','q012_block_plane','q012_japanese_plane','q012_pull_saw',
  'q012_coping_saw','q012_step_drill','q012_countersink_bit','q012_reamer','q012_grinder_disc',
  'q012_flap_disc','q012_wire_brush_wheel','q012_cup_wheel','q012_sds_plus_bit','q012_sds_max_bit'
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
  if (wave?.schema !== 'cta-content-enrichment-v2.3') throw new Error('Unexpected Wave3A enrichment schema');
  const patches = arr(wave.entries);
  if (patches.length !== 25) throw new Error(`Expected 25 Wave3A entries, got ${patches.length}`);
  const actual = new Set();
  for (const patch of patches) {
    const id = text(patch?.id);
    if (!id || actual.has(id)) throw new Error(`Invalid or duplicate Wave3A id: ${id || '<missing>'}`);
    actual.add(id);
    if (!EXPECTED.has(id)) throw new Error(`Unexpected Wave3A id: ${id}`);
    if (COLLISION_REVIEW_IDS.has(id)) throw new Error(`${id}: collision-review entry must not be enriched in safe Wave3A`);
    if (text(patch?.wave) !== 'content-wave-003a' || text(patch?.state) !== 'expanded') throw new Error(`${id}: invalid wave/state`);
    if (!text(patch?.detail_ja) || !text(patch?.detail_en)) throw new Error(`${id}: bilingual detail required`);
    if (!nonEmptyArray(patch?.bullets_ja) || !nonEmptyArray(patch?.bullets_en)) throw new Error(`${id}: bilingual bullets required`);
    if (!nonEmptyArray(patch?.examples_ja) || !nonEmptyArray(patch?.examples_en)) throw new Error(`${id}: bilingual examples required`);
  }
  for (const id of EXPECTED) if (!actual.has(id)) throw new Error(`Missing expected Wave3A id: ${id}`);

  const redirects = new Set(arr(readJson(REDIRECTS)?.redirects).map((row) => text(row?.from)).filter(Boolean));
  const q012 = rowsFrom(readJson(TARGET)).map((row) => text(row?.id)).filter(Boolean);
  const activeQ012 = q012.filter((id) => !redirects.has(id));
  if (activeQ012.length !== 84) throw new Error(`Expected 84 active q012 rows before identity closure, got ${activeQ012.length}`);
  for (const id of EXPECTED) if (!activeQ012.includes(id)) throw new Error(`${id}: expected safe id is not an active q012 canonical`);

  const runtime = await runLoader();
  const byId = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  for (const id of EXPECTED) {
    const entry = byId.get(id);
    if (!entry) throw new Error(`${id}: Wave3A id missing from public runtime`);
    if (text(entry?.meta?.content_enrichment_wave) !== 'content-wave-003a') throw new Error(`${id}: runtime wave marker mismatch`);
    if (text(entry?.meta?.content_enrichment_state) !== 'expanded') throw new Error(`${id}: runtime state is not expanded`);
  }
  if (runtime.diagnostics.contentEnrichmentMissingTargets) throw new Error('Runtime reports missing enrichment targets');
  if (runtime.diagnostics.contentEnrichmentDuplicateTargets) throw new Error('Runtime reports duplicate enrichment targets');
  if ((runtime.diagnostics.contentEnriched || 0) !== 57) throw new Error(`Expected 57 total enriched runtime entries, got ${runtime.diagnostics.contentEnriched || 0}`);

  console.log(`CTA_Q012_WAVE3A=${JSON.stringify({ active_q012: activeQ012.length, wave3a_entries: actual.size, collision_review_entries_excluded: COLLISION_REVIEW_IDS.size, total_enriched_runtime_entries: runtime.diagnostics.contentEnriched })}`);
  console.log('Construction Tools Atlas q012 content Wave3A v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas q012 content Wave3A v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
