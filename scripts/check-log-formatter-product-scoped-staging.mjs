import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LOG_FORMATTER_PRO_OPERATIONS,
  createLogFormatterProductScopedController
} from '../tools/log-formatter/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.log_formatter.product';
const FEATURE_MAP = Object.freeze({
  regexFilter: 'fixture.log_formatter.regex_filter',
  csvExport: 'fixture.log_formatter.csv_export',
  jsonExport: 'fixture.log_formatter.json_export',
  markdownReport: 'fixture.log_formatter.markdown_report',
  advancedAnalysis: 'fixture.log_formatter.advanced_analysis'
});

assert.deepEqual(LOG_FORMATTER_PRO_OPERATIONS, [
  'regexFilter',
  'csvExport',
  'jsonExport',
  'markdownReport',
  'advancedAnalysis'
]);
assert.equal(new Set(LOG_FORMATTER_PRO_OPERATIONS).size, 5);

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
  features: [FEATURE_MAP.regexFilter, FEATURE_MAP.markdownReport, FEATURE_MAP.advancedAnalysis]
});
const controller = createLogFormatterProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('regexFilter'), true);
assert.equal(controller.can('markdownReport'), true);
assert.equal(controller.can('advancedAnalysis'), true);
assert.equal(controller.can('csvExport'), false);
assert.equal(controller.can('jsonExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown LogFormatter paid operation/);

const localOnly = createLogFormatterProductScopedController({
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

const wrongProduct = createLogFormatterProductScopedController({
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

const failed = createLogFormatterProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(LOG_FORMATTER_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/log-formatter/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const duplicatedCore of [
  'function normalizeProductId',
  'function normalizeFeatureMap',
  'function inactiveState',
  'function verifiedState',
  'function validateVerifiedResponse',
  'refreshProState({ productId:'
]) {
  assert.equal(wrapperSource.includes(duplicatedCore), false, `LogFormatter wrapper must not duplicate shared core logic: ${duplicatedCore}`);
}

const appSource = fs.readFileSync(new URL('../tools/log-formatter/app.js', import.meta.url), 'utf8');

// Free contract evidence: normal text/status filters, visible/error copy, and TXT download stay outside requirePro().
assert.match(appSource, /filterInclude/);
assert.match(appSource, /filterExclude/);
assert.match(appSource, /statusFrom/);
assert.match(appSource, /statusTo/);
assert.match(appSource, /btnCopyVisible[^\n]*copyLines\(state\.lastVisibleLines/);
assert.match(appSource, /btnCopyErrors[^\n]*copyLines\(state\.lastErrorLines/);
assert.match(appSource, /btnDownloadTxt[^\n]*downloadVisibleTxt/);
assert.doesNotMatch(appSource, /function downloadVisibleTxt\([^)]*\)\s*\{\s*if\s*\(!requirePro\(\)\)/);

// Paid runtime evidence.
assert.match(appSource, /regexModeEl\?\.checked\s*&&\s*!isProActive\(\)/);
assert.match(appSource, /function exportCsv\([^)]*\)\s*\{\s*if\s*\(!requirePro\(\)\)\s*return/);
assert.match(appSource, /function exportJson\(\)\s*\{\s*if\s*\(!requirePro\(\)\)\s*return/);
assert.match(appSource, /async function copyMarkdown\(\)\s*\{\s*if\s*\(!requirePro\(\)\)\s*return/);
assert.match(appSource, /btnDownloadMarkdown[^\n]*requirePro\(\)/);
assert.match(appSource, /function renderProAnalysis\(\)/);
assert.match(appSource, /topUserAgents/);
assert.match(appSource, /botCounts/);
assert.match(appSource, /ipDetails/);
assert.match(appSource, /urlDetails/);
assert.match(appSource, /sensitiveDetails/);

const bridgeSource = fs.readFileSync(new URL('../tools/log-formatter/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridgeSource, /NWPro\.getLocalStatus/);
assert.match(bridgeSource, /buy\.stripe\.com/);
assert.match(bridgeSource, /CSV export/);
assert.match(bridgeSource, /JSON export/);
assert.match(bridgeSource, /Markdown reports/);
assert.match(bridgeSource, /regex filters/);
assert.match(bridgeSource, /User-Agent\/bot trends/);
assert.match(bridgeSource, /IP\/URL detail analysis/);

console.log('LogFormatter product-scoped staging contracts: OK');
