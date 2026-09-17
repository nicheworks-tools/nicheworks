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

function detailKey(row) {
  return `${row.maker}|${row.model}|${row.category}`.toLowerCase();
}

function countByMaker(rows) {
  return Object.fromEntries(
    Array.from(rows.reduce((map, row) => {
      map.set(row.maker, (map.get(row.maker) || 0) + 1);
      return map;
    }, new Map())).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  );
}

function modelsByMaker(rows) {
  const result = Object.fromEntries(
    Array.from(rows.reduce((map, row) => {
      const models = map.get(row.maker) || [];
      models.push(row.model);
      map.set(row.maker, models);
      return map;
    }, new Map())).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  );
  for (const models of Object.values(result)) models.sort();
  return result;
}

const baseRows = JSON.parse(fs.readFileSync(new URL('manuals.json', dataRoot), 'utf8'));

runData('manuals.full.js');
for (const name of context.window.MANUALFINDER_WAVE1_BATCHES || []) runData(name);
const wave1Rows = typeof context.window.MANUALFINDER_BUILD_WAVE1 === 'function'
  ? context.window.MANUALFINDER_BUILD_WAVE1()
  : [];

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
const cameraRecords = records.filter((row) => row.category === 'カメラ・映像');
assert.ok(cameraRecords.length > 0, 'ManualFinder camera catalog should not be empty');

for (const name of [
  'affiliate-config.js',
  'affiliate-camera-accessories.js',
  'affiliate-nikon-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave1.js',
  'affiliate-dji-camera-accessories-wave2.js',
  'affiliate-dji-camera-accessories-wave3.js',
  'affiliate-dji-camera-accessories-wave4.js',
  'affiliate-dji-camera-accessories-wave5.js',
  'affiliate-dji-camera-accessories-wave6.js',
  'affiliate-dji-camera-accessories-wave7.js',
  'affiliate-dji-camera-accessories-wave8.js',
  'affiliate-dji-camera-accessories-wave9.js',
  'affiliate-dji-camera-accessories-wave10.js',
  'affiliate-dji-camera-accessories-wave11.js',
  'affiliate-dji-camera-accessories-wave12.js',
  'affiliate-dji-camera-accessories-wave13.js',
  'affiliate-dji-camera-accessories-wave14.js',
  'affiliate-dji-camera-accessories-wave15.js',
  'affiliate-dji-camera-accessories-wave16.js',
  'affiliate-dji-camera-accessories-wave17.js',
  'affiliate-dji-camera-accessories-wave18.js',
  'affiliate-dji-camera-accessories-wave19.js',
  'affiliate-camera-detail-exclusions.js'
]) run(new URL(name, root), `tools/manual-finder/${name}`);

const config = context.window.MANUALFINDER_AFFILIATE_CONFIG;
assert.ok(config?.enabled, 'ManualFinder affiliate config should be enabled');
assert.equal(typeof config.getAccessoryOffers, 'function', 'camera accessory offer resolver should be active');

const staticOfferTitles = new Set(
  Array.from(config.offers || []).map((offer) => `${offer.maker} ${offer.model}`)
);
const detailLedger = Array.from(context.window.MANUALFINDER_CAMERA_ACCESSORY_LEDGER || []);
const exclusions = Array.from(context.window.MANUALFINDER_CAMERA_DETAIL_EXCLUSIONS || []);
const canonicalCameraKeys = new Set(cameraRecords.map(detailKey));
const detailKeys = new Set(detailLedger.map(detailKey));
const exclusionKeys = new Set(exclusions.map(detailKey));

assert.equal(detailKeys.size, detailLedger.length, 'camera accessory ledger must not contain duplicate maker/model/category keys');
assert.equal(exclusionKeys.size, exclusions.length, 'camera detail exclusions must not contain duplicate maker/model/category keys');
assert.ok(detailLedger.every((row) => canonicalCameraKeys.has(detailKey(row))), 'every camera accessory mapping must resolve to one canonical camera record');
assert.ok(exclusions.every((row) => canonicalCameraKeys.has(detailKey(row))), 'every camera detail exclusion must resolve to one canonical camera record');
assert.ok(exclusions.every((row) => !detailKeys.has(detailKey(row))), 'camera records cannot be both detail-mapped and excluded');

