import products from '../../../config/billing/products.json';
import {
  buildEntitlementRecord,
  getEntitlementByCheckoutSession,
  issueEntitlement
} from './entitlement-store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function hasValue(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function productById(productId) {
  const list = Array.isArray(products?.products) ? products.products : [];
  return list.find((entry) => entry.productId === productId) || null;
}

function buildEntitlementFromSession(session, product) {
  return buildEntitlementRecord({
    productId: product.productId,
    status: 'active',
    source: 'stripe_webhook',
    stripeCustomerId: session.customer || null,
    stripeCheckoutSessionId: session.id || null,
    stripePaymentIntentId: session.payment_intent || null,
    features: Array.isArray(product.features) ? product.features : []
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed', allowed: ['POST'] }, 405);
  }

  const rawBody = await request.text();
  void rawBody;

  if (!hasValue(env?.STRIPE_WEBHOOK_SECRET)) {
    return json({ ok: false, error: 'webhook_not_configured' }, 503);
  }

  // TODO(OKJ-P04 follow-up): Connect Stripe SDK signature verification using STRIPE_WEBHOOK_SECRET.
  // Security rule: never trust unverified payload for payment proof or entitlement issuance.
  const stripeSdkConnected = false;
  if (!stripeSdkConnected) {
    return json({ ok: false, error: 'stripe_sdk_not_connected' }, 501);
  }

  // Placeholder for verified event from Stripe SDK.
  const verifiedEvent = null;
  if (!verifiedEvent) {
    return json({ ok: false, error: 'event_not_verified' }, 400);
  }

  if (verifiedEvent.type !== 'checkout.session.completed') {
    return json({ ok: true, received: true, ignored: true, eventType: verifiedEvent.type }, 200);
  }

  const session = verifiedEvent.data?.object || {};
  const productId = String(session?.metadata?.productId || '').trim();
  const product = productById(productId);
  if (!product) {
    return json({ ok: false, error: 'unknown_product' }, 400);
  }

  const existing = await getEntitlementByCheckoutSession(env, session.id || '');
  if (existing?.ok && existing.record) {
    return json({ ok: true, idempotent: true, entitlementId: existing.record.entitlementId }, 200);
  }

  const entitlement = buildEntitlementFromSession(session, product);
  const issued = await issueEntitlement(env, entitlement);
  if (!issued.ok) {
    return json({ ok: false, error: issued.error || 'entitlement_issue_failed' }, 503);
  }

  return json({ ok: true, entitlementId: entitlement.entitlementId }, 200);
}
