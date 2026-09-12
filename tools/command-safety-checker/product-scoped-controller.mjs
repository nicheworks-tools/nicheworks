import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const COMMAND_SAFETY_PRO_OPERATIONS = Object.freeze([
  "reviewMarkdown",
  "codexTask",
  "githubIssue",
  "jsonExport",
  "markdownExport"
]);

export function createCommandSafetyProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: COMMAND_SAFETY_PRO_OPERATIONS,
    toolLabel: "Command Safety"
  });
}
