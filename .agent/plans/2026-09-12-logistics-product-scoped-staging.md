# ExecPlan — Logistics Compliance Kit JP product-scoped staging

## Goal

Prepare Logistics Compliance Kit JP for migration from the live legacy shared `nicheworks_pro` gate to the common product-scoped, server-verified billing foundation without guessing a product ID, price, Stripe Price mapping, or switching the public page prematurely.

## Base

- Branch: `feat/logistics-product-scoped-staging-20260912`
- Authority: current runtime/SPEC, `PRO_MIGRATION_LEDGER.md`, `docs/billing/pro-product-contracts-wave1.md`, and `assets/nw-pro-entitlement.js`.

## Current live contract to preserve

Free remains available:
- assessment/review level and evidence signals;
- next actions;
- medium/long-term plan draft;
- current-state memo;
- on-screen Markdown preview.

Current paid operations implemented in runtime:
1. internal-share memo copy;
2. contractor/vendor confirmation memo copy;
3. improvement-plan copy;
4. GitHub Issue draft copy;
5. Codex task copy;
6. handoff Markdown export;
7. JSON export;
8. Markdown save.

## Scope

- Add a non-live product-scoped controller module.
- Require an explicit future `productId`; no default product is allowed.
- Require an explicit mapping from all eight paid operations to product feature IDs.
- Call the common entitlement client through server-verifying `refreshProState({ productId })`.
- Treat a state as active only when it matches the requested product ID and reports `active: true`, `source: "server"`, and `reason: "verified_entitlement"`.
- Gate each operation by the verified feature list returned by the server.
- Reject legacy/shared entitlement names, local-only states, wrong-product responses, missing feature mappings, and failed entitlement checks.
- Add deterministic tests and a path-scoped CI check.
- Update Logistics SPEC and billing product contract documentation to record the exact Free/Paid boundary and staged migration state.

## Non-goals

- Do not register a Logistics product yet.
- Do not invent product ID, price, currency, billing model, price tier, or Stripe Price environment variable.
- Do not replace the live `pro-bridge.js` yet.
- Do not remove access from existing legacy shared-Pro users before a real product-scoped product is configured.
- Do not change scoring/assessment logic or Free behavior.
- Do not touch ManualFinder, affiliate, or Amazon work.

## Controller contract

`createLogisticsProductScopedController({ entitlementClient, productId, featureMap })` must:
- fail closed when commercial/product configuration is absent;
- expose the eight supported operation keys;
- refresh from the server-backed common entitlement client;
- retain only fixed entitlement metadata, never user assessment/memo content;
- expose `can(operation)` and a frozen state snapshot;
- never read localStorage or legacy `NWPro.getLocalStatus()` directly;
- never accept `nicheworks_pro` as a product ID or authority.

## Acceptance

- [x] All eight currently implemented paid operations are represented exactly once.
- [x] Missing product ID or incomplete feature mapping fails closed.
- [x] Local/browser-only active state is rejected.
- [x] Wrong-product response is rejected.
- [x] Server-verified matching product can activate only returned features.
- [x] Failed refresh returns inactive state without affecting Free functionality.
- [x] Public runtime remains on the existing legacy bridge until commercial configuration is authorized.
- [x] No price/product/Stripe value is invented.

## Validation evidence

- `tools/logistics-compliance-kit-jp/product-scoped-controller.mjs`
- `scripts/check-logistics-product-scoped-staging.mjs`
- `.github/workflows/logistics-product-scoped-staging-check.yml`
- `tools/logistics-compliance-kit-jp/SPEC.md`
- `docs/billing/pro-product-contracts-wave1.md`

The test suite uses only explicit `fixture.*` identifiers. They are test data and are not registered billing products, feature namespaces, prices, or Stripe configuration.
