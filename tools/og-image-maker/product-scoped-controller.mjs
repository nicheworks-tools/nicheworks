import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const OG_IMAGE_MAKER_PRO_OPERATIONS = Object.freeze([
  "batchGeneration"
]);

export function createOgImageMakerProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: OG_IMAGE_MAKER_PRO_OPERATIONS,
    toolLabel: "OG Image Maker"
  });
}
