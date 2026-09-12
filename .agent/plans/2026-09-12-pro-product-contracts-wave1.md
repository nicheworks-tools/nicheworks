# ExecPlan — Pro product contracts Wave 1

## Goal

Convert the Pro migration audit into implementable product contracts for the first two reference products without inventing commercial configuration that the repository does not currently authorize.

## Base

- Base main SHA: `d16610c53acb7c9316855bf79e0ad4015e91a399`
- Branch: `docs/pro-product-contracts-wave1-20260912`
- Source of truth: `PRO_MIGRATION_LEDGER.md`, `MONETIZATION_EXECUTION.md`, current tool SPEC/runtime, and the product-scoped billing foundation from PR #516.

## Scope

1. Command Safety Checker — freeze the current Free/Pro feature boundary and define the exact product-scoped migration contract up to, but not including, unresolved product ID, price, Stripe Price env mapping, or live enablement.
2. JSON2Mermaid — define an additive Free/Pro product contract based on the current runtime and search/monetization priority, without removing current Free behavior.
3. Update the per-tool SPECs only where necessary to make these contracts authoritative.

## Non-goals

- Do not create or guess product IDs, prices, Stripe Price IDs, environment variable names, or live checkout flags.
- Do not activate checkout.
- Do not modify ManualFinder or affiliate runtime.
- Do not change detection/conversion algorithms in either tool.
- Do not take existing Free features away merely to manufacture a paid tier.

## Command Safety contract requirements

- The command risk checker remains Free.
- Current paid artifacts remain the candidate paid delta: review Markdown, Codex safety-check task, GitHub Issue draft, JSON export, and Markdown export.
- Migration must replace legacy shared `nicheworks_pro` authority with a product-scoped server-verified entitlement.
- Checkout return path is the Command Safety tool page.
- Browser-local state alone must never become purchase proof.
- Unresolved commercial fields must remain explicitly unresolved.

## JSON2Mermaid contract requirements

- Preserve the current core JSON-to-Mermaid conversion and currently documented Free behavior.
- The Wave 1 additive package is batch workspace, embedded diagram rendering, SVG export, PNG export, and reusable local style presets.
- Larger parsing limits are excluded from this Wave 1 package until benchmark evidence exists.
- No current Free feature is reclassified as paid.

## Deliverables

1. `docs/billing/pro-product-contracts-wave1.md` with implementable contracts and explicit unresolved commercial fields.
2. Command Safety SPEC alignment.
3. JSON2Mermaid SPEC alignment.
4. A clear next implementation queue: Command Safety commercial settings → product-scoped migration; JSON2Mermaid feature implementation/product registration only after its paid delta is confirmed.

## Outcome

- Command Safety Free/paid boundary is fixed without changing runtime behavior.
- Command Safety migration requirements are defined through checkout return path, webhook/D1 entitlement, reload re-verification, and legacy shared-gate retirement; commercial identifiers remain unresolved.
- JSON2Mermaid keeps its complete current converter/download contract Free.
- JSON2Mermaid Wave 1 Pro is additive: batch, embedded rendering, SVG, PNG, and reusable local style presets.
- No price, product ID, Stripe Price mapping, live checkout flag, affiliate configuration, or parser-limit increase was invented.

## Acceptance

- [x] No commercial identifier or price is invented.
- [x] Command Safety Free checker remains Free.
- [x] JSON2Mermaid retains all existing Free contractual behavior.
- [x] Each paid candidate feature is additive rather than a retroactive paywall.
- [x] ManualFinder and affiliate work remain untouched.