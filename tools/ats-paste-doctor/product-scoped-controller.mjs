import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const ATS_PASTE_DOCTOR_PRO_OPERATIONS = Object.freeze([
  "extendedInputLimit",
  "outputPack",
  "proExports",
  "templates",
  "history"
]);

export function createATSPasteDoctorProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: ATS_PASTE_DOCTOR_PRO_OPERATIONS,
    toolLabel: "ATS Paste Doctor"
  });
}
