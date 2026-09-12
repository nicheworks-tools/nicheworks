# CSV Tidy — canonical tool specification

- **Slug:** `csv-tidy`
- **Display name (JA):** CSV整形ツール
- **Display name (EN):** CSV Tidy
- **Implementation:** `tools/csv-tidy/`
- **Registry state:** active (registered implementation present)
- **Category:** csv, tidy, columns, data
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `csv-tidy` implementation at `/tools/csv-tidy/`. It does not authorize a production rewrite.

## 2. Purpose

Load a CSV locally, reorganize and clean its columns/values, preview the result, and download a new UTF-8 CSV without modifying the source file.

## 3. Inputs

- Local CSV file or built-in sample data.
- Input encoding, delimiter, header-row, and preview-size settings.
- Column order/name/include state.
- Cleanup options and output options.

## 4. Processing behavior

- Load a local CSV or built-in accounting, e-commerce, contact-list, or generic sample.
- Support input encoding selection including auto, UTF-8, and Shift_JIS subject to browser support.
- Support delimiter selection including auto, comma, TAB, and semicolon plus header-row on/off.
- Let users reorder, rename, and exclude columns.
- Apply implemented cleanup rules including leading/trailing whitespace trim, repeated-space normalization, and full-width/half-width conversion.
- Preview transformed rows and output summary before saving.
- Produce UTF-8 output with the implemented BOM option for Excel-oriented compatibility.

## 5. Outputs

- Parsed/cleaned CSV preview and summary.
- Newly generated UTF-8 CSV download.
- Built-in sample CSV download where provided.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** No additional clipboard failure policy is implemented beyond the browser operation. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/csv-tidy/app.js`, `tools/csv-tidy/index.html`.

## 7. Privacy/data handling

CSV reading, transformation, preview, and output generation run in the browser and the selected CSV is not intentionally uploaded by the tool workflow. Suite-wide advertising and analytics resources may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- Column editing and table preview benefit substantially from desktop width; narrow-screen support must preserve access to the controls rather than redefine the tool as a simple form.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same workbench UI.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/csv-tidy/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/csv-tidy/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A supported CSV or built-in sample can be loaded and parsed with the selected delimiter/header settings.
- [ ] Reordering, renaming, excluding, and enabled cleanup rules are reflected in the preview and downloaded output.
- [ ] Saving creates a new UTF-8 CSV and does not mutate the original local file.
- [ ] JP/EN switching preserves the same CSV editing workflow and local-processing notice.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/csv-tidy/index.html`
- `tools/csv-tidy/app.js`
- `tools/csv-tidy/style.css`
- `tools/csv-tidy/usage.html`
