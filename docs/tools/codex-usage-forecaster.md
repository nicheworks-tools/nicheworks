# Codex Usage Forecaster — canonical tool specification

- **Slug:** `codex-usage-forecaster`
- **Display name (JA):** Codex使用量見積もり
- **Display name (EN):** Codex Usage Forecaster
- **Implementation:** `tools/codex-usage-forecaster/`
- **Registry state:** active (registered implementation present)
- **Category:** codex, estimate, usage, planning
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `codex-usage-forecaster` implementation at `/tools/codex-usage-forecaster/`. It does not authorize a production rewrite.

## 2. Purpose

Record user-entered Codex usage percentages and estimate consumption rate, depletion timing, and reset-related context for five-hour and weekly usage windows.

## 3. Inputs

- Weekly usage percentage and five-hour usage percentage.
- Optional mode, status, model, and note fields.
- Filter controls and named profile data.
- Optional manual reset date/time values.
- Compatible JSON import file.
- Theme and language/page selection.

## 4. Processing behavior

- Accept manual weekly and five-hour usage percentages together with optional mode, status, model, and note metadata.
- Save usage observations locally and derive simple forecast KPIs from the stored log history.
- Filter observations by mode, status, model, and note text; optionally make forecasts respect those filters.
- Save, apply, overwrite, and delete named filter profiles.
- Accept manual weekly and five-hour reset timestamps that take precedence when supplied.
- Export logs, profiles, settings, and reset data as JSON and import compatible exported JSON to replace current local data.
- List stored observations and support deletion/clearing.
- Provide separate Japanese and English page sets plus usage/how-to documentation.

## 5. Outputs

- Weekly and five-hour consumption/ETA KPIs.
- Reset display based on automatic or manual reset context.
- Filtered log table and counts.
- Saved local profiles/settings.
- User-triggered JSON export.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/codex-usage-forecaster/app-fixed.js`, `tools/codex-usage-forecaster/app.js`, `tools/codex-usage-forecaster/en/index.html`, `tools/codex-usage-forecaster/index.html`.

## 7. Privacy/data handling

Forecast calculation and storage run locally in the browser. The usage observations entered into the tool are not intentionally uploaded by the forecasting workflow. Suite-wide advertising and analytics scripts may load independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ko-fi.com`, `ofuse.me`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The dashboard contains KPI groups, configuration panels, filters, profiles, and a horizontally rich log table; narrow-screen support is secondary to the information-dense dashboard layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- Japanese is served at the canonical root and the English interface is under `/en/`.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/codex-usage-forecaster/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/codex-usage-forecaster/en/usage.html`, `tools/codex-usage-forecaster/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Saving at least two usable observations can produce forecast information for the applicable usage window.
- [ ] Filters and saved profiles affect the visible log set and, when enabled, the forecast source set.
- [ ] Exported JSON can be downloaded and a compatible import can replace the current local logs/profiles/settings.
- [ ] Manual reset values override automatic reset presentation when present, and clearing them returns to automatic behavior.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/codex-usage-forecaster/index.html`
- `tools/codex-usage-forecaster/app-fixed.js`
- `tools/codex-usage-forecaster/app.js`
- `tools/codex-usage-forecaster/en/howto.html`
- `tools/codex-usage-forecaster/en/usage.html`
- `tools/codex-usage-forecaster/howto.html`
- `tools/codex-usage-forecaster/style.css`
- `tools/codex-usage-forecaster/usage.html`
