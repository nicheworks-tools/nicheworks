import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const CONTRACT_RISK_PRO_OPERATIONS = Object.freeze([
  "fullFindings",
  "fullReviewPack",
  "markdownExport",
  "printPdf"
]);

export function createContractRiskProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: CONTRACT_RISK_PRO_OPERATIONS,
    toolLabel: "Contract Risk Highlighter"
  });
}
