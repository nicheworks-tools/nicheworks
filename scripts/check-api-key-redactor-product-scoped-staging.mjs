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

for (const [response, reason] of [
  [{
    productId: PRODUCT_ID,
    active: true,
    source: 'local',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }, 'non_server_authority'],
  [{
    productId: 'fixture.other.product',
    active: true,
    source: 'server',
    reason: 'verified_entitlement',
    features: Object.values(FEATURE_MAP)
  }, 'wrong_product'],
  [{
    productId: PRODUCT_ID,
    active: true,
    source: 'server',
    reason: 'cached_active',
    features: Object.values(FEATURE_MAP)
  }, 'unverified_entitlement']
]) {
  const candidate = createApiKeyRedactorProductScopedController({
    entitlementClient: clientFrom(response),
    productId: PRODUCT_ID,
    featureMap: FEATURE_MAP
  });
  const candidateState = await candidate.refresh();
  assert.equal(candidateState.active, false);
  assert.equal(candidateState.reason, reason);
  assert.equal(API_KEY_REDACTOR_PRO_OPERATIONS.every((operation) => candidate.can(operation) === false), true);
}

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
  'nicheworks.pro',
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

// Pro surface evidence.
assert.match(indexSource, /data-pro-only/);
for (const id of [
  'profileSelect',
  'addCustomRuleBtn',
  'copyAuditBtn',
  'copyGithubBtn',
  'copySupportBtn',
  'copyDiscordBtn',
  'downloadJsonBtn',
  'downloadCsvBtn',
  'downloadHandoffBtn'
]) {
  assert.equal(indexSource.includes(`id="${id}"`), true, `Pro control missing: ${id}`);
}
assert.match(appSource, /options\.proActive && Array\.isArray\(options\.customRules\)/);
assert.match(appSource, /document\.documentElement\.dataset\.proActive !== "true"/);
assert.match(appSource, /proActive: document\.documentElement\.dataset\.proActive === "true"/);
assert.match(appSource, /selectedProfile/);
assert.match(appSource, /copyAction\("copyAuditBtn", auditMarkdown/);
assert.match(appSource, /copyAction\("copyGithubBtn", githubIssueTemplate/);
assert.match(appSource, /copyAction\("copySupportBtn", \(\) => supportTemplate\("support"\)/);
assert.match(appSource, /copyAction\("copyDiscordBtn", \(\) => supportTemplate\("Discord"\)/);
assert.match(appSource, /downloadJsonBtn/);
assert.match(appSource, /downloadCsvBtn/);
assert.match(appSource, /downloadHandoffBtn/);

// Exact legacy entitlement and DOM/action hardening.
assert.match(bridgeSource, /status\.active === true && status\.entitlement === ENTITLEMENT/);
assert.doesNotMatch(bridgeSource, /!status\.entitlement/);
assert.doesNotMatch(bridgeSource, /status\.entitlement \|\| ENTITLEMENT/);
assert.doesNotMatch(bridgeSource, /entitlement:\s*ENTITLEMENT,\s*checkedAt/);
assert.match(bridgeSource, /const PRO_ACTION_SELECTOR/);
assert.match(bridgeSource, /const RESYNC_SELECTOR/);
for (const protectedSelector of [
  '#profileSelect',
  '#addCustomRuleBtn',
  '[data-remove-rule]',
  '#copyAuditBtn',
  '#copyGithubBtn',
  '#copySupportBtn',
  '#copyDiscordBtn',
  '#downloadJsonBtn',
  '#downloadCsvBtn',
  '#downloadHandoffBtn'
]) {
  assert.equal(bridgeSource.includes(`'${protectedSelector}'`), true, `legacy guard missing: ${protectedSelector}`);
}
assert.match(bridgeSource, /#redactBtn, \[data-sample\]/);
assert.match(bridgeSource, /function guardLegacyInteraction\(event\)/);
assert.match(bridgeSource, /event\.stopImmediatePropagation\(\)/);
assert.match(bridgeSource, /document\.addEventListener\('click', guardLegacyInteraction, true\)/);
assert.match(bridgeSource, /document\.addEventListener\('change', guardLegacyProfileChange, true\)/);
assert.match(bridgeSource, /isActive: \(\) => readStatus\(\)\.active === true/);

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

// Current bundle authority and follow-up contract.
const classification = JSON.parse(fs.readFileSync(new URL('../MONETIZATION_CLASSIFICATION_87.json', import.meta.url), 'utf8'));
assert.equal(classification.bundleProductId, 'nicheworks.pro');
assert.equal(classification.classes?.PRO_BUNDLE?.includes('api-key-token-redactor'), true);

const localSpec = fs.readFileSync(new URL('../tools/api-key-token-redactor/SPEC.md', import.meta.url), 'utf8');
const canonicalSpec = fs.readFileSync(new URL('../docs/tools/api-key-token-redactor.md', import.meta.url), 'utf8');
const wave7 = fs.readFileSync(new URL('../docs/billing/pro-product-contracts-wave7.md', import.meta.url), 'utf8');
for (const source of [localSpec, canonicalSpec, wave7]) {
  assert.match(source, /PRO_BUNDLE/);
  assert.match(source, /nicheworks\.pro/);
  for (const operation of API_KEY_REDACTOR_PRO_OPERATIONS) {
    assert.equal(source.includes(operation), true, `${operation} missing from current boundary docs`);
  }
}
assert.match(wave7, /capture/i);
assert.match(wave7, /DOM/i);
assert.match(wave7, /secret-preview|secret-safety|safe redacted marker/i);

console.log('API Key Token Redactor product-scoped staging contracts: OK');
