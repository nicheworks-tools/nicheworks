import { createProductScopedController } from "../../assets/nw-product-scoped-controller.mjs";

export const SQL_DB_RISK_PRO_OPERATIONS = Object.freeze([
  "safeExecutionPack",
  "reviewSummary",
  "dbChecklist",
  "migrationReview",
  "teamHandoff",
  "markdownExport",
  "jsonExport"
]);

export function createSqlDbRiskProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  return createProductScopedController({
    entitlementClient,
    productId,
    featureMap,
    operations: SQL_DB_RISK_PRO_OPERATIONS,
    toolLabel: "SQL DB Risk Checker"
  });
}
