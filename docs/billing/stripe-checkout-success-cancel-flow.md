# Stripe Checkout Success/Cancel Flow (OKJ-BILLING-LIVE-01)

Status:
- Phase: OKJ-BILLING-LIVE-01
- State: test-safe Checkout session creation implemented (server-side)
- Product: `okj.toolkit_pro`
- Entitlement issuance: not implemented in this phase
- Pro unlock: not implemented in this phase

## 1. Scope

This phase enables Stripe Checkout Session creation from `POST /api/billing/create-checkout-session` with explicit safety gates.

This phase does **not**:
- issue entitlement,
- unlock Pro features,
- wire purchase buttons in OKJ tool UI,
- enable live sales by default.

## 2. Route behavior summary

Checkout route:
- `POST /api/billing/create-checkout-session`

Request body:

```json
{
  "productId": "okj.toolkit_pro",
  "returnPath": "/tools/old-kanji-ocr-scanner/"
}
```

Validation:
- only known `productId`
- `productId` must be `okj.toolkit_pro`
- product must match `priceTierId: nw.one_time.usd_499`
- product `price.amount` must remain `4.99`
- `returnPath` must be safe internal path (`/`, no `//`, no `://`)

## 3. Environment variables (server-side only)

Required runtime env vars:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_OKJ_TOOLKIT_PRO`
- `OKJ_STRIPE_TEST_CHECKOUT_ENABLED`
- `OKJ_LIVE_CHECKOUT_ENABLED`

Optional origin override:
- `BILLING_BASE_ORIGIN` (if valid `http/https`, used for success/cancel absolute URLs)

Security constraints:
- never expose `STRIPE_SECRET_KEY` to frontend.
- never commit real Stripe secrets.
- never commit real Stripe price IDs.

## 4. Test-safe gate rules

If `STRIPE_SECRET_KEY` starts with `sk_test_`:
- checkout is allowed only when `OKJ_STRIPE_TEST_CHECKOUT_ENABLED === "true"`
- otherwise response:

```json
{
  "ok": false,
  "error": "test_checkout_not_enabled"
}
```

If `STRIPE_SECRET_KEY` starts with `sk_live_`:
- checkout is rejected unless `OKJ_LIVE_CHECKOUT_ENABLED === "true"`
- default live behavior remains blocked
- blocked response:

```json
{
  "ok": false,
  "error": "live_checkout_blocked_until_entitlement"
}
```

## 5. Stripe Checkout Session creation

Server calls Stripe Checkout Sessions API with:
- `mode=payment`
- `line_items[0][price]=STRIPE_PRICE_OKJ_TOOLKIT_PRO`
- `line_items[0][quantity]=1`
- `success_url=/billing/success.html?session_id={CHECKOUT_SESSION_ID}` (absolute origin)
- `cancel_url=/billing/cancel.html` (absolute origin)
- metadata:
  - `productId=okj.toolkit_pro`
  - `priceTierId=nw.one_time.usd_499`

`priceTierId` is pricing metadata validation only.
It is **not** entitlement scope.

## 6. Response shape and redaction

Allowed response keys:
- `ok`
- `sessionId`
- `url`
- `productId`
- `mode`

Never return:
- secret key
- webhook secret
- raw env dump
- raw Stripe price ID
- internal stack traces

## 7. Success/cancel pages remain non-authoritative

`/billing/success.html` remains informational only:
- payment may have completed,
- Pro access is not activated by URL alone,
- entitlement verification is required.

`/billing/cancel.html` remains informational only:
- checkout canceled/not completed,
- no Pro access granted.

## 8. Current boundary and next step

Still not implemented:
- webhook signature verification
- durable entitlement issuance
- runtime Pro unlock from verified entitlement

Next step is webhook verification and entitlement issue path.
