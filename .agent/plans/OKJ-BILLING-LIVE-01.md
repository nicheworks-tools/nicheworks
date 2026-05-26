# ExecPlan: OKJ-BILLING-LIVE-01

## Scope
- `functions/api/billing/create-checkout-session.js`
- `docs/billing/stripe-checkout-success-cancel-flow.md`
- `docs/billing/stripe-test-checkout-setup.md` (new)

## Files to touch
- Implement guarded Stripe Checkout session creation in server function.
- Update flow documentation to reflect test-safe behavior and live-block default.
- Add explicit setup/testing doc for Stripe test checkout and Cloudflare env vars.

## Steps
1. Inspect current checkout scaffold and product config validation requirements.
2. Implement guarded server-side Stripe Checkout Session creation with strict env gates and safe response shape.
3. Update/add docs for setup, behavior boundaries, and next-step handoff.
4. Run targeted checks (lint/syntax check where available) and review diff for prohibited scope changes.

## Manual verification
1. In test mode (`STRIPE_SECRET_KEY=sk_test_...`) with `OKJ_STRIPE_TEST_CHECKOUT_ENABLED != "true"`, POST returns `test_checkout_not_enabled`.
2. In test mode with `OKJ_STRIPE_TEST_CHECKOUT_ENABLED="true"` and valid `STRIPE_PRICE_OKJ_TOOLKIT_PRO`, POST returns `{ok:true, sessionId, url, productId, mode}`.
3. In live mode (`sk_live_...`) with `OKJ_LIVE_CHECKOUT_ENABLED != "true"`, POST returns `live_checkout_blocked_until_entitlement`.
4. Confirm response body never includes Stripe secret, raw price ID, or env dump.
