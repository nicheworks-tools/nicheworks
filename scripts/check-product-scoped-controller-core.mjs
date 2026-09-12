import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LEGACY_SHARED_PRO_AUTHORITY,
  createProductScopedController
} from '../assets/nw-product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.product';
const OPERATIONS = Object.freeze(['alpha', 'beta', 'gamma']);
const FEATURE_MAP = Object.freeze({
  alpha: 'fixture.feature.alpha',
  beta: 'fixture.feature.beta',
  gamma: 'fixture.feature.gamma'
});

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response(input) : response;
  }
});

assert.equal(LEGACY_SHARED_PRO_AUTHORITY, 'nicheworks_pro');
assert.throws(
  () => createProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: FEATURE_MAP,
    operations: [],
    toolLabel: 'Fixture'
  }),
  /non-empty array/
);
assert.throws(
  () => createProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: FEATURE_MAP,
    operations: ['alpha', 'alpha'],
    toolLabel: 'Fixture'
  }),
  /must be unique/
);
assert.throws(
  () => createProductScopedController({
    entitlementClient: clientFrom({}),
    productId: '',
    featureMap: FEATURE_MAP,
    operations: OPERATIONS,
    toolLabel: 'Fixture'
  }),
  /productId is required/
);
assert.throws(
  () => createProductScopedController({
    entitlementClient: clientFrom({}),
    productId: LEGACY_SHARED_PRO_AUTHORITY,
    featureMap: FEATURE_MAP,
    operations: OPERATIONS,
    toolLabel: 'Fixture'
  }),
  /legacy shared nicheworks_pro/
);
assert.throws(
  () => createProductScopedController({
    entitlementClient: clientFrom({}),
    productId: PRODUCT_ID,
    featureMap: { ...FEATURE_MAP, gamma: FEATURE_MAP.beta },
    operations: OPERATIONS,
    toolLabel: 'Fixture'
  }),
  /Feature IDs must be unique/
);

const wrongProduct = createProductScopedController({
  entitlementClient: clientFrom({
    productId: 'fixture.other',
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP,
  operations: OPERATIONS,
  toolLabel: 'Fixture'
});
const wrongProductState = await wrongProduct.refresh();
assert.equal(wrongProductState.active, false);
assert.equal(wrongProductState.reason, 'wrong_product');

const localOnly = createProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'local',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP,
  operations: OPERATIONS,
  toolLabel: 'Fixture'
});
const localOnlyState = await localOnly.refresh();
assert.equal(localOnlyState.active, false);
assert.equal(localOnlyState.reason, 'non_server_authority');

const verifiedClient = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [FEATURE_MAP.alpha, FEATURE_MAP.gamma, FEATURE_MAP.gamma, '']
});
const verified = createProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP,
  operations: OPERATIONS,
  toolLabel: 'Fixture'
});
const verifiedState = await verified.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(verifiedState.active, true);
assert.deepEqual(verifiedState.features, [FEATURE_MAP.alpha, FEATURE_MAP.gamma]);
assert.equal(verified.can('alpha'), true);
assert.equal(verified.can('beta'), false);
assert.equal(verified.can('gamma'), true);
assert.throws(() => verified.can('unknown'), /Unknown Fixture paid operation/);
assert.equal(Object.isFrozen(verifiedState), true);
assert.equal(Object.isFrozen(verifiedState.operations), true);
assert.equal(Object.isFrozen(verified.operations), true);

const failed = createProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP,
  operations: OPERATIONS,
  toolLabel: 'Fixture'
});
const failedState = await failed.refresh();
assert.equal(failedState.active, false);
assert.equal(failedState.reason, 'entitlement_check_failed');
assert.equal(OPERATIONS.every((operation) => failed.can(operation) === false), true);

const source = fs.readFileSync(new URL('../assets/nw-product-scoped-controller.mjs', import.meta.url), 'utf8');
for (const forbidden of [
  'localStorage',
  'sessionStorage',
  'NWPro.getLocalStatus',
  'getLocalStatus()',
  'buy.stripe.com',
  'window.NWPro',
  'cmdInput',
  '__cscLastResult',
  'memo'
]) {
  assert.equal(source.includes(forbidden), false, `shared core must not depend on browser authority or tool input: ${forbidden}`);
}

for (const [label, path] of [
  ['Logistics', '../tools/logistics-compliance-kit-jp/product-scoped-controller.mjs'],
  ['Command Safety', '../tools/command-safety-checker/product-scoped-controller.mjs']
]) {
  const wrapper = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  assert.match(wrapper, /createProductScopedController/);
  for (const duplicatedCore of [
    'function normalizeProductId',
    'function normalizeFeatureMap',
    'function inactiveState',
    'function verifiedState',
    'function validateVerifiedResponse',
    'refreshProState({ productId:'
  ]) {
    assert.equal(wrapper.includes(duplicatedCore), false, `${label} wrapper must not duplicate shared core logic: ${duplicatedCore}`);
  }
}

console.log('Shared product-scoped controller contracts: OK');
