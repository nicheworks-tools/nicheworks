# Minutes to Ops — canonical tool specification

- **Slug:** `minutes-to-ops`
- **Display name (JA):** 議事録から実行項目へ
- **Display name (EN):** Minutes to Ops
- **Implementation:** `tools/minutes-to-ops/`
- **Registry state:** active (registered implementation present)
- **Category:** minutes, ops, tasks, meeting
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `minutes-to-ops` implementation at `/tools/minutes-to-ops/`. It does not authorize a production rewrite.

## 2. Purpose

Turn pasted meeting minutes into operational artifacts using deterministic rule-based extraction rather than AI summarization.

## 3. Inputs

- Meeting minutes text.
- Optional meeting title, date, and participants.
- JA/EN UI selection.
- Pro actions when the shared entitlement is active.

## 4. Processing behavior

- Accept meeting notes plus optional meeting title, date, and participants.
- Extract ToDo candidates from rule/keyword patterns and derive owner/due fields when present.
- Extract decision/agreement lines and produce an SOP draft.
- Infer whether output headings should be Japanese or English from the pasted notes; switching the UI does not translate the notes.
- Free mode provides generation, previews, Markdown/SOP copy, CSV download, and Markdown download.
- Pro mode adds saved history, history comparison, a bundled output pack, GitHub Issue format, Codex request text, and SOP handoff Markdown copy/download.
- Cap ToDo extraction rather than attempting unlimited meeting-note interpretation.

## 5. Outputs

- ToDo table with Task, Owner, Due, Priority, and Status fields.
- Decision list.
- SOP draft.
- CSV and Markdown previews/downloads.
- Pro GitHub Issue, Codex task, SOP handoff, history comparison, and output pack.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/minutes-to-ops/app.js`, `tools/minutes-to-ops/index.html`.

## 7. Privacy/data handling

Extraction runs in the browser. Meeting text is not sent to an AI summarization service. Ads/analytics and the external Pro purchase flow may communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary workflow uses dense notes input, tabular ToDos, multiple artifact panels, and Pro handoff outputs, although responsive use remains supported.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The UI labels switch JA/EN; source minutes are not translated, and output heading language is inferred from the source text.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/minutes-to-ops/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/minutes-to-ops/usage-en.html`, `tools/minutes-to-ops/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Free generation works without an AI API and produces ToDo, decision, SOP, CSV, and Markdown artifacts from pasted text.
- [ ] UI language switching does not silently translate the pasted meeting text.
- [ ] Free CSV/Markdown download remains available when Pro is inactive.
- [ ] Pro history and Pro-only output actions remain gated by the shared entitlement and history uses `nw_mto_history_v2`.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/minutes-to-ops/index.html`
- `tools/minutes-to-ops/app.js`
- `tools/minutes-to-ops/howto-en.html`
- `tools/minutes-to-ops/howto.html`
- `tools/minutes-to-ops/style.css`
- `tools/minutes-to-ops/usage-en.html`
- `tools/minutes-to-ops/usage.html`
