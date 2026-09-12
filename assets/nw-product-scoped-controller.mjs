export const LEGACY_SHARED_PRO_AUTHORITY = "nicheworks_pro";

function normalizeToolLabel(value) {
  const label = String(value || "").trim();
  if (!label) throw new TypeError("A tool label is required for product-scoped controller errors.");
  return label;
}

function normalizeOperations(input, toolLabel) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new TypeError(`${toolLabel} paid operations must be a non-empty array.`);
  }

  const seen = new Set();
  const operations = input.map((value) => {
    const operation = String(value || "").trim();
    if (!operation) throw new TypeError(`${toolLabel} paid operation names must be non-empty.`);
    if (seen.has(operation)) throw new TypeError(`${toolLabel} paid operation names must be unique; duplicate: ${operation}`);
    seen.add(operation);
    return operation;
  });

  return Object.freeze(operations);
}

function normalizeProductId(value, toolLabel) {
  const productId = String(value || "").trim();
  if (!productId) throw new TypeError(`${toolLabel} productId is required before product-scoped activation can be staged.`);
  if (productId === LEGACY_SHARED_PRO_AUTHORITY) {
    throw new TypeError("The legacy shared nicheworks_pro authority cannot be used as a productId.");
  }
  return productId;
}

function normalizeFeatureMap(input, operations, toolLabel) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`A complete ${toolLabel} featureMap is required.`);
  }

  const normalized = Object.create(null);
  const seen = new Set();
  for (const operation of operations) {
    const featureId = String(input[operation] || "").trim();
    if (!featureId) throw new TypeError(`Missing feature ID for ${toolLabel} operation: ${operation}`);
    if (featureId === LEGACY_SHARED_PRO_AUTHORITY) {
      throw new TypeError(`Legacy shared entitlement cannot be used as a feature ID: ${operation}`);
    }
    if (seen.has(featureId)) throw new TypeError(`Feature IDs must be unique; duplicate: ${featureId}`);
    seen.add(featureId);
    normalized[operation] = featureId;
  }

  for (const key of Object.keys(input)) {
    if (!operations.includes(key)) {
      throw new TypeError(`Unknown ${toolLabel} paid operation: ${key}`);
    }
  }

  return Object.freeze(normalized);
}

function inactiveState(productId, featureMap, operations, reason = "not_verified") {
  return Object.freeze({
    productId,
    active: false,
    source: "server",
    reason,
    features: Object.freeze([]),
    operations: Object.freeze(Object.fromEntries(
      operations.map((operation) => [operation, false])
    )),
    featureMap
  });
}

function verifiedState(productId, featureMap, operations, response) {
  const features = Array.isArray(response.features)
    ? [...new Set(response.features.map((value) => String(value).trim()).filter(Boolean))]
    : [];
  const featureSet = new Set(features);

  return Object.freeze({
    productId,
    active: true,
    source: "server",
    reason: "verified_entitlement",
    features: Object.freeze(features),
    operations: Object.freeze(Object.fromEntries(
      operations.map((operation) => [operation, featureSet.has(featureMap[operation])])
    )),
    featureMap
  });
}

function validateVerifiedResponse(productId, response) {
  if (!response || typeof response !== "object") return "invalid_entitlement_response";
  if (String(response.productId || "").trim() !== productId) return "wrong_product";
  if (response.active !== true) return String(response.reason || "entitlement_not_active");
  if (response.source !== "server") return "non_server_authority";
  if (response.reason !== "verified_entitlement") return "unverified_entitlement";
  return "";
}

export function createProductScopedController({
  entitlementClient,
  productId,
  featureMap,
  operations,
  toolLabel
} = {}) {
  const normalizedToolLabel = normalizeToolLabel(toolLabel);
  const normalizedOperations = normalizeOperations(operations, normalizedToolLabel);

  if (!entitlementClient || typeof entitlementClient.refreshProState !== "function") {
    throw new TypeError("A server-backed entitlement client with refreshProState() is required.");
  }

  const normalizedProductId = normalizeProductId(productId, normalizedToolLabel);
  const normalizedFeatureMap = normalizeFeatureMap(featureMap, normalizedOperations, normalizedToolLabel);
  let current = inactiveState(normalizedProductId, normalizedFeatureMap, normalizedOperations, "server_recheck_required");

  const getState = () => current;

  const can = (operation) => {
    if (!normalizedOperations.includes(operation)) {
      throw new TypeError(`Unknown ${normalizedToolLabel} paid operation: ${operation}`);
    }
    return Boolean(current.active && current.operations[operation]);
  };

  const refresh = async () => {
    let response;
    try {
      response = await entitlementClient.refreshProState({ productId: normalizedProductId });
    } catch {
      current = inactiveState(normalizedProductId, normalizedFeatureMap, normalizedOperations, "entitlement_check_failed");
      return current;
    }

    const failureReason = validateVerifiedResponse(normalizedProductId, response);
    if (failureReason) {
      current = inactiveState(normalizedProductId, normalizedFeatureMap, normalizedOperations, failureReason);
      return current;
    }

    current = verifiedState(normalizedProductId, normalizedFeatureMap, normalizedOperations, response);
    return current;
  };

  return Object.freeze({
    productId: normalizedProductId,
    featureMap: normalizedFeatureMap,
    operations: normalizedOperations,
    getState,
    can,
    refresh
  });
}
