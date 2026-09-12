import { getActiveEntitlementByCheckoutSession } from './entitlement-store.js';
import { loadProductsConfig, validateConfiguredProduct } from './product-config.js';

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
  return typeof value === 'string' ? value.trim() : '';
}

function validateSessionId(sessionId) {
  if (!sessionId) return 'missing_session_id';
  if (!SESSION_ID_PATTERN.test(sessionId)) return 'invalid_session_id';
  return null;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const productId = normalizeQueryValue(url.searchParams.get('productId'));
  const sessionId = normalizeQueryValue(url.searchParams.get('sessionId'));

  if (!productId) {
    return json({ ok: false, error: 'missing_product_id' }, 400);
  }

  let config;
  try {
    config = await loadProductsConfig(request, env);
  } catch {
    return json({ ok: false, error: 'products_config_unavailable' }, 503);
  }

  const productCheck = validateConfiguredProduct(config, productId);
  if (!productCheck.ok) {
    const status = productCheck.error === 'unknown_product_id' ? 404 : 409;
    return json({ ok: false, error: productCheck.error }, status);
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

  const configuredFeatures = new Set(productCheck.product.features);
  const features = Array.isArray(lookup.entitlement.features)
    ? lookup.entitlement.features.filter((featureId) => configuredFeatures.has(featureId))
    : [];

  return json({
    ok: true,
    productId,
    active: true,
    state: 'pro-active',
    source: 'server',
    features,
    entitlementId: lookup.entitlement.entitlementId
  });
}
