# Stripe Checkout Success/Cancel Flow

Status:
- Product-scoped Checkout Session creation implemented server-side.
- Product definitions come from `config/billing/products.json`.
- `okj.toolkit_pro` remains the only configured product at the time of this update.
- No unverified product, price, or Stripe Price ID is added by the common-foundation hardening work.

## Checkout route

- `POST /api/billing/create-checkout-session`

Request:

```json
{
  "productId": "okj.toolkit_pro",
  "returnPath": "/tools/old-kanji-ocr-scanner/"
}
```

The route:

1. loads the product registry;
2. requires a known product;
3. requires the product price metadata to match its referenced `priceTierId`;
4. resolves the Stripe Price ID only from the product's configured environment-variable name;
5. requires a safe internal `returnPath`;
6. creates a one-time Stripe Checkout Session.

The runtime no longer hardcodes one acceptable product ID in the route. Adding a future product still requires an explicit registry entry and a real server-side Stripe price environment value.

## Environment gates

Required:

- `STRIPE_SECRET_KEY`
- the product-specific price environment variable, currently `STRIPE_PRICE_OKJ_TOOLKIT_PRO`

Generic enable flags:

- `BILLING_TEST_CHECKOUT_ENABLED=true`
- `BILLING_LIVE_CHECKOUT_ENABLED=true`

Backward-compatible OKJ aliases remain accepted for the existing product:

- `OKJ_STRIPE_TEST_CHECKOUT_ENABLED=true`
- `OKJ_LIVE_CHECKOUT_ENABLED=true`

Live checkout remains fail-closed unless an enable flag is explicitly present.

## Stripe Session fields

The server creates Checkout with:

- `mode=payment`
- one line item using the configured Stripe Price ID
- quantity `1`
- metadata `productId`
- metadata `priceTierId`

Success URL includes:

- `product_id`
- validated `return_path`
- `{CHECKOUT_SESSION_ID}` as `session_id`

Cancel URL includes:

- `product_id`
- validated `return_path`

The redirect does not grant access. The success page asks the server entitlement API to verify the matching product/session record.

## Success page authority

`/billing/success.html` can display active access only after `/api/billing/entitlement` returns an active server-side entitlement for the matching product and Checkout Session ID.

A URL parameter alone is never treated as payment proof.

## Cancel page

`/billing/cancel.html` grants nothing. It only provides a safe return link to the validated original tool path.

## Privacy / security

- Stripe secrets and real Price IDs stay server-side.
- Tool content is never placed into Checkout metadata.
- Checkout Session IDs are not emitted as GA4 event parameters by these pages.
- Product-level entitlement scope is distinct from reusable price tiers.
