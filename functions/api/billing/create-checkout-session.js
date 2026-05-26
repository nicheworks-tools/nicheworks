function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function loadProductsConfig() {
  const configUrl = new URL('../../../config/billing/products.json', import.meta.url);
  const text = await (await fetch(configUrl)).text();
  return JSON.parse(text);
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
    config = await loadProductsConfig();
  } catch {
    return json({ ok: false, error: 'products_config_unavailable' }, 500);
  }

  const product = readProduct(config, productId);
  if (!product) return json({ ok: false, error: 'unknown_product_id' }, 404);

  const priceIdEnvName = product?.stripe?.priceIdEnv;
  const stripePriceId = priceIdEnvName ? env[priceIdEnvName] : '';
  if (!priceIdEnvName || typeof priceIdEnvName !== 'string') return json({ ok: false, error: 'missing_price_env_name' }, 500);

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/billing/success.html?session_id={CHECKOUT_SESSION_ID}&returnPath=${encodeURIComponent(returnPath)}`;
  const cancelUrl = `${origin}/billing/cancel.html?returnPath=${encodeURIComponent(returnPath)}`;

  const checkoutParams = {
    mode: 'payment',
    line_items: [{ price: stripePriceId || `env:${priceIdEnvName}`, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { productId },
    client_reference_id: returnPath
  };

  if (product?.stripe?.mode !== 'connected' || !env.STRIPE_SECRET_KEY || !stripePriceId) {
    return json({ ok: false, error: 'checkout_not_connected', message: 'P03 scaffold only. Checkout session creation is disabled.', productId, priceIdEnv: priceIdEnvName, checkoutParamsPreview: checkoutParams }, 503);
  }

  return json({ ok: false, error: 'not_implemented_in_p03' }, 501);
}
