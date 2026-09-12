import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  API_KEY_REDACTOR_PRO_OPERATIONS,
  createApiKeyRedactorProductScopedController
} from '../tools/api-key-token-redactor/product-scoped-controller.mjs';

const PRODUCT_ID = 'fixture.api_key_redactor.product';
const FEATURE_MAP = Object.freeze({
  customRules: 'fixture.api_key_redactor.custom_rules',
  redactionProfiles: 'fixture.api_key_redactor.redaction_profiles',
  auditMarkdown: 'fixture.api_key_redactor.audit_markdown',
  githubIssueTemplate: 'fixture.api_key_redactor.github_issue_template',
  supportTemplates: 'fixture.api_key_redactor.support_templates',
  jsonFindingsExport: 'fixture.api_key_redactor.json_findings_export',
  csvFindingsExport: 'fixture.api_key_redactor.csv_findings_export',
  handoffMarkdownExport: 'fixture.api_key_redactor.handoff_markdown_export'
});

assert.deepEqual(API_KEY_REDACTOR_PRO_OPERATIONS, [
  'customRules',
  'redactionProfiles',
  'auditMarkdown',
  'githubIssueTemplate',
  'supportTemplates',
  'jsonFindingsExport',
  'csvFindingsExport',
  'handoffMarkdownExport'
]);
assert.equal(new Set(API_KEY_REDACTOR_PRO_OPERATIONS).size, 8);

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
  features: [
    FEATURE_MAP.customRules,
    FEATURE_MAP.auditMarkdown,
    FEATURE_MAP.supportTemplates,
    FEATURE_MAP.handoffMarkdownExport
  ]
});
const controller = createApiKeyRedactorProductScopedController({
  entitlementClient: verifiedClient,
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
const state = await controller.refresh();
assert.deepEqual(verifiedClient.calls, [{ productId: PRODUCT_ID }]);
assert.equal(state.active, true);
assert.equal(controller.can('customRules'), true);
assert.equal(controller.can('auditMarkdown'), true);
assert.equal(controller.can('supportTemplates'), true);
assert.equal(controller.can('handoffMarkdownExport'), true);
assert.equal(controller.can('redactionProfiles'), false);
assert.equal(controller.can('githubIssueTemplate'), false);
assert.equal(controller.can('jsonFindingsExport'), false);
assert.equal(controller.can('csvFindingsExport'), false);
assert.throws(() => controller.can('unknown'), /Unknown API Key Token Redactor paid operation/);

const localOnly = createApiKeyRedactorProductScopedController({
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

const wrongProduct = createApiKeyRedactorProductScopedController({
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

const failed = createApiKeyRedactorProductScopedController({
  entitlementClient: clientFrom(new Error('network down')),
  productId: PRODUCT_ID,
  featureMap: FEATURE_MAP
});
assert.equal((await failed.refresh()).active, false);
assert.equal(failed.getState().reason, 'entitlement_check_failed');
assert.equal(API_KEY_REDACTOR_PRO_OPERATIONS.every((operation) => failed.can(operation) === false), true);

const wrapperSource = fs.readFileSync(new URL('../tools/api-key-token-redactor/product-scoped-controller.mjs', import.meta.url), 'utf8');
assert.match(wrapperSource, /createProductScopedController/);
for (const forbidden of [
  'NWPro',
  'nicheworks_pro',
  'localStorage',
  'sessionStorage',
  'buy.stripe.com',
  'inputText',
  'outputText',
  'safeFindings',
  'preview',
  'Blob',
  'clipboard'
]) {
  assert.equal(wrapperSource.includes(forbidden), false, `staged wrapper must not receive browser authority or secret-bearing data: ${forbidden}`);
}

const indexSource = fs.readFileSync(new URL('../tools/api-key-token-redactor/index.html', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../tools/api-key-token-redactor/app.js', import.meta.url), 'utf8');
const bridgeSource = fs.readFileSync(new URL('../tools/api-key-token-redactor/pro-bridge.js', import.meta.url), 'utf8');

// Free contract evidence.
assert.match(indexSource, /id="redactBtn"/);
assert.match(indexSource, /id="copyBtn"/);
assert.match(indexSource, /id="downloadBtn"/);
assert.match(appSource, /redactContent/);
assert.match(appSource, /copyBtn/);
assert.match(appSource, /downloadBtn/);

// Pro surface evidence: controls/artifacts are inside the legacy Pro-only section.
assert.match(indexSource, /data-pro-only/);
assert.match(indexSource, /id="profileSelect"/);
assert.match(indexSource, /id="addCustomRuleBtn"/);
assert.match(indexSource, /id="copyAuditBtn"/);
assert.match(indexSource, /id="copyGithubBtn"/);
assert.match(indexSource, /id="copySupportBtn"/);
assert.match(indexSource, /id="copyDiscordBtn"/);
assert.match(indexSource, /id="downloadJsonBtn"/);
assert.match(indexSource, /id="downloadCsvBtn"/);
assert.match(indexSource, /id="downloadHandoffBtn"/);
assert.match(appSource, /options\.proActive && Array\.isArray\(options\.customRules\)/);
assert.match(appSource, /document\.documentElement\.dataset\.proActive !== "true"/);
assert.match(appSource, /selectedProfile/);
assert.match(appSource, /copyAction\("copyAuditBtn", auditMarkdown/);
assert.match(appSource, /copyAction\("copyGithubBtn", githubIssueTemplate/);
assert.match(appSource, /copyAction\("copySupportBtn", \(\) => supportTemplate\("support"\)/);
assert.match(appSource, /copyAction\("copyDiscordBtn", \(\) => supportTemplate\("Discord"\)/);
assert.match(appSource, /downloadJsonBtn/);
assert.match(appSource, /downloadCsvBtn/);
assert.match(appSource, /downloadHandoffBtn/);

// Secret-safety hardening must remain in place for visible/copy/download artifacts.
assert.match(bridgeSource, /const SAFE_PREVIEW = '\[REDACTED PREVIEW\]'/);
assert.match(bridgeSource, /function scrubPreviewText\(value\)/);
assert.match(bridgeSource, /currentUnsafePreviews\(\)/);
assert.match(bridgeSource, /navigator\.clipboard/);
assert.match(bridgeSource, /safeWriteText = \(text\) => nativeWriteText\(scrubPreviewText\(text\)\)/);
assert.match(bridgeSource, /class SafeBlob extends NativeBlob/);
assert.match(bridgeSource, /typeof part === 'string' \? scrubPreviewText\(part\) : part/);
assert.match(bridgeSource, /#findingsList code, #verificationList code/);
assert.match(bridgeSource, /node\.textContent = SAFE_PREVIEW/);

// Existing legacy entitlement still requires explicit active=true and matching/no-conflict entitlement.
assert.match(bridgeSource, /Boolean\(status\.active && \(!status\.entitlement \|\| status\.entitlement === ENTITLEMENT\)\)/);

console.log('API Key Token Redactor product-scoped staging contracts: OK');
