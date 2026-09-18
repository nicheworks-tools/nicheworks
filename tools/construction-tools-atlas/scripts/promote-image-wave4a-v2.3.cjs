const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const LEDGER_PATH = path.join(DATA, 'image-wave4-sources-v2.3.json');
const RUNTIME_PATH = path.join(ROOT, 'detail-image-hotfix.js');
const VERSION = '2026-09-18-wave4a-1';
const MODIFICATIONS = 'Auto-oriented if required, resized, metadata stripped, and converted to WebP; original source retained locally.';

const META = {
  allen_key: {
    alt_ja: 'サイズ違いのL形六角レンチ',
    alt_en: 'Assorted metric L-shaped hex keys',
    notes: 'Wave 4A manually reviewed real-subject image for the Allen key canonical.'
  },
  bolt_cutter: {
    alt_ja: '長いハンドルを備えたボルトカッター',
    alt_en: 'Long-handled bolt cutter',
    notes: 'Wave 4A manually reviewed real-subject image for the Bolt Cutter canonical.'
  },
  ball_valve: {
    alt_ja: '内部の球体が見える半開きのボールバルブ断面模型',
    alt_en: 'Cutaway ball valve showing the internal spherical closure',
    notes: 'Wave 4A manually reviewed real-subject image for the Ball Valve canonical.'
  },
  respirator: {
    alt_ja: '交換式フィルターを備えた半面形空気浄化式呼吸用保護具',
    alt_en: 'Half-mask air-purifying respirator with replaceable filters',
    notes: 'Wave 4A manually reviewed real-subject image for the Respirator canonical.'
  },
  measuring_wheel: {
    alt_ja: '距離測定に使用される測定輪',
    alt_en: 'Surveyor measuring wheel used to measure distance',
    notes: 'Wave 4A manually reviewed real-subject image for the Measuring Wheel canonical.'
  },
  safety_boots: {
    alt_ja: 'つま先保護付きの黒い安全靴',
    alt_en: 'Black steel-toe safety boots',
    notes: 'Wave 4A manually reviewed real-subject image for the Safety Boots canonical.'
  }
};

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

const registry = readJson(REGISTRY_PATH);
const ledger = readJson(LEDGER_PATH);
if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) throw new Error('Unexpected registry schema.');
if (ledger.schema !== 'cta-image-wave4-sources-v2.3' || !Array.isArray(ledger.items)) throw new Error('Unexpected Wave 4 source ledger schema.');

const ledgerById = new Map(ledger.items.map((item) => [text(item.entry_id), item]));
const registryById = new Map(registry.items.map((item) => [text(item.entry_id), item]));

for (const [id, meta] of Object.entries(META)) {
  const source = ledgerById.get(id);
  if (!source) throw new Error(`${id}: missing from Wave 4 source ledger`);
  if (!/^[a-f0-9]{40}$/.test(text(source.source_sha1))) throw new Error(`${id}: source SHA-1 is not pinned`);
  if (text(source.expected_sha1) !== text(source.source_sha1)) throw new Error(`${id}: source SHA-1 does not match reviewed Commons hash`);
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

console.log(`Construction Tools Atlas Wave 4A promotion: PASS (${Object.keys(META).length} entries, registry ${VERSION})`);
