# ExecPlan — Pro candidate migration ledger

## Goal

Audit all 42 tools classified as Pro-primary in `MONETIZATION_MASTER.md` against current `main` runtime and record the actual migration state from legacy/shared Pro behavior to the product-scoped billing foundation introduced by PR #516.

## Base

- Base main SHA: `9133d853b3fa1b059ed6dca5c12667546cdc61e6`
- Branch: `docs/pro-migration-ledger-20260912`
- ManualFinder is out of scope.

## Scope

Documentation and audit only unless a concrete security bypass is discovered that is already covered by an existing runtime contract. Do not create product IDs, prices, Stripe Price IDs, affiliate data, or new paid features.

## Audit fields

For each of the 42 Pro-primary tools record:

- current Pro surface/runtime status;
- legacy `NWPro.getLocalStatus()` / `nicheworks_pro` dependency;
- hard-coded/shared Payment Link or old unlock-route dependency where present;
- authoritative self-unlock/bypass risk (`?pro=1`, tool-local `active=true`, etc.);
- presence in `config/billing/products.json`;
- migration class and next action;
- migration priority/readiness.

## Classification

- `LEGACY_SHARED_GATE` — runtime gates paid behavior through old shared `NWPro` / `nicheworks_pro`.
- `LEGACY_COMMERCE_COPY` — old shared purchase/unlock wording or Payment Link remains even if the runtime gate is elsewhere.
- `BYPASS_RISK` — user-controlled URL/local state can authoritatively unlock paid behavior.
- `PRO_SURFACE_NO_GATE` — Pro/paid value is described but no authoritative paid runtime gate is implemented.
- `NO_CURRENT_PRO_RUNTIME` — classified Pro-primary for strategy, but current runtime has no paid surface to migrate.
- `PRODUCT_SCOPED` — uses the server-verified product-scoped billing foundation.
- `UNVERIFIED` — repository evidence is insufficient; do not infer.

A tool may carry more than one finding, but the ledger must name one primary migration class.

## Known facts before audit

- `config/billing/products.json` currently contains only `okj.toolkit_pro`; none of the 42 Pro-primary tools has a verified product-scoped registry entry.
- PR #518 already verifies legacy shared gating for AI Interaction Atlas, ATS Paste Doctor, Cold Email Requirement Checker, Command Safety Checker, and Contract Risk Highlighter; reuse that evidence instead of redoing it.
- Command Safety's historical shared Payment Link is not product-specific and does not establish its future product price.
- Product-scoped migration must not trust browser-local `active=true` as purchase proof.

## Deliverables

1. `PRO_MIGRATION_LEDGER.md` listing all 42 tools exactly once with evidence-based migration state.
2. A Command Safety product-contract section that fixes the already-verifiable free/paid feature boundary and explicitly leaves product ID, price, price tier, Stripe env mapping, and enablement policy unresolved where the repository has no authority.
3. Summary counts by migration class and an ordered migration queue.
4. Targeted fixes and regression checks for any proven tool-specific bypass found during the audit.

## Audit outcome

- 42/42 tools classified exactly once.
- 15 tools currently have legacy shared Pro runtime and require product-by-product migration.
- 27 tools have no current Pro runtime and therefore require product design, not legacy-gate migration.
- 0 of the 42 are product-scoped at audit time.
- Three weaker tool-specific unlock paths were found and repaired:
  - Logistics Compliance Kit JP tool-local `nw_pro_logistics-compliance-kit-jp` fallback removed.
  - SQL DB Risk Checker entitlement-name-only activation removed.
  - OG Image Maker tool-local `nw_pro_key` authority replaced by explicit legacy shared active-state checking.
- A focused `scripts/check-pro-migration-safety.mjs` regression check and path-scoped workflow were added so those bypasses cannot silently return.
- Command Safety's current Free and paid-artifact boundaries are documented without inventing unresolved commercial configuration.

## Acceptance

- [x] Exactly 42 Pro-primary tools are present in the ledger.
- [x] Every classification is supported by current repository evidence or marked `UNVERIFIED`.
- [x] No tool is described as product-scoped merely because it has a Pro UI.
- [x] No product ID, price, Stripe Price ID/env mapping, or entitlement is invented.
- [x] Known bypasses are distinguished from ordinary legacy shared gating and repaired where proven.
- [x] Command Safety's free safety analysis remains explicitly free.
- [x] ManualFinder and affiliate runtime are untouched.
- [x] PR diff remains audit/documentation scoped except for the three proven legacy bypass repairs and their regression coverage.
