# Tool Specification — AI Interaction Atlas

- Slug: `ai-interaction-atlas`
- Public URL: `https://nicheworks.app/tools/ai-interaction-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/ai-interaction-atlas.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Provide a searchable reference atlas of AI interaction patterns so builders can compare UI patterns, inspect risks and failure states, and turn a selected pattern into implementation-oriented handoff material.

## Current functional contract

- Load the local pattern dataset and support text search plus category, purpose, risk, user-control, and AI-visibility filters.
- Open a pattern detail view with purpose, best-fit contexts, non-fit contexts, failure states, trust notes, implementation notes, required states, common mistakes, and a copyable basic implementation prompt.
- Maintain recent items and favorites in browser storage. Current runtime caps favorites at five in both Free and current legacy-Pro state; a larger Pro favorite limit is not part of the product contract.
- Compare up to two patterns for Free. Current legacy Pro raises comparison to four and exposes additional comparison rows.
- Current legacy Pro also gates copying the generated handoff blocks plus selected-pattern/comparison Markdown and JSON downloads.
- Provide separate English and Japanese page families over the same atlas behavior.

## Inputs

- Search text.
- Filter selections for category, purpose, risk, control, and visibility.
- Pattern selection, favorite actions, comparison selection, and diff-only toggle.
- Current legacy shared NicheWorks Pro entitlement state.

## Outputs

Free:
- filtered pattern cards and result count;
- pattern detail panels, recent/favorite lists and basic prompt copy;
- comparison of up to two patterns with the Free comparison rows and copy path.

Current paid value boundaries:
1. `advancedCompare` — compare three or four patterns and expose the additional Pro comparison rows;
2. `handoffCopy` — copy Product Spec, Codex task, GitHub Issue, UX-risk, and Safety/Fallback handoff blocks;
3. `handoffExport` — save selected-pattern handoff Markdown or JSON;
4. `comparisonExport` — save comparison Markdown or JSON.

## State and persistence

Favorites, recent items, and comparison selections use `localStorage` keys `nw_aiia_favorites`, `nw_aiia_recent`, and `nw_aiia_compare`. Current filters and the open detail are in-memory UI state. Downloaded exports are user-controlled files.

The current legacy shared-Pro state is compatibility/migration state only. Browser-local active state is not the future purchase authority.

## Privacy and network behavior

Pattern search, filtering, comparison, storage, and export generation run in the browser. The tool loads repository-hosted atlas data and the shared NicheWorks Pro client; suite-wide advertising and analytics scripts may also load. User search/filter text is not sent to an AI API by the atlas implementation.

Future billing/entitlement requests may contain fixed product/feature metadata only. Search text, active filters, selected/favorite/recent pattern interaction data, comparison content, generated handoff text, output bodies, and filenames must not enter the billing path.

## Product-scoped migration staging

`MONETIZATION_CLASSIFICATION_87.md` classifies `ai-interaction-atlas` as `PRO_BUNDLE`. The future shared product authority is `nicheworks.pro`; legacy `nicheworks_pro` remains compatibility/migration state only.

`tools/ai-interaction-atlas/product-scoped-controller.mjs` stages exactly four paid operation boundaries:

1. `advancedCompare`
2. `handoffCopy`
3. `handoffExport`
4. `comparisonExport`

The wrapper delegates verification to `assets/nw-product-scoped-controller.mjs`, requires an explicit product ID plus complete unique feature map, and fails closed for wrong-product, local-only, unverified, incomplete/duplicate mapping, or entitlement-refresh failures.

For live migration of this approved bundle member, the configured product ID must be `nicheworks.pro`. No AI-Interaction-Atlas-specific paid product is authorized by this contract.

The current legacy bridge must require both `status.active === true` and exact `status.entitlement === "nicheworks_pro"`; a missing entitlement must not fall back to the expected legacy entitlement.

## Language mode

`separate JA/EN pages`

The canonical root is English and `/ja/` provides the Japanese experience. Shared JavaScript selects copy based on the document language.

## Layout class

`pc-oriented`

The primary interaction is a multi-pane searchable reference workspace with filter, list, detail, and comparison regions; mobile controls adapt those panes rather than redefining the tool as a narrow single-column form.

## Limits and non-goals

- The atlas does not call an AI model and does not produce live model output.
- Pattern guidance is design reference material, not a guarantee that an AI product will be safe, correct, or compliant.
- Free comparison is limited to two items and favorites to five according to current runtime.
- Pro does not currently increase the favorites limit.
- Boundary staging does not decide NicheWorks Pro price/currency, Stripe Product/Price, production feature IDs, restore policy, purchaser migration, or live rollout timing.
- Product-scoped staging is non-live until the common bundle is commercially configured and this migration wave is authorized.

## Acceptance criteria

- [ ] Searching or applying a supported filter changes the visible pattern set without external AI processing.
- [ ] Opening a pattern exposes detail information and basic prompt copy; recent state is retained locally.
- [ ] Free favorites remain capped at five and Free comparison never exceeds two patterns.
- [ ] Current paid behavior supports up to four compared patterns, additional comparison rows, the handoff copy pack, selected-pattern Markdown/JSON export, and comparison Markdown/JSON export.
- [ ] The current legacy bridge does not activate on `status.active` alone when the entitlement is missing or unrelated.
- [ ] The staged product-scoped wrapper represents exactly the four documented paid boundaries and fails closed unless server-verified state matches the configured product/features.
- [ ] Future live product authority is shared `nicheworks.pro`, not a tool-specific product.
- [ ] Billing/entitlement traffic contains no atlas interaction or generated handoff content.
- [ ] English and Japanese page families preserve equivalent core pattern browsing behavior.

## Implementation evidence

- `tools/ai-interaction-atlas/index.html`
- `tools/ai-interaction-atlas/app.js`
- `tools/ai-interaction-atlas/complete-details.js`
- `tools/ai-interaction-atlas/pro-bridge.js`
- `tools/ai-interaction-atlas/product-scoped-controller.mjs`
- `tools/ai-interaction-atlas/data/`
- `tools/ai-interaction-atlas/ja/`
- `scripts/check-ai-interaction-atlas-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave4.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
