const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const LEDGER_PATH = path.join(DATA, 'image-wave2-sources-v2.3.json');
const RUNTIME_PATH = path.join(ROOT, 'detail-image-hotfix.js');
const VERSION = '2026-09-14-wave2b-1';
const MODIFICATIONS = 'Auto-oriented if required, resized, metadata stripped, and converted to WebP; original source retained locally.';

const META = {
  q012_cold_chisel: {
    alt_ja: '金属加工用の平タガネ2本',
    alt_en: 'Two metalworking cold chisels',
    notes: 'Wave 2B manually reviewed real-subject image; legacy たがね / Chisel identity resolved to q012_cold_chisel rather than the woodworking chisel canonical.'
  },
  q011_flashing: {
    alt_ja: '屋根に施工された水切り金物',
    alt_en: 'Roof flashing installed on a building',
    notes: 'Wave 2B manually reviewed real-subject image; legacy 水切り金物 / Flashing identity resolved to q011_flashing.'
  },
  q014_drip_edge: {
    alt_ja: '屋根端部に施工されるドリップエッジ',
    alt_en: 'Drip edge being installed along a roof edge',
    notes: 'Wave 2B manually reviewed real-subject image; legacy 唐草 / Drip edge identity resolved to the roof-component canonical q014_drip_edge.'
  },
  q013_paint_tray: {
    alt_ja: '塗料を入れたローラー用塗料皿',
    alt_en: 'Paint tray containing paint for a roller',
    notes: 'Wave 2B manually reviewed real-subject image; legacy 塗料皿 / Paint tray identity resolved to q013_paint_tray.'
  },
  q011_notched_trowel: {
    alt_ja: 'タイル接着剤用の角くし目ごて',
    alt_en: 'Square-notched adhesive trowels for tile work',
    notes: 'Wave 2B manually reviewed real-subject image; legacy くし目ごて / Notched trowel identity resolved to q011_notched_trowel.'
  },
  safety_harness: {
    alt_ja: '墜落制止用フルハーネスを装着した作業員',
    alt_en: 'Worker wearing a full-body fall-arrest harness',
    notes: 'Wave 2B manually reviewed real-subject image; legacy フルハーネス / Full body harness identity resolved to safety_harness.'
  }
};

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

const registry = readJson(REGISTRY_PATH);
const ledger = readJson(LEDGER_PATH);
if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) throw new Error('Unexpected registry schema.');
if (ledger.schema !== 'cta-image-wave2-sources-v2.3' || !Array.isArray(ledger.items)) throw new Error('Unexpected Wave 2 source ledger schema.');

const ledgerById = new Map(ledger.items.map((item) => [text(item.entry_id), item]));
const registryById = new Map(registry.items.map((item) => [text(item.entry_id), item]));

for (const [id, meta] of Object.entries(META)) {
  const source = ledgerById.get(id);
  if (!source) throw new Error(`${id}: missing from Wave 2 source ledger`);
  if (!/^[a-f0-9]{40}$/.test(text(source.source_sha1))) throw new Error(`${id}: source SHA-1 is not pinned`);
  const sourceFilename = text(source.source_filename);
  if (!sourceFilename) throw new Error(`${id}: source_filename is required`);
  for (const rel of [sourceFilename, 'primary.webp', 'thumb.webp']) {
    const file = path.join(ROOT, 'images', id, rel);
    if (!fs.existsSync(file)) throw new Error(`${id}: generated image asset missing: ${rel}`);
  }

  const promoted = {
    entry_id: id,
    alt_ja: meta.alt_ja,
    alt_en: meta.alt_en,
    image_state: 'reviewed',
    subject_match: 'matched',
    migration_state: 'promoted',
    primary: {
      source: `./images/${id}/${sourceFilename}`,
      display: `./images/${id}/primary.webp`,
      thumbnail: `./images/${id}/thumb.webp`
    },
    source: {
      source_url: source.source_url,
      source_page: source.source_page,
      license: source.license,
      license_url: source.license_url,
      author: source.author,
      attribution: source.attribution,
      modifications: MODIFICATIONS,
      source_sha1: source.source_sha1
    },
    notes: meta.notes
  };

  if (registryById.has(id)) {
    const index = registry.items.findIndex((item) => text(item.entry_id) === id);
    registry.items[index] = promoted;
  } else {
    registry.items.push(promoted);
  }
  registryById.set(id, promoted);
}

registry.version = VERSION;
fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`);

let runtime = fs.readFileSync(RUNTIME_PATH, 'utf8');
const pattern = /image-registry-v2\.3\.json\?v=[^"']+/;
if (!pattern.test(runtime)) throw new Error('Runtime registry cache-key URL was not found.');
runtime = runtime.replace(pattern, `image-registry-v2.3.json?v=${VERSION}`);
fs.writeFileSync(RUNTIME_PATH, runtime);

console.log(`Construction Tools Atlas Wave 2B promotion: PASS (${Object.keys(META).length} entries, registry ${VERSION})`);
