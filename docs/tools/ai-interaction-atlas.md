# Ai Interaction Atlas — canonical tool specification

- **Slug:** `ai-interaction-atlas`
- **Display name (JA):** About AI Interaction Atlas
- **Display name (EN):** Ai Interaction Atlas
- **Implementation:** `tools/ai-interaction-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** ai, interaction, atlas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `ai-interaction-atlas` implementation at `/tools/ai-interaction-atlas/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a searchable reference atlas of AI interaction patterns so builders can compare UI patterns, inspect risks and failure states, and turn a selected pattern into implementation-oriented handoff material.

## 3. Inputs

- Search text.
- Filter selections for category, purpose, risk, control, and visibility.
- Pattern selection, favorite actions, comparison selection, and diff-only toggle.
- Shared NicheWorks Pro entitlement state in the current browser.

## 4. Processing behavior

- Load the local pattern dataset and support text search plus category, purpose, risk, user-control, and AI-visibility filters.
- Open a pattern detail view with purpose, best-fit contexts, non-fit contexts, failure states, trust notes, implementation notes, required states, common mistakes, and a copyable implementation prompt.
- Maintain recent items and favorites in browser storage; free favorites are capped at five.
- Compare two patterns for free; active NicheWorks Pro raises comparison to three or four patterns.
- Generate Pro handoff outputs for the selected pattern, including product-spec, Codex-task, GitHub-Issue, UX-risk, safety/fallback, Markdown, and JSON-oriented outputs.
- Provide separate English and Japanese page families over the same atlas behavior.

## 5. Outputs

- Filtered pattern cards and result count.
- Pattern detail panels, comparison summaries, recent/favorite lists, copied prompts and comparison text.
- Pro-only copied/downloaded handoff material when Pro is active.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **Network/API failure:** The current request path has no separate recovery policy; an unsuccessful request produces no verified remote result. This observed limitation is not treated as an unresolved product choice.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/ai-interaction-atlas/about/index.html`, `tools/ai-interaction-atlas/app.js`, `tools/ai-interaction-atlas/categories/index.html`, `tools/ai-interaction-atlas/compare/index.html`, `tools/ai-interaction-atlas/index.html`, `tools/ai-interaction-atlas/ja/about/index.html`, `tools/ai-interaction-atlas/ja/categories/index.html`, `tools/ai-interaction-atlas/ja/compare/index.html`.

## 7. Privacy/data handling

Pattern search, filtering, comparison, storage, and export generation run in the browser. The tool loads repository-hosted atlas data and the shared NicheWorks Pro client; suite-wide advertising and analytics scripts may also load. User search/filter text is not sent to an AI API by the atlas implementation.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary interaction is a multi-pane searchable reference workspace with filter, list, detail, and comparison regions; mobile controls adapt those panes rather than redefining the tool as a narrow single-column form.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The canonical root is English and `/ja/` provides the Japanese experience. Shared JavaScript selects copy based on the document language.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/ai-interaction-atlas/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/ai-interaction-atlas/ja/usage/index.html`, `tools/ai-interaction-atlas/usage/index.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Searching or applying a supported filter changes the visible pattern set without external AI processing.
- [ ] Opening a pattern exposes its detail information and supports prompt copying; recent state is retained locally.
- [ ] Free comparison never exceeds two items, while active Pro allows up to four and exposes Pro handoff/export actions.
- [ ] English and Japanese page families preserve equivalent core pattern browsing behavior.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/ai-interaction-atlas/index.html`
- `tools/ai-interaction-atlas/app.js`
- `tools/ai-interaction-atlas/styles.css`
