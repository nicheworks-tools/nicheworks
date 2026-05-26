# Stripe Checkout Success/Cancel Flow (OKJ-P03)

Status:
- Phase: OKJ-P03
- State: scaffold/documentation only
- Product: `okj.toolkit_pro`
- Billing mode in config: `stripe.mode: not_connected`
- Entitlement issuance: not implemented in this phase
- Pro unlock: not implemented in this phase

## 1. Scope of OKJ-P03

OKJ-P03 defines the Checkout boundary and success/cancel flow for `okj.toolkit_pro`.

This phase adds a minimal server-side scaffold route shape and static success/cancel pages.
It does **not** create entitlements and does **not** unlock Pro features.

## 2. Files changed

- `docs/billing/stripe-checkout-success-cancel-flow.md`
- `docs/billing/billing-config-and-mock-entitlement.md` (small cross-reference update)
- `functions/api/billing/create-checkout-session.js` (disabled-by-default scaffold)
- `billing/success.html`
- `billing/cancel.html`

## 3. Checkout request shape

Intended route:

- `POST /api/billing/create-checkout-session`

Request body:

```json
{
  "productId": "okj.toolkit_pro",
  "returnPath": "/tools/old-kanji-ocr-scanner/"
}
```

Validation rules in P03 scaffold:

- Reject missing `productId`.
- Reject unknown `productId`.
- Reject unsafe `returnPath`.
- Only allow safe internal paths for `returnPath`.
- Disallow external redirect targets (`http://`, `https://`, protocol-relative `//`).

## 4. Product config dependency

Checkout scaffold reads product data from:

- `config/billing/products.json`

Expected product:

- `productId: okj.toolkit_pro`
- `price.amount: 4.99`
- `price.currency: USD`
- `price.type: one_time`
- `stripe.mode: not_connected`
- `stripe.priceIdEnv: STRIPE_PRICE_OKJ_TOOLKIT_PRO`

## 5. Environment variables

P03 references (server-side only):

- `STRIPE_SECRET_KEY` (not used to create a real session in P03)
- `STRIPE_PRICE_OKJ_TOOLKIT_PRO` (resolved via `stripe.priceIdEnv`)

Constraints:

- Stripe secret key must never be placed in frontend code.
- Real Stripe price IDs must not be committed.
- Webhook secrets must not be committed.

## 6. Success flow

Success URL (planned):

- `/billing/success.html?session_id={CHECKOUT_SESSION_ID}&returnPath=<encoded internal path>`

Success page behavior in P03:

- States payment may have completed.
- States Pro access is **not** activated by URL alone.
- States entitlement verification is deferred to P04/P05.
- Informs user to return to tool / wait for entitlement-enabled flow.
- `session_id` is display/support reference only and must not unlock Pro.

## 7. Cancel flow

Cancel URL (planned):

- `/billing/cancel.html?returnPath=<encoded internal path>`

Cancel page behavior in P03:

- States checkout was canceled or not completed.
- States no Pro access was granted.
- States no local unlock state was stored.
- Informs user they can return to the original OKJ tool.

## 8. Security constraints

- Checkout session creation route is server-side boundary only.
- Product lookup must use server-loaded config; never trust client to provide Stripe price ID.
- Read Stripe price ID from env var named in product config (`stripe.priceIdEnv`).
- Prevent open redirects by validating safe internal `returnPath`.
- Do not introduce URL-param unlock or localStorage-only unlock.
- Do not issue entitlement in P03.

## 9. Privacy constraints

- Do not include OCR text or document content in Checkout metadata.
- Keep metadata minimal (`productId`, optional internal reference).
- Do not persist user purchase state from URL parameters.

## 10. What P03 does not implement

- No real Stripe Checkout session creation.
- No webhook verification.
- No entitlement issuance.
- No entitlement DB writes.
- No real Pro feature unlock.

## 11. P04 handoff

P04 should implement:

- Stripe webhook endpoint verification.
- Verified `checkout.session.completed` processing.
- Idempotent entitlement issuance.
- Durable entitlement storage and audit logging.

## 12. P05 handoff

P05 should implement:

- Real entitlement verification boundary from tool runtime.
- Pro feature unlock only when entitlement is verified active.
- User-facing access recovery/retry path if verification is delayed.

## 13. Validation checklist

- [x] `docs/billing/stripe-checkout-success-cancel-flow.md` exists.
- [x] Product remains `okj.toolkit_pro` at `$4.99` one-time in USD.
- [x] `config/billing/products.json` parses.
- [x] `config/billing/mock-entitlements.json` parses.
- [x] `stripe.mode` remains `not_connected`.
- [x] No real Stripe IDs or secrets committed.
- [x] No Pro unlock path added.
- [x] Success/cancel text explicitly says P03 does not grant Pro access.
- [x] P04 handoff covers webhook verification and entitlement issue.
- [x] P05 handoff covers real Pro unlock.
