const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA',
  'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
]);

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizedCurrency(value) {
  return String(value || '').trim().toUpperCase();
}

function expectedMinorAmount(product) {
  const currency = normalizedCurrency(product?.price?.currency);
  const amount = Number(product?.price?.amount);
  if (!currency || !Number.isFinite(amount) || amount < 0) return null;
  const factor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
  return Math.round(amount * factor);
}

export async function loadProductsConfig(request, env) {
  const url = new URL('/config/billing/products.json', request.url);
  const assetRequest = new Request(url.toString(), { method: 'GET' });

  const response = env?.ASSETS && typeof env.ASSETS.fetch === 'function'
    ? await env.ASSETS.fetch(assetRequest)
    : await fetch(assetRequest);

  if (!response.ok) throw new Error('products_config_unavailable');

  let config;
  try {
    config = await response.json();
  } catch {
    throw new Error('products_config_unavailable');
  }

  if (!Array.isArray(config?.products) || !Array.isArray(config?.priceTiers)) {
    throw new Error('products_config_unavailable');
  }

  return config;
}

export function getProduct(config, productId) {
  const products = Array.isArray(config?.products) ? config.products : [];
  return products.find((item) => item?.productId === productId) || null;
}

export function getPriceTier(config, priceTierId) {
  const tiers = Array.isArray(config?.priceTiers) ? config.priceTiers : [];
  return tiers.find((item) => item?.priceTierId === priceTierId) || null;
}

export function validateConfiguredProduct(config, productId) {
  if (!hasText(productId)) {
    return { ok: false, error: 'missing_product_id' };
  }

  const product = getProduct(config, productId);
  if (!product) {
    return { ok: false, error: 'unknown_product_id' };
  }

  const tier = getPriceTier(config, product.priceTierId);
  if (!tier) {
    return { ok: false, error: 'product_config_mismatch' };
  }

  const price = product.price || {};
  const stripe = product.stripe || {};
  const amount = Number(price.amount);
  const tierAmount = Number(tier.amount);
  const priceType = String(price.type || '');
  const tierType = String(tier.type || '');
  const currency = normalizedCurrency(price.currency);
  const tierCurrency = normalizedCurrency(tier.currency);

  if (
    !Number.isFinite(amount)
    || amount < 0
    || !Number.isFinite(tierAmount)
    || amount !== tierAmount
    || !currency
    || currency !== tierCurrency
    || !priceType
    || priceType !== tierType
    || priceType !== 'one_time'
    || !hasText(stripe.priceIdEnv)
    || !/^[A-Z][A-Z0-9_]*$/.test(stripe.priceIdEnv)
    || !Array.isArray(product.features)
    || product.features.some((featureId) => !hasText(featureId))
  ) {
    return { ok: false, error: 'product_config_mismatch' };
  }

  return { ok: true, product, tier };
}

export function productPaymentMatchesSession(session, product) {
  const expectedCurrency = normalizedCurrency(product?.price?.currency).toLowerCase();
  const actualCurrency = normalizedCurrency(session?.currency).toLowerCase();
  if (!actualCurrency || !expectedCurrency || actualCurrency !== expectedCurrency) return false;

  const expectedAmount = expectedMinorAmount(product);
  const actualAmount = Number(session?.amount_total);
  if (!Number.isInteger(expectedAmount) || !Number.isInteger(actualAmount) || actualAmount !== expectedAmount) {
    return false;
  }

  const paymentStatus = String(session?.payment_status || '').trim();
  return paymentStatus === 'paid' || paymentStatus === 'no_payment_required';
}
