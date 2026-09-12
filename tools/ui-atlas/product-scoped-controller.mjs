import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const UI_ATLAS_PRO_OPERATIONS = Object.freeze([
  "fiveWayCompare",
  "fullHandoffOutput",
  "proSampleDetails"
]);

export function createUIAtlasProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: UI_ATLAS_PRO_OPERATIONS,
    toolLabel: "UI Atlas"
  });
}
