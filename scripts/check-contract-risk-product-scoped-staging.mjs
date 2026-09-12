import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CONTRACT_RISK_PRO_OPERATIONS,
  createContractRiskProductScopedController
} from '../tools/contract-risk-highlighter/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.contract_risk.product';
const FEATURE_MAP = Object.freeze({
  fullFindings: 'fixture.contract_risk.full_findings',
  fullReviewPack: 'fixture.contract_risk.full_review_pack',
  markdownExport: 'fixture.contract_risk.markdown_export',
  printPdf: 'fixture.contract_risk.print_pdf'
});

assert.deepEqual(CONTRACT_RISK_PRO_OPERATIONS, [
  'fullFindings',
  'fullReviewPack',
  'markdownExport',
  'printPdf'
]);
assert.equal(new Set(CONTRACT_RISK_PRO_OPERATIONS).size, 4);

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
  features: [FEATURE_MAP.fullFindings, FEATURE_MAP.markdownExport]
});
const controller = createContractRiskProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('fullFindings'), true);
assert.equal(controller.can('markdownExport'), true);
assert.equal(controller.can('fullReviewPack'), false);
assert.equal(controller.can('printPdf'), false);
assert.throws(() => controller.can('unknown'), /Unknown Contract Risk Highlighter paid operation/);

const localOnly = createContractRiskProductScopedController({
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

const wrongProduct = createContractRiskProductScopedController({
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

const unverified = createContractRiskProductScopedController({
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
assert.equal((await unverified.refresh()).active, false);
assert.equal(unverified.getState().reason, 'unverified_entitlement');

const failed = createContractRiskProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(CONTRACT_RISK_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

assert.throws(() => createContractRiskProductScopedController({
  entitlementClient: clientFrom({}),
  productId: '',
  featureMap: FEATURE_MAP
}), /productId is required/);
assert.throws(() => createContractRiskProductScopedController({
  entitlementClient: clientFrom({}),
  productId: PRODUCT_ID,
  featureMap: { ...FEATURE_MAP, printPdf: FEATURE_MAP.markdownExport }
}), /Feature IDs must be unique/);

const wrapperSource = fs.readFileSync(new URL('../tools/contract-risk-highlighter/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'nicheworks.pro',
  'localStorage',
  'buy.stripe.com',
  'contractText',
  'document.getElementById',
  'querySelector',
  'memoParts',
  'Blob',
  'window.print',
  'function normalizeProductId',
  'function validateVerifiedResponse'
]) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority, bundle membership, DOM/content dependency, or duplicated core logic: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/contract-risk-highlighter/app.js', import.meta.url), 'utf8');
assert.match(appSource, /const MAX_FREE_FINDINGS = 3/);
assert.match(appSource, /function liteMarkdown\(/);
assert.match(appSource, /function fullMarkdown\(/);
assert.match(appSource, /function memoParts\(/);
assert.match(appSource, /copyFindings.*copyText\(isPro\(\) \? fullMarkdown\(\) : liteMarkdown\(\)\)/s);
assert.match(appSource, /downloadMd.*if\(!isPro\(\)\) return lockPreview\(\)/s);
assert.match(appSource, /downloadPdf.*if\(!isPro\(\)\) return lockPreview\(\)/s);

const bridgeSource = fs.readFileSync(new URL('../tools/contract-risk-highlighter/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridgeSource, /const EXPECTED_ENTITLEMENT = "nicheworks_pro"/);
assert.match(bridgeSource, /status\.active === true && status\.entitlement === EXPECTED_ENTITLEMENT/);
assert.doesNotMatch(bridgeSource, /function normalizeStatus/);
for (const forbiddenLegacyShortcut of ['status.isActive', 'status.proActive', 'status.status === "active"']) {
  assert.equal(bridgeSource.includes(forbiddenLegacyShortcut), false, `legacy bridge must not accept generic active-like authority: ${forbiddenLegacyShortcut}`);
}
assert.match(bridgeSource, /PRO_ONLY_ACTION_IDS/);
for (const actionId of ['showAllBtn', 'copyFullBtn', 'copyConsultBtn', 'copyQuestionsBtn', 'copyMissingBtn', 'downloadMdBtn', 'downloadPdfBtn']) {
  assert.equal(bridgeSource.includes(`"${actionId}"`), true, `runtime guard missing for ${actionId}`);
}
assert.match(bridgeSource, /event\.stopImmediatePropagation\(\)/);
assert.match(bridgeSource, /\}, true\);/);
assert.match(bridgeSource, /function clearProOutputs\(/);
for (const outputId of ['fullReview', 'consultMemo', 'counterpartyQuestions', 'missingChecklist', 'nextAction']) {
  assert.equal(bridgeSource.includes(`"${outputId}"`), true, `inactive cleanup missing for ${outputId}`);
}
assert.match(bridgeSource, /function enforceFreeFindingLimit\(/);
assert.match(bridgeSource, /MAX_FREE_FINDINGS = 3/);
assert.match(bridgeSource, /root\.dataset\.proActive = "false"/);
assert.match(bridgeSource, /window\.addEventListener\("storage", apply\)/);

const localSpec = fs.readFileSync(new URL('../tools/contract-risk-highlighter/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/contract-risk-highlighter.md', import.meta.url), 'utf8');
const wave3 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave3.md', import.meta.url), 'utf8');
const executionAuthority = fs.readFileSync(new URL('../MONETIZATION_EXECUTION.md', import.meta.url), 'utf8');
const commonBilling = fs.readFileSync(new URL('../docs/billing/nicheworks-common-billing-architecture.md', import.meta.url), 'utf8');
const bundleContract = fs.readFileSync(new URL('../docs/billing/nicheworks-pro-bundle-contract.md', import.meta.url), 'utf8');
const monetizationClassification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));

for (const source of [localSpec, canonicalSpec, wave3]) {
  assert.match(source, /three|3|三/iu);
  assert.match(source, /nicheworks_pro/);
  assert.match(source, /nicheworks\.pro/);
  assert.match(source, /Full Review/i);
  assert.match(source, /Markdown/i);
  assert.match(source, /Print|PDF/i);
}
for (const authority of [executionAuthority, commonBilling, bundleContract]) {
  assert.match(authority, /nicheworks\.pro/);
  assert.match(authority, /bundle/i);
}
assert.equal(monetizationClassification.bundleProductId, 'nicheworks.pro');
assert.equal(monetizationClassification.classes?.PRO_BUNDLE?.includes('contract-risk-highlighter'), true);
assert.match(wave3, /classifies `contract-risk-highlighter` as `PRO_BUNDLE`/i);
assert.match(wave3, /configured product ID must be.*`nicheworks\.pro`/is);
assert.match(wave3, /billing\/entitlement/i);
assert.match(wave3, /contract text/i);
assert.match(wave3, /commercial configuration unresolved/i);
assert.match(localSpec, /Monetization class: `PRO_BUNDLE`/i);
assert.match(canonicalSpec, /Monetization class:\*\* `PRO_BUNDLE`/i);

console.log('Contract Risk Highlighter product-scoped staging contracts: OK');
