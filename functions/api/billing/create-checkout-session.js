function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function loadProductsConfig(request, env) {
  const url = new URL('/config/billing/products.json', request.url);
  const assetRequest = new Request(url.toString(), { method: 'GET' });

  const response = env?.ASSETS && typeof env.ASSETS.fetch === 'function'
    ? await env.ASSETS.fetch(assetRequest)
    : await fetch(assetRequest);

  if (!response.ok) throw new Error('products_config_unavailable');

  try {
    return await response.json();
  } catch {
    throw new Error('products_config_unavailable');
  }
}

function readProduct(config, productId) {
  const products = Array.isArray(config?.products) ? config.products : [];
  return products.find((item) => item?.productId === productId) || null;
}

function isSafeReturnPath(returnPath) {
  if (typeof returnPath !== 'string') return false;
  if (!returnPath.startsWith('/')) return false;
  if (returnPath.startsWith('//')) return false;
  if (returnPath.includes('://')) return false;
  return returnPath.length <= 512;
}

function isExpectedProductShape(product) {
  return (
    product?.productId === 'okj.toolkit_pro'
    && product?.priceTierId === 'nw.one_time.usd_499'
    && product?.price?.amount === 4.99
    && product?.price?.currency === 'USD'
    && product?.price?.type === 'one_time'
    && product?.stripe?.priceIdEnv === 'STRIPE_PRICE_OKJ_TOOLKIT_PRO'
  );
}

function buildOrigin(request, env) {
  const configured = typeof env?.BILLING_BASE_ORIGIN === 'string' ? env.BILLING_BASE_ORIGIN.trim() : '';
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.origin;
    } catch {
      // ignore invalid configured origin
    }
  }

  const requestUrl = new URL(request.url);
  return requestUrl.origin;
}

function evaluateCheckoutGate(secretKey, env) {
  if (typeof secretKey !== 'string' || !secretKey) return { ok: false, error: 'stripe_secret_key_missing', status: 503 };

  if (secretKey.startsWith('sk_test_')) {
    if (env.OKJ_STRIPE_TEST_CHECKOUT_ENABLED !== 'true') {
      return { ok: false, error: 'test_checkout_not_enabled', status: 403 };
    }
    return { ok: true, mode: 'test' };
  }

  if (secretKey.startsWith('sk_live_')) {
    if (env.OKJ_LIVE_CHECKOUT_ENABLED !== 'true') {
      return { ok: false, error: 'live_checkout_blocked_until_entitlement', status: 403 };
    }
    return { ok: true, mode: 'live' };
  }

  return { ok: false, error: 'stripe_secret_key_invalid', status: 503 };
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

  const productId = body?.productId;
  const returnPath = body?.returnPath;

  if (!productId || typeof productId !== 'string') return json({ ok: false, error: 'missing_product_id' }, 400);
  if (!isSafeReturnPath(returnPath)) return json({ ok: false, error: 'invalid_return_path' }, 400);

  let config;
  try {
    config = await loadProductsConfig(request, env);
  } catch {
    return json({ ok: false, error: 'products_config_unavailable' }, 500);
  }

  const product = readProduct(config, productId);
  if (!product) return json({ ok: false, error: 'unknown_product_id' }, 404);
  if (!isExpectedProductShape(product)) return json({ ok: false, error: 'product_config_mismatch' }, 409);

  const priceIdEnvName = product?.stripe?.priceIdEnv;
  const stripePriceId = typeof priceIdEnvName === 'string' ? env[priceIdEnvName] : '';
  if (!priceIdEnvName || typeof priceIdEnvName !== 'string') return json({ ok: false, error: 'missing_price_env_name' }, 500);
  if (!stripePriceId || typeof stripePriceId !== 'string') return json({ ok: false, error: 'missing_stripe_price_id' }, 503);

  const gate = evaluateCheckoutGate(env.STRIPE_SECRET_KEY, env);
  if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

  const origin = buildOrigin(request, env);
  const successUrl = `${origin}/billing/success.html?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/billing/cancel.html`;

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

  return json({ ok: true, sessionId: stripeResult.sessionId, url: stripeResult.url, productId: product.productId, mode: gate.mode }, 200);
}
