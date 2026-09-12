import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const OUTSOURCE_SPEC_PRO_OPERATIONS = Object.freeze([
  "fullHandoffPack",
  "deliverablePack",
  "acceptanceChecklist",
  "vendorQuestions",
  "codexTask",
  "githubIssue",
  "markdownExport",
  "jsonExport"
]);

export function createOutsourceSpecProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: OUTSOURCE_SPEC_PRO_OPERATIONS,
    toolLabel: "Outsource Spec Generator"
  });
}
