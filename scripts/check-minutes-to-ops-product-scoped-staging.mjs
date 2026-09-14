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
    return response;
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
assert.equal(controller.can('outputPack'), false);
assert.equal(controller.can('codexRequest'), false);
assert.equal(controller.can('sopHandoff'), false);
assert.throws(() => controller.can('unknown'), /Unknown Minutes to Ops paid operation/);

for (const [response, expectedReason] of [
  [{ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'non_server_authority'],
  [{ productId: 'fixture.other.product', active: true, source: 'server', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'wrong_product'],
  [{ productId: PRODUCT_ID, active: true, source: 'server', reason: 'cached_active', features: Object.values(FEATURE_MAP) }, 'unverified_entitlement']
]) {
  const candidate = createMinutesToOpsProductScopedController({
    entitlementClient: clientFrom(response),
    productId: PRODUCT_ID,
    featureMap: FEATURE_MAP
  });
  assert.equal((await candidate.refresh()).active, false);
  assert.equal(candidate.getState().reason, expectedReason);
}

const failed = createMinutesToOpsProductScopedController({
  entitlementClient: {
    async refreshProState() { throw new Error('network down'); }
  },
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
assert.equal(wrapperSource.includes('NWPro'), false);
assert.equal(wrapperSource.includes('nicheworks_pro'), false);
assert.equal(wrapperSource.includes('localStorage'), false);
assert.equal(wrapperSource.includes('buy.stripe.com'), false);
assert.equal(wrapperSource.includes('nw_mto_history_v2'), false);

const bridgeSource = fs.readFileSync(new URL('../tools/minutes-to-ops/pro-bridge.js', import.meta.url), 'utf8');
for (const required of [
  "current.active === true && current.entitlement === 'nicheworks_pro'",
  "PRO_ACTION_SELECTOR = 'button[data-pro-only]'",
  "document.addEventListener('click', recheckProAction, true)",
  'event.stopImmediatePropagation()',
  'isActive: function () { return lastActive && exactActive(status()); }'
]) {
  assert.equal(bridgeSource.includes(required), true, `legacy gate hardening evidence missing: ${required}`);
}

const appSource = fs.readFileSync(new URL('../tools/minutes-to-ops/app.js', import.meta.url), 'utf8');
for (const freeEvidence of [
  "const HISTORY_KEY = 'nw_mto_history_v2'",
  'function generate(',
  "els.dlCsv?.addEventListener('click'",
  "els.dlMd?.addEventListener('click'",
  "els.copyMd?.addEventListener('click'",
  "els.copySop?.addEventListener('click'"
]) {
  assert.equal(appSource.includes(freeEvidence), true, `Free runtime evidence missing: ${freeEvidence}`);
}
for (const paidEvidence of [
  'function saveHistory()',
  'function compareHistory()',
  'function outputPack()',
  'githubIssue',
  'codexPrompt',
  'handoffMarkdown',
  'function proCopy(',
  'function proDownload('
]) {
  assert.equal(appSource.includes(paidEvidence), true, `paid runtime evidence missing: ${paidEvidence}`);
}
for (const analyticsEvidence of [
  "event('tool_run', { tool_slug: TOOL, lang: UI })",
  "event('pro_feature_use', { tool_slug: TOOL, feature: 'history_save' })",
  "event('pro_feature_use', { tool_slug: TOOL, feature: 'history_compare' })",
  "event('pro_feature_use', { tool_slug: TOOL, feature: 'export_pack' })"
]) {
  assert.equal(appSource.includes(analyticsEvidence), true, `fixed analytics metadata evidence missing: ${analyticsEvidence}`);
}

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
  assert.match(source, /billing\/entitlement/i);
  for (const operation of MINUTES_TO_OPS_PRO_OPERATIONS) {
    assert.equal(source.includes(operation), true, `boundary documentation missing ${operation}`);
  }
}
assert.match(bundleContract, /nicheworks\.pro/);
assert.match(wave8, /commercial configuration unresolved/i);
assert.match(wave8, /legacy commerce evidence/i);
assert.match(wave8, /meeting notes/i);

console.log('Minutes to Ops product-scoped staging contracts: OK');
