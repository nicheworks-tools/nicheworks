# Stripe Webhook and Entitlement Issue Scaffold

Status:
- OKJ-P04
- Webhook scaffold
- Entitlement issue scaffold
- Runtime safe-disabled unless Stripe/webhook/storage are configured
- Stripe Checkout already scaffolded in OKJ-P03
- Pro unlock not implemented yet
- Tool runtime unchanged
- Based on OKJ-P01 to OKJ-P03

## 1. Purpose
P04 adds a server-side scaffold for Stripe webhook handling and entitlement issue flow. It does not activate Pro unlock and does not change any OKJ tool runtime.

## 2. Files
- `functions/api/billing/stripe-webhook.js`
- `functions/api/billing/entitlement-store.js`
- `docs/billing/stripe-webhook-entitlement-issue.md`

## 3. Webhook route
- `POST /api/billing/stripe-webhook`
- Method must be POST.
- Route reads raw request body for signature verification usage.
- If webhook env/settings are missing, it returns safe disabled responses.

## 4. Supported event
Planned event handling scaffold is:
- `checkout.session.completed`

## 5. Verification requirement
No verified Stripe signature means no entitlement issuance. Unverified request bodies are never treated as payment proof.

## 6. Entitlement record
Scaffold record fields:
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

## 7. Idempotency
`stripeCheckoutSessionId` is the idempotency anchor. Duplicate webhook delivery must not create duplicate active entitlements.

## 8. Storage
Entitlement writes are safe-disabled unless storage binding exists and real storage implementation is connected.
- If no D1/KV binding is configured: `entitlement_storage_not_configured`
- Current scaffold does not fake active entitlement

## 9. Security constraints
- Verify Stripe signature before trusting event payload
- Never issue entitlement from unverified request body
- Keep webhook idempotent by checkout session id
- No entitlement from URL parameters
- No entitlement from localStorage
- Do not commit Stripe secret keys or webhook secret
- Do not expose detailed internal errors to clients
- Do not expose public active Pro state from mock entitlement

## 10. Privacy constraints
- Do not include OCR text in entitlement records
- Do not include names, addresses, or document content
- Do not store user tool input with payment records
- Avoid logging raw webhook bodies
- Store only minimum identifiers required for entitlement issue/support

## 11. Relationship to P03
P03 added checkout success/cancel scaffolding. P04 adds webhook/entitlement issuance scaffolding behind verification and storage guards.

## 12. Handoff to P05
P05 will apply real entitlement checks to OKJ tools and switch UI/runtime state only after entitlement is verified server-side.

## 13. Validation
Recommended local checks for this scaffold:
- `node --check functions/api/billing/stripe-webhook.js`
- `node --check functions/api/billing/entitlement-store.js`
- `node -e "JSON.parse(require('node:fs').readFileSync('config/billing/products.json','utf8'));JSON.parse(require('node:fs').readFileSync('config/billing/mock-entitlements.json','utf8'));"`
