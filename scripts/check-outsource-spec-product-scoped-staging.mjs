import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  OUTSOURCE_SPEC_PRO_OPERATIONS,
  createOutsourceSpecProductScopedController
} from '../tools/outsource-spec-generator/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.outsource_spec.product';
const FEATURE_MAP = Object.freeze({
  fullHandoffPack: 'fixture.outsource_spec.full_handoff_pack',
  deliverablePack: 'fixture.outsource_spec.deliverable_pack',
  acceptanceChecklist: 'fixture.outsource_spec.acceptance_checklist',
  vendorQuestions: 'fixture.outsource_spec.vendor_questions',
  codexTask: 'fixture.outsource_spec.codex_task',
  githubIssue: 'fixture.outsource_spec.github_issue',
  markdownExport: 'fixture.outsource_spec.markdown_export',
  jsonExport: 'fixture.outsource_spec.json_export'
});

assert.deepEqual(OUTSOURCE_SPEC_PRO_OPERATIONS, [
  'fullHandoffPack',
  'deliverablePack',
  'acceptanceChecklist',
  'vendorQuestions',
  'codexTask',
  'githubIssue',
  'markdownExport',
  'jsonExport'
]);
assert.equal(new Set(OUTSOURCE_SPEC_PRO_OPERATIONS).size, 8);

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
  features: [FEATURE_MAP.fullHandoffPack, FEATURE_MAP.vendorQuestions, FEATURE_MAP.githubIssue, FEATURE_MAP.jsonExport]
});
const controller = createOutsourceSpecProductScopedController({ entitlementClient: verifiedClient, productId: PRODUCT_ID, featureMap: FEATURE_MAP });
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('fullHandoffPack'), true);
assert.equal(controller.can('vendorQuestions'), true);
assert.equal(controller.can('githubIssue'), true);
assert.equal(controller.can('jsonExport'), true);
assert.equal(controller.can('deliverablePack'), false);
assert.equal(controller.can('acceptanceChecklist'), false);
assert.equal(controller.can('codexTask'), false);
assert.equal(controller.can('markdownExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown Outsource Spec Generator paid operation/);

const localOnly = createOutsourceSpecProductScopedController({
  entitlementClient: clientFrom({ productId: PRODUCT_ID, active: true, source: 'local', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await localOnly.refresh()).active, false);
assert.equal(localOnly.getState().reason, 'non_server_authority');

const wrongProduct = createOutsourceSpecProductScopedController({
  entitlementClient: clientFrom({ productId: 'fixture.other.product', active: true, source: 'server', reason: 'verified_entitlement', features: Object.values(FEATURE_MAP) }),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await wrongProduct.refresh()).active, false);
assert.equal(wrongProduct.getState().reason, 'wrong_product');

const failed = createOutsourceSpecProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(OUTSOURCE_SPEC_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/outsource-spec-generator/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of ['NWPro', 'nicheworks_pro', 'localStorage', 'buy.stripe.com', 'workType', 'deliverables', 'budget', 'function normalizeProductId', 'function validateVerifiedResponse']) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not contain legacy authority/user form data: ${forbidden}`);
}

const appSource = fs.readFileSync(new URL('../tools/outsource-spec-generator/app.js', import.meta.url), 'utf8');

// Free runtime evidence: lightweight generation and copy do not require Pro.
assert.match(appSource, /function buildFreeSpec\(/);
assert.match(appSource, /\$\('generateBtn'\)\.addEventListener\('click'/);
assert.match(appSource, /\$\('copyBtn'\)\.addEventListener\('click'/);
assert.match(appSource, /copyText\(lang\(\) === 'ja' \? \$\('outputJa'\)\.textContent : \$\('outputEn'\)\.textContent/);

// Paid runtime evidence: six generated artifact families plus Markdown/JSON export.
assert.match(appSource, /\$\('handoffBtn'\)[^\n]*showProOutput\('handoff', buildProHandoffPack\)/);
assert.match(appSource, /\$\('packBtn'\)[^\n]*showProOutput\('deliverable', buildDeliverablePack\)/);
assert.match(appSource, /\$\('checklistBtn'\)[^\n]*showProOutput\('checklist', buildAcceptanceChecklist\)/);
assert.match(appSource, /\$\('questionsBtn'\)[^\n]*showProOutput\('questions', buildVendorQuestionList\)/);
assert.match(appSource, /\$\('codexBtn'\)[^\n]*showProOutput\('codex', buildCodexPrompt\)/);
assert.match(appSource, /\$\('issueBtn'\)[^\n]*showProOutput\('issue', buildGithubIssue\)/);
assert.match(appSource, /function showProOutput\([^)]*\)\s*\{\s*if \(!requirePro\(\)\) return/);
assert.match(appSource, /function exportMarkdown\(\)\s*\{\s*if \(!requirePro\(\)\) return/);
assert.match(appSource, /function exportJson\(\)\s*\{\s*if \(!requirePro\(\)\) return/);

const bridgeSource = fs.readFileSync(new URL('../tools/outsource-spec-generator/pro-bridge.js', import.meta.url), 'utf8');
assert.match(bridgeSource, /const EXPECTED_ENTITLEMENT = 'nicheworks_pro'/);
assert.match(bridgeSource, /NWPro\.getLocalStatus/);
assert.match(bridgeSource, /status && status\.active && status\.entitlement === EXPECTED_ENTITLEMENT/);
assert.match(bridgeSource, /buy\.stripe\.com/);

console.log('Outsource Spec Generator product-scoped staging contracts: OK');
