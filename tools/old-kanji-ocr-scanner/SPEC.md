# Tool Specification — Old Kanji OCR Scanner

- Slug: `old-kanji-ocr-scanner`
- Public URL: `https://nicheworks.app/tools/old-kanji-ocr-scanner/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules: `common-spec/amazon-affiliate.md`

## Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, and detect registered old/variant kanji in the resulting text.

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
- Historical Amazon resource wiring remains dormant compatibility code only. Canonical monetization class is `HOLD`; production affiliate config remains `enabled: false` with no tracking ID or outbound target.

## Amazon affiliate contract

- Canonical monetization SSOT class: `HOLD`.
- Old Kanji OCR Scanner is not in the canonical `AFFILIATE` class.
- Production `affiliate-config.js` must remain `enabled: false`, `provider: "disabled"`, with an empty `trackingId`, `targets`, and `searches`.
- Historical Amazon UI/helper files may remain only as dormant fail-closed compatibility wiring and must render no live Amazon CTA or Associates disclosure while disabled.
- OCR text, image filename/type/size, detected characters, modern-form preview, selected image state, and manually entered text must never enter an affiliate URL or affiliate event.
- If a future explicit monetization decision moves this tool into the canonical `AFFILIATE` class, shared `/assets/amazon-affiliate.js` remains the only Amazon measurement authority and uses the coarse `affiliate_outbound` event. Cluster analytics must not duplicate that event.

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
- No live Amazon outbound handoff while the canonical affiliate config remains disabled.

## State and persistence

Selected image, OCR text, and detection results are page-memory state and are not stored as scan history. Object URLs are revoked when the selected image is cleared/replaced. Paid history/collection scope is outside the current public free workflow; no inactive sales panel is rendered. Historical Amazon compatibility configuration is static, disabled, and does not persist user state.

## Privacy and network behavior

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page. Current disabled Amazon compatibility wiring has no live outbound destination; OCR/image/user-derived values must not enter any future affiliate URL or event.

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
- Historical Amazon compatibility wiring is not authorization to activate affiliate links; activation requires an explicit canonical `AFFILIATE` classification.

## Acceptance criteria

- [x] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [x] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [x] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [x] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [x] No fixed Pro price, disabled purchase CTA, or unfinished billing panel is rendered before a verified purchase path is active.
- [x] Canonical monetization keeps Old Kanji OCR Scanner in `HOLD` and outside the `AFFILIATE` class with production Amazon config fail-closed. Evidence: `MONETIZATION_CLASSIFICATION.json`, `affiliate-config.js`, and `scripts/check-old-kanji-amazon.mjs`.
- [x] OCR/image/manual-input values cannot enter an Old Kanji Amazon URL/event while the config is disabled; cluster analytics also does not duplicate shared affiliate measurement. Evidence: `scripts/check-old-kanji-amazon.mjs` and `scripts/check-old-kanji-measurement.mjs`.
- [x] No Associates disclosure or live Amazon CTA is rendered from the disabled config. Evidence: shared Amazon helper renders disclosure/CTA only for active targets; `scripts/check-old-kanji-amazon.mjs` locks the disabled state.

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
