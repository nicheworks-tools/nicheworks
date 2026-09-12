import {
  buildEntitlementRecord,
  issueEntitlement,
  updateEntitlementStatusByPaymentIntent
} from './entitlement-store.js';
import { loadProductsConfig, productPaymentMatchesSession, validateConfiguredProduct } from './product-config.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseStripeSignatureHeader(header) {
  if (!hasValue(header)) return { timestamp: null, signatures: [] };

  const parts = header.split(',');
  let timestamp = null;
  const signatures = [];

  for (const part of parts) {
    const [rawKey, rawValue] = part.split('=');
    const key = String(rawKey || '').trim();
    const value = String(rawValue || '').trim();
    if (!key || !value) continue;

    if (key === 't') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) timestamp = parsed;
      continue;
    }

    if (key === 'v1') signatures.push(value.toLowerCase());
  }

  return { timestamp, signatures };
}

function timingSafeEqualHex(a, b) {
  if (!hasValue(a) || !hasValue(b) || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeSignature(secret, payload) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  return toHex(signature);
}

function withinTolerance(timestamp, now, toleranceSeconds) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(now)) return false;
  return Math.abs(now - timestamp) <= toleranceSeconds;
}

async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    return { ok: false, error: 'webhook_signature_invalid' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!withinTolerance(timestamp, nowSeconds, 300)) {
    return { ok: false, error: 'webhook_signature_invalid' };
  }

  const expected = await computeSignature(secret, `${timestamp}.${rawBody}`);
  const matched = signatures.some((candidate) => timingSafeEqualHex(candidate, expected));
  return matched ? { ok: true } : { ok: false, error: 'webhook_signature_invalid' };
}

function acceptedFulfillmentEvent(eventType) {
  return eventType === 'checkout.session.completed' || eventType === 'checkout.session.async_payment_succeeded';
}

function revocationStatusForEvent(eventType) {
  if (eventType === 'charge.refunded') return 'refunded';
  if (eventType === 'charge.dispute.created') return 'disputed';
  return null;
}

function stripeId(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value.id === 'string') return value.id.trim();
  return '';
}

async function handleRevocationEvent(env, eventType, object) {
  const status = revocationStatusForEvent(eventType);
  const paymentIntentId = stripeId(object?.payment_intent);
  if (!paymentIntentId) {
    return {
      ok: true,
      verified: true,
      received: true,
      eventType,
      entitlementUpdated: false,
      ignored: true,
      reason: 'payment_intent_missing'
    };
  }

  const updated = await updateEntitlementStatusByPaymentIntent(env, { paymentIntentId, status });
  if (!updated.ok) {
    const httpStatus = updated.error === 'entitlement_storage_not_configured' ? 503 : 500;
    return { ok: false, error: updated.error || 'entitlement_update_failed', httpStatus };
  }

  return {
    ok: true,
    verified: true,
    received: true,
    eventType,
    entitlementUpdated: updated.updated > 0,
    updatedCount: updated.updated,
    entitlementStatus: status
  };
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed', allowed: ['POST'] }, 405);
  }

  if (!hasValue(env?.STRIPE_WEBHOOK_SECRET)) {
    return json({ ok: false, error: 'webhook_secret_missing' }, 503);
  }

  const signatureHeader = request.headers.get('Stripe-Signature');
  if (!hasValue(signatureHeader)) {
    return json({ ok: false, error: 'webhook_signature_missing' }, 400);
  }

  const rawBody = await request.text();
  const verified = await verifyStripeSignature(rawBody, signatureHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!verified.ok) {
    return json({ ok: false, error: verified.error || 'webhook_signature_invalid' }, 400);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  const eventType = String(event?.type || '').trim();
  const revocationStatus = revocationStatusForEvent(eventType);
  if (revocationStatus) {
    const result = await handleRevocationEvent(env, eventType, event?.data?.object);
    if (!result.ok) return json({ ok: false, error: result.error }, result.httpStatus || 500);
    return json(result, 200);
  }

  if (!acceptedFulfillmentEvent(eventType)) {
    return json({ ok: true, verified: true, received: true, ignored: true, eventType }, 200);
  }

  const session = event?.data?.object;
  if (!session || typeof session !== 'object') {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  const productId = String(session?.metadata?.productId || '').trim();
  const priceTierId = String(session?.metadata?.priceTierId || '').trim();
  if (!hasValue(productId) || !hasValue(priceTierId)) {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  let productsConfig;
  try {
    productsConfig = await loadProductsConfig(request, env);
  } catch {
    return json({ ok: false, error: 'products_config_unavailable' }, 503);
  }

  const productCheck = validateConfiguredProduct(productsConfig, productId);
  if (!productCheck.ok || productCheck.product.priceTierId !== priceTierId) {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  if (!productPaymentMatchesSession(session, productCheck.product)) {
    return json({
      ok: true,
      verified: true,
      received: true,
      eventType,
      productId,
      entitlementIssued: false,
      paymentVerified: false,
      paymentPending: String(session?.payment_status || '') === 'unpaid'
    }, 200);
  }

  const checkoutSessionId = String(session?.id || '').trim();
  if (!hasValue(checkoutSessionId) || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(checkoutSessionId)) {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  const entitlementRecord = buildEntitlementRecord({
    productId,
    status: 'active',
    source: 'stripe_webhook',
    stripeCustomerId: session.customer || session.customer_id || null,
    stripeCheckoutSessionId: checkoutSessionId,
    stripePaymentIntentId: session.payment_intent || null,
    customerEmailHash: null,
    features: productCheck.product.features,
    revokedAt: null
  });

  const issued = await issueEntitlement(env, entitlementRecord);
  if (!issued.ok) {
    const status = issued.error === 'entitlement_storage_not_configured' ? 503 : 500;
    return json({ ok: false, error: issued.error || 'entitlement_issue_failed' }, status);
  }

  const response = {
    ok: true,
    verified: true,
    received: true,
    eventType,
    productId,
    entitlementIssued: true,
    paymentVerified: true,
    entitlementId: issued.entitlement?.entitlementId || entitlementRecord.entitlementId
  };

  if (issued.idempotent) response.idempotent = true;
  return json(response, 200);
}
