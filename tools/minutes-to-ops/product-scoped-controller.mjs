import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const MINUTES_TO_OPS_PRO_OPERATIONS = Object.freeze([
  "history",
  "outputPack",
  "githubIssue",
  "codexRequest",
  "sopHandoff"
]);

export function createMinutesToOpsProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: MINUTES_TO_OPS_PRO_OPERATIONS,
    toolLabel: "Minutes to Ops"
  });
}
