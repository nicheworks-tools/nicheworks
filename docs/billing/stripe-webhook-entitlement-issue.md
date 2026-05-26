# Stripe Webhook Verification and Entitlement-Issue Deferral (LIVE-02)

## 1) Status
- Status: **OKJ-BILLING-LIVE-02**
- Runtime posture: **verified webhook parsing enabled, entitlement issuing disabled**
- Production payment flow: **not active for unlock**

## 2) Current scope
Implemented in this phase:
- server-side `Stripe-Signature` verification using HMAC SHA-256 (Web Crypto)
- strict raw body verification path (`request.text()`)
- safe JSON parsing only after verification
- strict event filtering for `checkout.session.completed`
- metadata validation (`productId`, `priceTierId`) against `config/billing/products.json`

Not implemented in this phase:
- entitlement issue
- D1/KV persistence
- runtime Pro unlock wiring

## 3) Webhook route behavior
- Route: `POST /api/billing/stripe-webhook`
- Method: POST only
- Non-POST response: `method_not_allowed`

Required env:
- `STRIPE_WEBHOOK_SECRET`

Failure mapping:
- missing webhook secret: `webhook_secret_missing`
- missing `Stripe-Signature`: `webhook_signature_missing`
- invalid signature/timestamp: `webhook_signature_invalid`
- invalid verified JSON payload shape: `webhook_payload_invalid`

## 4) Signature verification details
- Raw payload is read with `request.text()`.
- Signature header must include `t=<timestamp>` and `v1=<hex-signature>`.
- Signed payload is `${timestamp}.${rawBody}`.
- Signature is verified by server HMAC SHA-256 and constant-time hex comparison.
- Verification is fail-closed and occurs before trusted JSON handling.
- A 300-second tolerance window is applied to timestamp checks.

## 5) Event handling
After successful signature verification:
- `event.type !== "checkout.session.completed"` returns ignored acknowledgement.
- `event.type === "checkout.session.completed"` requires:
  - `event.data.object` object shape
  - `session.metadata.productId === "okj.toolkit_pro"` path validation via products config
  - `session.metadata.priceTierId === "nw.one_time.usd_499"` path validation via products config
  - consistency check between product price metadata and referenced price tier metadata

Successful verified ack for accepted completed event:
- returns `ok: true`, `verified: true`, `received: true`, `eventType`, `productId`, and `entitlementIssued: false`

## 6) Product config validation rules
- Product source: `config/billing/products.json`
- Cloudflare Pages Functions-compatible loading:
  - prefer `env.ASSETS.fetch()`
  - fallback `fetch`
- Validation checks:
  - product exists by `productId`
  - price tier exists by `priceTierId`
  - product's declared `priceTierId` matches metadata `priceTierId`
  - product price metadata and tier metadata are consistent (`amount`, `currency`, `type`)

`priceTierId` is used for validation/metadata consistency only, not as entitlement boundary.

## 7) Security and deferral guardrails
- Unverified body is never treated as payment proof.
- No entitlement issue function is called.
- No D1/KV write path is introduced.
- No Pro unlock or runtime gating change is introduced.
- No secret values are logged or returned.

## 8) Next phase handoff
Next step (LIVE-03):
- implement storage-backed idempotent entitlement issue (D1/KV)
- add server-side entitlement read surface for runtime gating
- preserve verified webhook-first security ordering
