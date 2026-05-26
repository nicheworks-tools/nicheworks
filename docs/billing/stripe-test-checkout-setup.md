# Stripe Test Checkout Setup (OKJ-BILLING-LIVE-01)

This document explains how to enable **test-only** Checkout Session creation for OKJ.

## 1. Purpose

`/api/billing/create-checkout-session` is now capable of creating Stripe Checkout Sessions, but remains guarded:
- test mode requires explicit opt-in,
- live mode is blocked by default.

No entitlement issuance and no Pro unlock are implemented in this step.

## 2. Stripe Dashboard setup (test)

1. Open Stripe Dashboard in **test mode**.
2. Create (or confirm) a one-time USD price for OKJ Toolkit Pro.
3. Copy the test price ID (example format: `price_...`).
4. Set it as Cloudflare env var `STRIPE_PRICE_OKJ_TOOLKIT_PRO`.

Do not commit this value to git.

## 3. Cloudflare environment variables

Set these on Pages/Functions environment:

Required:
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_PRICE_OKJ_TOOLKIT_PRO=price_...` (test price)
- `OKJ_STRIPE_TEST_CHECKOUT_ENABLED=true`
- `OKJ_LIVE_CHECKOUT_ENABLED=false` (or unset)

Optional:
- `BILLING_BASE_ORIGIN=https://<your-host>`

## 4. Live safety behavior

When secret key is live (`sk_live_...`):
- route rejects checkout unless `OKJ_LIVE_CHECKOUT_ENABLED=true`
- default rejection error:

```json
{
  "ok": false,
  "error": "live_checkout_blocked_until_entitlement"
}
```

This keeps live sales blocked until webhook + entitlement + unlock are ready.

## 5. Manual API test

Request:

```http
POST /api/billing/create-checkout-session
Content-Type: application/json

{
  "productId": "okj.toolkit_pro",
  "returnPath": "/tools/old-kanji-ocr-scanner/"
}
```

Expected test behavior:
- if `OKJ_STRIPE_TEST_CHECKOUT_ENABLED != true`:
  - `{"ok":false,"error":"test_checkout_not_enabled"}`
- if enabled and env is valid:
  - `{"ok":true,"sessionId":"...","url":"...","productId":"okj.toolkit_pro","mode":"test"}`

## 6. Boundary reminder

Price tier vs entitlement:
- `priceTierId` is used for pricing validation and metadata only.
- entitlement scope remains product-specific (`productId=okj.toolkit_pro`).

Not implemented yet:
- webhook verification,
- entitlement storage,
- runtime Pro unlock.
