import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  COLD_EMAIL_PRO_OPERATIONS,
  createColdEmailProductScopedController
} from '../tools/cold-email-requirement-checker/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.cold_email.product';
const FEATURE_MAP = Object.freeze({
  score: 'fixture.cold_email.score',
  suggestions: 'fixture.cold_email.suggestions',
  draftCompare: 'fixture.cold_email.draft_compare',
  markdownExport: 'fixture.cold_email.markdown_export'
});

assert.deepEqual(COLD_EMAIL_PRO_OPERATIONS, ['score', 'suggestions', 'draftCompare', 'markdownExport']);
assert.equal(new Set(COLD_EMAIL_PRO_OPERATIONS).size, 4);

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
  features: [FEATURE_MAP.score, FEATURE_MAP.draftCompare]
});
const controller = createColdEmailProductScopedController({ entitlementClient: verifiedClient, productId: PRODUCT_ID, featureMap: FEATURE_MAP });
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('score'), true);
assert.equal(controller.can('draftCompare'), true);
assert.equal(controller.can('suggestions'), false);
assert.equal(controller.can('markdownExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown Cold Email Requirement Checker paid operation/);

const localOnly = createColdEmailProductScopedController({
  entitlementClient: clientFrom({ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await localOnly.refresh()).active, false);
assert.equal(localOnly.getState().reason, 'non_server_authority');

const wrongProduct = createColdEmailProductScopedController({
  entitlementClient: clientFrom({ productId: 'fixture.other.product', active: true, source: 'server', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await wrongProduct.refresh()).active, false);
assert.equal(wrongProduct.getState().reason, 'wrong_product');

const failed = createColdEmailProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(COLD_EMAIL_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/cold-email-requirement-checker/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of ['NWPro', 'nicheworks_pro', 'localStorage', 'buy.stripe.com', 'emailText', 'emailSubject', 'proDraftB', 'function normalizeProductId', 'function validateVerifiedResponse']) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority/draft content dependency: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/cold-email-requirement-checker/app.js', import.meta.url), 'utf8');
assert.match(appSource, /id="checkBtn"/);
assert.match(appSource, /id="copyBtn"/);
assert.match(appSource, /copyBtn\.addEventListener\("click"/);
assert.match(appSource, /window\.NW\.copyToClipboard\(text\)/);
assert.match(appSource, /id="scoreValue"/);
assert.match(appSource, /id="suggestions"/);

const addonSource = fs.readFileSync(new URL('../tools/cold-email-requirement-checker/pro-addon.js', import.meta.url), 'utf8');
assert.match(addonSource, /const ENTITLEMENT = 'nicheworks_pro'/);
assert.match(addonSource, /NWPro\.getLocalStatus/);
assert.match(addonSource, /return Boolean\(status\.active && status\.entitlement === ENTITLEMENT\)/);
assert.doesNotMatch(addonSource, /status\.entitlement \|\| ENTITLEMENT/);
assert.match(addonSource, /score\.style\.display = pro \? '' : 'none'/);
assert.match(addonSource, /suggestions\.style\.display = pro \? '' : 'none'/);
assert.match(addonSource, /proCompareBtn[\s\S]*if \(!requirePro\(\)\) return/);
assert.match(addonSource, /proExportBtn[\s\S]*if \(!requirePro\(\)\) return/);
assert.match(addonSource, /const a = \$\('emailText'\)\?\.value \|\| ''/);
assert.match(addonSource, /const b = \$\('proDraftB'\)\?\.value \|\| ''/);
assert.match(addonSource, /const subject = \$\('emailSubject'\)\?\.value \|\| ''/);

const sharedProSource = fs.readFileSync(new URL('../assets/nw-pro.js', import.meta.url), 'utf8');
assert.match(sharedProSource, /entitlement: localStorage\.getItem\(KEY_ENTITLEMENT\) \|\| DEFAULT_ENTITLEMENT/);
assert.match(sharedProSource, /return \{ active: false, entitlement: DEFAULT_ENTITLEMENT/);

console.log('Cold Email Requirement Checker product-scoped staging contracts: OK');
