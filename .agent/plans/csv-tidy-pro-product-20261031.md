# ExecPlan — CSV Tidy Pro product registration with checkout closed (2026-10-31)

## Objective

Continue beyond browser acceptance into a **safe monetization foundation**. Preserve the current free CSV Tidy product unmodified. Reuse NicheWorks' existing Stripe / Cloudflare Pages Function / D1 entitlement framework, but do **not** open sales or activate checkout.

## Scope

- `config/billing/products.json`: register a planning-only CSV Tidy Pro product and 1-time JPY draft tier.
- `functions/api/billing/create-checkout-session.js`: honor an explicit per-product checkout-disabled flag **before** accessing Stripe credentials/price IDs or sending requests. Products without the new optional field retain existing behavior.
- `tools/csv-tidy/PRO-SPEC.md`: MVP definition, privacy, Free/Pro boundary and gating conditions.
- `tools/csv-tidy/tests/pro-contract.mjs`: tests for registration, fail-closed behavior, backward compatibility, no outbound Stripe calls.
- `.github/workflows/csv-tidy-pro-contract.yml`: focused read-only test CI.
- This plan.

**Do not edit** production CSV Tidy `app.js`, `index.html`, `complete.js`, `style.css`, other tool folders, site-wide common spec, deployment settings, existing Stripe credentials/secret values, or D1 migrations.

## Product design

- Free: all currently shipped single-CSV functions remain unchanged.
- Candidate paid value: locally stored reusable mapping/cleaning presets, repeated application to multiple CSV files, explicit mismatch detection, per-file result report/ZIP download.
- Proposed price: **JPY 1,980 one-time (unapproved draft only)**. No billing CTA, no user purchase, no traffic instrumentation or exported CSV upload.
- Pro feature entitlements use namespaced IDs, never `nicheworks_pro` (which could accidentally grant across unrelated tools).
- Full product capability and safe entitlement-based access gating need separate implementation and acceptance before checkout may be enabled.

## Guardrails

`checkout.enabled: false` is a **hard fail-closed gate** at server checkout request time, even if a site-wide live Stripe checkout flag and Stripe secret/price ID are present. Product remains marked `not_connected`. New product is never silently included in existing Pro purchases.

No additional SaaS account, CSV cloud storage, AI processing, recurring charge or third-party script.

## Test plan

1. Product configuration validates and JPY price amount aligns with tier.
2. Product state stays `planning` and disabled.
3. POST /api/billing/create-checkout-session returns `403 product_checkout_disabled` even if test/live global flags and all Stripe-like secrets/price IDs are supplied.
4. The guarded call must make **zero Stripe/network calls**.
5. An existing product without the optional checkout flag must follow existing auth/secret check behavior (non-breaking).
6. Run focused test on GitHub Actions, and all repository PR checks; no merge until verified.

## Explicit non-goals of this PR

No paid feature code, finished UI or entitlement issuance simulation; no claim of active billing, guaranteed revenue, or full product release. A follow-on Pro implementation may begin after reviewing this contained product contract.
