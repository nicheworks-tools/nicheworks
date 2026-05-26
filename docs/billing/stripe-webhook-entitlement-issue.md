# Stripe Webhook Verification and D1 Entitlement Issue (LIVE-03)

## 1) Status
- Status: **OKJ-BILLING-LIVE-03**
- Runtime posture: **verified webhook parsing enabled, server-side entitlement issue enabled**
- Production payment flow: **entitlement issue only (no Pro runtime unlock yet)**

## 2) Current scope
Implemented in this phase:
- server-side `Stripe-Signature` verification using HMAC SHA-256 (Web Crypto)
- strict raw body verification path (`request.text()`)
- safe JSON parsing only after verification
- strict event filtering for `checkout.session.completed`
- metadata validation (`productId`, `priceTierId`) against `config/billing/products.json`
- D1-backed idempotent entitlement issue by `stripeCheckoutSessionId`

Not implemented in this phase:
- runtime Pro unlock wiring
- client-side entitlement activation
- localStorage-based entitlement source

## 3) Webhook route behavior
- Route: `POST /api/billing/stripe-webhook`
- Method: POST only
- Non-POST response: `method_not_allowed`

Required env:
- `STRIPE_WEBHOOK_SECRET`
- `BILLING_DB` (D1 binding)

Failure mapping:
- missing webhook secret: `webhook_secret_missing`
- missing `Stripe-Signature`: `webhook_signature_missing`
- invalid signature/timestamp: `webhook_signature_invalid`
- invalid verified JSON payload shape: `webhook_payload_invalid`
- missing D1 entitlement storage binding: `entitlement_storage_not_configured`

## 4) Security ordering
Webhook signature verification and payload validation happen before entitlement issue.
Unverified payloads are never treated as payment proof and never create entitlements.

## 5) Entitlement issue contract
Entitlement issue happens only for verified `checkout.session.completed` events with valid product metadata.

Entitlement boundary:
- **`productId`** is the entitlement boundary.
- **`priceTierId`** is validation-only (metadata consistency), not entitlement identity.

Persisted entitlement fields include:
- `entitlementId`
- `productId`
- `status` (`active`)
- `source` (`stripe_webhook`)
- `stripeCustomerId`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId`
- `customerEmailHash` (LIVE-03 default is `null`)
- `features` (from product config)
- `createdAt`
- `updatedAt`
- `revokedAt` (`null` on issue)

## 6) Idempotency
Idempotency key: `stripeCheckoutSessionId` (`stripe_checkout_session_id` unique in D1).

Behavior:
- If entitlement for checkout session already exists, webhook returns successful idempotent response.
- If insert races and unique constraint is hit, existing entitlement is fetched and returned idempotently.
- Duplicate active entitlements are not created for the same checkout session.

## 7) Response shape examples
New issue:

```json
{
  "ok": true,
  "verified": true,
  "received": true,
  "eventType": "checkout.session.completed",
  "productId": "okj.toolkit_pro",
  "entitlementIssued": true,
  "entitlementId": "..."
}
```

Idempotent duplicate:

```json
{
  "ok": true,
  "verified": true,
  "received": true,
  "eventType": "checkout.session.completed",
  "productId": "okj.toolkit_pro",
  "entitlementIssued": true,
  "idempotent": true,
  "entitlementId": "..."
}
```

Missing D1 binding:

```json
{
  "ok": false,
  "error": "entitlement_storage_not_configured"
}
```

## 8) Explicit non-goals in LIVE-03
- No changes to OKJ tool UI.
- No changes to `assets/nw-pro-entitlement.js`.
- No client-side unlock state.
- No URL/localStorage unlock path.
- Next phase is dedicated entitlement-check API for runtime gating.
