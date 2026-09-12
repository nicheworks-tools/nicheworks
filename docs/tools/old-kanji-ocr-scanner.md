# Old Kanji Ocr Scanner — canonical tool specification

- **Slug:** `old-kanji-ocr-scanner`
- **Display name (JA):** 旧字体OCRスキャナー | Old Kanji OCR Scanner
- **Display name (EN):** Old Kanji Ocr Scanner
- **Implementation:** `tools/old-kanji-ocr-scanner/`
- **Registry state:** active (registered implementation present)
- **Category:** old, kanji, ocr, scanner
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `old-kanji-ocr-scanner` implementation at `/tools/old-kanji-ocr-scanner/`. It does not authorize a production rewrite.

## 2. Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, and detect registered old/variant kanji in the resulting text.

## 3. Inputs

- One image file or camera-captured image.
- Editable OCR/manual text.
- JP/EN display language.

## 4. Processing behavior

- Accept one local image through file selection/camera capture and show preview plus file name, size, and MIME type.
- Run Japanese OCR with Tesseract.js using `Tesseract.recognize(file, 'jpn', ...)`.
- Load the Tesseract.js script from jsDelivr and allow its engine/language data to load as required by Tesseract.
- Place OCR output in an editable text area; the same text area also supports manual input before OCR.
- Re-run old-kanji detection whenever the editable OCR/manual text changes.
- Show detection summary, highlighted text, detected-character cards, metadata, and a mechanical modern-form preview.
- Allow copying OCR text, detected old forms, correspondence table, and modern preview.
- Load same-site Old Kanji mapping/metadata/compatibility assets for detection.
- Free mode is designed for one-image review.
- Old Kanji Toolkit Pro features such as batch OCR, saved history, crop OCR, zoom inspection, image marking, collection, and report/export are shown as planned/locked because billing is not connected.

## 5. Outputs

- Local image preview and metadata.
- Japanese OCR text and progress/status.
- Old-kanji detection/highlighting.
- Mechanical modern-form preview.
- Clipboard outputs for OCR text, old forms, pairs, and preview.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- [ ] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [ ] Planned Pro controls remain locked while billing is unavailable.

## 7. Privacy/data handling

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts observed: `cdn.jsdelivr.net`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- Camera/image selection, OCR status, editable result text, and detected cards form a mobile-friendly vertical scan workflow.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/old-kanji-ocr-scanner/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [ ] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [ ] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [ ] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [ ] Planned Pro controls remain locked while billing is unavailable.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/style.css`
