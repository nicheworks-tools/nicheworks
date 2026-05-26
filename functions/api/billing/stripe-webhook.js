function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function envPresence(env) {
  return {
    STRIPE_SECRET_KEY: hasValue(env?.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: hasValue(env?.STRIPE_WEBHOOK_SECRET),
    STRIPE_PRICE_OKJ_TOOLKIT_PRO: hasValue(env?.STRIPE_PRICE_OKJ_TOOLKIT_PRO)
  };
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed', allowed: ['POST'] }, 405);
  }

  return json({
    ok: false,
    error: 'webhook_not_connected',
    message: 'OKJ-P04-A scaffold only. Stripe webhook verification and entitlement issuing are disabled.',
    route: '/api/billing/stripe-webhook',
    envPresence: envPresence(env),
    safeguards: {
      parseTrustedPaymentData: false,
      issueEntitlement: false,
      writeStorage: false,
      unlockPro: false
    }
  }, 503);
}
