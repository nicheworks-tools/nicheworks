export const COMMAND_SAFETY_PRO_OPERATIONS = Object.freeze([
  "reviewMarkdown",
  "codexTask",
  "githubIssue",
  "jsonExport",
  "markdownExport"
]);

const LEGACY_SHARED_AUTHORITY = "nicheworks_pro";

function normalizeProductId(value) {
  const productId = String(value || "").trim();
  if (!productId) throw new TypeError("Command Safety productId is required before product-scoped activation can be staged.");
  if (productId === LEGACY_SHARED_AUTHORITY) {
    throw new TypeError("The legacy shared nicheworks_pro authority cannot be used as a productId.");
  }
  return productId;
}

function normalizeFeatureMap(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("A complete Command Safety featureMap is required.");
  }

  const normalized = Object.create(null);
  const seen = new Set();
  for (const operation of COMMAND_SAFETY_PRO_OPERATIONS) {
    const featureId = String(input[operation] || "").trim();
    if (!featureId) throw new TypeError(`Missing feature ID for Command Safety operation: ${operation}`);
    if (featureId === LEGACY_SHARED_AUTHORITY) {
      throw new TypeError(`Legacy shared entitlement cannot be used as a feature ID: ${operation}`);
    }
    if (seen.has(featureId)) throw new TypeError(`Feature IDs must be unique; duplicate: ${featureId}`);
    seen.add(featureId);
    normalized[operation] = featureId;
  }

  for (const key of Object.keys(input)) {
    if (!COMMAND_SAFETY_PRO_OPERATIONS.includes(key)) {
      throw new TypeError(`Unknown Command Safety paid operation: ${key}`);
    }
  }

  return Object.freeze(normalized);
}

function inactiveState(productId, featureMap, reason = "not_verified") {
  return Object.freeze({
    productId,
    active: false,
    source: "server",
    reason,
    features: Object.freeze([]),
    operations: Object.freeze(Object.fromEntries(
      COMMAND_SAFETY_PRO_OPERATIONS.map((operation) => [operation, false])
    )),
    featureMap
  });
}

function verifiedState(productId, featureMap, response) {
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
      COMMAND_SAFETY_PRO_OPERATIONS.map((operation) => [operation, featureSet.has(featureMap[operation])])
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

export function createCommandSafetyProductScopedController({ entitlementClient, productId, featureMap } = {}) {
  if (!entitlementClient || typeof entitlementClient.refreshProState !== "function") {
    throw new TypeError("A server-backed entitlement client with refreshProState() is required.");
  }

  const normalizedProductId = normalizeProductId(productId);
  const normalizedFeatureMap = normalizeFeatureMap(featureMap);
  let current = inactiveState(normalizedProductId, normalizedFeatureMap, "server_recheck_required");

  const getState = () => current;

  const can = (operation) => {
    if (!COMMAND_SAFETY_PRO_OPERATIONS.includes(operation)) {
      throw new TypeError(`Unknown Command Safety paid operation: ${operation}`);
    }
    return Boolean(current.active && current.operations[operation]);
  };

  const refresh = async () => {
    let response;
    try {
      response = await entitlementClient.refreshProState({ productId: normalizedProductId });
    } catch {
      current = inactiveState(normalizedProductId, normalizedFeatureMap, "entitlement_check_failed");
      return current;
    }

    const failureReason = validateVerifiedResponse(normalizedProductId, response);
    if (failureReason) {
      current = inactiveState(normalizedProductId, normalizedFeatureMap, failureReason);
      return current;
    }

    current = verifiedState(normalizedProductId, normalizedFeatureMap, response);
    return current;
  };

  return Object.freeze({
    productId: normalizedProductId,
    featureMap: normalizedFeatureMap,
    operations: COMMAND_SAFETY_PRO_OPERATIONS,
    getState,
    can,
    refresh
  });
}
