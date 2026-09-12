import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ATS_PASTE_DOCTOR_PRO_OPERATIONS,
  createATSPasteDoctorProductScopedController
} from '../tools/ats-paste-doctor/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.nicheworks.pro';
const FEATURE_MAP = Object.freeze({
  extendedInputLimit: 'fixture.ats.extended_input_limit',
  outputPack: 'fixture.ats.output_pack',
  proExports: 'fixture.ats.pro_exports',
  templates: 'fixture.ats.templates',
  history: 'fixture.ats.history'
});

assert.deepEqual(ATS_PASTE_DOCTOR_PRO_OPERATIONS, [
  'extendedInputLimit',
  'outputPack',
  'proExports',
  'templates',
  'history'
]);
assert.equal(new Set(ATS_PASTE_DOCTOR_PRO_OPERATIONS).size, 5);

const clientFrom = (response) => ({
  calls: [],
  async refreshProState(input) {
    this.calls.push(input);
    if (response instanceof Error) throw response;
    return response;
  }
});

const client = clientFrom({
  productId: PRODUCT_ID,
  active: true,
  source: 'server',
  reason: 'verified_entitlement',
  features: [FEATURE_MAP.extendedInputLimit, FEATURE_MAP.templates]
});
const controller = createATSPasteDoctorProductScopedController({ entitlementClient: client, productId: PRODUCT_ID, featureMap: FEATURE_MAP });
const active = await controller.refresh();
assert.deepEqual(client.calls, [{ productId: PRODUCT_ID }]);
assert.equal(active.active, true);
assert.equal(controller.can('extendedInputLimit'), true);
assert.equal(controller.can('templates'), true);
assert.equal(controller.can('outputPack'), false);
assert.equal(controller.can('proExports'), false);
assert.equal(controller.can('history'), false);
assert.throws(() => controller.can('unknown'), /Unknown ATS Paste Doctor paid operation/);

for (const [response, reason] of [
  [{ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'non_server_authority'],
  [{ productId: 'fixture.other', active: true, source: 'server', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }, 'wrong_product'],
  [{ productId: PRODUCT_ID, active: true, source: 'server', reason: 'cached_active', features: Object.values(FEATURE_MAP) }, 'unverified_entitlement']
]) {
  const candidate = createATSPasteDoctorProductScopedController({ entitlementClient: clientFrom(response), productId: PRODUCT_ID, featureMap: FEATURE_MAP });
  const state = await candidate.refresh();
  assert.equal(state.active, false);
  assert.equal(state.reason, reason);
  assert.equal(ATS_PASTE_DOCTOR_PRO_OPERATIONS.every((operation) => candidate.can(operation) === false), true);
}

const failed = createATSPasteDoctorProductScopedController({ entitlementClient: clientFrom(new Error('offline')), productId: PRODUCT_ID, featureMap: FEATURE_MAP });
assert.equal((await failed.refresh()).reason, 'entitlement_check_failed');
assert.equal(ATS_PASTE_DOCTOR_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

assert.throws(() => createATSPasteDoctorProductScopedController({ entitlementClient: clientFrom({}), productId: '', featureMap: FEATURE_MAP }), /productId is required/);
assert.throws(() => createATSPasteDoctorProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: { ...FEATURE_MAP, history: FEATURE_MAP.templates }
}), /Feature IDs must be unique/);

const wrapper = fs.readFileSync(new URL('../tools/ats-paste-doctor/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapper, /createProductScopedController/);
for (const forbidden of ['NWPro', 'nicheworks_pro', 'nicheworks.pro', 'localStorage', 'buy.stripe.com', 'inputText', 'outputText', 'Blob']) {
  assert.equal(wrapper.includes(forbidden), false, `staged wrapper must not contain legacy/browser/content authority: ${forbidden}`);
}

const app = fs.readFileSync(new URL('../tools/ats-paste-doctor/app.js', import.meta.url), 'utf8');
assert.match(app, /const FREE_LIMIT = 30000/);
assert.match(app, /const PRO_LIMIT = 200000/);
assert.match(app, /const max = isProActive\(\) \? PRO_LIMIT : FREE_LIMIT/);
assert.match(app, /el\.copy\?\.addEventListener\("click", copyOutput\)/);
assert.match(app, /el\.download\?\.addEventListener\("click", downloadTxt\)/);
assert.match(app, /if \(!requirePro\(\)\) return/);
for (const action of ['copy-pack', 'copy-markdown', 'copy-checklist', 'export-json', 'export-pdf', 'save-template', 'load-template', 'save-history', 'clear-history']) {
  assert.equal(app.includes(`action === "${action}"`), true, `current Pro runtime action missing: ${action}`);
}
assert.match(app, /const HISTORY_LIMIT = 10/);
assert.match(app, /TEMPLATE_PREFIX = "nw_ats_paste_doctor_template_"/);

const bridge = fs.readFileSync(new URL('../tools/ats-paste-doctor/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridge, /const ENTITLEMENT = "nicheworks_pro"/);
assert.match(bridge, /local\.active === true && local\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(bridge, /local\.entitlement \|\| ENTITLEMENT/);
assert.doesNotMatch(bridge, /entitlement:\s*ENTITLEMENT/);
assert.match(bridge, /const INTERACTION_GUARD_SELECTOR = "#processBtn, \[data-pro-action\]"/);
assert.match(bridge, /function enforceBeforeInteraction\(event\)[\s\S]*syncGate\(\);/);
assert.match(bridge, /document\.addEventListener\("click", enforceBeforeInteraction, true\)/);
assert.match(bridge, /window\.NWATSPasteDoctorPro/);
assert.match(bridge, /isActive:\s*\(\) =>/);

const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));
assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes?.PRO_BUNDLE?.includes('ats-paste-doctor'), true);

const localSpec = fs.readFileSync(new URL('../tools/ats-paste-doctor/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/ats-paste-doctor.md', import.meta.url), 'utf8');
const wave5 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave5.md', import.meta.url), 'utf8');
for (const source of [localSpec, canonicalSpec, wave5]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks\.pro/);
  for (const operation of ATS_PASTE_DOCTOR_PRO_OPERATIONS) assert.equal(source.includes(operation), true, `${operation} missing from boundary docs`);
}
assert.match(wave5, /30,000/);
assert.match(wave5, /200,000/);
assert.match(wave5, /configured product ID must be `nicheworks\.pro`/i);
assert.match(wave5, /capture phase/i);
assert.match(wave5, /DOM/i);

console.log('ATS Paste Doctor product-scoped staging contracts: OK');
