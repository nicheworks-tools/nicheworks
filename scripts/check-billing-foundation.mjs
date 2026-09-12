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

const checkout = read('functions/api/billing/create-checkout-session.js');
const webhook = read('functions/api/billing/stripe-webhook.js');
const entitlement = read('functions/api/billing/entitlement.js');
const adapter = read('assets/nw-pro-entitlement.js');
const success = read('billing/success.html');
const config = read('config/billing/products.json');

requireText(checkout, "validateConfiguredProduct", 'checkout');
requireText(checkout, "product_id", 'checkout');
requireText(checkout, "return_path", 'checkout');
requireText(checkout, "BILLING_LIVE_CHECKOUT_ENABLED", 'checkout');
forbidText(checkout, "product?.productId === 'okj.toolkit_pro'", 'checkout');

requireText(webhook, "checkout.session.completed", 'webhook');
requireText(webhook, "checkout.session.async_payment_succeeded", 'webhook');
requireText(webhook, "productPaymentMatchesSession", 'webhook');
requireText(webhook, "entitlementIssued: false", 'webhook');
requireText(webhook, "paymentPending", 'webhook');

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

requireText(config, '"productId": "okj.toolkit_pro"', 'product registry');
requireText(config, '"amount": 4.99', 'product registry');

if (!process.exitCode) {
  console.log('billing-foundation: contract checks passed');
}
