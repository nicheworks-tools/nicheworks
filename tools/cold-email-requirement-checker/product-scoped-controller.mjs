import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const COLD_EMAIL_PRO_OPERATIONS = Object.freeze([
  "score",
  "suggestions",
  "draftCompare",
  "markdownExport"
]);

export function createColdEmailProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: COLD_EMAIL_PRO_OPERATIONS,
    toolLabel: "Cold Email Requirement Checker"
  });
}
