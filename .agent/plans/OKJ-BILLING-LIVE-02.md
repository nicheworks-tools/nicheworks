# OKJ-BILLING-LIVE-02 ExecPlan

## Scope
- `functions/api/billing/stripe-webhook.js`
- `docs/billing/stripe-webhook-entitlement-issue.md`
- `docs/billing/stripe-webhook-test-setup.md` (new, optional)

## Files to touch
- Implement webhook signature verification and verified event parsing in `functions/api/billing/stripe-webhook.js`.
- Update webhook/entitlement handoff documentation in `docs/billing/stripe-webhook-entitlement-issue.md`.
- Add test setup and operator guidance in `docs/billing/stripe-webhook-test-setup.md`.

## Steps
1. Inspect current webhook scaffold and product config shape.
2. Implement Cloudflare-compatible Stripe signature verification using Web Crypto HMAC SHA-256 with raw body + `Stripe-Signature` parsing.
3. Add strict verified-event handling for `checkout.session.completed`, including product and price tier validation and safe acknowledgements only.
4. Confirm no entitlement issue/write/unlock code path can execute.
5. Update docs for env requirements, webhook setup, signature requirements, accepted event, and non-issuance status.
6. Run targeted checks and produce commit + PR message.

## Manual verification for reviewer
1. Set `STRIPE_WEBHOOK_SECRET` in local/dev env and send a signed test webhook.
2. Verify missing signature returns `webhook_signature_missing`.
3. Verify invalid signature returns `webhook_signature_invalid`.
4. Verify valid non-target event returns ignored ack.
5. Verify valid `checkout.session.completed` with expected metadata returns verified ack with `entitlementIssued: false`.
6. Verify no D1/KV writes and no Pro unlock behavior changes.
