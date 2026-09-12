# Tool Specification — PDF2CSV Local

- Slug: `pdf2csv-local`
- Public URL: `https://nicheworks.app/tools/pdf2csv-local/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Extract table-like text from selectable-text PDFs in the browser and export the reviewed result as CSV or XLSX.

## Current functional contract

- Accept a local PDF up to the implemented size limit shown by the UI (30 MB).
- Target text-based PDFs with selectable text; do not perform OCR for image-only scans.
- Accept optional page-range selection.
- Provide Auto extraction using text coordinates and tunable row/column proximity settings.
- Provide Manual mode that lets the user select a table region in the preview and re-extract that area.
- Preview extracted rows, with cleanup controls for empty rows/columns, CSV BOM, and delimiter choice.
- Export CSV and XLSX after review.
- Support multi-page output; CSV inserts page separators and XLSX uses page-oriented sheets according to current implementation/docs.
- Persist the tool language setting under `pdf2csv-local-lang`.

## Inputs

- One local PDF.
- Optional page range.
- Auto/Manual extraction mode.
- Row tolerance and column-gap settings.
- Manual selection region when applicable.
- CSV cleanup/BOM/delimiter settings.
- JP/EN language selection.

## Outputs

- PDF page preview.
- Extracted table preview.
- CSV file.
- XLSX file.
- Warnings/errors for encrypted, oversized, invalid-range, or weak extraction cases.

## State and persistence

Loaded PDF bytes, manual selection, extraction settings, and extracted table data are current-page state and are not persisted as document history. Language preference is stored as `pdf2csv-local-lang`.

## Privacy and network behavior

PDF contents are processed in the browser and are not uploaded to a conversion backend. The tool may load supporting libraries over the network: the bundled `vendor/xlsx.full.min.js` loader fetches SheetJS from `cdn.sheetjs.com` when `window.XLSX` is absent. Ads/analytics may also load separately. The PDF itself is not sent to SheetJS merely because the library script is loaded.

## Language mode

`bilingual single-page`

## Layout class

`pc-oriented`

PDF preview, manual region selection, extraction controls, and tabular result review are primarily desktop-oriented.

## Limits and non-goals

- No OCR: scanned/photo PDFs without embedded selectable text are unsupported.
- Password-protected or strongly encrypted PDFs are unsupported.
- Complex, rotated, multi-column, decorative, or irregular tables can produce row/column misalignment, duplicates, or blanks.
- Export does not reproduce the visual appearance of the source PDF.
- Extraction accuracy is not guaranteed; preview review is mandatory for reliable use.
- XLSX support depends on the SheetJS library being available.

## Acceptance criteria

- [ ] Image-only PDFs are not falsely presented as OCR-extracted data.
- [ ] Auto extraction and Manual region re-extraction operate on local PDF contents without uploading the PDF.
- [ ] Users can review extracted rows before CSV/XLSX export and adjust cleanup/delimiter/BOM settings.
- [ ] Invalid/oversized/encrypted PDF conditions produce explicit errors rather than fabricated output.
- [ ] Network-loading of the XLSX library is not described as PDF-content upload.

## Implementation evidence

- `tools/pdf2csv-local/index.html`
- `tools/pdf2csv-local/app.js`
- `tools/pdf2csv-local/vendor/xlsx.full.min.js`
- `tools/pdf2csv-local/usage.html`
- `tools/pdf2csv-local/howto.html`
- `tools/pdf2csv-local/style.css`
