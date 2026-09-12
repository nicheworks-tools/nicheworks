# ExecPlan — Shared product-scoped controller core

## Goal

Remove duplicated fail-closed product entitlement logic from the staged Logistics Compliance Kit JP and Command Safety Checker migrations while preserving their tool-specific paid-operation contracts and all existing staging tests.

## Base

- Base main SHA: `7947847d390a096f4a8ead816056619f6cd11d70`
- Branch: `refactor/product-scoped-controller-core-20260912`

## Scope

- Add `assets/nw-product-scoped-controller.mjs` as the shared non-live controller core.
- Keep product ID mandatory and reject legacy shared `nicheworks_pro` authority.
- Keep exact/unique operation and feature-map validation.
- Keep server-only verification: exact product match, `active: true`, `source: "server"`, `reason: "verified_entitlement"`.
- Keep operation-level activation driven only by the verified server-returned feature list.
- Keep failed refresh fail-closed.
- Refactor Logistics and Command Safety staging controllers into thin wrappers that define only tool label and operation list.
- Add a shared-core deterministic test.
- Make both existing tool-specific staging workflows rerun when the shared core changes.
- Preserve existing tool-specific tests and docs.

## Non-goals

- Do not connect either staging controller to public runtime.
- Do not register products, prices, Stripe Price mappings, or production feature namespaces.
- Do not alter current legacy live bridges.
- Do not modify checker/assessment logic.
- Do not touch affiliate, Amazon, or ManualFinder.

## Acceptance

- [x] Shared core contains the common entitlement logic once.
- [x] Logistics wrapper contains no duplicated entitlement validation/state machine.
- [x] Command Safety wrapper contains no duplicated entitlement validation/state machine.
- [x] Existing Logistics staging contract test remains wired to rerun when the core changes.
- [x] Existing Command Safety staging contract test remains wired to rerun when the core changes.
- [x] Shared core test covers duplicate operations, missing product, wrong product, non-server authority, partial features, and refresh failure.
- [x] Shared core contains no localStorage, shared Payment Link, tool input, or generated-output access.

## Validation evidence

- `assets/nw-product-scoped-controller.mjs`
- `scripts/check-product-scoped-controller-core.mjs`
- `.github/workflows/product-scoped-controller-core-check.yml`
- `.github/workflows/logistics-product-scoped-staging-check.yml`
- `.github/workflows/command-safety-product-scoped-staging-check.yml`
- `tools/logistics-compliance-kit-jp/product-scoped-controller.mjs`
- `tools/command-safety-checker/product-scoped-controller.mjs`
