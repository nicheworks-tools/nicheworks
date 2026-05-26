# ExecPlan: OKJ-BILLING-LIVE-03

## Scope
- `functions/api/billing/entitlement-store.js`
- `functions/api/billing/stripe-webhook.js`
- `docs/billing/stripe-webhook-entitlement-issue.md`
- `docs/billing/d1-entitlement-storage.md` (new)

## Steps
1. Inspect current webhook and entitlement scaffold behavior.
2. Implement D1-backed entitlement store helpers with idempotent insert-by-checkout-session behavior.
3. Wire verified webhook flow to call entitlement issue and return safe idempotent responses.
4. Update/add billing docs for D1 schema, privacy constraints, and operational test notes.
5. Run targeted checks (lint-free import/parse smoke via node syntax check where applicable) and validate no UI/runtime unlock files changed.

## Manual verification
- Send verified `checkout.session.completed` payload with valid metadata and ensure JSON includes `entitlementIssued: true` and `entitlementId`.
- Replay same event and ensure idempotent response includes `idempotent: true`.
- Remove/omit `BILLING_DB` binding and verify safe failure with `entitlement_storage_not_configured`.
- Confirm no changes under OKJ UI files and no modifications to `assets/nw-pro-entitlement.js`.
