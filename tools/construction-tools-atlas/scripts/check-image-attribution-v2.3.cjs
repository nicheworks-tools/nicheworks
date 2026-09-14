const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ATTRIBUTION_PATH = path.join(ROOT, 'images', 'ATTRIBUTION.md');
const LEDGER_PATHS = [
  path.join(DATA, 'image-wave1-sources-v2.3.json'),
  path.join(DATA, 'image-wave2-sources-v2.3.json')
];
const errors = [];

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if (!fs.existsSync(ATTRIBUTION_PATH)) {
  console.error('Construction Tools Atlas image attribution check: FAIL');
  console.error('- images/ATTRIBUTION.md is missing');
  process.exit(1);
}

const markdown = fs.readFileSync(ATTRIBUTION_PATH, 'utf8');
const ledgers = [];
const seen = new Set();
for (const file of LEDGER_PATHS) {
  if (!fs.existsSync(file)) continue;
  const ledger = readJson(file);
  if (!text(ledger.version)) errors.push(`${path.basename(file)}: version is required`);
  if (!Array.isArray(ledger.items)) {
    errors.push(`${path.basename(file)}: items must be an array`);
    continue;
  }
  ledgers.push(ledger);
  for (const item of ledger.items) {
    const id = text(item.entry_id);
    if (!id) {
      errors.push(`${path.basename(file)}: item missing entry_id`);
      continue;
    }
    if (seen.has(id)) errors.push(`${id}: duplicate entry_id across source ledgers`);
    seen.add(id);
    const hash = text(item.source_sha1);
    if (!/^[a-f0-9]{40}$/.test(hash)) errors.push(`${id}: pinned source_sha1 is required before attribution validation`);

    const expectedFragments = [
      `\`${id}\``,
      text(item.attribution),
      `[${text(item.license)}](${text(item.license_url)})`,
      `[Wikimedia Commons](${text(item.source_page)})`,
      `\`${hash}\``
    ];
    for (const fragment of expectedFragments) {
      if (!fragment || !markdown.includes(fragment)) {
        errors.push(`${id}: attribution output is missing or stale for ${fragment || '<empty field>'}`);
      }
    }
  }
}

for (const ledger of ledgers) {
  if (!markdown.includes(`\`${ledger.version}\``)) {
    errors.push(`images/ATTRIBUTION.md is missing source ledger version ${ledger.version}`);
  }
}

if (!markdown.includes('Runtime images are local derivatives.')) {
  errors.push('images/ATTRIBUTION.md is missing derivative disclosure');
}
if (!markdown.includes('does not assert new copyright restrictions')) {
  errors.push('images/ATTRIBUTION.md is missing Public Domain/CC0 derivative rights statement');
}

if (errors.length) {
  console.error('Construction Tools Atlas image attribution check: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas image attribution check: PASS');
console.log(`- source ledgers: ${ledgers.length}`);
console.log(`- attributed canonical images: ${seen.size}`);
console.log('- generated attribution contains every pinned source hash, source page, license, and source-ledger version');
