const ALLOWED_STATUSES = new Set(['active', 'revoked', 'refunded', 'disputed', 'test', 'unknown']);

function nowIso() {
  return new Date().toISOString();
}

function safeSuffix(value) {
  if (!value) {
    return 'unknown';
  }
  const cleaned = String(value).replace(/[^a-zA-Z0-9_-]/g, '').slice(-24);
  return cleaned || 'unknown';
}

export function normalizeEntitlementStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return ALLOWED_STATUSES.has(normalized) ? normalized : 'unknown';
}

export function buildEntitlementRecord(input = {}) {
  const timestamp = nowIso();
  const productId = String(input.productId || '').trim();
  const checkoutSessionId = String(input.stripeCheckoutSessionId || '').trim();

  return {
    entitlementId: input.entitlementId || `ent_${productId || 'unknown'}_${safeSuffix(checkoutSessionId)}`,
    productId,
    status: normalizeEntitlementStatus(input.status || 'active'),
    source: input.source || 'stripe_webhook',
    stripeCustomerId: input.stripeCustomerId || null,
    stripeCheckoutSessionId: checkoutSessionId || null,
    stripePaymentIntentId: input.stripePaymentIntentId || null,
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || timestamp,
    revokedAt: input.revokedAt || null,
    features: Array.isArray(input.features) ? input.features : []
  };
}

export function validateEntitlementRecord(record) {
  const required = [
    'entitlementId',
    'productId',
    'status',
    'source',
    'stripeCustomerId',
    'stripeCheckoutSessionId',
    'stripePaymentIntentId',
    'createdAt',
    'updatedAt',
    'revokedAt',
    'features'
  ];

  const missing = required.filter((key) => !(key in (record || {})));
  if (missing.length > 0) {
    return { ok: false, error: 'entitlement_record_invalid', missing };
  }

  if (!Array.isArray(record.features)) {
    return { ok: false, error: 'entitlement_record_invalid_features' };
  }

  if (normalizeEntitlementStatus(record.status) !== record.status) {
    return { ok: false, error: 'entitlement_record_invalid_status' };
  }

  return { ok: true };
}

function detectStorageBinding(env) {
  if (env?.BILLING_ENTITLEMENTS) {
    return { type: 'kv', binding: env.BILLING_ENTITLEMENTS };
  }
  if (env?.DB) {
    return { type: 'd1', binding: env.DB };
  }
  return null;
}

export async function getEntitlementByCheckoutSession(env, stripeCheckoutSessionId) {
  const storage = detectStorageBinding(env);
  if (!storage) {
    return { ok: false, error: 'entitlement_storage_not_configured' };
  }

  return {
    ok: false,
    error: 'entitlement_storage_not_implemented',
    storage: storage.type,
    stripeCheckoutSessionId: stripeCheckoutSessionId || null
  };
}

export async function issueEntitlement(env, record) {
  const validation = validateEntitlementRecord(record);
  if (!validation.ok) {
    return validation;
  }

  const storage = detectStorageBinding(env);
  if (!storage) {
    return { ok: false, error: 'entitlement_storage_not_configured' };
  }

  return {
    ok: false,
    error: 'entitlement_issue_not_implemented',
    storage: storage.type,
    entitlementId: record.entitlementId,
    stripeCheckoutSessionId: record.stripeCheckoutSessionId
  };
}
