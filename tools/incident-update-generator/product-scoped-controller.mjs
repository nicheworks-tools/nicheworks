import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const INCIDENT_UPDATE_PRO_OPERATIONS = Object.freeze([
  "communicationPack"
]);

export function createIncidentUpdateProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: INCIDENT_UPDATE_PRO_OPERATIONS,
    toolLabel: "Incident Update Generator"
  });
}
