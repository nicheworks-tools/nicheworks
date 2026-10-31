# ExecPlan — CSV Tidy Stripe webhook → D1 → entitlement → refund integration QA

## Goal
Prove NicheWorks' real billing functions (not a mocked entitlement response) under test-only, signed Stripe-like events and a real SQLite schema. Leave all real payment switches disabled.

## Scope
- New `scripts/check-csv-tidy-billing-lifecycle.mjs`: invokes actual `functions/api/billing/stripe-webhook.js`, `entitlement.js` and `entitlement-store.js` through an in-memory `node:sqlite` database with the actual schema `schema/billing_entitlements.sql`.
- New scoped `.github/workflows/csv-tidy-billing-lifecycle.yml`: Node 24 and no Stripe keys, no account access, no new package.
- This plan; optionally append a verified status note to `tools/csv-tidy/PRO-SPEC.md`.

## Required matrix
- No valid signed payment: no entitlement; invalid/stale signatures rejected.
- Unpaid, wrong amount/currency, unknown product: cannot grant an entitlement.
- Signed paid Stripe-like checkout event: exactly one active D1 row and correct product-scoped features.
- Duplicate webhook delivery: idempotent; one row only.
- Client entitlement lookup: active only for matching product/session; fake and cross-product IDs cannot unlock.
- Signed refund and dispute events: remove active access; later duplicate checkout completion does not revive entitlement.
- Missing database binding: fail closed.
- No external network or real payment. Product checkout stays disabled.

## Known external gates before live launch
- Validate Cloudflare Pages D1 BILLING_DB binding and schema deployment against real D1.
- Stripe test-mode Checkout with exact JPY price/product, Stripe test webhook secret and verified delivery.
- Test real refund/dispute event forms, event ordering, transaction rollback, durable purchase recovery and support path.
- Approve final price and terms/refund policy, then enable live checkout in separately reviewed release.
