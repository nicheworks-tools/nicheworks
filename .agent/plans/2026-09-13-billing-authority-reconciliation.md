# ExecPlan: NicheWorks billing authority reconciliation

## Goal
Resolve the conflicting billing directions currently present in the repository without changing live billing runtime, prices, Stripe configuration, D1 schema, or tool behavior.

The approved commercial direction is:

1. `NicheWorks Pro` is the primary shared one-time bundle for selected professional tools.
2. Standalone Pro remains available only for products that are genuinely separate products.
3. Usage/credit billing is deferred until NicheWorks has a workflow with material per-use server cost.
4. The existing product-scoped `/api/billing/*` foundation remains the forward technical billing engine.
5. A shared bundle is represented as one explicit product (`nicheworks.pro`) rather than by reviving the legacy browser-local `nicheworks_pro` authority.

## Scope

This PR is documentation/authority only.

Files in scope:
- `MONETIZATION_EXECUTION.md`
- `docs/billing/nicheworks-common-billing-architecture.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
- this ExecPlan

Explicitly out of scope:
- `config/billing/products.json`
- Stripe Product/Price creation or IDs
- prices/currency selection for NicheWorks Pro
- D1 schema/migrations
- `/api/billing/*` runtime
- legacy `/api/pro/*` runtime
- any `tools/*` runtime or SPEC
- affiliate workstreams
- ManualFinder, TrashNavi, 解約どこナビ, and other parallel feature/data work

## Decisions to encode

- Canonical future bundle product ID: `nicheworks.pro`.
- `nicheworks.pro` is distinct from legacy entitlement label `nicheworks_pro`.
- One verified `nicheworks.pro` purchase may unlock multiple tools that are explicitly members of the bundle.
- Bundle membership is a separate explicit ledger/contract; it is not inferred from old Pro code.
- `okj.toolkit_pro` and `reconcile.pro_v1` remain standalone/frozen planning products until deliberately reviewed; they do not implicitly grant the bundle.
- Existing staged product-scoped controllers are retained and will later point to `nicheworks.pro` for tools selected into the bundle.
- Legacy shared Payment Link, `NWPro`, `/api/pro/status`, `/api/stripe/webhook`, and browser-local `nicheworks:pro` remain compatibility/migration inputs only.

## Follow-up sequence

1. Merge this authority reconciliation.
2. Classify all 87 registered tools into `PRO_BUNDLE`, `STANDALONE_PRO`, `AFFILIATE`, `ADS_DONATION`, `FREE`, or `HOLD` using the canonical per-tool specs and monetization evidence.
3. Freeze exact Free/Pro boundaries for every `PRO_BUNDLE` tool.
4. Decide the NicheWorks Pro one-time price and Stripe Product/Price configuration.
5. Register `nicheworks.pro` in the billing product registry.
6. Unify D1 entitlement authority around the new billing store and design legacy purchaser migration before deleting old records.
7. Connect one reference tool (Command Safety Checker) end to end.
8. Prove a second bundle tool unlocks from the same purchase.
9. Migrate remaining bundle tools in measured waves.
10. Retire legacy shared billing only after migration is complete.

## Verification

- Documentation must no longer claim that product-scoped billing forbids an explicit shared bundle.
- Documentation must not claim that legacy `nicheworks_pro` is the future purchase authority.
- No price, Stripe Price ID, or environment variable for `nicheworks.pro` is invented in this PR.
- Existing standalone products remain separate.
- No runtime, tool, common-spec, CI, deployment, affiliate, or data file changes are included.
