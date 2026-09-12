import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  UI_ATLAS_PRO_OPERATIONS,
  createUIAtlasProductScopedController
} from '../tools/ui-atlas/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.ui_atlas.product';
const FEATURE_MAP = Object.freeze({
  fiveWayCompare: 'fixture.ui_atlas.five_way_compare',
  fullHandoffOutput: 'fixture.ui_atlas.full_handoff_output',
  proSampleDetails: 'fixture.ui_atlas.pro_sample_details'
});

assert.deepEqual(UI_ATLAS_PRO_OPERATIONS, [
  'fiveWayCompare',
  'fullHandoffOutput',
  'proSampleDetails'
]);
assert.equal(new Set(UI_ATLAS_PRO_OPERATIONS).size, 3);

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
  features: [FEATURE_MAP.fiveWayCompare, FEATURE_MAP.proSampleDetails]
});
const controller = createUIAtlasProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('fiveWayCompare'), true);
assert.equal(controller.can('proSampleDetails'), true);
assert.equal(controller.can('fullHandoffOutput'), false);
assert.throws(() => controller.can('unknown'), /Unknown UI Atlas paid operation/);

const localOnly = createUIAtlasProductScopedController({
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

const wrongProduct = createUIAtlasProductScopedController({
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

const failed = createUIAtlasProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(UI_ATLAS_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/ui-atlas/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const duplicatedCore of [
  'function normalizeProductId',
  'function normalizeFeatureMap',
  'function inactiveState',
  'function verifiedState',
  'function validateVerifiedResponse',
  'refreshProState({ productId:'
]) {
  assert.equal(wrapperSource.includes(duplicatedCore), false, `UI Atlas wrapper must not duplicate shared core logic: ${duplicatedCore}`);
}

const appSource = fs.readFileSync(new URL('../tools/ui-atlas/app.js', import.meta.url), 'utf8');
assert.match(appSource, /getCompareMax\s*=\s*\(\)\s*=>\s*\(commonProActive\s*\?\s*5\s*:\s*2\)/, 'current runtime must preserve Free 2 / legacy Pro 5 compare evidence');
assert.match(appSource, /Free compare supports 2 patterns/i);

const generatorSource = fs.readFileSync(new URL('../tools/ui-atlas/pro-generator.js', import.meta.url), 'utf8');
assert.match(generatorSource, /const max = commonProActive \? 5 : 2/);
assert.match(generatorSource, /previewMarker/);
assert.match(generatorSource, /lockedPreview/);
assert.match(generatorSource, /exportMarkdown/);
assert.match(generatorSource, /exportJson/);

console.log('UI Atlas product-scoped staging contracts: OK');
