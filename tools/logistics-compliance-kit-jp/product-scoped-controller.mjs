import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const LOGISTICS_PRO_OPERATIONS = Object.freeze([
  "internalShare",
  "vendorConfirmation",
  "improvementPlan",
  "githubIssue",
  "codexTask",
  "handoffMarkdown",
  "jsonExport",
  "markdownSave"
]);

export function createLogisticsProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: LOGISTICS_PRO_OPERATIONS,
    toolLabel: "Logistics"
  });
}
