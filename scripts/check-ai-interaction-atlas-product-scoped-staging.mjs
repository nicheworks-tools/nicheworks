import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AIIA_PRO_OPERATIONS,
  createAIIAProductScopedController
} from '../tools/ai-interaction-atlas/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.nicheworks.pro';
const FEATURE_MAP = Object.freeze({
  advancedCompare: 'fixture.aiia.advanced_compare',
  handoffCopy: 'fixture.aiia.handoff_copy',
  handoffExport: 'fixture.aiia.handoff_export',
  comparisonExport: 'fixture.aiia.comparison_export'
});

assert.deepEqual(AIIA_PRO_OPERATIONS, [
  'advancedCompare',
  'handoffCopy',
  'handoffExport',
  'comparisonExport'
]);
assert.equal(new Set(AIIA_PRO_OPERATIONS).size, 4);

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
  features: [FEATURE_MAP.advancedCompare, FEATURE_MAP.handoffExport]
});
const controller = createAIIAProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const verified = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(verified.active, true);
assert.equal(controller.can('advancedCompare'), true);
assert.equal(controller.can('handoffExport'), true);
assert.equal(controller.can('handoffCopy'), false);
assert.equal(controller.can('comparisonExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown AI Interaction Atlas paid operation/);

for (const [response, reason] of [
  [{ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'non_server_authority'],
  [{ productId: 'fixture.other', active: true, source: 'server', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'wrong_product'],
  [{ productId: PRODUCT_ID, active: true, source: 'server', reason: 'cached_active', features: Object.values(FEATURE_MAP) }, 'unverified_entitlement']
]) {
  const candidate = createAIIAProductScopedController({
    entitlementClient: clientFrom(response),
    productId: PRODUCT_ID,
    featureMap: FEATURE_MAP
  });
  const state = await candidate.refresh();
  assert.equal(state.active, false);
  assert.equal(state.reason, reason);
  assert.equal(AIIA_PRO_OPERATIONS.every((operation) => candidate.can(operation) === false), true);
}

const failed = createAIIAProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).reason, 'entitlement_check_failed');
assert.equal(AIIA_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

assert.throws(() => createAIIAProductScopedController({
  entitlementClient: clientFrom({}),
  productId: '',
  featureMap: FEATURE_MAP
}), /productId is required/);
assert.throws(() => createAIIAProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: { ...FEATURE_MAP, comparisonExport: FEATURE_MAP.handoffExport }
}), /Feature IDs must be unique/);

const wrapper = fs.readFileSync(new URL('../tools/ai-interaction-atlas/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapper, /createProductScopedController/);
for (const forbidden of ['NWPro', 'nicheworks_pro', 'nicheworks.pro', 'localStorage', 'buy.stripe.com', 'atlas-search', 'patterns', 'Blob']) {
  assert.equal(wrapper.includes(forbidden), false, `staged wrapper must not contain legacy/browser/content authority: ${forbidden}`);
}

const app = fs.readFileSync(new URL('../tools/ai-interaction-atlas/app.js', import.meta.url), 'utf8');
assert.match(app, /state\.fav\.length\s*>=\s*5/);
assert.match(app, /const limit = state\.proActive \? 4 : 2/);
assert.match(app, /return state\.proActive \? base : base\.slice\(0, 7\)/);
assert.match(app, /state\.proActive \? copy\(copyText\) : toast\(TEXT\.proLocked\)/);
assert.match(app, /state\.proActive \? download\(`\$\{pattern\.slug\}-handoff\.md`/);
assert.match(app, /state\.proActive \? download\(`\$\{pattern\.slug\}-handoff\.json`/);
assert.match(app, /state\.proActive \? download\('aiia-comparison\.md'/);
assert.match(app, /state\.proActive \? download\('aiia-comparison\.json'/);

const bridge = fs.readFileSync(new URL('../tools/ai-interaction-atlas/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridge, /var ENTITLEMENT = 'nicheworks_pro'/);
assert.match(bridge, /status\.active === true && status\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(bridge, /\(status\.entitlement \|\| ENTITLEMENT\) === ENTITLEMENT/);
assert.doesNotMatch(bridge, /entitlement:\s*ENTITLEMENT\s*\}/);

const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));
assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes?.PRO_BUNDLE?.includes('ai-interaction-atlas'), true);

const localSpec = fs.readFileSync(new URL('../tools/ai-interaction-atlas/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/ai-interaction-atlas.md', import.meta.url), 'utf8');
const wave4 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave4.md', import.meta.url), 'utf8');
for (const source of [localSpec, canonicalSpec, wave4]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks\.pro/);
  assert.match(source, /advancedCompare/);
  assert.match(source, /handoffCopy/);
  assert.match(source, /handoffExport/);
  assert.match(source, /comparisonExport/);
}
assert.match(wave4, /five favorites|five-favorite|five favorite/i);
assert.match(wave4, /up to two patterns|two patterns/i);
assert.match(wave4, /configured product ID must be `nicheworks\.pro`/i);

console.log('AI Interaction Atlas product-scoped staging contracts: OK');
