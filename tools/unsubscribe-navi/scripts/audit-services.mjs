import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const dataPath = path.join(root, 'data', 'services.json');
const allowedStates = new Set(['legacy_review_required', 'verified', 'needs_review', 'retired', 'placeholder']);
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

let database;
try {
  database = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (error) {
  console.error(`unsubscribe-navi audit: FAIL — cannot parse ${dataPath}: ${error.message}`);
  process.exit(1);
}

if (!Number.isInteger(database.schema_version)) fail('schema_version must be an integer');
if (!Array.isArray(database.records)) fail('records must be an array');

const records = Array.isArray(database.records) ? database.records : [];
const ids = new Set();
const stateCounts = {};
const categoryCounts = {};

for (const [index, record] of records.entries()) {
  const label = record?.id || `record[${index}]`;
  for (const field of ['id', 'name', 'category', 'official_site_url', 'publication_state']) {
    if (!record?.[field]) fail(`${label}: missing required field ${field}`);
  }

  if (record?.id) {
    if (ids.has(record.id)) fail(`${label}: duplicate id`);
    ids.add(record.id);
  }

  if (record?.publication_state && !allowedStates.has(record.publication_state)) {
    fail(`${label}: invalid publication_state ${record.publication_state}`);
  }

  if (record?.official_site_url && !/^https:\/\//.test(record.official_site_url)) {
    fail(`${label}: official_site_url must use https`);
  }
  if (record?.procedure_url && !/^https:\/\//.test(record.procedure_url)) {
    fail(`${label}: procedure_url must use https when present`);
  }

  if (record?.publication_state === 'verified') {
    if (!record.procedure_url) fail(`${label}: verified record requires procedure_url`);
    if (!record.verification?.last_verified_at) fail(`${label}: verified record requires verification.last_verified_at`);
    if (!record.verification?.source_title) fail(`${label}: verified record requires verification.source_title`);
  }

  if (!record?.procedure_url && record?.publication_state !== 'placeholder') {
    warn(`${label}: no procedure_url; official-site fallback only`);
  }

  stateCounts[record?.publication_state || 'missing'] = (stateCounts[record?.publication_state || 'missing'] || 0) + 1;
  categoryCounts[record?.category || 'missing'] = (categoryCounts[record?.category || 'missing'] || 0) + 1;
}

const visibleCount = records.filter((record) => record.publication_state !== 'placeholder').length;
const verifiedCount = records.filter((record) => record.publication_state === 'verified').length;
const reviewCount = records.filter((record) => ['legacy_review_required', 'needs_review'].includes(record.publication_state)).length;

console.log('unsubscribe-navi database audit');
console.log(`- total records: ${records.length}`);
console.log(`- public-visible records: ${visibleCount}`);
console.log(`- verified: ${verifiedCount}`);
console.log(`- review required: ${reviewCount}`);
console.log(`- progress to 100-service target: ${Math.min(100, Math.round((visibleCount / 100) * 100))}% (${visibleCount}/100)`);
console.log(`- progress to 200-service target: ${Math.min(100, Math.round((visibleCount / 200) * 100))}% (${visibleCount}/200)`);
console.log(`- states: ${JSON.stringify(stateCounts)}`);
console.log(`- categories: ${JSON.stringify(categoryCounts)}`);

if (warnings.length) {
  console.log(`- warnings: ${warnings.length}`);
  for (const message of warnings) console.log(`  - ${message}`);
}

if (errors.length) {
  console.error(`unsubscribe-navi audit: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log('unsubscribe-navi audit: OK');
