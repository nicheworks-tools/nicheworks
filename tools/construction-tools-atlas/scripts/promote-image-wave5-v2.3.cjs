const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REGISTRY_PATH = path.join(DATA, 'image-registry-v2.3.json');
const LEDGER_PATH = path.join(DATA, 'image-wave5-sources-v2.3.json');
const LIFECYCLE_PATH = path.join(DATA, 'image-lifecycle-v2.3.json');
const RUNTIME_PATH = path.join(ROOT, 'detail-image-hotfix.js');
const VERSION = '2026-09-19-wave5-promotion-1';
const LIFECYCLE_VERSION = '2026-09-19-image-wave5-promoted';
const PROMOTION_AT = '2026-09-18T23:05:00Z';
const MODIFICATIONS = 'Auto-oriented if required, resized, metadata stripped, and converted to WebP; original source retained locally.';
const PROVENANCE_FIELDS = ['source_url', 'source_page', 'license', 'license_url', 'author', 'attribution', 'source_sha1'];

const META = {
  backhoe_loader: {
    alt_ja: '前方ローダーバケットと後方バックホーを備えたバックホーローダー',
    alt_en: 'Backhoe loader with front loader bucket and rear backhoe boom'
  },
  caliper: {
    alt_ja: '測定ジョーを備えたデジタルノギス',
    alt_en: 'Digital caliper with measuring jaws'
  },
  circuit_breaker: {
    alt_ja: '操作レバーを備えた配線用遮断器',
    alt_en: 'Electrical circuit breakers with operating toggles'
  },
  circular_saw: {
    alt_ja: '丸い鋸刃とガードを備えた手持ち丸ノコ',
    alt_en: 'Handheld circular saw with circular blade and guard'
  },
  clamp_bar: {
    alt_ja: '長いバーとスライド式ジョーを備えたバークランプ',
    alt_en: 'Bar clamps with long rails and sliding jaws'
  },
  drill_driver: {
    alt_ja: 'チャックとバッテリーを備えたドリルドライバー',
    alt_en: 'Cordless drill driver with chuck and battery'
  },
  excavator: {
    alt_ja: '履帯、ブーム、アーム、バケットを備えた油圧ショベル',
    alt_en: 'Tracked excavator with boom, arm, and bucket'
  },
  fire_extinguisher: {
    alt_ja: '携帯型の消火器',
    alt_en: 'Portable fire extinguisher'
  },
  forklift: {
    alt_ja: 'マストとフォークを備えたフォークリフト',
    alt_en: 'Forklift with mast and forks'
  },
  hammer: {
    alt_ja: '金属ヘッドと爪を備えたクローハンマー',
    alt_en: 'Claw hammer with metal head, striking face, and claw'
  },
  hard_hat: {
    alt_ja: '白色の保護帽（ハードハット）',
    alt_en: 'White construction hard hat'
  },
  jigsaw: {
    alt_ja: '細い往復刃とベースを備えた電動ジグソー',
    alt_en: 'Electric jigsaw with narrow reciprocating blade and shoe'
  }
};

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

const registry = readJson(REGISTRY_PATH);
const ledger = readJson(LEDGER_PATH);
const lifecycle = readJson(LIFECYCLE_PATH);

if (registry.schema !== 'cta-image-registry-v2.3' || !Array.isArray(registry.items)) throw new Error('Unexpected registry schema.');
if (ledger.schema !== 'cta-image-wave5-sources-v2.3' || !Array.isArray(ledger.items)) throw new Error('Unexpected Wave 5 source ledger schema.');
if (lifecycle.schema !== 'cta-image-lifecycle-v2.3' || !Array.isArray(lifecycle.items) || !Array.isArray(lifecycle.candidates)) throw new Error('Unexpected image lifecycle schema.');

const ledgerById = new Map(ledger.items.map((item) => [text(item.entry_id), item]));
const registryById = new Map(registry.items.map((item) => [text(item.entry_id), item]));
const lifecycleById = new Map(lifecycle.items.map((item) => [text(item.entry_id), item]));
const candidateById = new Map(lifecycle.candidates.map((item) => [text(item.id), item]));

for (const [id, meta] of Object.entries(META)) {
  const source = ledgerById.get(id);
  if (!source) throw new Error(`${id}: missing from Wave 5 source ledger`);
  if (!/^[a-f0-9]{40}$/.test(text(source.source_sha1))) throw new Error(`${id}: source SHA-1 is not pinned`);
  if (text(source.expected_sha1) !== text(source.source_sha1)) throw new Error(`${id}: source SHA-1 does not match verified expected hash`);
  if (source.review_state !== 'verified' || source.subject_match !== 'matched') throw new Error(`${id}: source must remain verified and subject-matched`);

  const sourceFilename = text(source.source_filename);
  if (!sourceFilename) throw new Error(`${id}: source_filename is required`);
  for (const rel of [sourceFilename, 'primary.webp', 'thumb.webp']) {
    const file = path.join(ROOT, 'images', id, rel);
    if (!fs.existsSync(file)) throw new Error(`${id}: generated image asset missing: ${rel}`);
  }

  const lifecycleRow = lifecycleById.get(id);
  if (!lifecycleRow?.history?.length) throw new Error(`${id}: lifecycle row/history missing`);
  const latest = lifecycleRow.history[lifecycleRow.history.length - 1];
  if (!['verified', 'promoted'].includes(latest.state)) throw new Error(`${id}: expected verified/promoted lifecycle state, got ${latest.state}`);
  const candidate = candidateById.get(latest.candidate_id);
  if (!candidate || candidate.source_entry_id !== id || !candidate.source) throw new Error(`${id}: latest verified candidate is missing or not direct`);
  for (const field of PROVENANCE_FIELDS) {
    if (text(candidate.source[field]) !== text(source[field])) throw new Error(`${id}: lifecycle candidate/source ledger mismatch for ${field}`);
  }

  if (latest.state === 'verified') {
    lifecycleRow.history.push({
      state: 'promoted',
      at: PROMOTION_AT,
      actor: 'image-wave5-promotion',
      reason: 'Promoted the already verified Wave 5 candidate after pinned source hash verification, local raster retention, derivative generation, and canonical registry materialization.',
      candidate_id: latest.candidate_id,
      candidate_sha256: latest.candidate_sha256,
      hold: null
    });
  }

  const promoted = {
    entry_id: id,
    alt_ja: meta.alt_ja,
    alt_en: meta.alt_en,
    image_state: 'verified',
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
    notes: 'Wave 5 promotion of a previously provenance-verified and subject-verified lifecycle candidate.'
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
lifecycle.version = LIFECYCLE_VERSION;
fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`);
fs.writeFileSync(LIFECYCLE_PATH, `${JSON.stringify(lifecycle, null, 2)}\n`);

let runtime = fs.readFileSync(RUNTIME_PATH, 'utf8');
const pattern = /image-registry-v2\.3\.json\?v=[^"']+/;
if (!pattern.test(runtime)) throw new Error('Runtime registry cache-key URL was not found.');
runtime = runtime.replace(pattern, `image-registry-v2.3.json?v=${VERSION}`);
fs.writeFileSync(RUNTIME_PATH, runtime);

console.log(`Construction Tools Atlas Wave 5 promotion: PASS (${Object.keys(META).length} entries, registry ${VERSION})`);
