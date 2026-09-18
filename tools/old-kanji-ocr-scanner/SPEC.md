# Tool Specification — Old Kanji OCR Scanner

- Slug: `old-kanji-ocr-scanner`
- Public URL: `https://nicheworks.app/tools/old-kanji-ocr-scanner/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`

## Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, detect registered old/variant kanji in the resulting text, and optionally expose contextual Amazon search handoffs for physical document-reading tools.

## Search cluster role

- Primary intent: read a photographed/scanned image with browser OCR and inspect recognized old/variant forms.
- Primary query families: `旧字体 OCR`, `古文書 OCR 漢字`, `画像 旧字体 読み取り`.
- Supporting query families: `旧漢字 画像 検索`, `旧字体 写真 読み取り`.
- The page is the cluster's image-input/OCR tool. It must not present itself as the text-only highlighter or generic reference.
- Primary task handoffs are Old Kanji Reference, Old Document Kanji Highlighter, and Kanji Modernizer.

## Current functional contract

- Accept one local image through file selection/camera capture and show preview plus file name, size, and MIME type.
- Run Japanese OCR with Tesseract.js using `Tesseract.recognize(file, 'jpn', ...)`.
- Load the Tesseract.js script from jsDelivr and allow its engine/language data to load as required by Tesseract.
- Place OCR output in an editable text area; preserve the recognized text's leading/trailing whitespace and line breaks; the same text area also supports manual input before OCR.
- Re-run old-kanji detection whenever the editable OCR/manual text changes.
- Show detection summary, highlighted text, detected-character cards, metadata, and a mechanical modern-form preview.
- Allow copying OCR text, detected old forms, correspondence table, and modern preview.
- Load same-site Old Kanji mapping/metadata/compatibility assets for detection.
- Free mode is designed for one-image review.
- Future batch/history/crop/report scope is not advertised through an unfinished public sales panel while no verified purchase path is connected.
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

Selected image, OCR text, and detection results are page-memory state and are not stored as scan history. Object URLs are revoked when the selected image is cleared/replaced. Paid history/collection scope is outside the current public free workflow; no inactive sales panel is rendered. Amazon resource configuration is static and does not persist user state.

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

- [x] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [x] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [x] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [x] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [x] No fixed Pro price, disabled purchase CTA, or unfinished billing panel is rendered before a verified purchase path is active.
- [ ] Amazon links use only the two fixed search terms and `nicheworks09-22`.
- [ ] OCR/image/manual-input values never enter Amazon URLs or affiliate analytics.
- [ ] Associates disclosure is rendered whenever active Amazon targets are available.

## Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/tests/behavior.test.mjs` — one-image lifecycle/source contract, Japanese Tesseract wiring, exact OCR/handoff text preservation, detection, degraded dictionary mode, metadata/rendering-card contract, and no rendered unfinished Pro sales panel.
- `tools/old-kanji-ocr-scanner/style.css`
- `tools/old-kanji-ocr-scanner/amazon.css`
- `tools/old-kanji-ocr-scanner/affiliate-config.js`
- `tools/old-kanji-ocr-scanner/affiliate.js`
- `assets/amazon-affiliate.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
