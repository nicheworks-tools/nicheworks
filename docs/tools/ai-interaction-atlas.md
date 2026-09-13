# Ai Interaction Atlas — canonical tool specification

- **Slug:** `ai-interaction-atlas`
- **Display name (JA):** About AI Interaction Atlas
- **Display name (EN):** Ai Interaction Atlas
- **Implementation:** `tools/ai-interaction-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** ai, interaction, atlas
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `ai-interaction-atlas` implementation at `/tools/ai-interaction-atlas/`. It does not authorize a production rewrite or live billing launch.

## 2. Purpose

Provide a searchable reference atlas of AI interaction patterns so builders can compare UI patterns, inspect risks and failure states, and turn a selected pattern into implementation-oriented handoff material.

## 3. Inputs

- Search text.
- Filter selections for category, purpose, risk, control, and visibility.
- Pattern selection, favorite actions, comparison selection, and diff-only toggle.
- Current legacy shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Load the local pattern dataset and support text search plus category, purpose, risk, user-control, and AI-visibility filters.
- Open a pattern detail view with purpose, best-fit contexts, non-fit contexts, failure states, trust notes, implementation notes, required states, common mistakes, and a copyable basic implementation prompt.
- Maintain recent items and favorites in browser storage. Current runtime caps favorites at five regardless of current legacy-Pro state; a larger paid favorite limit is not implemented.
- Compare up to two patterns for Free. Current legacy Pro raises comparison to four and expands the comparison from the Free rows to the additional Pro rows.
- Generate the existing handoff blocks for the selected pattern. Preview content may be visible while inactive, but handoff copy and Markdown/JSON save actions are paid.
- Save selected-pattern and comparison outputs as Markdown/JSON only when the current paid state is active.
- Provide separate English and Japanese page families over the same atlas behavior.

## 5. Outputs

Free:
- filtered pattern cards and result count;
- pattern detail panels, recent/favorite lists, and basic prompt copy;
- up to two compared patterns with Free comparison rows and Free comparison copy.

Runtime-backed paid value boundaries:
1. `advancedCompare` — three/four pattern comparison plus additional Pro comparison rows;
2. `handoffCopy` — copy Product Spec, Codex task, GitHub Issue, UX-risk, and Safety/Fallback handoff blocks;
3. `handoffExport` — save selected-pattern handoff Markdown/JSON;
4. `comparisonExport` — save comparison Markdown/JSON.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented guard clauses prevent invalid actions from being represented as successful outputs.
- **Unsupported or over-limit input:** Current Free and paid limits are enforced by runtime controls; no unimplemented fallback limit is implied.
- **Local data failure:** Dataset load failure produces the current load-failure state and no fabricated atlas result.
- **Billing/entitlement failure:** Free atlas browsing remains usable; paid actions remain locked.
- **Copy/download failure:** Clipboard rejection uses the existing feedback path; downloads are created only from current local generated output.
- **Safe fallback/reset:** Current filters/selection/compare controls permit retry without invented state.
- **Runtime evidence inspected:** `tools/ai-interaction-atlas/app.js`, `tools/ai-interaction-atlas/pro-bridge.js`, root/JA pages and local data.

## 7. Privacy/data handling

Pattern search, filtering, comparison, storage, and export generation run in the browser. The tool loads repository-hosted atlas data and the shared NicheWorks Pro client; suite-wide advertising and analytics scripts may also load. User search/filter text is not sent to an AI API by the atlas implementation.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed include the historical Stripe Payment Link and donation providers.

Future billing/entitlement requests may contain fixed product/feature metadata only. Search text, filters, selected/favorite/recent interaction data, compared-pattern content, generated handoff text, export bodies, and filenames must not enter billing/entitlement traffic.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary interaction is a multi-pane searchable reference workspace with filter, list, detail, and comparison regions; mobile controls adapt those panes rather than redefining the tool as a narrow single-column form.
- Preserve the functional width class and common-spec responsive adaptation rules.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The canonical root is English and `/ja/` provides the Japanese experience. Shared JavaScript selects copy based on document language.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must retain tool-specific title/description, self-referencing canonical, and valid WebApplication structured data according to common-spec. SEO prose must remain evidence-based.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code. Advertising must not interrupt the primary input/action flow.

## 12. Donation/support contract

Preserve the existing support block in place according to common-spec; do not replace product actions with donation pressure.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: required-and-present.
- Usage documentation: recommended-and-present in EN/JA.
- FAQ: recommended-and-present under current common-spec interpretation.
- Usage links remain subdued text links and separated from advertising.

## 14. Functional acceptance tests

- [ ] Search/filter changes the visible pattern set without external AI processing.
- [ ] Pattern detail and basic prompt copy remain Free; recent state remains local.
- [ ] Free favorites stay capped at five; Free comparison never exceeds two patterns.
- [ ] Paid behavior supports up to four patterns, additional comparison rows, handoff copy, handoff Markdown/JSON save, and comparison Markdown/JSON save.
- [ ] Missing/unrelated legacy entitlement cannot unlock current paid behavior even when an active-like flag is present.
- [ ] Product-scoped staging fails closed unless server-verified state matches configured product/features.
- [ ] Future live authority is shared `nicheworks.pro`.
- [ ] Billing/entitlement traffic remains free of atlas interaction/generated content.
- [ ] English and Japanese page families preserve equivalent core behavior.

Automated evidence includes the suite runtime-contract checker and `scripts/check-ai-interaction-atlas-product-scoped-staging.mjs`. Browser behavior-level coverage remains separate from source-contract checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond separate EN/JA pages.
- The information-dense workflow is desktop-wide; mobile adaptation must preserve the workspace rather than force an arbitrary narrow fixed width.
- Pro does not currently increase the five-favorite runtime cap.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `ai-interaction-atlas` as `PRO_BUNDLE`. Its future paid product authority is the shared `nicheworks.pro` product; legacy `nicheworks_pro` is compatibility/migration state only.

The exact current additive paid boundaries are the four operations in section 5. Free atlas browsing, five favorites, two-item comparison, Free comparison rows/copy, pattern details, and basic prompt copy must remain independent of billing availability.

The current legacy bridge must require exact `status.active === true` plus `status.entitlement === "nicheworks_pro"`. Missing or unrelated entitlement state must not unlock current paid behavior.

`tools/ai-interaction-atlas/product-scoped-controller.mjs` is non-live staging. It requires explicit product/feature configuration and delegates fail-closed server verification to `assets/nw-product-scoped-controller.mjs`. For live migration, configured product ID must be `nicheworks.pro`; no separate AI Interaction Atlas product is created.

NicheWorks Pro price/currency, Stripe Product/Price, production feature IDs, restore/account policy, legacy purchaser treatment, and migration-wave timing remain unresolved.

### Implementation evidence

- `tools/ai-interaction-atlas/index.html`
- `tools/ai-interaction-atlas/app.js`
- `tools/ai-interaction-atlas/pro-bridge.js`
- `tools/ai-interaction-atlas/product-scoped-controller.mjs`
- `tools/ai-interaction-atlas/styles.css`
- `tools/ai-interaction-atlas/data/`
- `tools/ai-interaction-atlas/ja/`
- `scripts/check-ai-interaction-atlas-product-scoped-staging.mjs`
- `MONETIZATION_CLASSIFICATION_87.md`
- `docs/billing/pro-product-contracts-wave4.md`
- `docs/billing/nicheworks-pro-bundle-contract.md`
