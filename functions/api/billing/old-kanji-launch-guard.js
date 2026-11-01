// Shared Old Kanji sale-readiness check. Never expose secrets or personal/tool content.
export async function oldKanjiLiveReady(config, product, env) {
  if (config?.status !== 'active' ||
      product?.productId !== 'okj.toolkit_pro' ||
      product?.stripe?.mode !== 'connected' ||
      env?.OKJ_TOOLKIT_PRO_LAUNCH_APPROVED !== 'true') return false;
  if (env.BILLING_LIVE_CHECKOUT_ENABLED !== 'true' && env.OKJ_LIVE_CHECKOUT_ENABLED !== 'true') return false;
  if (typeof env.STRIPE_SECRET_KEY !== 'string' || !env.STRIPE_SECRET_KEY.startsWith('sk_live_')) return false;
  if (typeof env.STRIPE_WEBHOOK_SECRET !== 'string' || !env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) return false;
  const priceId = env[product.stripe.priceIdEnv];
  if (typeof priceId !== 'string' || !/^price_[A-Za-z0-9]+$/.test(priceId)) return false;
  if (typeof env.BILLING_DB?.prepare !== 'function') return false;
  try {
    // Ensure the migrations ran and the D1 binding can actually read entitlements.
    await env.BILLING_DB.prepare('SELECT entitlement_id FROM billing_entitlements LIMIT 1').first();
    await env.BILLING_DB.prepare('SELECT stripe_payment_intent_id FROM billing_payment_revocations LIMIT 1').first();
    return true;
  } catch {
    return false;
  }
}
