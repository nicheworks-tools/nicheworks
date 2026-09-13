import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  JSON_REPAIR_PRO_OPERATIONS,
  createJsonRepairProductScopedController
} from '../tools/json-repair/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.json_repair.bundle';
const FEATURE_MAP = Object.freeze({
  aggressiveRepair: 'fixture.json_repair.aggressive_repair',
  candidateActions: 'fixture.json_repair.candidate_actions',
  schemaCheck: 'fixture.json_repair.schema_check',
  history: 'fixture.json_repair.history',
  reportExport: 'fixture.json_repair.report_export',
  proSamples: 'fixture.json_repair.pro_samples'
});

assert.deepEqual(JSON_REPAIR_PRO_OPERATIONS, [
  'aggressiveRepair',
  'candidateActions',
  'schemaCheck',
  'history',
  'reportExport',
  'proSamples'
]);
assert.equal(new Set(JSON_REPAIR_PRO_OPERATIONS).size, 6);

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response(input) : response;
  }
});

const verifiedClient = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [FEATURE_MAP.aggressiveRepair, FEATURE_MAP.reportExport]
});
const controller = createJsonRepairProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('aggressiveRepair'), true);
assert.equal(controller.can('reportExport'), true);
for (const operation of ['candidateActions', 'schemaCheck', 'history', 'proSamples']) {
  assert.equal(controller.can(operation), false);
}
assert.throws(() => controller.can('unknown'), /Unknown JSON Repair paid operation/);

const localOnly = createJsonRepairProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'local',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await localOnly.refresh()).active, false);
assert.equal(localOnly.getState().reason, 'non_server_authority');

const wrongProduct = createJsonRepairProductScopedController({
  entitlementClient: clientFrom({
    productId: 'fixture.other.product',
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await wrongProduct.refresh()).active, false);
assert.equal(wrongProduct.getState().reason, 'wrong_product');

const unverified = createJsonRepairProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'server',
    reason: 'cached_active',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await unverified.refresh()).active, false);
assert.equal(unverified.getState().reason, 'unverified_entitlement');

const failed = createJsonRepairProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(JSON_REPAIR_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

assert.throws(() => createJsonRepairProductScopedController({
  entitlementClient: clientFrom({}),
  productId: '',
  featureMap: FEATURE_MAP
}), /productId is required/);
assert.throws(() => createJsonRepairProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: { ...FEATURE_MAP, proSamples: FEATURE_MAP.reportExport }
}), /Feature IDs must be unique/);

const wrapperSource = fs.readFileSync(new URL('../tools/json-repair/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'nicheworks.pro',
  'localStorage',
  'buy.stripe.com',
  'jrInput',
  'JSON.parse',
  'repairLog',
  'schemaResult',
  'reportMarkdown',
  'Blob',
  'function normalizeProductId',
  'function validateVerifiedResponse'
]) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority or JSON/generated-data dependency: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/json-repair/app.js', import.meta.url), 'utf8');
assert.match(appSource, /status && status\.active === true && status\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(appSource, /!status\.entitlement \|\| status\.entitlement === ENTITLEMENT/);
assert.match(appSource, /value === "aggressive" && !guardPro\(\)/);
assert.match(appSource, /data-cand-use/);
assert.match(appSource, /data-cand-repair/);
assert.match(appSource, /if \(!guardPro\(\)\) return; const idx/);
assert.match(appSource, /function runSchema\(\)\{ if \(!guardPro\(\)\) return;/);
assert.match(appSource, /function saveHistory\(input, repaired\)\{ if \(!state\.proActive\) return;/);
assert.match(appSource, /btnHistoryClear.*if \(!guardPro\(\)\) return/s);
assert.match(appSource, /btnReportCopy.*if \(!guardPro\(\)\) return/s);
assert.match(appSource, /btnExportMd.*if \(!guardPro\(\)\) return/s);
assert.match(appSource, /btnExportJson.*if \(!guardPro\(\)\) return/s);
assert.match(appSource, /dataset\.pro === "true" && !state\.proActive/);

for (const freeEvidence of [
  'btnValidate',
  'btnRepair',
  'btnFormatPretty',
  'btnFormatMinify',
  'btnCopy',
  'btnDownload',
  'function safeRepair',
  'level === "standard"'
]) {
  assert.equal(appSource.includes(freeEvidence), true, `Free runtime evidence missing: ${freeEvidence}`);
}

const localSpec = fs.readFileSync(new URL('../tools/json-repair/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/json-repair.md', import.meta.url), 'utf8');
const wave7 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave7.md', import.meta.url), 'utf8');
const bundleContract = fs.readFileSync(new URL('../docs/billing/nicheworks-pro-bundle-contract.md', import.meta.url), 'utf8');
const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));

assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes.PRO_BUNDLE.includes('json-repair'), true);
for (const source of [localSpec, canonicalSpec, wave7]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks_pro/);
  assert.match(source, /nicheworks\.pro/);
  for (const operation of JSON_REPAIR_PRO_OPERATIONS) assert.match(source, new RegExp(operation));
  assert.match(source, /billing\/entitlement/i);
}
assert.match(bundleContract, /nicheworks\.pro/);
assert.match(wave7, /\$2\.99/);
assert.match(wave7, /legacy commerce evidence/i);
assert.match(wave7, /commercial configuration unresolved/i);

console.log('JSON Repair product-scoped staging contracts: OK');
