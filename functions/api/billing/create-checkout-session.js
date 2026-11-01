import { expectedMinorAmount, getProduct, loadProductsConfig, validateConfiguredProduct } from './product-config.js';
import { oldKanjiLiveReady } from './old-kanji-launch-guard.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function isSafeReturnPath(returnPath) {
  if (typeof returnPath !== 'string') return false;
  if (!returnPath.startsWith('/')) return false;
  if (returnPath.startsWith('//')) return false;
  if (returnPath.includes('://')) return false;
  return returnPath.length <= 512;
}

function buildOrigin(request, env) {
  const configured = typeof env?.BILLING_BASE_ORIGIN === 'string' ? env.BILLING_BASE_ORIGIN.trim() : '';
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.origin;
    } catch {
      // Ignore invalid configured origin and use the request origin.
    }
  }

  return new URL(request.url).origin;
}

function enabledFlag(env, productId, mode) {
  const commonFlag = mode === 'test' ? env.BILLING_TEST_CHECKOUT_ENABLED : env.BILLING_LIVE_CHECKOUT_ENABLED;
  if (commonFlag === 'true') return true;

  // Backward compatibility for the existing OKJ rollout controls.
  if (productId === 'okj.toolkit_pro') {
    const okjFlag = mode === 'test' ? env.OKJ_STRIPE_TEST_CHECKOUT_ENABLED : env.OKJ_LIVE_CHECKOUT_ENABLED;
    return okjFlag === 'true';
  }

  return false;
}

function evaluateCheckoutGate(secretKey, env, productId) {
  if (typeof secretKey !== 'string' || !secretKey) {
    return { ok: false, error: 'stripe_secret_key_missing', status: 503 };
  }

  if (secretKey.startsWith('sk_test_')) {
    if (!enabledFlag(env, productId, 'test')) {
      return { ok: false, error: 'test_checkout_not_enabled', status: 403 };
    }
    return { ok: true, mode: 'test' };
  }

  if (secretKey.startsWith('sk_live_')) {
    if (!enabledFlag(env, productId, 'live')) {
      return { ok: false, error: 'live_checkout_not_enabled', status: 403 };
    }
    return { ok: true, mode: 'live' };
  }

  return { ok: false, error: 'stripe_secret_key_invalid', status: 503 };
}

async function verifyStripePrice(secretKey, priceId, product, mode) {
  // Prevent charging a Stripe amount/currency different from the approved public product contract.
  let response, data;
  try {
    response = await fetch('https://api.stripe.com/v1/prices/' + encodeURIComponent(priceId), {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + secretKey }
    });
    data = await response.json();
  } catch {
    return false;
  }
  return Boolean(
    response.ok && data?.active === true &&
    data?.type === 'one_time' && data?.recurring == null &&
    data?.livemode === (mode === 'live') &&
    data?.currency === String(product?.price?.currency || '').toLowerCase() &&
    Number.isInteger(data?.unit_amount) &&
    data.unit_amount === expectedMinorAmount(product)
  );
}

