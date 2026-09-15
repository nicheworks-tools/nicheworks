import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const dataRoot = new URL('../data/', import.meta.url);
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);

function run(url, filename) {
  vm.runInContext(fs.readFileSync(url, 'utf8'), context, { filename });
}

function runData(name) {
  run(new URL(name, dataRoot), `tools/manual-finder/data/${name}`);
}

function normalize(rows) {
  const seen = new Set();
  return (rows || []).filter(Boolean).map((x) => {
    const brand = x.brand || x.maker || x.nameEn || x.nameJa || 'Unknown';
    return {
      id: x.id || '',
      maker: x.maker || brand,
      model: x.model || '',
      family: x.family || '',
      category: x.category || 'その他'
    };
  }).filter((x) => {
    const key = x.id
      ? `id:${x.id}`
      : x.model
        ? `model:${x.maker}|${x.model}|${x.category}`.toLowerCase()
        : `base:${x.maker}|${x.category}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function printerDetailKey(row) {
  return `${row.maker}|${row.model}|${row.category}`.toLowerCase();
}

// Reproduce the production data-loading contract from app.paged.js/index.html.
const baseRows = JSON.parse(fs.readFileSync(new URL('manuals.json', dataRoot), 'utf8'));

runData('manuals.full.js');
for (const name of context.window.MANUALFINDER_WAVE1_BATCHES || []) runData(name);
const wave1Rows = typeof context.window.MANUALFINDER_BUILD_WAVE1 === 'function'
  ? context.window.MANUALFINDER_BUILD_WAVE1()
  : [];

// Wave 2.06-2.11 are intentionally preloaded by index.html before manuals.wave2.js.
for (const name of [
  'manuals.wave2.06.js',
  'manuals.wave2.07.js',
  'manuals.wave2.08.js',
  'manuals.wave2.09.js',
  'manuals.wave2.10.js',
  'manuals.wave2.11.js'
]) runData(name);
runData('manuals.wave2.js');
for (const name of context.window.MANUALFINDER_WAVE2_BATCHES || []) runData(name);
const wave2Rows = typeof context.window.MANUALFINDER_BUILD_WAVE2 === 'function'
  ? context.window.MANUALFINDER_BUILD_WAVE2()
  : [];

runData('manuals.wave3.js');
for (const name of context.window.MANUALFINDER_WAVE3_BATCHES || []) runData(name);
const wave3Rows = typeof context.window.MANUALFINDER_BUILD_WAVE3 === 'function'
  ? context.window.MANUALFINDER_BUILD_WAVE3()
  : [];

const records = normalize([...baseRows, ...wave1Rows, ...wave2Rows, ...wave3Rows]);
assert.ok(records.length > 0, 'ManualFinder canonical catalog should not be empty');

for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js',
  'affiliate-oki-toner-wave6.js',
  'affiliate-ricoh-consumables-wave3.js',
  'affiliate-kyocera-toner-wave3.js',
  'affiliate-kyocera-toner-wave4.js',
  'affiliate-kyocera-toner-wave6.js',
  'affiliate-fujifilm-toner-wave2.js',
  'affiliate-printer-detail-exclusions.js'
]) run(new URL(name, root), `tools/manual-finder/${name}`);

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.ok(config?.enabled, 'ManualFinder affiliate config should be enabled');

const excludedCategories = new Set(Array.from(config.modelSearchTemplate?.excludedCategories || []));
const staticOfferTitles = new Set(
  Array.from(config.offers || []).map((offer) => `${offer.maker} ${offer.model}`)
);
const printerDetailExclusions = Array.from(context.window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS || []);
const printerDetailExclusionKeys = new Set(printerDetailExclusions.map(printerDetailKey));
assert.equal(
  printerDetailExclusionKeys.size,
  printerDetailExclusions.length,
  'reviewed printer detail exclusions must not contain duplicate maker/model/category keys'
);

const canonicalPrinterKeys = new Set(
  records
    .filter((row) => row.category === 'プリンター・複合機')
    .map(printerDetailKey)
);
assert.ok(
  printerDetailExclusions.every((row) => canonicalPrinterKeys.has(printerDetailKey(row))),
  'every reviewed printer detail exclusion must resolve to one canonical printer record'
);

const rows = records.map((record) => {
  const modelUrl = config.buildModelSearchUrl?.(record) || '';
  const consumables = Array.from(config.getConsumableOffers?.(record) || []);
  const staticOffer = staticOfferTitles.has(`${record.maker} ${record.model}`);
  const basic = Boolean(modelUrl || staticOffer);
  const detail = Boolean(consumables.length || staticOffer);
  const detailExcluded = printerDetailExclusionKeys.has(printerDetailKey(record));
  const makerIndexWithoutModel = !basic && !record.model;
  const excludedCategory = !basic && !makerIndexWithoutModel && excludedCategories.has(record.category);
  const explicitlyExcluded = excludedCategory || makerIndexWithoutModel;
  const exclusionReason = makerIndexWithoutModel
    ? 'maker_index_without_model'
    : excludedCategory
      ? 'excluded_category'
      : '';
  const unclassified = !basic && !explicitlyExcluded;
  return {
    ...record,
    basic,
    detail,
    detailExcluded,
    explicitlyExcluded,
    exclusionReason,
    unclassified
  };
});

const byCategory = {};
for (const row of rows) {
  const bucket = byCategory[row.category] ||= {
    total: 0,
    basic: 0,
    detail: 0,
    detailExcluded: 0,
    excludedCategory: 0,
    makerIndexWithoutModel: 0,
    unclassified: 0
  };
  bucket.total += 1;
  if (row.basic) bucket.basic += 1;
  if (row.detail) bucket.detail += 1;
  if (row.detailExcluded) bucket.detailExcluded += 1;
  if (row.exclusionReason === 'excluded_category') bucket.excludedCategory += 1;
  if (row.exclusionReason === 'maker_index_without_model') bucket.makerIndexWithoutModel += 1;
  if (row.unclassified) bucket.unclassified += 1;
}

const explicitExclusions = rows.filter((row) => row.explicitlyExcluded);
const excludedCategoryRows = rows.filter((row) => row.exclusionReason === 'excluded_category');
const makerIndexRows = rows.filter((row) => row.exclusionReason === 'maker_index_without_model');
const unclassified = rows.filter((row) => row.unclassified);
const excludedCategoryByMaker = Object.fromEntries(
  Array.from(excludedCategoryRows.reduce((map, row) => {
    map.set(row.maker, (map.get(row.maker) || 0) + 1);
    return map;
  }, new Map())).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
);
const printerDetailExcludedRows = rows.filter(
  (row) => row.category === 'プリンター・複合機' && row.basic && !row.detail && row.detailExcluded
);
const printerDetailExcludedByMaker = Object.fromEntries(
  Array.from(printerDetailExcludedRows.reduce((map, row) => {
    map.set(row.maker, (map.get(row.maker) || 0) + 1);
    return map;
  }, new Map())).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
);
const printerMissingDetailRows = rows.filter(
  (row) => row.category === 'プリンター・複合機' && row.basic && !row.detail && !row.detailExcluded
);
const printerMissingDetailByMaker = Object.fromEntries(
  Array.from(printerMissingDetailRows.reduce((map, row) => {
    map.set(row.maker, (map.get(row.maker) || 0) + 1);
    return map;
  }, new Map())).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
);
const printerMissingDetailModelsByMaker = Object.fromEntries(
  Array.from(printerMissingDetailRows.reduce((map, row) => {
    const models = map.get(row.maker) || [];
    models.push(row.model);
    map.set(row.maker, models);
    return map;
  }, new Map())).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
);
for (const models of Object.values(printerMissingDetailModelsByMaker)) models.sort();

const summary = {
  total: rows.length,
  basic: rows.filter((row) => row.basic).length,
  detail: rows.filter((row) => row.detail).length,
  explicitlyExcluded: explicitExclusions.length,
  excludedCategoryRecords: excludedCategoryRows.length,
  makerIndexWithoutModel: makerIndexRows.length,
  unclassified: unclassified.length,
  excludedCategories: Array.from(excludedCategories).sort(),
  excludedCategoryByMaker,
  printerDetailExcluded: printerDetailExcludedRows.length,
  printerDetailExcludedByMaker,
  printerMissingDetail: printerMissingDetailRows.length,
  printerMissingDetailByMaker,
  printerMissingDetailModelsByMaker,
  excludedFingerprint: crypto.createHash('sha256').update(
    explicitExclusions
      .map((row) => `${row.id}|${row.maker}|${row.model}|${row.category}|${row.exclusionReason}`)
      .sort()
      .join('\n')
  ).digest('hex'),
  printerDetailExclusionFingerprint: crypto.createHash('sha256').update(
    printerDetailExclusions
      .map((row) => `${row.maker}|${row.model}|${row.category}|${row.reason}|${row.sourceUrl}`)
      .sort()
      .join('\n')
  ).digest('hex'),
  byCategory
};

console.log(`MANUALFINDER_AFFILIATE_COVERAGE ${JSON.stringify(summary)}`);
if (unclassified.length) {
  console.error('ManualFinder affiliate-unclassified records:');
  for (const row of unclassified) console.error(`- ${row.id || '(no-id)'} | ${row.maker} | ${row.model} | ${row.category}`);
}

assert.equal(
  summary.basic + summary.explicitlyExcluded,
  summary.total,
  'every canonical record must have a basic Amazon path or an explicit exclusion'
);
assert.equal(summary.unclassified, 0, 'new affiliate-unclassified records must fail closed');
assert.equal(
  summary.excludedCategoryRecords + summary.makerIndexWithoutModel,
  summary.explicitlyExcluded,
  'every explicit exclusion must have exactly one audited reason'
);
assert.equal(
  Object.values(summary.excludedCategoryByMaker).reduce((sum, count) => sum + count, 0),
  summary.excludedCategoryRecords,
  'maker-level excluded-category counts must reconcile to the audited excluded total'
);
assert.deepEqual(
  Object.keys(summary.excludedCategoryByMaker),
  ['Seiko'],
  'only the reviewed Seiko caliber family may remain excluded by category; new その他 makers must be reviewed explicitly'
);
assert.ok(
  excludedCategoryRows.every((row) => row.maker === 'Seiko' && row.family === 'Watch caliber'),
  'all category exclusions must remain non-retail Seiko caliber identifiers'
);
assert.equal(
  printerDetailExcludedRows.length,
  printerDetailExclusions.length,
  'every reviewed printer detail exclusion must remain a basic printer without a retail detail handoff'
);
assert.equal(
  Object.values(summary.printerDetailExcludedByMaker).reduce((sum, count) => sum + count, 0),
  summary.printerDetailExcluded,
  'printer detail exclusion maker counts must reconcile to the audited exclusion total'
);
assert.equal(
  Object.values(summary.printerMissingDetailByMaker).reduce((sum, count) => sum + count, 0),
  summary.printerMissingDetail,
  'printer missing-detail maker counts must reconcile to the audited missing-detail total'
);
assert.equal(
  summary.printerMissingDetail + summary.printerDetailExcluded,
  summary.byCategory['プリンター・複合機'].basic - summary.byCategory['プリンター・複合機'].detail,
  'printer detail gaps must reconcile to actionable missing detail plus reviewed detail exclusions'
);

console.log('ManualFinder affiliate coverage audit passed.');
