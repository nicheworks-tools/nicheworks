import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const JSON_REPAIR_PRO_OPERATIONS = Object.freeze([
  "aggressiveRepair",
  "candidateActions",
  "schemaCheck",
  "history",
  "reportExport",
  "proSamples"
]);

export function createJsonRepairProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: JSON_REPAIR_PRO_OPERATIONS,
    toolLabel: "JSON Repair"
  });
}
