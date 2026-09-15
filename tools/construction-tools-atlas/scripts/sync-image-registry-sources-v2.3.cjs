const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const LEDGER_PATHS = fs.readdirSync(DATA)
  .filter((name) => /^image-wave\d+-sources-v2\.3\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, 'en'))
  .map((name) => path.join(DATA, name));
const SYNC_FIELDS = [
  'source_url',
  'source_page',
  'license',
  'license_url',
  'author',
  'attribution',
  'source_sha1'
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const registry = readJson(REGISTRY_PATH);
if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) {
  throw new Error('Unexpected canonical image registry schema.');
}

const ledgerById = new Map();
for (const file of LEDGER_PATHS) {
  if (!fs.existsSync(file)) continue;
  const ledger = readJson(file);
  if (!Array.isArray(ledger.items)) throw new Error(`Invalid source ledger: ${path.basename(file)}`);
  for (const item of ledger.items) {
    const id = text(item.entry_id);
    if (!id) throw new Error(`${path.basename(file)} contains an item without entry_id`);
    if (ledgerById.has(id)) throw new Error(`Source ledger entry_id appears more than once across ledgers: ${id}`);
    const source = {};
    for (const field of SYNC_FIELDS) {
      const value = text(item[field]);
      if (!value) throw new Error(`${id}: source ledger ${field} is required before registry sync`);
      source[field] = value;
    }
    ledgerById.set(id, source);
  }
}

let changed = 0;
let matched = 0;
for (const item of registry.items) {
  const id = text(item.entry_id);
  const canonical = ledgerById.get(id);
  if (!canonical) continue;
  matched += 1;
  if (!item.source || typeof item.source !== 'object' || Array.isArray(item.source)) item.source = {};
  for (const field of SYNC_FIELDS) {
    if (text(item.source[field]) !== canonical[field]) {
      item.source[field] = canonical[field];
      changed += 1;
    }
  }
}

fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Construction Tools Atlas registry source sync: matched=${matched}, field_updates=${changed}`);
