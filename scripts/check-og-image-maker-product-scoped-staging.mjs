import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  OG_IMAGE_MAKER_PRO_OPERATIONS,
  createOgImageMakerProductScopedController
} from '../tools/og-image-maker/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.og_image_maker.bundle';
const FEATURE_MAP = Object.freeze({
  batchGeneration: 'fixture.og_image_maker.batch_generation'
});

assert.deepEqual(OG_IMAGE_MAKER_PRO_OPERATIONS, ['batchGeneration']);

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
  features: [FEATURE_MAP.batchGeneration]
});
const controller = createOgImageMakerProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await controller.refresh()).active, true);
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(controller.can('batchGeneration'), true);
assert.throws(() => controller.can('unknown'), /Unknown OG Image Maker paid operation/);

for (const [response, reason] of [
  [{ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: [FEATURE_MAP.batchGeneration] }, 'non_server_authority'],
  [{ productId: 'fixture.other.product', active: true, source: 'server', reason: 'verified_entitlement', features: [FEATURE_MAP.batchGeneration] }, 'wrong_product'],
  [{ productId: PRODUCT_ID, active: true, source: 'server', reason: 'cached_active', features: [FEATURE_MAP.batchGeneration] }, 'unverified_entitlement'],
  [{ productId: PRODUCT_ID, active: true, source: 'server', reason: 'verified_entitlement', features: [] }, 'verified_entitlement']
]) {
  const candidate = createOgImageMakerProductScopedController({ entitlementClient: clientFrom(response), productId: PRODUCT_ID, featureMap: FEATURE_MAP });
  await candidate.refresh();
  if (reason === 'verified_entitlement') {
    assert.equal(candidate.getState().active, true);
    assert.equal(candidate.can('batchGeneration'), false);
  } else {
    assert.equal(candidate.getState().active, false);
    assert.equal(candidate.getState().reason, reason);
  }
}

const failed = createOgImageMakerProductScopedController({
  entitlementClient: { async refreshProState() { throw new Error('network down'); } },
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(failed.can('batchGeneration'), false);

assert.throws(() => createOgImageMakerProductScopedController({ entitlementClient: clientFrom({}), productId: '', featureMap: FEATURE_MAP }), /productId is required/);
assert.throws(() => createOgImageMakerProductScopedController({ entitlementClient: clientFrom({}), productId: PRODUCT_ID, featureMap: {} }), /Missing feature mapping/);

const wrapper = fs.readFileSync(new URL('../tools/og-image-maker/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapper, /createProductScopedController/);
for (const forbidden of ['NWPro', 'nicheworks_pro', 'nw_pro_key', 'localStorage', 'buy.stripe.com', 'batchInput', 'logoInput', 'canvas', 'Blob']) {
  assert.equal(wrapper.includes(forbidden), false, `staged wrapper contains forbidden legacy/user-content dependency: ${forbidden}`);
}

const bridge = fs.readFileSync(new URL('../tools/og-image-maker/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridge, /status\.active === true && status\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(bridge, /!status\.entitlement \|\| status\.entitlement === ENTITLEMENT/);
for (const required of [
  'BATCH_ACTION_SELECTOR = "#batchDownload"',
  'window.NW.hasPro = hasSharedPro',
  'document.addEventListener("click", recheckBatchAction, true)',
  'event.stopImmediatePropagation()'
]) {
  assert.equal(bridge.includes(required), true, `legacy batch hardening evidence missing: ${required}`);
}

const app = fs.readFileSync(new URL('../tools/og-image-maker/app.js', import.meta.url), 'utf8');
for (const freeEvidence of [
  'const STORAGE_KEY = "nw_og_settings"',
  'const renderCanvas =',
  'downloadCanvas(canvas, "og-image.png")',
  'if (state.showSafeArea && !isExport)'
]) {
  assert.equal(app.includes(freeEvidence), true, `Free OG runtime evidence missing: ${freeEvidence}`);
}
for (const paidEvidence of [
  'const parseBatch =',
  'document.getElementById("batchDownload").addEventListener("click"',
  'if (!window.NW.hasPro()) return',
  'const rows = parseBatch(batchInput.value)'
]) {
  assert.equal(app.includes(paidEvidence), true, `batch runtime evidence missing: ${paidEvidence}`);
}

const localSpec = fs.readFileSync(new URL('../tools/og-image-maker/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/og-image-maker.md', import.meta.url), 'utf8');
const wave9 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave9.md', import.meta.url), 'utf8');
const bundle = fs.readFileSync(new URL('../docs/billing/nicheworks-pro-bundle-contract.md', import.meta.url), 'utf8');
const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));

assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes.PRO_BUNDLE.includes('og-image-maker'), true);
for (const source of [localSpec, canonicalSpec, wave9]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /batchGeneration/);
  assert.match(source, /nicheworks_pro/);
  assert.match(source, /nicheworks\.pro/);
  assert.match(source, /billing\/entitlement/i);
}
assert.match(bundle, /nicheworks\.pro/);
assert.match(wave9, /commercial configuration unresolved/i);
assert.match(wave9, /legacy commerce\/migration evidence/i);
assert.match(wave9, /logo/i);
assert.match(wave9, /batch/i);

console.log('OG Image Maker product-scoped staging contracts: OK');
