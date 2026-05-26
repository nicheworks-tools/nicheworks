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

function normalizeNullable(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function fromDbRow(row) {
  if (!row) {
    return null;
  }

  let features = [];
  try {
    const parsed = JSON.parse(row.features_json || '[]');
    if (Array.isArray(parsed)) {
      features = parsed;
    }
  } catch {
    features = [];
  }

  return {
    entitlementId: row.entitlement_id,
    productId: row.product_id,
    status: row.status,
    source: row.source,
    stripeCustomerId: row.stripe_customer_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    customerEmailHash: row.customer_email_hash,
    features,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at
  };
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
    stripeCustomerId: normalizeNullable(input.stripeCustomerId),
    stripeCheckoutSessionId: checkoutSessionId || null,
    stripePaymentIntentId: normalizeNullable(input.stripePaymentIntentId),
    customerEmailHash: normalizeNullable(input.customerEmailHash),
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || timestamp,
    revokedAt: normalizeNullable(input.revokedAt),
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
    'customerEmailHash',
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
  if (env?.BILLING_DB) {
    return { type: 'd1', binding: env.BILLING_DB };
  }
  return null;
}

export async function getEntitlementByCheckoutSession(env, stripeCheckoutSessionId) {
  const storage = detectStorageBinding(env);
  if (!storage) {
    return { ok: false, error: 'entitlement_storage_not_configured' };
  }

  const sessionId = normalizeNullable(stripeCheckoutSessionId);
  if (!sessionId) {
    return { ok: false, error: 'entitlement_checkout_session_id_required' };
  }

  const result = await storage.binding
    .prepare(`
      SELECT
        entitlement_id,
        product_id,
        status,
        source,
        stripe_customer_id,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        customer_email_hash,
        features_json,
        created_at,
        updated_at,
        revoked_at
      FROM billing_entitlements
      WHERE stripe_checkout_session_id = ?
      LIMIT 1
    `)
    .bind(sessionId)
    .first();

  return {
    ok: true,
    found: Boolean(result),
    entitlement: fromDbRow(result)
  };
}

function isUniqueViolation(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('unique') || message.includes('constraint');
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

  const existing = await getEntitlementByCheckoutSession(env, record.stripeCheckoutSessionId);
  if (!existing.ok) {
    return existing;
  }

  if (existing.found && existing.entitlement) {
    return {
      ok: true,
      issued: true,
      idempotent: true,
      entitlement: existing.entitlement
    };
  }

  try {
    await storage.binding
      .prepare(`
        INSERT INTO billing_entitlements (
          entitlement_id,
          product_id,
          status,
          source,
          stripe_customer_id,
          stripe_checkout_session_id,
          stripe_payment_intent_id,
          customer_email_hash,
          features_json,
          created_at,
          updated_at,
          revoked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        record.entitlementId,
        record.productId,
        record.status,
        record.source,
        record.stripeCustomerId,
        record.stripeCheckoutSessionId,
        record.stripePaymentIntentId,
        record.customerEmailHash,
        JSON.stringify(record.features),
        record.createdAt,
        record.updatedAt,
        record.revokedAt
      )
      .run();
  } catch (error) {
    if (!isUniqueViolation(error)) {
      return { ok: false, error: 'entitlement_issue_failed' };
    }

    const dup = await getEntitlementByCheckoutSession(env, record.stripeCheckoutSessionId);
    if (!dup.ok || !dup.found || !dup.entitlement) {
      return { ok: false, error: 'entitlement_issue_failed' };
    }

    return {
      ok: true,
      issued: true,
      idempotent: true,
      entitlement: dup.entitlement
    };
  }

  return {
    ok: true,
    issued: true,
    idempotent: false,
    entitlement: record
  };
}
