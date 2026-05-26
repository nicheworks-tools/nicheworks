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

function parseStripeSignatureHeader(header) {
  if (!hasValue(header)) {
    return { timestamp: null, signatures: [] };
  }

  const parts = header.split(',');
  let timestamp = null;
  const signatures = [];

  for (const part of parts) {
    const [rawKey, rawValue] = part.split('=');
    const key = String(rawKey || '').trim();
    const value = String(rawValue || '').trim();

    if (!key || !value) {
      continue;
    }

    if (key === 't') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        timestamp = parsed;
      }
      continue;
    }

    if (key === 'v1') {
      signatures.push(value.toLowerCase());
    }
  }

  return { timestamp, signatures };
}

function timingSafeEqualHex(a, b) {
  if (!hasValue(a) || !hasValue(b) || a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeSignature(secret, payload) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
  return toHex(signature);
}

function withinTolerance(timestamp, now, toleranceSeconds) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(now)) {
    return false;
  }

  return Math.abs(now - timestamp) <= toleranceSeconds;
}

async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!Number.isFinite(timestamp) || signatures.length === 0) {
    return { ok: false, error: 'webhook_signature_invalid' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const toleranceSeconds = 300;
  if (!withinTolerance(timestamp, nowSeconds, toleranceSeconds)) {
    return { ok: false, error: 'webhook_signature_invalid' };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = await computeSignature(secret, signedPayload);

  const matched = signatures.some((candidate) => timingSafeEqualHex(candidate, expected));
  if (!matched) {
    return { ok: false, error: 'webhook_signature_invalid' };
  }

  return { ok: true };
}

async function loadProductsConfig(request, env) {
  try {
    const url = new URL('/config/billing/products.json', request.url);
    const assetRequest = new Request(url.toString(), { method: 'GET' });

    const response = env?.ASSETS && typeof env.ASSETS.fetch === 'function'
      ? await env.ASSETS.fetch(assetRequest)
      : await fetch(assetRequest);

    if (!response.ok) {
      throw new Error('products_config_unavailable');
    }

    const parsed = await response.json();
    if (!Array.isArray(parsed?.products) || !Array.isArray(parsed?.priceTiers)) {
      throw new Error('products_config_unavailable');
    }

    return parsed;
  } catch {
    throw new Error('products_config_unavailable');
  }
}

function productById(productsConfig, productId) {
  const list = Array.isArray(productsConfig?.products) ? productsConfig.products : [];
  return list.find((entry) => entry.productId === productId) || null;
}

function priceTierById(productsConfig, priceTierId) {
  const list = Array.isArray(productsConfig?.priceTiers) ? productsConfig.priceTiers : [];
  return list.find((entry) => entry.priceTierId === priceTierId) || null;
}

function sessionMatchesProductPrice(session, product, tier) {
  const productPrice = product?.price || {};
  return (
    Number(productPrice.amount) === Number(tier.amount)
    && String(productPrice.currency || '').toLowerCase() === String(tier.currency || '').toLowerCase()
    && String(productPrice.type || '') === String(tier.type || '')
  );
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
  if (eventType !== 'checkout.session.completed') {
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

  const product = productById(productsConfig, productId);
  const priceTier = priceTierById(productsConfig, priceTierId);
  if (!product || !priceTier) {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  if (product.priceTierId !== priceTierId || !sessionMatchesProductPrice(session, product, priceTier)) {
    return json({ ok: false, error: 'webhook_payload_invalid' }, 400);
  }

  return json({
    ok: true,
    verified: true,
    received: true,
    eventType,
    productId,
    entitlementIssued: false
  }, 200);
}
