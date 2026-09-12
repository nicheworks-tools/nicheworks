# PDF to CSV Local — canonical tool specification

- **Slug:** `pdf2csv-local`
- **Display name (JA):** PDF表CSV変換ローカル
- **Display name (EN):** PDF to CSV Local
- **Implementation:** `tools/pdf2csv-local/`
- **Registry state:** active (registered implementation present)
- **Category:** pdf, csv, table, local
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `pdf2csv-local` implementation at `/tools/pdf2csv-local/`. It does not authorize a production rewrite.

## 2. Purpose

Extract table-like text from selectable-text PDFs in the browser and export the reviewed result as CSV or XLSX.

## 3. Inputs

- One local PDF.
- Optional page range.
- Auto/Manual extraction mode.
- Row tolerance and column-gap settings.
- Manual selection region when applicable.
- CSV cleanup/BOM/delimiter settings.
- JP/EN language selection.

## 4. Processing behavior

- Accept a local PDF up to the implemented size limit shown by the UI (30 MB).
- Target text-based PDFs with selectable text; do not perform OCR for image-only scans.
- Accept optional page-range selection.
- Provide Auto extraction using text coordinates and tunable row/column proximity settings.
- Provide Manual mode that lets the user select a table region in the preview and re-extract that area.
- Preview extracted rows, with cleanup controls for empty rows/columns, CSV BOM, and delimiter choice.
- Export CSV and XLSX after review.
- Support multi-page output; CSV inserts page separators and XLSX uses page-oriented sheets according to current implementation/docs.
- Persist the tool language setting under `pdf2csv-local-lang`.

## 5. Outputs

- PDF page preview.
- Extracted table preview.
- CSV file.
- XLSX file.
- Warnings/errors for encrypted, oversized, invalid-range, or weak extraction cases.

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- [ ] Invalid/oversized/encrypted PDF conditions produce explicit errors rather than fabricated output.

## 7. Privacy/data handling

PDF contents are processed in the browser and are not uploaded to a conversion backend. The tool may load supporting libraries over the network: the bundled `vendor/xlsx.full.min.js` loader fetches SheetJS from `cdn.sheetjs.com` when `window.XLSX` is absent. Ads/analytics may also load separately. The PDF itself is not sent to SheetJS merely because the library script is loaded.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `cdn.jsdelivr.net`, `ofuse.me`, `ko-fi.com`, `cdn.sheetjs.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- PDF preview, manual region selection, extraction controls, and tabular result review are primarily desktop-oriented.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/pdf2csv-local/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Image-only PDFs are not falsely presented as OCR-extracted data.
- [ ] Auto extraction and Manual region re-extraction operate on local PDF contents without uploading the PDF.
- [ ] Users can review extracted rows before CSV/XLSX export and adjust cleanup/delimiter/BOM settings.
- [ ] Invalid/oversized/encrypted PDF conditions produce explicit errors rather than fabricated output.
- [ ] Network-loading of the XLSX library is not described as PDF-content upload.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/pdf2csv-local/index.html`
- `tools/pdf2csv-local/app.js`
- `tools/pdf2csv-local/howto.html`
- `tools/pdf2csv-local/style.css`
- `tools/pdf2csv-local/usage.html`
