# Tool Specification — PDF Page Tools Mini

- Slug: `pdf-page-tools-mini`
- Public URL: `https://nicheworks.app/tools/pdf-page-tools-mini/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Edit page order and composition of one or more PDFs entirely in the browser, then download a new PDF without modifying the originals.

## Current functional contract

- Accept one or more PDF files through picker or drag-and-drop.
- Load pages into a merged page view using bundled PDF libraries.
- Delete, reorder, and rotate pages in the current merged output.
- Support a single undo step for page-edit operations.
- Extract selected page ranges such as `1-3,5,8-10` into a separate downloaded PDF.
- Save the current merged/edited pages as a new PDF file.
- Allow adding additional PDFs and resetting the editor.
- Keep original input PDFs unchanged.
- Switch JP/EN UI.

## Inputs

- One or more local PDF files.
- Page operations: reorder, delete, rotate, add/reset, undo.
- Optional extraction range.
- JP/EN display language.

## Outputs

- Current merged-page preview/list.
- Edited PDF download.
- Extracted-range PDF download.
- Status/error messages for unsupported or failed PDFs.

## State and persistence

Loaded PDF bytes and page-edit state are held in current-page memory and are not persisted after reload. No PDF history is saved.

## Privacy and network behavior

PDF bytes are processed in the browser. Core PDF libraries are shipped from same-site `vendor` files, and selected PDFs are not uploaded to a PDF-processing backend. Ads/analytics may load separately.

## Language mode

`bilingual single-page`

## Layout class

`pc-oriented`

Multiple files, page thumbnails/list operations, range extraction, and reorder controls benefit from desktop space, although the page remains responsive.

## Limits and non-goals

- Password-protected/protected PDFs are unsupported.
- Corrupted, special, image-heavy, very large, 100+ page, or tens-of-MB PDFs may exceed device/browser resources.
- The tool does not compress PDFs, OCR scanned pages, edit page contents, redact text, or alter original files.
- Undo is limited rather than a full edit-history stack.

## Acceptance criteria

- [ ] Local PDFs can be combined into a current-page merged view without uploading their contents.
- [ ] Reorder/delete/rotate operations change only the in-memory output plan and saved new PDF, never the original files.
- [ ] Valid visible-page ranges can be extracted into a separate PDF and invalid ranges surface a recoverable error.
- [ ] Password/protection failures are reported rather than silently producing corrupted output.
- [ ] Save produces a separate edited PDF from the current page order/rotation state.

## Implementation evidence

- `tools/pdf-page-tools-mini/index.html`
- `tools/pdf-page-tools-mini/app.js`
- `tools/pdf-page-tools-mini/vendor/pdf-lib/pdf-lib.min.js`
- `tools/pdf-page-tools-mini/vendor/pdfjs/pdfjs-setup.mjs`
- `tools/pdf-page-tools-mini/style.css`
