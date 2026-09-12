import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  INCIDENT_UPDATE_PRO_OPERATIONS,
  createIncidentUpdateProductScopedController
} from '../tools/incident-update-generator/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.incident.bundle';
const FEATURE_MAP = Object.freeze({
  communicationPack: 'fixture.incident.communication_pack'
});

assert.deepEqual(INCIDENT_UPDATE_PRO_OPERATIONS, ['communicationPack']);

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
  features: [FEATURE_MAP.communicationPack]
});
const controller = createIncidentUpdateProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('communicationPack'), true);
assert.throws(() => controller.can('unknown'), /Unknown Incident Update Generator paid operation/);

const verifiedWithoutFeature = createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: []
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await verifiedWithoutFeature.refresh()).active, true);
assert.equal(verifiedWithoutFeature.can('communicationPack'), false);

const localOnly = createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom({
    productId: PRODUCT_ID,
    active: true,
    source: 'local',
    reason: 'verified_entitlement',
    features: [FEATURE_MAP.communicationPack]
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await localOnly.refresh()).active, false);
assert.equal(localOnly.getState().reason, 'non_server_authority');

const wrongProduct = createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom({
    productId: 'fixture.other.product',
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: [FEATURE_MAP.communicationPack]
  }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await wrongProduct.refresh()).active, false);
assert.equal(wrongProduct.getState().reason, 'wrong_product');

const failed = createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(failed.can('communicationPack'), false);

assert.throws(() => createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom({}),
  productId: '',
  featureMap: FEATURE_MAP
}), /productId is required/);
assert.throws(() => createIncidentUpdateProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: {}
}), /Missing feature ID/);

const wrapperSource = fs.readFileSync(new URL('../tools/incident-update-generator/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'nicheworks.pro',
  'localStorage',
  'buy.stripe.com',
  'service',
  'impact',
  'causeSummary',
  'currentOutputs',
  'buildMarkdownPack',
  'Blob',
  'function normalizeProductId',
  'function validateVerifiedResponse'
]) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority or incident/generated data dependency: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/incident-update-generator/app.js', import.meta.url), 'utf8');
assert.match(appSource, /const generateAll = \(\) =>/);
assert.match(appSource, /document\.querySelectorAll\("\[data-copy\]"\)/);
assert.match(appSource, /byId\("downloadBtn"\)\.addEventListener\("click"/);
assert.match(appSource, /downloadText\(`incident-update-\$\{audience\}-\$\{lang\}-\$\{formatDate\(\)\}\.txt`/);
assert.match(appSource, /const buildMarkdownPack = \(\) =>/);
for (const packEvidence of [
  '## Statuspage update',
  '## Slack / Teams update',
  '## Support macro',
  '## Public review checklist',
  '## Postmortem outline',
  '## GitHub Issue incident ticket',
  '## Next update draft'
]) {
  assert.equal(appSource.includes(packEvidence), true, `communication pack runtime evidence missing: ${packEvidence}`);
}
assert.match(appSource, /copyMarkdownBtn\.addEventListener/);
assert.match(appSource, /saveMarkdownBtn\.addEventListener/);
assert.match(appSource, /requireProAndGenerated\(\)/);

const bridgeSource = fs.readFileSync(new URL('../tools/incident-update-generator/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridgeSource, /const ENTITLEMENT = "nicheworks_pro"/);
assert.match(bridgeSource, /status\.active === true && status\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(bridgeSource, /status\.entitlement \|\| ENTITLEMENT/);
assert.doesNotMatch(bridgeSource, /\(status\.entitlement \|\| ENTITLEMENT\) === ENTITLEMENT/);

const localSpec = fs.readFileSync(new URL('../tools/incident-update-generator/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/incident-update-generator.md', import.meta.url), 'utf8');
const wave6 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave6.md', import.meta.url), 'utf8');
const bundleContract = fs.readFileSync(new URL('../docs/billing/nicheworks-pro-bundle-contract.md', import.meta.url), 'utf8');
const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));

assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes.PRO_BUNDLE.includes('incident-update-generator'), true);
for (const source of [localSpec, canonicalSpec, wave6]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks_pro/);
  assert.match(source, /nicheworks\.pro/);
  assert.match(source, /communicationPack/);
  assert.match(source, /Incident Communication Pack/i);
  assert.match(source, /billing\/entitlement/i);
}
assert.match(bundleContract, /nicheworks\.pro/);
assert.match(wave6, /Statuspage update/i);
assert.match(wave6, /Slack \/ Teams update/i);
assert.match(wave6, /support macro/i);
assert.match(wave6, /postmortem outline/i);
assert.match(wave6, /GitHub Issue incident ticket/i);
assert.match(wave6, /commercial configuration unresolved/i);

console.log('Incident Update Generator product-scoped staging contracts: OK');