const rows = cameraRecords.map((record) => {
  const modelUrl = config.buildModelSearchUrl?.(record) || '';
  const staticOffer = staticOfferTitles.has(`${record.maker} ${record.model}`);
  const basic = Boolean(modelUrl || staticOffer);
  const offers = Array.from(config.getAccessoryOffers(record) || []);
  const detail = offers.length > 0;
  const detailExcluded = exclusionKeys.has(detailKey(record));
  return { ...record, basic, detail, detailExcluded, offerCount: offers.length };
});

const basicRows = rows.filter((row) => row.basic);
const detailRows = rows.filter((row) => row.basic && row.detail);
const excludedRows = rows.filter((row) => row.basic && !row.detail && row.detailExcluded);
const missingRows = rows.filter((row) => row.basic && !row.detail && !row.detailExcluded);
const nonActionableRows = rows.filter((row) => !row.basic);

const summary = {
  cameraTotal: rows.length,
  cameraBasic: basicRows.length,
  cameraDetail: detailRows.length,
  cameraDetailExcluded: excludedRows.length,
  cameraMissingAccessory: missingRows.length,
  cameraNonActionable: nonActionableRows.length,
  cameraBasicByMaker: countByMaker(basicRows),
  cameraDetailByMaker: countByMaker(detailRows),
  cameraDetailExcludedByMaker: countByMaker(excludedRows),
  cameraMissingAccessoryByMaker: countByMaker(missingRows),
  cameraMissingAccessoryModelsByMaker: modelsByMaker(missingRows),
  cameraNonActionableByMaker: countByMaker(nonActionableRows),
  detailFingerprint: crypto.createHash('sha256').update(
    detailLedger
      .map((row) => `${row.maker}|${row.model}|${row.category}|${row.sourceUrl}|${row.verifiedAt}`)
      .sort()
      .join('\n')
  ).digest('hex'),
  exclusionFingerprint: crypto.createHash('sha256').update(
    exclusions
      .map((row) => `${row.maker}|${row.model}|${row.category}|${row.reason}|${row.sourceUrl}`)
      .sort()
      .join('\n')
  ).digest('hex')
};

console.log(`MANUALFINDER_CAMERA_ACCESSORY_COVERAGE ${JSON.stringify(summary)}`);

assert.equal(
  summary.cameraDetail + summary.cameraDetailExcluded + summary.cameraMissingAccessory,
  summary.cameraBasic,
  'camera basic records must reconcile to detail + reviewed exclusion + missing accessory detail'
);
assert.equal(
  Object.values(summary.cameraBasicByMaker).reduce((sum, count) => sum + count, 0),
  summary.cameraBasic,
  'camera basic maker counts must reconcile'
);
assert.equal(
  Object.values(summary.cameraDetailByMaker).reduce((sum, count) => sum + count, 0),
  summary.cameraDetail,
  'camera detail maker counts must reconcile'
);
assert.equal(
  Object.values(summary.cameraDetailExcludedByMaker).reduce((sum, count) => sum + count, 0),
  summary.cameraDetailExcluded,
  'camera exclusion maker counts must reconcile'
);
assert.equal(
  Object.values(summary.cameraMissingAccessoryByMaker).reduce((sum, count) => sum + count, 0),
  summary.cameraMissingAccessory,
  'camera missing-accessory maker counts must reconcile'
);
assert.equal(
  Object.values(summary.cameraMissingAccessoryModelsByMaker).reduce((sum, models) => sum + models.length, 0),
  summary.cameraMissingAccessory,
  'camera missing-accessory model lists must reconcile'
);
assert.equal(summary.cameraDetail, detailLedger.length, 'every reviewed camera detail row must remain active');
assert.equal(summary.cameraDetailExcluded, exclusions.length, 'every reviewed camera exclusion must remain active and detail-free');

console.log('ManualFinder camera accessory coverage audit passed.');