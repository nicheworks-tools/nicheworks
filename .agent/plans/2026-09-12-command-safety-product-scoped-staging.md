# ExecPlan — Command Safety Checker product-scoped staging

## Goal

Prepare Command Safety Checker for migration from the live legacy shared `nicheworks_pro` gate to the common product-scoped, server-verified billing foundation without guessing a product ID, price, Stripe Price mapping, or changing the public checker prematurely.

## Base

- Base main SHA: `5e79fc8c8ec023370e3c87811a57244bae94466c`
- Branch: `feat/command-safety-product-scoped-staging-20260912`
- Authority: current runtime/SPEC, `PRO_MIGRATION_LEDGER.md`, `docs/billing/pro-product-contracts-wave1.md`, and `assets/nw-pro-entitlement.js`.

## Current live contract to preserve

Free remains available:
- command paste/input;
- Unix shell / PowerShell mode;
- local heuristic risk checks;
- risk level, category, reason, verification guidance, safer/dry-run guidance;
- JP/EN UI and safety disclaimers.

Current paid operations implemented in runtime:
1. review Markdown;
2. Codex safety-check task;
3. GitHub Issue draft;
4. JSON export;
5. Markdown export.

## Scope

- Add a non-live product-scoped controller module.
- Require an explicit future `productId`; no default product is allowed.
- Require an explicit mapping from all five paid operations to product feature IDs.
- Call the common entitlement client through server-verifying `refreshProState({ productId })`.
- Treat a state as active only when it matches the requested product ID and reports `active: true`, `source: "server"`, and `reason: "verified_entitlement"`.
- Gate each operation by the verified feature list returned by the server.
- Reject legacy/shared entitlement names, local-only states, wrong-product responses, missing/duplicate feature mappings, and failed entitlement checks.
- Add deterministic tests and a path-scoped CI check.
- Update Command Safety SPEC and Wave 1 billing contract staged-migration state.

## Non-goals

- Do not register a Command Safety product yet.
- Do not invent product ID, product name, price, currency, billing model, price tier, Stripe Price environment variable, or production feature namespace.
- Do not replace the live `pro-bridge.js` yet.
- Do not remove existing legacy shared-Pro access before an authorized product-scoped product exists.
- Do not change the checker heuristics, risk rules, or Free behavior.
- Do not touch ManualFinder, affiliate, Amazon, or Logistics runtime.

## Controller contract

`createCommandSafetyProductScopedController({ entitlementClient, productId, featureMap })` must:
- fail closed when commercial/product configuration is absent;
- expose the five supported paid operation keys;
- refresh only through the server-backed entitlement client;
- retain only fixed entitlement metadata, never command text or finding content;
- expose `can(operation)` and a frozen state snapshot;
- never read localStorage or legacy `NWPro.getLocalStatus()` directly;
- never accept `nicheworks_pro` as a product ID or feature authority.

## Acceptance

- [x] All five current paid operations are represented exactly once.
- [x] Missing product ID or incomplete/duplicate feature mapping fails closed.
- [x] Local/browser-only active state is rejected.
- [x] Wrong-product response is rejected.
- [x] Server-verified matching product can activate only returned features.
- [x] Failed refresh returns inactive state without affecting Free checking.
- [x] Public runtime remains on the legacy bridge until commercial configuration is authorized.
- [x] No price/product/Stripe value is invented.

## Validation evidence

- `tools/command-safety-checker/product-scoped-controller.mjs`
- `scripts/check-command-safety-product-scoped-staging.mjs`
- `.github/workflows/command-safety-product-scoped-staging-check.yml`
- `tools/command-safety-checker/SPEC.md`
- `docs/billing/pro-product-contracts-wave1.md`

The deterministic tests use only `fixture.*` identifiers. They are test data and are not registered products, production feature IDs, prices, or Stripe configuration.
