# Stripe Webhook + Entitlement Issue Contract (OKJ-P04-A)

Status:
- Phase: OKJ-P04-A
- State: documentation + disabled scaffold only
- Runtime entitlement issuing: not active
- Pro unlock: not active
- Product in scope: `okj.toolkit_pro` (`$4.99` one-time, USD)

## 1. Scope of OKJ-P04-A

This phase defines the Stripe webhook and entitlement-issue **contract** for upcoming implementation.

P04-A intentionally adds only:
- route contract documentation
- verification and idempotency requirements
- entitlement schema definition
- disabled-by-default webhook scaffold

P04-A does **not** activate real webhook verification, entitlement writes, or Pro unlock.

## 2. Files changed

- `docs/billing/stripe-webhook-entitlement-issue.md` (this contract)
- `functions/api/billing/stripe-webhook.js` (disabled scaffold)
- `docs/billing/nicheworks-common-billing-architecture.md` (small cross-reference update)
- `docs/billing/billing-config-and-mock-entitlement.md` (small cross-reference update)
- `docs/billing/stripe-checkout-success-cancel-flow.md` (small cross-reference update)

## 3. Intended webhook route

Intended route (server-side):

- `POST /api/billing/stripe-webhook`

Contract in P04-A:
- route exists only as safe scaffold
- route is disabled by default
- route must not issue entitlement
- route must not unlock Pro

## 4. Required env vars

Allowed environment variable names referenced by scaffold/contract:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_OKJ_TOOLKIT_PRO`

Rules:
- never commit real secret values
- never return secret values in API response
- webhook connection is considered incomplete unless required vars are present in deployment env

## 5. Raw body + signature verification requirement

P04-B implementation must enforce Stripe verification boundary:

1. Read the **raw request body bytes/text first**.
2. Read the `Stripe-Signature` request header.
3. Verify signature against `STRIPE_WEBHOOK_SECRET`.
4. Reject requests with missing signature.
5. Reject requests with invalid signature.
6. Do not parse/mutate JSON before verification.
7. Do not trust client-sent payment/product state.

Important:
- signature verification must run before any entitlement business logic
- only verified Stripe events may enter entitlement pipeline

## 6. Supported Stripe event types (planned)

Primary event for initial OKJ Pro entitlement issuance:

- `checkout.session.completed`

Future event handling (later phase):
- refund-related revocation flow
- dispute/chargeback-related revocation flow
- manual revoke/admin paths

Not in initial OKJ purchase model:
- no subscription events for P04 initial launch (product is one-time purchase)

## 7. `checkout.session.completed` handling contract

For a verified `checkout.session.completed` event in P04-B:

1. Extract trusted fields from verified event payload.
2. Determine target product via server-side product mapping rules.
3. Validate that mapped product is allowed (`okj.toolkit_pro` in this phase).
4. Run idempotency check before issuing entitlement.
5. Upsert/insert entitlement record as `active` when valid and not duplicated.
6. Store Stripe linkage fields for audit and future revoke workflows.
7. Return success response without exposing sensitive internals.

Must not:
- trust client URL params as proof of payment
- unlock Pro directly from success page query params

## 8. Product mapping rules

Product resolution in P04-B must be server-controlled:

- resolve from verified Stripe event data + server config
- compare against known billing registry (`config/billing/products.json`)
- enforce stable `productId` (`okj.toolkit_pro` for this phase)
- optionally verify expected Stripe price env mapping (`STRIPE_PRICE_OKJ_TOOLKIT_PRO`)

Rules:
- unknown product mapping => reject/no entitlement issue
- mismatched or missing required Stripe identifiers => reject/no entitlement issue

## 9. Entitlement schema (contract)

Minimum entitlement record shape (planning contract):

```json
{
  "entitlementId": "string",
  "productId": "okj.toolkit_pro",
  "status": "active",
  "source": "stripe_webhook",
  "features": ["okj.batchOcr"],
  "stripeCustomerId": "cus_xxx",
  "stripeCheckoutSessionId": "cs_xxx",
  "stripePaymentIntentId": "pi_xxx",
  "customerEmailHash": "sha256:...",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "revokedAt": null
}
```

Required fields:
- `entitlementId`
- `productId`
- `status`
- `source`
- `features`
- `stripeCustomerId`
- `stripeCheckoutSessionId`
- `stripePaymentIntentId`
- `customerEmailHash` (or equivalent restore reference)
- `createdAt`
- `updatedAt`
- `revokedAt`

Allowed initial status values:
- `active`
- `revoked`
- `refunded`
- `disputed`
- `test`
- `unknown`

## 10. Idempotency rules

Entitlement issuance must be idempotent using:
- `stripeCheckoutSessionId` (primary)
- optional `stripePaymentIntentId` (secondary)
- `productId`

Required behavior:
- duplicate webhook deliveries must not create duplicate active entitlements
- retried deliveries for same checkout session should return safe idempotent success/no-op result

## 11. Storage decision placeholder

P04-A does not choose final storage implementation code yet, but defines constraints:

- preferred durable source of truth: Cloudflare D1
- Cloudflare KV may be used as cache only
- JSON files are not acceptable as production entitlement source of truth
- `localStorage` is not acceptable as paid-access source of truth

Final storage schema/migrations are P04-B scope.

## 12. Security constraints

- webhook endpoint must remain server-side only
- must verify Stripe signature before payload trust
- must not expose secrets in responses/logs
- must not issue entitlement from unverified data
- must not introduce client-side self-unlock
- must not write production entitlement from mock/dev files

## 13. Privacy constraints

- avoid storing raw personal data when not required
- prefer hash/reference for customer email (`customerEmailHash`)
- do not store OCR payload/content in billing records
- log minimal billing metadata required for reconciliation and support

## 14. What P04-A does not implement

- real Stripe signature verification logic
- real entitlement DB write
- refund/dispute revoke implementation
- Pro unlock path in runtime UI
- subscription billing logic

## 15. P04-B handoff

P04-B should implement:
- real raw-body signature verification with `STRIPE_WEBHOOK_SECRET`
- verified `checkout.session.completed` entitlement write
- durable storage integration (D1 preferred)
- hard idempotency guards and replay-safe behavior
- audit-friendly entitlement lifecycle updates

## 16. P05 handoff

P05 should implement:
- entitlement read/verification API for runtime gating
- server-verified Pro unlock flow in OKJ tool runtime
- restore/recovery UX driven by verified entitlement state

## 17. Validation checklist

- [x] Route contract defined: `POST /api/billing/stripe-webhook`.
- [x] Required env var names documented without real values.
- [x] Raw body + `Stripe-Signature` verification requirement is explicit.
- [x] `checkout.session.completed` handling contract is explicit.
- [x] Entitlement schema includes all required fields.
- [x] Status values include `active/revoked/refunded/disputed/test/unknown`.
- [x] Idempotency keys and duplicate-delivery behavior are documented.
- [x] Storage decision placeholder forbids JSON/localStorage as source of truth.
- [x] P04-A explicitly keeps webhook/entitlement inactive by default.
- [x] P04-B/P05 handoff responsibilities are documented.
