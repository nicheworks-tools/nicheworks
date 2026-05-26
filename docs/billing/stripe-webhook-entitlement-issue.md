# Stripe Webhook and Entitlement Issue Scaffold (P04 Safe-Disabled)

## 1) Status
- Status: **OKJ-P04-SAFE-FIX**
- Base context: PR #461 merged, then stabilized by this safe-fix patch
- Runtime posture: **safe-disabled scaffold only**
- Production payment flow: **not active**

## 2) Stripe work deferred note
Stripe setup and real payment/entitlement operation are intentionally deferred.
This document exists to preserve future replacement points without enabling live Stripe behavior.

## 3) Scope of current scaffold
Current scaffold only provides:
- webhook route shape
- raw body read point for future signature verification
- future event branching points
- non-writing entitlement-store contract helpers

Current scaffold does **not** provide:
- real Stripe SDK verification
- real entitlement issuance
- real Pro unlock
- real D1/KV persistence

## 4) Webhook route
- Route: `POST /api/billing/stripe-webhook`
- Method: POST only
- Non-POST response: `method_not_allowed`
- Safe-disabled guard when secret missing: `webhook_not_configured`
- Safe-disabled guard when Stripe SDK verification path not connected: `stripe_sdk_not_connected`

## 5) Raw body and Stripe-Signature verification requirement
- Raw body is read as `request.text()` for future Stripe signature verification.
- Raw body is **never** treated as payment proof by itself.
- `Stripe-Signature` verification (with Stripe SDK and webhook secret) is required before any trusted event use.

## 6) `checkout.session.completed` planned handling
When signature verification is implemented in a future phase:
- only verified `checkout.session.completed` may proceed to entitlement pipeline
- non-target events should be acknowledged as ignored

Until then, the trusted event block remains unreachable.

## 7) Product mapping rules
- Product mapping source is `config/billing/products.json`.
- In Cloudflare Pages Functions, product config is loaded via `env.ASSETS.fetch()` (fallback: `fetch`).
- JSON module import is avoided.
- Missing/invalid config returns `products_config_unavailable`.
- Unknown productId returns `unknown_product`.

## 8) Entitlement schema
Scaffold entitlement record fields:
- `entitlementId`
- `productId`
- `status`
- `source`
- `stripeCustomerId`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId`
- `createdAt`
- `updatedAt`
- `revokedAt`
- `features`

Allowed statuses:
- `active`
- `revoked`
- `refunded`
- `disputed`
- `test`
- `unknown`

## 9) Restore reference: customerEmailHash (and equivalent fields)
Current scaffold does not require or store `customerEmailHash`.
If future support workflows need identity correlation, any `customerEmailHash`-like field must:
- be explicitly spec-approved
- be privacy-reviewed
- avoid raw email storage
- remain separate from tool content and OCR payloads

## 10) Idempotency rules
- Primary idempotency anchor: `stripeCheckoutSessionId`
- Duplicate webhook delivery must not create duplicate active entitlements.
- Future implementation must read-before-write or enforce unique constraints per checkout session.

## 11) Storage rules
Current `entitlement-store` behavior must remain non-writing:
- allowed: record build/validate/normalize helpers
- allowed: `entitlement_storage_not_configured`
- allowed: `entitlement_storage_not_implemented`
- allowed: `entitlement_issue_not_implemented`
- not allowed: D1 write
- not allowed: KV write
- not allowed: local file write
- not allowed: fake active entitlement treated as real purchase

## 12) Security constraints
- Never issue entitlement from unverified payload.
- Never move entitlement issuance ahead of signature verification.
- Never unlock Pro from URL params, localStorage, or client-only state.
- Never expose internal stack traces or secrets in API responses.
- Keep webhook logic fail-closed while Stripe is deferred.

## 13) Privacy constraints
- Do not store OCR text/document contents in billing records.
- Do not store names/addresses unless explicitly approved and required.
- Keep stored payment-related identifiers minimal.
- Avoid logging raw webhook body in production logs.

## 14) What is not implemented
- Stripe SDK webhook signature verification
- Verified event parsing/handling
- Entitlement persistence (D1/KV)
- Entitlement issuance as completed purchase proof
- Active entitlement API for runtime gating
- Pro unlock state changes in OKJ tools

## 15) Future P04-B handoff
P04-B should implement only server-side verification/connectivity tasks in sequence:
1. Stripe SDK webhook verification integration
2. verified event extraction and strict event-type handling
3. safe error mapping without internal leakage

No runtime Pro unlock should be introduced in P04-B.

## 16) Future P05-C handoff
P05-C should address entitlement lifecycle + runtime gating only after verified webhook + storage are complete:
1. idempotent storage-backed issue flow
2. entitlement query surface for server-validated gating
3. controlled rollout to tool runtime unlock logic

## 17) Validation checklist
- `stripe-webhook.js` does not JSON-import `products.json`
- Product config loading is Pages-compatible (`env.ASSETS.fetch` path)
- Webhook remains safe-disabled before verification
- No entitlement issuance can succeed in current scaffold
- `entitlement-store.js` has no D1/KV/file write
- No Pro unlock behavior is introduced
- Stripe work deferred stance is explicit
- Future P04-B / P05-C handoff points are documented
