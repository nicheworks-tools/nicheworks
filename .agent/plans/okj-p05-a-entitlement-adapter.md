# ExecPlan — OKJ-P05-A Pro entitlement state adapter contract

## Goal
- Add a swappable Pro entitlement state adapter contract for OKJ billing integration prep without enabling Stripe or Pro unlock.
- Define state model, provider modes, adapter return shape, and migration path toward future Stripe/D1 entitlement.

## Scope
- Targets:
  - `docs/billing/pro-entitlement-state-adapter.md` (new)
  - `assets/nw-pro-entitlement.js` (new, tiny optional runtime scaffold)
  - `docs/billing/nicheworks-common-billing-architecture.md` (minimal reference update)
  - `docs/billing/stripe-webhook-entitlement-issue.md` (minimal reference update)
  - `docs/billing/stripe-checkout-success-cancel-flow.md` (minimal reference update)
- Excluded: all other files and directories.

## Rules / Prohibitions
- No Stripe activation, no real checkout/webhook entitlement, no D1 writes, no Pro unlock.
- No localStorage or URL-param unlock source of truth.
- Keep changes limited to billing docs and optional tiny adapter scaffold.
- Do not modify tool runtime HTML/CSS/JS in `tools/*`.

## Change List
- Create contract doc with required 16 sections and explicit default state `billing-unavailable`.
- Add small global adapter module that always returns inactive billing-unavailable state.
- Add minimal references in existing billing docs clarifying P05-A is contract/scaffold only and Stripe/D1 remains deferred.

## Step-by-step Procedure
1. Inspect existing billing docs and naming conventions.
2. Author `docs/billing/pro-entitlement-state-adapter.md` with required sections and constraints.
3. Add `assets/nw-pro-entitlement.js` with safe no-op adapter API (`getProState`, `getFeatureState`, `getProductState`).
4. Update existing billing docs with short references to the new adapter contract.
5. Run grep-based checks to verify prohibited patterns are absent and new states/modes are present.
6. Review diff for scope compliance.

## Test Plan
- Validate files exist and contain required state/model/provider text.
- Validate adapter scaffold never returns `active: true` and does not reference `localStorage`, URL params, Stripe, or webhook calls.
- Run `git diff --name-only` to confirm changed-file scope.

## Rollback Plan
- Revert commit with `git revert <commit>` if needed.
- Or discard working changes before commit with `git checkout -- <files>`.
