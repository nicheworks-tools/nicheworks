const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TARGET = path.join(DATA, 'tools.quality-013.json');
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const LOADER = path.join(DATA, 'quality-loader.js');

const EXPECTED = {
  'content-wave-004a': new Set([
    'q013_scaffold_board','q013_scaffold_clamp','q013_swivel_clamp','q013_right_angle_clamp','q013_base_jack','q013_base_plate_scaffold','q013_scaffold_ladder','q013_ladder_frame','q013_cross_brace','q013_wall_tie','q013_lifting_sling','q013_wire_rope_sling','q013_chain_sling','q013_turnbuckle','q013_beam_clamp','q013_trolley_hoist','q013_tag_line','q013_dolly','q013_material_cart','q013_mortar_pan','q013_mix_bucket','q013_paddle_mixer'
  ]),
  'content-wave-004b': new Set([
    'q013_concrete_rake','q013_bull_float','q013_edger_trowel','q013_groover_trowel','q013_power_trowel','q013_joint_cutter','q013_ram_compactor','q013_shovel_square','q013_shovel_pointed','q013_soil_rake','q013_gravel','q013_sand','q013_backfill_soil','q013_geotextile','q013_weed_barrier','q013_drain_pipe','q013_perforated_pipe','q013_drain_gravel','q013_catch_basin','q013_manhole_cover','q013_trench_box','q013_shoring','q013_sheet_pile','q013_h_pile','q013_strut','q013_waler'
  ]),
  'content-wave-004c': new Set([
    'q013_survey_stake','q013_theodolite','q013_prism_pole','q013_survey_prism','q013_flagging_tape','q013_batter_board','q013_grade_stake','q013_slope_board','q013_panel_carrier','q013_drywall_rasp','q013_board_cutter','q013_snap_off_blade','q013_straightedge','q013_metal_ruler','q013_long_tape','q013_scribe','q013_center_punch','q013_pin_punch','q013_file_flat','q013_file_round','q013_file_half_round','q013_wire_hand_brush'
  ])
};

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
  const sourceRows = rowsFrom(readJson(TARGET));
  if (sourceRows.length !== 85) throw new Error(`Expected 85 q013 source rows, got ${sourceRows.length}`);
  const redirects = new Map(arr(readJson(REDIRECTS)?.redirects).map((row) => [text(row?.from), text(row?.to)]).filter(([from, to]) => from && to));
  const activeIds = sourceRows.map((row) => text(row?.id)).filter((id) => id && !redirects.has(id));
  if (activeIds.length !== 70) throw new Error(`Expected 70 active q013 canonicals, got ${activeIds.length}`);

  const expectedAll = new Set(Object.values(EXPECTED).flatMap((set) => [...set]));
  if (expectedAll.size !== 70) throw new Error(`Expected pack membership must contain 70 unique ids, got ${expectedAll.size}`);
  const activeSet = new Set(activeIds);
  const missingExpected = activeIds.filter((id) => !expectedAll.has(id));
  const retiredInPack = [...expectedAll].filter((id) => !activeSet.has(id));
  if (missingExpected.length || retiredInPack.length) throw new Error(`q013 pack membership mismatch: missing=${missingExpected.join(',') || '-'} retired_or_unknown=${retiredInPack.join(',') || '-'}`);

  const runtime = await runLoader();
  const byId = new Map(runtime.entries.map((entry) => [text(entry?.id), entry]));
  const missing = [];
  const notExpanded = [];
  const waveCounts = {};
  for (const id of activeIds) {
    const entry = byId.get(id);
    if (!entry) { missing.push(id); continue; }
    const wave = text(entry?.meta?.content_enrichment_wave);
    const state = text(entry?.meta?.content_enrichment_state);
    if (!wave || state !== 'expanded') notExpanded.push(id);
    if (wave) waveCounts[wave] = (waveCounts[wave] || 0) + 1;
  }
  if (missing.length) throw new Error(`Active q013 entries missing from runtime: ${missing.join(', ')}`);
  if (notExpanded.length) throw new Error(`Active q013 entries still rely on generic fallback: ${notExpanded.join(', ')}`);

  for (const [wave, expected] of Object.entries(EXPECTED)) {
    const actual = new Set(activeIds.filter((id) => text(byId.get(id)?.meta?.content_enrichment_wave) === wave));
    const missingIds = [...expected].filter((id) => !actual.has(id));
    const unexpectedIds = [...actual].filter((id) => !expected.has(id));
    if (missingIds.length || unexpectedIds.length) throw new Error(`${wave} membership mismatch: missing=${missingIds.join(',') || '-'} unexpected=${unexpectedIds.join(',') || '-'}`);
    if (actual.size !== expected.size) throw new Error(`${wave} expected ${expected.size} entries, got ${actual.size}`);
  }

  if (runtime.diagnostics.contentEnrichmentMissingTargets) throw new Error('Runtime reports missing content enrichment targets');
  if (runtime.diagnostics.contentEnrichmentDuplicateTargets) throw new Error('Runtime reports duplicate content enrichment targets');

  console.log(`CTA_Q013_CONTENT_COMPLETION=${JSON.stringify({source_q013:sourceRows.length,active_q013:activeIds.length,enriched_q013:activeIds.length,wave_counts:waveCounts,wave4a:EXPECTED['content-wave-004a'].size,wave4b:EXPECTED['content-wave-004b'].size,wave4c:EXPECTED['content-wave-004c'].size})}`);
  console.log('Construction Tools Atlas q013 content completion v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas q013 content completion v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
