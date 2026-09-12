import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const LOG_FORMATTER_PRO_OPERATIONS = Object.freeze([
  "regexFilter",
  "csvExport",
  "jsonExport",
  "markdownReport",
  "advancedAnalysis"
]);

export function createLogFormatterProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: LOG_FORMATTER_PRO_OPERATIONS,
    toolLabel: "LogFormatter"
  });
}
