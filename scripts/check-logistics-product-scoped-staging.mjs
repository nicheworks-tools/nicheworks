import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LOGISTICS_PRO_OPERATIONS,
  createLogisticsProductScopedController
} from '../tools/logistics-compliance-kit-jp/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.logistics.product';
const FEATURE_MAP = Object.freeze({
  internalShare: 'fixture.logistics.internal_share',
  vendorConfirmation: 'fixture.logistics.vendor_confirmation',
  improvementPlan: 'fixture.logistics.improvement_plan',
  githubIssue: 'fixture.logistics.github_issue',
  codexTask: 'fixture.logistics.codex_task',
  handoffMarkdown: 'fixture.logistics.handoff_markdown',
  jsonExport: 'fixture.logistics.json_export',
  markdownSave: 'fixture.logistics.markdown_save'
});

assert.deepEqual(LOGISTICS_PRO_OPERATIONS, [
  'internalShare',
  'vendorConfirmation',
  'improvementPlan',
  'githubIssue',
  'codexTask',
  'handoffMarkdown',
  'jsonExport',
  'markdownSave'
]);
assert.equal(new Set(LOGISTICS_PRO_OPERATIONS).size, 8);

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response(input) : response;
  }
});

assert.throws(
  () => createLogisticsProductScopedController({ entitlementClient: clientFrom({}), featureMap: FEATURE_MAP }),
  /productId is required/
);
assert.throws(
  () => createLogisticsProductScopedController({ entitlementClient: clientFrom({}), productId: 'nicheworks_pro', featureMap: FEATURE_MAP }),
  /legacy shared nicheworks_pro/
);
assert.throws(
  () => createLogisticsProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: { ...FEATURE_MAP, markdownSave: '' }
  }),
  /Missing feature ID/
);
assert.throws(
  () => createLogisticsProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: { ...FEATURE_MAP, markdownSave: FEATURE_MAP.jsonExport }
  }),
  /Feature IDs must be unique/
);

const wrongProductClient = clientFrom({
  productId: 'fixture.other.product',
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: Object.values(FEATURE_MAP)
});
const wrongProduct = createLogisticsProductScopedController({
  entitlementClient: wrongProductClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal(wrongProduct.getState().active, false);
assert.equal(wrongProduct.getState().reason, 'server_recheck_required');
const wrongProductState = await wrongProduct.refresh();
assert.deepEqual(wrongProductClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(wrongProductState.active, false);
assert.equal(wrongProductState.reason, 'wrong_product');
assert.equal(LOGISTICS_PRO_OPERATIONS.every((operation) => wrongProduct.can(operation) === false), true);

const localOnly = createLogisticsProductScopedController({
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
const localOnlyState = await localOnly.refresh();
assert.equal(localOnlyState.active, false);
assert.equal(localOnlyState.reason, 'non_server_authority');

const unverified = createLogisticsProductScopedController({
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
const unverifiedState = await unverified.refresh();
assert.equal(unverifiedState.active, false);
assert.equal(unverifiedState.reason, 'unverified_entitlement');

const verifiedClient = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [
    FEATURE_MAP.internalShare,
    FEATURE_MAP.githubIssue,
    FEATURE_MAP.jsonExport,
    FEATURE_MAP.jsonExport,
    '  '
  ]
});
const verified = createLogisticsProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const verifiedState = await verified.refresh();
assert.equal(verifiedState.active, true);
assert.equal(verifiedState.source, 'server');
assert.equal(verifiedState.reason, 'verified_entitlement');
assert.deepEqual(verifiedState.features, [
  FEATURE_MAP.internalShare,
  FEATURE_MAP.githubIssue,
  FEATURE_MAP.jsonExport
]);
assert.equal(verified.can('internalShare'), true);
assert.equal(verified.can('githubIssue'), true);
assert.equal(verified.can('jsonExport'), true);
assert.equal(verified.can('vendorConfirmation'), false);
assert.equal(verified.can('improvementPlan'), false);
assert.equal(verified.can('codexTask'), false);
assert.equal(verified.can('handoffMarkdown'), false);
assert.equal(verified.can('markdownSave'), false);
assert.throws(() => verified.can('unknown'), /Unknown Logistics paid operation/);
assert.equal(Object.isFrozen(verifiedState), true);
assert.equal(Object.isFrozen(verifiedState.operations), true);
assert.equal(Object.prototype.hasOwnProperty.call(verifiedState, 'assessment'), false);
assert.equal(Object.prototype.hasOwnProperty.call(verifiedState, 'memo'), false);

const failing = createLogisticsProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const failedState = await failing.refresh();
assert.equal(failedState.active, false);
assert.equal(failedState.reason, 'entitlement_check_failed');
assert.equal(LOGISTICS_PRO_OPERATIONS.every((operation) => failing.can(operation) === false), true);

const source = fs.readFileSync(new URL('../tools/logistics-compliance-kit-jp/product-scoped-controller.mjs', import.meta.url), 'utf8');
for (const forbidden of [
  'localStorage',
  'sessionStorage',
  'NWPro.getLocalStatus',
  'getLocalStatus()',
  'buy.stripe.com',
  'window.NWPro'
]) {
  assert.equal(source.includes(forbidden), false, `staging controller must not depend on legacy/browser authority: ${forbidden}`);
}

console.log('Logistics product-scoped staging contracts: OK');
