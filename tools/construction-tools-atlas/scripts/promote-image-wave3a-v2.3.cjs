const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const LEDGER_PATH = path.join(DATA, 'image-wave3-sources-v2.3.json');
const RUNTIME_PATH = path.join(ROOT, 'detail-image-hotfix.js');
const VERSION = '2026-09-14-wave3a-1';
const MODIFICATIONS = 'Auto-oriented if required, resized, metadata stripped, and converted to WebP; original source retained locally.';

const META = {
  q017_workbench: {
    alt_ja: '木工作業用の大型作業台',
    alt_en: 'Heavy woodworking workbench with vise',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Workbench canonical.'
  },
  q017_toolbox: {
    alt_ja: '持ち運び用の金属製工具箱',
    alt_en: 'Portable metal toolbox',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Toolbox canonical.'
  },
  q017_rubber_mallet: {
    alt_ja: '黒いゴム頭のゴムハンマー',
    alt_en: 'Rubber mallets with black non-marring heads',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Rubber Mallet canonical.'
  },
  q017_needle_nose_pliers: {
    alt_ja: '細長い先端を持つラジオペンチ',
    alt_en: 'Needle-nose pliers with long narrow jaws',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Needle-nose Pliers canonical.'
  },
  q017_survey_tripod: {
    alt_ja: '測量機器を載せる測量用三脚',
    alt_en: 'Surveyor tripod with instrument head and spiked feet',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Survey Tripod canonical.'
  },
  q017_copper_pipe: {
    alt_ja: '中空断面が見える銅管',
    alt_en: 'Copper pipe section showing its hollow bore',
    notes: 'Wave 3A manually reviewed real-subject image for the q017 Copper Pipe canonical.'
  }
};

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

const registry = readJson(REGISTRY_PATH);
const ledger = readJson(LEDGER_PATH);
if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) throw new Error('Unexpected registry schema.');
if (ledger.schema !== 'cta-image-wave3-sources-v2.3' || !Array.isArray(ledger.items)) throw new Error('Unexpected Wave 3 source ledger schema.');

const ledgerById = new Map(ledger.items.map((item) => [text(item.entry_id), item]));
const registryById = new Map(registry.items.map((item) => [text(item.entry_id), item]));

for (const [id, meta] of Object.entries(META)) {
  const source = ledgerById.get(id);
  if (!source) throw new Error(`${id}: missing from Wave 3 source ledger`);
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

console.log(`Construction Tools Atlas Wave 3A promotion: PASS (${Object.keys(META).length} entries, registry ${VERSION})`);
