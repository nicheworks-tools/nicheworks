import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onRequestPost } from '../../../functions/api/billing/create-checkout-session.js';
import { validateConfiguredProduct } from '../../../functions/api/billing/product-config.js';

const ROOT = new URL('../../../', import.meta.url);
const config = JSON.parse(readFileSync(new URL('config/billing/products.json', ROOT), 'utf8'));
const freePage = readFileSync(new URL('tools/csv-tidy/index.html', ROOT), 'utf8');
const proId = 'csv_tidy.pro_v1';
const pro = config.products.find(product => product.productId === proId);
let checked = 0;

function pass(message) { checked++; process.stdout.write('PASS ' + message + '\n'); }

assert.equal(config.status, 'planning');
assert.ok(pro, 'CSV Tidy product must be registered');
assert.equal(pro.price.type, 'one_time');
assert.equal(pro.price.amount, 1980);
assert.equal(pro.price.currency, 'JPY');
assert.equal(pro.stripe.mode, 'not_connected');
assert.equal(pro.checkout.enabled, false);
assert.equal(pro.ui.state, 'billing-unavailable');
assert.ok(pro.features.includes('csvTidy.savedPresets'));
assert.ok(pro.features.includes('csvTidy.batchApply'));
assert.ok(pro.features.includes('csvTidy.batchReport'));
const validation = validateConfiguredProduct(config, proId);
assert.equal(validation.ok, true, JSON.stringify(validation));
assert.equal(validation.product.priceTierId, 'nw.one_time.jpy_1980');
pass('planning-only product and price tier are internally valid');

assert.ok(!freePage.includes('CSV Tidy Pro'), 'No public Pro CTA before implemented feature and payment acceptance');
assert.ok(!freePage.includes('¥1,980'), 'No advertised purchase price on current Free page');
pass('current Free page does not advertise an unpurchasable product');

const originalFetch = globalThis.fetch;
let outboundCalls = 0;
globalThis.fetch = async () => {
  outboundCalls++;
  throw new Error('UNEXPECTED_OUTBOUND_NETWORK');
};

async function checkout({ productId, envOverrides = {} }) {
  const request = new Request('https://nicheworks.app/api/billing/create-checkout-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productId, returnPath: '/tools/csv-tidy/' })
  });
  const env = {
    ASSETS: {
      fetch: async assetRequest => {
        assert.equal(new URL(assetRequest.url).pathname, '/config/billing/products.json');
        return new Response(JSON.stringify(config), { status: 200, headers: { 'content-type': 'application/json' } });
      }
    },
    STRIPE_SECRET_KEY: 'sk_live_mocknotreal',
    STRIPE_PRICE_CSV_TIDY_PRO: 'price_mocknotreal',
    BILLING_LIVE_CHECKOUT_ENABLED: 'true',
    BILLING_TEST_CHECKOUT_ENABLED: 'true',
    ...envOverrides
  };
  const result = await onRequestPost({ request, env });
  return { status: result.status, payload: await result.json() };
}
try {
  for (const secret of ['sk_live_mocknotreal','sk_test_mocknotreal']) {
    const result = await checkout({
      productId: proId,
      envOverrides: { STRIPE_SECRET_KEY: secret }
    });
    assert.equal(result.status, 403);
    assert.deepEqual(result.payload, { ok: false, error: 'product_checkout_disabled' });
  }
  assert.equal(outboundCalls, 0);
  pass('live/test global Stripe enable flags cannot bypass CSV Tidy product gate');

  const noCredentials = await checkout({
    productId: proId,
    envOverrides: {
      STRIPE_SECRET_KEY: '',
      STRIPE_PRICE_CSV_TIDY_PRO: ''
    }
  });
  assert.equal(noCredentials.status, 403);
  assert.equal(noCredentials.payload.error, 'product_checkout_disabled');
  assert.equal(outboundCalls, 0);
  pass('product gate runs before Stripe credentials and pricing checks');

  const legacyProduct = config.products.find(product => product.productId === 'reconcile.pro_v1');
  assert.ok(legacyProduct && !('checkout' in legacyProduct));
  const previousRoute = await checkout({
    productId: legacyProduct.productId,
    envOverrides: {
      STRIPE_SECRET_KEY: '',
      STRIPE_PRICE_RECONCILE_PRO: 'price_mocknotreal'
    }
  });
  assert.equal(previousRoute.status, 503);
  assert.equal(previousRoute.payload.error, 'stripe_secret_key_missing');
  assert.equal(outboundCalls, 0);
  pass('existing products lacking optional checkout flag retain legacy behavior');

  const unknown = await checkout({ productId: 'csv_tidy.not_a_product' });
  assert.equal(unknown.status, 404);
  assert.equal(unknown.payload.error, 'unknown_product_id');
  assert.equal(outboundCalls, 0);
  pass('unknown product rejects before any Stripe call');
} finally {
  globalThis.fetch = originalFetch;
}
console.log('CSV Tidy Pro product contract: ' + checked + ' PASS / 0 FAIL');
