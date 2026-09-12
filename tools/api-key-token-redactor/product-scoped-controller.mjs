import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const API_KEY_REDACTOR_PRO_OPERATIONS = Object.freeze([
  "customRules",
  "redactionProfiles",
  "auditMarkdown",
  "githubIssueTemplate",
  "supportTemplates",
  "jsonFindingsExport",
  "csvFindingsExport",
  "handoffMarkdownExport"
]);

export function createApiKeyRedactorProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: API_KEY_REDACTOR_PRO_OPERATIONS,
    toolLabel: "API Key Token Redactor"
  });
}
