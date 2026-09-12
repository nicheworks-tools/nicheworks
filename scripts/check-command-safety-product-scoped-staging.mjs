import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  COMMAND_SAFETY_PRO_OPERATIONS,
  createCommandSafetyProductScopedController
} from '../tools/command-safety-checker/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.command_safety.product';
const FEATURE_MAP = Object.freeze({
  reviewMarkdown: 'fixture.command_safety.review_markdown',
  codexTask: 'fixture.command_safety.codex_task',
  githubIssue: 'fixture.command_safety.github_issue',
  jsonExport: 'fixture.command_safety.json_export',
  markdownExport: 'fixture.command_safety.markdown_export'
});

assert.deepEqual(COMMAND_SAFETY_PRO_OPERATIONS, [
  'reviewMarkdown',
  'codexTask',
  'githubIssue',
  'jsonExport',
  'markdownExport'
]);
assert.equal(new Set(COMMAND_SAFETY_PRO_OPERATIONS).size, 5);

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response(input) : response;
  }
});

assert.throws(
  () => createCommandSafetyProductScopedController({ entitlementClient: clientFrom({}), featureMap: FEATURE_MAP }),
  /productId is required/
);
assert.throws(
  () => createCommandSafetyProductScopedController({ entitlementClient: clientFrom({}), productId: 'nicheworks_pro', featureMap: FEATURE_MAP }),
  /legacy shared nicheworks_pro/
);
assert.throws(
  () => createCommandSafetyProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: { ...FEATURE_MAP, markdownExport: '' }
  }),
  /Missing feature ID/
);
assert.throws(
  () => createCommandSafetyProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: { ...FEATURE_MAP, markdownExport: FEATURE_MAP.jsonExport }
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
const wrongProduct = createCommandSafetyProductScopedController({
  entitlementClient: wrongProductClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal(wrongProduct.getState().active, false);
const wrongProductState = await wrongProduct.refresh();
assert.deepEqual(wrongProductClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(wrongProductState.active, false);
assert.equal(wrongProductState.reason, 'wrong_product');
assert.equal(COMMAND_SAFETY_PRO_OPERATIONS.every((operation) => wrongProduct.can(operation) === false), true);

const localOnly = createCommandSafetyProductScopedController({
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

const verifiedClient = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [
    FEATURE_MAP.reviewMarkdown,
    FEATURE_MAP.githubIssue,
    FEATURE_MAP.markdownExport,
    FEATURE_MAP.markdownExport,
    ''
  ]
});
const verified = createCommandSafetyProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const verifiedState = await verified.refresh();
assert.equal(verifiedState.active, true);
assert.equal(verifiedState.source, 'server');
assert.equal(verifiedState.reason, 'verified_entitlement');
assert.deepEqual(verifiedState.features, [
  FEATURE_MAP.reviewMarkdown,
  FEATURE_MAP.githubIssue,
  FEATURE_MAP.markdownExport
]);
assert.equal(verified.can('reviewMarkdown'), true);
assert.equal(verified.can('githubIssue'), true);
assert.equal(verified.can('markdownExport'), true);
assert.equal(verified.can('codexTask'), false);
assert.equal(verified.can('jsonExport'), false);
assert.throws(() => verified.can('unknown'), /Unknown Command Safety paid operation/);
assert.equal(Object.isFrozen(verifiedState), true);
assert.equal(Object.isFrozen(verifiedState.operations), true);
for (const userContentKey of ['command', 'commandText', 'findings', 'normalized', 'reviewMarkdown']) {
  assert.equal(Object.prototype.hasOwnProperty.call(verifiedState, userContentKey), false);
}

const failing = createCommandSafetyProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const failedState = await failing.refresh();
assert.equal(failedState.active, false);
assert.equal(failedState.reason, 'entitlement_check_failed');
assert.equal(COMMAND_SAFETY_PRO_OPERATIONS.every((operation) => failing.can(operation) === false), true);

const source = fs.readFileSync(new URL('../tools/command-safety-checker/product-scoped-controller.mjs', import.meta.url), 'utf8');
for (const forbidden of [
  'localStorage',
  'sessionStorage',
  'NWPro.getLocalStatus',
  'getLocalStatus()',
  'buy.stripe.com',
  'window.NWPro',
  '__cscLastResult',
  'cmdInput'
]) {
  assert.equal(source.includes(forbidden), false, `staging controller must not depend on legacy/browser/user-content authority: ${forbidden}`);
}

console.log('Command Safety product-scoped staging contracts: OK');
