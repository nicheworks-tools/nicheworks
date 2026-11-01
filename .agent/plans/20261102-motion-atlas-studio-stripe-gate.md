# ExecPlan — Studio product-specific Stripe launch switches (2026-11-02)

## Problem
NicheWorks has global BILLING_TEST_CHECKOUT_ENABLED / BILLING_LIVE_CHECKOUT_ENABLED flags shared by other products. Motion Atlas Studio is a new separately paid product. Product checkout being enabled in the config is necessary but not sufficient: sales must also be deliberately enabled for this *specific* product to avoid accidental cross-product activation.

## Scope
- functions/api/billing/create-checkout-session.js
- tools/motion-atlas/tests/studio-billing-lifecycle.test.mjs
- tools/motion-atlas/tests/studio-contract.test.mjs
- .agent/plans/20261102-motion-atlas-studio-stripe-gate.md

No changes to prices, production env flags, free Motion Atlas, historical Pro pages, billing D1 schema, webhook, or other product launch behavior.

## Requirements
- Studio checkout requires its own explicit `MOTION_ATLAS_STUDIO_TEST_CHECKOUT_ENABLED=true` or `MOTION_ATLAS_STUDIO_LIVE_CHECKOUT_ENABLED=true` matching Stripe key mode.
- Global billing flags must not grant Studio checkout, even if a future product registry enables Studio.
- Existing OKJ, CSV Tidy, Reconcile behavior is unchanged.
- Continue to require configured Studio product active, connected Stripe, approved positive amount/currency/tier, valid Stripe Price ID matching server contract, and real verified entitlement.
- Test synthetic price in-memory only; do not set or advertise live pricing.
- Maintain failure-closed behavior, run GitHub billing lifecycle and contract/browser tests, then merge on success.

## Rollout
No production flag should be enabled until the user approves a Studio price and a real Stripe test purchase, webhook, restore and refund complete successfully. Preview remains available without purchase; production code export remains locked.