async function createStripeCheckoutSession({ secretKey, priceId, successUrl, cancelUrl, metadata }) {
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('line_items[0][price]', priceId);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', successUrl);
  params.set('cancel_url', cancelUrl);
  params.set('metadata[productId]', metadata.productId);
  params.set('metadata[priceTierId]', metadata.priceTierId);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const status = response.status >= 400 && response.status < 600 ? response.status : 502;
    const errorCode = typeof payload?.error?.code === 'string' ? payload.error.code : 'stripe_checkout_create_failed';
    return { ok: false, status, error: errorCode };
  }

  if (typeof payload?.id !== 'string' || typeof payload?.url !== 'string') {
    return { ok: false, status: 502, error: 'stripe_checkout_create_failed' };
  }

  return { ok: true, sessionId: payload.id, url: payload.url };
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  const productId = typeof body?.productId === 'string' ? body.productId.trim() : '';
  const returnPath = body?.returnPath;

  if (!productId) return json({ ok: false, error: 'missing_product_id' }, 400);
  if (!isSafeReturnPath(returnPath)) return json({ ok: false, error: 'invalid_return_path' }, 400);

  let config;
  try {
    config = await loadProductsConfig(request, env);
  } catch {
    return json({ ok: false, error: 'products_config_unavailable' }, 503);
  }

  // The catalog can contain unpriced planning products. Check the explicit launch
  // gates BEFORE price validation, so all such products fail closed consistently.
  const listedProduct = getProduct(config, productId);
  if (!listedProduct) {
    return json({ ok: false, error: 'unknown_product_id' }, 404);
  }
  // Preserve product-specific launch switches added for CSV Tidy and future products.
  if (listedProduct.checkout && listedProduct.checkout.enabled !== true) {
    return json({ ok: false, error: 'product_checkout_disabled' }, 403);
  }
  // Studio is a separately priced product: require explicit registry activation
  // before global billing flags or Stripe credentials can authorize checkout.
  if (listedProduct.productId === 'motion_atlas.studio_v1' &&
      (config.status !== 'active' || listedProduct.stripe?.mode !== 'connected')) {
    return json({ ok: false, error: 'product_not_on_sale' }, 409);
  }
  // Keep earlier non-OKJ products' error handling stable; only Old Kanji is
  // subject to this new unpriced-product launch boundary.
  if (listedProduct.productId === 'okj.toolkit_pro' &&
      (config.status !== 'active' || listedProduct.stripe?.mode !== 'connected')) {
    return json({ ok: false, error: 'product_not_on_sale' }, 409);
  }

  const productCheck = validateConfiguredProduct(config, productId);
  if (!productCheck.ok) {
    return json({ ok: false, error: productCheck.error }, 409);
  }
  const { product } = productCheck;
  // An explicitly configured product-level checkout gate is fail-closed.
  // Existing products without checkout settings preserve their legacy behavior.
  // This check runs before reading price credentials or contacting Stripe.
  if (product.checkout && product.checkout.enabled !== true) {
    return json({ ok: false, error: 'product_checkout_disabled' }, 403);
  }
  const priceIdEnvName = product.stripe.priceIdEnv;
  const stripePriceId = env[priceIdEnvName];
  if (typeof stripePriceId !== 'string' || !stripePriceId) {
    return json({ ok: false, error: 'missing_stripe_price_id' }, 503);
  }

  const gate = evaluateCheckoutGate(env.STRIPE_SECRET_KEY, env, product.productId);
  if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);
  if (product.productId === 'okj.toolkit_pro' && gate.mode === 'live') {
    if (!(await oldKanjiLiveReady(config, product, env))) {
      return json({ ok: false, error: 'product_not_on_sale' }, 409);
    }
  }
  if (!(await verifyStripePrice(env.STRIPE_SECRET_KEY, stripePriceId, product, gate.mode))) {
    return json({ ok: false, error: 'stripe_price_mismatch_or_unavailable' }, 503);
  }

  const origin = buildOrigin(request, env);
  const query = new URLSearchParams({
    product_id: product.productId,
    return_path: returnPath
  });
  const successUrl = `${origin}/billing/success.html?${query.toString()}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/billing/cancel.html?${query.toString()}`;

  const stripeResult = await createStripeCheckoutSession({
    secretKey: env.STRIPE_SECRET_KEY,
    priceId: stripePriceId,
    successUrl,
    cancelUrl,
    metadata: {
      productId: product.productId,
      priceTierId: product.priceTierId
    }
  });

  if (!stripeResult.ok) return json({ ok: false, error: stripeResult.error }, stripeResult.status);

  return json({
    ok: true,
    sessionId: stripeResult.sessionId,
    url: stripeResult.url,
    productId: product.productId,
    mode: gate.mode
  });
}
