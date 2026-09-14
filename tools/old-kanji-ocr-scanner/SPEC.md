# Tool Specification — Old Kanji OCR Scanner

- Slug: `old-kanji-ocr-scanner`
- Public URL: `https://nicheworks.app/tools/old-kanji-ocr-scanner/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`

## Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, detect registered old/variant kanji in the resulting text, and optionally expose contextual Amazon search handoffs for physical document-reading tools.

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
- A separate optional Amazon resource panel exposes fixed searches for non-destructive book scanners and document magnifiers.

## Amazon affiliate contract

- Tracking ID: `nicheworks09-22`.
- Search base: `https://www.amazon.co.jp/s`.
- Fixed search terms only: `ブックスキャナー 非破壊` and `古文書 ルーペ`.
- OCR text, image filename/type/size, detected characters, modern-form preview, selected image state, and any manually entered text are never appended to affiliate URLs.
- Shared `/assets/amazon-affiliate.js` supplies URL validation, Associates disclosure, `rel="sponsored noopener"`, and coarse `affiliate_click` metadata only.
- Allowed click metadata remains only `tool`, `affiliate`, `target`, and `placement`.
- No Amazon product image, price, rating, review, availability, or scraped product metadata is displayed.

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
- Optional fixed Amazon search handoffs for non-destructive book scanners and document magnifiers, plus Associates disclosure.

## State and persistence

Selected image, OCR text, and detection results are page-memory state and are not stored as scan history. Object URLs are revoked when the selected image is cleared/replaced. Pro history/collection features are not active in the current billing-unavailable state. Amazon resource configuration is static and does not persist user state.

## Privacy and network behavior

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page. Amazon search handoffs are fixed URLs and do not contain OCR/image/user-derived values.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

Camera/image selection, OCR status, editable result text, and detected cards form a mobile-friendly vertical scan workflow. Amazon resource links collapse to one column on narrow screens.

## Limits and non-goals

- OCR is configured for Japanese and can misread old/variant kanji, vertical text, faded text, cursive forms, signs, and inscriptions.
- OCR output must be visually reviewed and can be manually corrected.
- The modern-form preview is a mapping-based aid, not an authoritative transcription or interpretation.
- Free operation is one image at a time; batch/history/crop/report features are not currently active.
- Loading external OCR runtime assets means offline operation is not guaranteed.
- Amazon search links are optional shopping handoffs, not product endorsements or suitability guarantees.

## Acceptance criteria

- [ ] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [ ] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [ ] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [ ] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [ ] Planned Pro controls remain locked while billing is unavailable.
- [ ] Amazon links use only the two fixed search terms and `nicheworks09-22`.
- [ ] OCR/image/manual-input values never enter Amazon URLs or affiliate analytics.
- [ ] Associates disclosure is rendered whenever active Amazon targets are available.

## Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/style.css`
- `tools/old-kanji-ocr-scanner/amazon.css`
- `tools/old-kanji-ocr-scanner/affiliate-config.js`
- `tools/old-kanji-ocr-scanner/affiliate.js`
- `assets/amazon-affiliate.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
