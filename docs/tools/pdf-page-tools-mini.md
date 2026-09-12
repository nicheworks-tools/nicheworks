# PDF Page Tools Mini — canonical tool specification

- **Slug:** `pdf-page-tools-mini`
- **Display name (JA):** PDFページ操作ミニ
- **Display name (EN):** PDF Page Tools Mini
- **Implementation:** `tools/pdf-page-tools-mini/`
- **Registry state:** active (registered implementation present)
- **Category:** pdf, pages, split, browser
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `pdf-page-tools-mini` implementation at `/tools/pdf-page-tools-mini/`. It does not authorize a production rewrite.

## 2. Purpose

Edit page order and composition of one or more PDFs entirely in the browser, then download a new PDF without modifying the originals.

## 3. Inputs

- One or more local PDF files.
- Page operations: reorder, delete, rotate, add/reset, undo.
- Optional extraction range.
- JP/EN display language.

## 4. Processing behavior

- Accept one or more PDF files through picker or drag-and-drop.
- Load pages into a merged page view using bundled PDF libraries.
- Delete, reorder, and rotate pages in the current merged output.
- Support a single undo step for page-edit operations.
- Extract selected page ranges such as `1-3,5,8-10` into a separate downloaded PDF.
- Save the current merged/edited pages as a new PDF file.
- Allow adding additional PDFs and resetting the editor.
- Keep original input PDFs unchanged.
- Switch JP/EN UI.

## 5. Outputs

- Current merged-page preview/list.
- Edited PDF download.
- Extracted-range PDF download.
- Status/error messages for unsupported or failed PDFs.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

PDF bytes are processed in the browser. Core PDF libraries are shipped from same-site `vendor` files, and selected PDFs are not uploaded to a PDF-processing backend. Ads/analytics may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`, `www.apache.org`, `a`, `a@b`, `тест`, `a#б`, `x`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- Multiple files, page thumbnails/list operations, range extraction, and reorder controls benefit from desktop space, although the page remains responsive.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/pdf-page-tools-mini/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/pdf-page-tools-mini/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Local PDFs can be combined into a current-page merged view without uploading their contents.
- [ ] Reorder/delete/rotate operations change only the in-memory output plan and saved new PDF, never the original files.
- [ ] Valid visible-page ranges can be extracted into a separate PDF and invalid ranges surface a recoverable error.
- [ ] Password/protection failures are reported rather than silently producing corrupted output.
- [ ] Save produces a separate edited PDF from the current page order/rotation state.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/pdf-page-tools-mini/index.html`
- `tools/pdf-page-tools-mini/app.js`
- `tools/pdf-page-tools-mini/style.css`
- `tools/pdf-page-tools-mini/usage.html`
