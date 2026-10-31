import { getProduct, loadProductsConfig, validateConfiguredProduct } from './product-config.js';
import { oldKanjiLiveReady } from './old-kanji-launch-guard.js';

function json(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function onRequestGet({ request, env }) {
  const productId = new URL(request.url).searchParams.get('productId') || '';
  // Phase 1 sale availability is explicitly scoped to Old Kanji only.
  if (productId !== 'okj.toolkit_pro') return json({ productId, available: false });
  try {
    const config = await loadProductsConfig(request, env);
    const product = getProduct(config, productId);
    if (!product) return json({ productId, available: false });
    const checked = validateConfiguredProduct(config, productId);
    if (!checked.ok || !(await oldKanjiLiveReady(config, product, env))) {
      return json({ productId, available: false });
    }
    return json({
      productId,
      available: true,
      displayName: product.displayName,
      price: { amount: product.price.amount, currency: product.price.currency, type: product.price.type }
    });
  } catch {
    return json({ productId, available: false });
  }
}
