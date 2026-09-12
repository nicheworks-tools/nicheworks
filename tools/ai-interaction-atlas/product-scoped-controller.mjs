import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const AIIA_PRO_OPERATIONS = Object.freeze([
  "advancedCompare",
  "handoffCopy",
  "handoffExport",
  "comparisonExport"
]);

export function createAIIAProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: AIIA_PRO_OPERATIONS,
    toolLabel: "AI Interaction Atlas"
  });
}
