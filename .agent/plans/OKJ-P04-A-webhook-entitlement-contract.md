# OKJ-P04-A ExecPlan — Stripe webhook and entitlement contract scaffold

## Scope
- `docs/billing/stripe-webhook-entitlement-issue.md` (new)
- `functions/api/billing/stripe-webhook.js` (new, disabled scaffold)
- `docs/billing/nicheworks-common-billing-architecture.md` (minimal cross-reference)
- `docs/billing/billing-config-and-mock-entitlement.md` (minimal cross-reference)
- `docs/billing/stripe-checkout-success-cancel-flow.md` (minimal cross-reference)

## Files to touch
- `docs/billing/stripe-webhook-entitlement-issue.md`
- `functions/api/billing/stripe-webhook.js`
- `docs/billing/nicheworks-common-billing-architecture.md`
- `docs/billing/billing-config-and-mock-entitlement.md`
- `docs/billing/stripe-checkout-success-cancel-flow.md`

## Steps
1. Inspect existing billing docs/scaffold to align wording and safety constraints.
2. Add P04-A webhook/entitlement contract doc with required sections.
3. Add disabled-by-default webhook route scaffold (`POST` only, safe response, no entitlement/storage/unlock).
4. Add minimal cross-reference updates to existing billing docs clarifying webhook/entitlement remain inactive until P04-B.
5. Run focused checks (`git diff`, optional syntax check by inspection), then commit.

## Manual verification for reviewer
1. Confirm new doc includes all 18 required sections.
2. Confirm webhook scaffold only accepts POST and returns `webhook_not_connected` safely.
3. Confirm no Stripe secrets/real IDs are added.
4. Confirm no entitlement issuance, storage writes, or Pro unlock logic was introduced.
