# Tool Specification — Old Kanji OCR Scanner

- Slug: `old-kanji-ocr-scanner`
- Public URL: `https://nicheworks.app/tools/old-kanji-ocr-scanner/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, and detect registered old/variant kanji in the resulting text.

## Current functional contract

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

## Inputs

- One image file or camera-captured image.
- Editable OCR/manual text.
- JP/EN display language.

## Outputs

- Local image preview and metadata.
- Japanese OCR text and progress/status.
- Old-kanji detection/highlighting.
- Mechanical modern-form preview.
- Clipboard outputs for OCR text, old forms, pairs, and preview.

## State and persistence

Selected image, OCR text, and detection results are page-memory state and are not stored as scan history. Object URLs are revoked when the selected image is cleared/replaced. Pro history/collection features are not active in the current billing-unavailable state.

## Privacy and network behavior

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

Camera/image selection, OCR status, editable result text, and detected cards form a mobile-friendly vertical scan workflow.

## Limits and non-goals

- OCR is configured for Japanese and can misread old/variant kanji, vertical text, faded text, cursive forms, signs, and inscriptions.
- OCR output must be visually reviewed and can be manually corrected.
- The modern-form preview is a mapping-based aid, not an authoritative transcription or interpretation.
- Free operation is one image at a time; batch/history/crop/report features are not currently active.
- Loading external OCR runtime assets means offline operation is not guaranteed.

## Acceptance criteria

- [ ] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [ ] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [ ] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [ ] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [ ] Planned Pro controls remain locked while billing is unavailable.

## Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/style.css`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
