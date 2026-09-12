import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const dataPath = path.join(root, 'data', 'services.json');
const additionsDir = path.join(root, 'data', 'additions');
const reverificationDir = path.join(root, 'data', 'reverification');
const allowedStates = new Set(['legacy_review_required', 'verified', 'needs_review', 'retired', 'placeholder']);
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    fail(`cannot parse ${path.relative(root, file)}: ${error.message}`);
    return null;
  }
}
function jsonFiles(dir) {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
    : [];
}

const base = readJson(dataPath);
if (!base) {
  console.error(`unsubscribe-navi audit: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

if (!Number.isInteger(base.schema_version)) fail('schema_version must be an integer');
if (!Array.isArray(base.records)) fail('records must be an array');

const baseRecords = Array.isArray(base.records) ? base.records : [];
const byId = new Map();
for (const record of baseRecords) {
  if (!record?.id) continue;
  if (byId.has(record.id)) fail(`${record.id}: duplicate id in base services.json`);
  byId.set(record.id, record);
}

const additionFiles = jsonFiles(additionsDir);
const additionIds = new Set();
for (const name of additionFiles) {
  const file = path.join(additionsDir, name);
  const addition = readJson(file);
  if (!addition) continue;
  if (!Array.isArray(addition.records)) {
    fail(`${name}: records must be an array`);
    continue;
  }

  const idsInFile = new Set();
  for (const record of addition.records) {
    if (!record?.id) {
      fail(`${name}: addition record missing id`);
      continue;
    }
    if (idsInFile.has(record.id)) {
      fail(`${name}: duplicate addition id ${record.id} within the same wave`);
      continue;
    }
    idsInFile.add(record.id);
    if (byId.has(record.id)) {
      fail(`${name}: addition id ${record.id} collides with an existing record`);
      continue;
    }
    additionIds.add(record.id);
    byId.set(record.id, record);
  }
}

const overlayFiles = jsonFiles(reverificationDir);
const overlayIds = new Set();
let supersededOverlayWrites = 0;

for (const name of overlayFiles) {
  const file = path.join(reverificationDir, name);
  const overlay = readJson(file);
  if (!overlay) continue;
  if (!Array.isArray(overlay.records)) {
    fail(`${name}: records must be an array`);
    continue;
  }

  const idsInFile = new Set();
  for (const record of overlay.records) {
    if (!record?.id) {
      fail(`${name}: overlay record missing id`);
      continue;
    }
    if (idsInFile.has(record.id)) {
      fail(`${name}: duplicate overlay id ${record.id} within the same wave`);
      continue;
    }
    idsInFile.add(record.id);

    if (!byId.has(record.id)) {
      fail(`${name}: overlay id ${record.id} does not exist in base or additions`);
      continue;
    }
    if (overlayIds.has(record.id)) supersededOverlayWrites += 1;
    overlayIds.add(record.id);

    const previous = byId.get(record.id);
    byId.set(record.id, {
      ...previous,
      ...record,
      verification: {
        ...(previous.verification || {}),
        ...(record.verification || {})
      }
    });
  }
}

const records = [...byId.values()];
const stateCounts = {};
const categoryCounts = {};
const procedureTypeCounts = {};
const billingRouteCounts = {};

for (const [index, record] of records.entries()) {
  const label = record?.id || `record[${index}]`;
  for (const field of ['id', 'name', 'category', 'official_site_url', 'publication_state']) {
    if (!record?.[field]) fail(`${label}: missing required field ${field}`);
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
    if (!record.procedure_type) warn(`${label}: verified record should declare procedure_type`);
    if (!Array.isArray(record.billing_routes) || record.billing_routes.length === 0) warn(`${label}: verified record should declare billing_routes`);
  }

  if (!record?.procedure_url && !['placeholder', 'needs_review'].includes(record?.publication_state)) {
    warn(`${label}: no procedure_url; official-site fallback only`);
  }

  stateCounts[record?.publication_state || 'missing'] = (stateCounts[record?.publication_state || 'missing'] || 0) + 1;
  categoryCounts[record?.category || 'missing'] = (categoryCounts[record?.category || 'missing'] || 0) + 1;
  if (record?.procedure_type) procedureTypeCounts[record.procedure_type] = (procedureTypeCounts[record.procedure_type] || 0) + 1;
  for (const route of record?.billing_routes || []) billingRouteCounts[route] = (billingRouteCounts[route] || 0) + 1;
}

const visibleCount = records.filter((record) => record.publication_state !== 'placeholder').length;
const verifiedCount = records.filter((record) => record.publication_state === 'verified').length;
const legacyCount = records.filter((record) => record.publication_state === 'legacy_review_required').length;
const needsReviewCount = records.filter((record) => record.publication_state === 'needs_review').length;
const reviewCount = legacyCount + needsReviewCount;
const retiredCount = records.filter((record) => record.publication_state === 'retired').length;
const placeholderCount = records.filter((record) => record.publication_state === 'placeholder').length;

console.log('unsubscribe-navi database audit');
console.log(`- legacy base records: ${baseRecords.length}`);
console.log(`- phase 2 addition files: ${additionFiles.length}`);
console.log(`- phase 2 added ids: ${additionIds.size}`);
console.log(`- re-verification overlay files: ${overlayFiles.length}`);
console.log(`- re-verified/overridden ids: ${overlayIds.size}`);
console.log(`- later-wave superseding writes: ${supersededOverlayWrites}`);
console.log(`- effective records: ${records.length}`);
console.log(`- public-visible records: ${visibleCount}`);
console.log(`- verified: ${verifiedCount}`);
console.log(`- legacy review required: ${legacyCount}`);
console.log(`- needs review: ${needsReviewCount}`);
console.log(`- review required total: ${reviewCount}`);
console.log(`- retired: ${retiredCount}`);
console.log(`- placeholders hidden: ${placeholderCount}`);
console.log(`- verified share of visible records: ${visibleCount ? Math.round((verifiedCount / visibleCount) * 100) : 0}%`);
console.log(`- progress to 100-service target: ${Math.min(100, Math.round((visibleCount / 100) * 100))}% (${visibleCount}/100)`);
console.log(`- progress to 200-service target: ${Math.min(100, Math.round((visibleCount / 200) * 100))}% (${visibleCount}/200)`);
console.log(`- states: ${JSON.stringify(stateCounts)}`);
console.log(`- categories: ${JSON.stringify(categoryCounts)}`);
console.log(`- procedure types: ${JSON.stringify(procedureTypeCounts)}`);
console.log(`- billing routes: ${JSON.stringify(billingRouteCounts)}`);

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
