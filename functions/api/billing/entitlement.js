import { getActiveEntitlementByCheckoutSession } from './entitlement-store.js';

const SUPPORTED_PRODUCT_ID = 'okj.toolkit_pro';
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function normalizeQueryValue(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function validateProductId(productId) {
  if (!productId) {
    return 'missing_product_id';
  }

  if (productId !== SUPPORTED_PRODUCT_ID) {
    return 'unknown_product_id';
  }

  return null;
}

function validateSessionId(sessionId) {
  if (!sessionId) {
    return 'missing_session_id';
  }

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return 'invalid_session_id';
  }

  return null;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const productId = normalizeQueryValue(url.searchParams.get('productId'));
  const sessionId = normalizeQueryValue(url.searchParams.get('sessionId'));

  const productError = validateProductId(productId);
  if (productError) {
    return json({ ok: false, error: productError }, 400);
  }

  const sessionError = validateSessionId(sessionId);
  if (sessionError) {
    return json({ ok: false, error: sessionError }, 400);
  }

  const lookup = await getActiveEntitlementByCheckoutSession(env, { productId, sessionId });
  if (!lookup.ok) {
    const status = lookup.error === 'entitlement_storage_not_configured' ? 503 : 500;
    return json({ ok: false, error: lookup.error || 'entitlement_lookup_failed' }, status);
  }

  if (!lookup.found || !lookup.entitlement) {
    return json({
      ok: true,
      productId,
      active: false,
      state: 'restore-required',
      source: 'server',
      features: []
    });
  }

  return json({
    ok: true,
    productId,
    active: true,
    state: 'pro-active',
    source: 'server',
    features: lookup.entitlement.features,
    entitlementId: lookup.entitlement.entitlementId
  });
}
