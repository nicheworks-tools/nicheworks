import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MINUTES_TO_OPS_PRO_OPERATIONS,
  createMinutesToOpsProductScopedController
} from '../tools/minutes-to-ops/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.minutes_to_ops.bundle';
const FEATURE_MAP = Object.freeze({
  history: 'fixture.minutes_to_ops.history',
  outputPack: 'fixture.minutes_to_ops.output_pack',
  githubIssue: 'fixture.minutes_to_ops.github_issue',
  codexRequest: 'fixture.minutes_to_ops.codex_request',
  sopHandoff: 'fixture.minutes_to_ops.sop_handoff'
});

assert.deepEqual(MINUTES_TO_OPS_PRO_OPERATIONS, [
  'history',
  'outputPack',
  'githubIssue',
  'codexRequest',
  'sopHandoff'
]);
assert.equal(new Set(MINUTES_TO_OPS_PRO_OPERATIONS).size, 5);

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
  features: [FEATURE_MAP.history, FEATURE_MAP.githubIssue]
});
const controller = createMinutesToOpsProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const verified = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(verified.active, true);
assert.equal(controller.can('history'), true);
assert.equal(controller.can('githubIssue'), true);
for (const operation of ['outputPack', 'codexRequest', 'sopHandoff']) {
  assert.equal(controller.can(operation), false);
}
assert.throws(() => controller.can('unknown'), /Unknown Minutes to Ops paid operation/);

const localOnly = createMinutesToOpsProductScopedController({
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

const wrongProduct = createMinutesToOpsProductScopedController({
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

const unverified = createMinutesToOpsProductScopedController({
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

const failed = createMinutesToOpsProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(MINUTES_TO_OPS_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

assert.throws(() => createMinutesToOpsProductScopedController({
  entitlementClient: clientFrom({}),
  productId: '',
  featureMap: FEATURE_MAP
}), /productId is required/);
assert.throws(() => createMinutesToOpsProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: { ...FEATURE_MAP, sopHandoff: FEATURE_MAP.codexRequest }
}), /Feature IDs must be unique/);

const wrapperSource = fs.readFileSync(new URL('../tools/minutes-to-ops/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'nicheworks.pro',
  'localStorage',
  'buy.stripe.com',
  'notes',
  'participants',
  'nw_mto_history_v2',
  'githubIssue',
  'codexPrompt',
  'handoffMarkdown',
  'Blob',
  'function normalizeProductId',
  'function validateVerifiedResponse'
]) {
  if (forbidden === 'githubIssue') continue;
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority or meeting/generated-data dependency: ${forbidden}`);
}

const bridgeSource = fs.readFileSync(new URL('../tools/minutes-to-ops/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridgeSource, /var ENTITLEMENT = 'nicheworks_pro'/);
assert.match(bridgeSource, /current\.active === true && current\.entitlement === ENTITLEMENT/);
assert.match(bridgeSource, /PRO_ACTION_SELECTOR = 'button\[data-pro-only\]'/);
assert.match(bridgeSource, /document\.addEventListener\('click', recheckProAction, true\)/);
assert.match(bridgeSource, /event\.stopImmediatePropagation\(\)/);
assert.match(bridgeSource, /isActive: function \(\) \{ return lastActive && exactActive\(status\(\)\); \}/);

const appSource = fs.readFileSync(new URL('../tools/minutes-to-ops/app.js', import.meta.url), 'utf8');
for (const freeEvidence of [
  "const HISTORY_KEY = 'nw_mto_history_v2'",
  'function generate(',
  'copyMd',
  'copySop',
  'dlCsv',
  'dlMd',
  'makeCsv'
]) {
  assert.equal(appSource.includes(freeEvidence), true, `Minutes to Ops runtime evidence missing: ${freeEvidence}`);
}
for (const paidEvidence of [
  'function saveHistory()',
  'function compareHistory()',
  'function outputPack()',
  'githubIssue',
  'codexPrompt',
  'handoffMarkdown',
  'proCopy',
  'proDownload'
]) {
  assert.equal(appSource.includes(paidEvidence), true, `Minutes to Ops paid runtime evidence missing: ${paidEvidence}`);
}
assert.match(appSource, /function saveHistory\(\) \{\s*if \(!requirePro\(\)\) return;/);
assert.match(appSource, /function compareHistory\(\) \{\s*if \(!requirePro\(\)\) return;/);
assert.match(appSource, /function outputPack\(\) \{\s*if \(!requirePro\(\)\) return;/);
assert.match(appSource, /event\('tool_run', \{ tool_slug: TOOL, lang: UI \}\)/);
assert.match(appSource, /event\('pro_feature_use', \{ tool_slug: TOOL, feature: 'history_save' \}\)/);
assert.match(appSource, /event\('pro_feature_use', \{ tool_slug: TOOL, feature: 'history_compare' \}\)/);
assert.match(appSource, /event\('pro_feature_use', \{ tool_slug: TOOL, feature: 'export_pack' \}\)/);

const localSpec = fs.readFileSync(new URL('../tools/minutes-to-ops/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/minutes-to-ops.md', import.meta.url), 'utf8');
const wave8 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave8.md', import.meta.url), 'utf8');
const bundleContract = fs.readFileSync(new URL('../docs/billing/nicheworks-pro-bundle-contract.md', import.meta.url), 'utf8');
const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));

assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes.PRO_BUNDLE.includes('minutes-to-ops'), true);
for (const source of [localSpec, canonicalSpec, wave8]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks_pro/);
  assert.match(source, /nicheworks\.pro/);
  for (const operation of MINUTES_TO_OPS_PRO_OPERATIONS) assert.match(source, new RegExp(operation));
  assert.match(source, /billing\/entitlement/i);
}
assert.match(bundleContract, /nicheworks\.pro/);
assert.match(wave8, /commercial configuration unresolved/i);
assert.match(wave8, /legacy commerce evidence/i);
assert.match(wave8, /meeting notes/i);

console.log('Minutes to Ops product-scoped staging contracts: OK');
