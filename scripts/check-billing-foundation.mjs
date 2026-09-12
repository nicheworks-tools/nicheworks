import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`billing-foundation: ${message}`);
  process.exitCode = 1;
};
const requireText = (source, text, label) => {
  if (!source.includes(text)) fail(`${label} missing ${JSON.stringify(text)}`);
};
const forbidText = (source, text, label) => {
  if (source.includes(text)) fail(`${label} must not contain ${JSON.stringify(text)}`);
};
const requireEqual = (actual, expected, label) => {
  if (actual !== expected) fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};
const requireArrayEqual = (actual, expected, label) => {
  const a = Array.isArray(actual) ? [...actual].sort() : actual;
  const b = [...expected].sort();
  if (!Array.isArray(a) || JSON.stringify(a) !== JSON.stringify(b)) {
    fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

const checkout = read('functions/api/billing/create-checkout-session.js');
const webhook = read('functions/api/billing/stripe-webhook.js');
const entitlement = read('functions/api/billing/entitlement.js');
const entitlementStore = read('functions/api/billing/entitlement-store.js');
const productConfig = read('functions/api/billing/product-config.js');
const adapter = read('assets/nw-pro-entitlement.js');
const success = read('billing/success.html');
const configSource = read('config/billing/products.json');
const config = JSON.parse(configSource);

requireText(checkout, "validateConfiguredProduct", 'checkout');
requireText(checkout, "product_id", 'checkout');
requireText(checkout, "return_path", 'checkout');
requireText(checkout, "BILLING_LIVE_CHECKOUT_ENABLED", 'checkout');
forbidText(checkout, "product?.productId === 'okj.toolkit_pro'", 'checkout');

requireText(productConfig, 'session?.amount_total', 'product config');
requireText(productConfig, 'ZERO_DECIMAL_CURRENCIES', 'product config');
requireText(productConfig, "'JPY'", 'product config');

requireText(webhook, "checkout.session.completed", 'webhook');
requireText(webhook, "checkout.session.async_payment_succeeded", 'webhook');
requireText(webhook, "charge.refunded", 'webhook');
requireText(webhook, "charge.dispute.created", 'webhook');
requireText(webhook, "productPaymentMatchesSession", 'webhook');
requireText(webhook, "entitlementIssued: false", 'webhook');
requireText(webhook, "paymentVerified: false", 'webhook');
requireText(webhook, "paymentPending", 'webhook');
requireText(webhook, "updateEntitlementStatusByPaymentIntent", 'webhook');

requireText(entitlementStore, "WHERE stripe_payment_intent_id = ?", 'entitlement store');
requireText(entitlementStore, "AND status = 'active'", 'entitlement store');
requireText(entitlementStore, "['refunded', 'disputed', 'revoked']", 'entitlement store');

requireText(entitlement, "validateConfiguredProduct", 'entitlement');
forbidText(entitlement, "SUPPORTED_PRODUCT_ID", 'entitlement');
requireText(entitlement, "getActiveEntitlementByCheckoutSession", 'entitlement');

requireText(adapter, "activateFromSession", 'adapter');
requireText(adapter, "refreshProState", 'adapter');
requireText(adapter, "/api/billing/entitlement", 'adapter');
requireText(adapter, "nicheworks:billing:session:", 'adapter');
forbidText(adapter, "nicheworks:pro", 'adapter');
forbidText(adapter, "active=true", 'adapter');

requireText(success, "activateFromSession", 'success page');
requireText(success, "server confirms an active entitlement", 'success page');
forbidText(success, "Entitlement verification and grant flow will be added", 'success page');

const okj = config.products.find((product) => product.productId === 'okj.toolkit_pro');
if (!okj) fail('product registry missing okj.toolkit_pro');
requireEqual(okj?.price?.amount, 4.99, 'OKJ price must remain unchanged');
requireEqual(okj?.price?.currency, 'USD', 'OKJ currency must remain unchanged');

const reconcile = config.products.find((product) => product.productId === 'reconcile.pro_v1');
if (!reconcile) fail('product registry missing reconcile.pro_v1');
requireEqual(reconcile?.price?.amount, 3980, 'Reconcile Pro amount');
requireEqual(reconcile?.price?.currency, 'JPY', 'Reconcile Pro currency');
requireEqual(reconcile?.price?.type, 'one_time', 'Reconcile Pro price type');
requireEqual(reconcile?.priceTierId, 'nw.one_time.jpy_3980', 'Reconcile Pro price tier');
requireEqual(reconcile?.stripe?.priceIdEnv, 'STRIPE_PRICE_RECONCILE_PRO', 'Reconcile Pro Stripe price env');
requireArrayEqual(reconcile?.features, ['reconcile_pro_v1', 'nicheworks_pro'], 'Reconcile Pro grants');

const nonReconcileProducts = config.products.filter((product) => product.productId !== 'reconcile.pro_v1');
for (const product of nonReconcileProducts) {
  if (Array.isArray(product.features) && product.features.includes('reconcile_pro_v1')) {
    fail(`${product.productId} must not grant reconcile_pro_v1`);
  }
}

const jpyTier = config.priceTiers.find((tier) => tier.priceTierId === 'nw.one_time.jpy_3980');
if (!jpyTier) fail('price tier missing nw.one_time.jpy_3980');
requireEqual(jpyTier?.amount, 3980, 'Reconcile JPY tier amount');
requireEqual(jpyTier?.currency, 'JPY', 'Reconcile JPY tier currency');
requireEqual(jpyTier?.type, 'one_time', 'Reconcile JPY tier type');

if (!process.exitCode) {
  console.log('billing-foundation: contract checks passed');
}
