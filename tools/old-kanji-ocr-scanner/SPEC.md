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
- Amazon Associates is active through the reviewed contextual affiliate runtime; offers are tool-specific and user-derived content is never used to build Amazon destinations.

## Amazon affiliate contract

- Canonical monetization class: `AFFILIATE`.
- Amazon Associates is active for Old Kanji OCR Scanner under the all-eight Old Kanji affiliate decision.
- The affiliate panel appears only after OCR/manual result text exists.
- Curated purchase intent: CZUR ET24 Pro, non-destructive book scanners, and LED reading magnifiers.
- Amazon destinations are fixed tool-specific searches; OCR text, image filename/type/size, detected characters, preview text, selected image state, and manually entered text must never be inserted into an affiliate URL or affiliate event.
- Shared `/assets/amazon-affiliate.js` owns URL validation, disclosure, `rel="sponsored noopener"`, and the canonical `affiliate_outbound` event.
- Shared `/assets/old-kanji-amazon-context.js` owns the reviewed tool-specific offer/placement catalog; it does not derive Amazon search terms from user input.
- The free tool task remains usable without interacting with Amazon.

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
- Active Amazon handoffs use only reviewed fixed destinations and the shared privacy-safe outbound event.

## State and persistence

Selected image, OCR text, and detection results are page-memory state and are not stored as scan history. Object URLs are revoked when the selected image is cleared/replaced. Paid history/collection scope is outside the current public free workflow; no inactive sales panel is rendered. Amazon affiliate configuration is fixed by tool and does not persist user input or result state.

## Privacy and network behavior

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page. Active Amazon handoffs use fixed curated destinations; user-derived values are excluded from URLs and affiliate analytics.

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
- Amazon is active under the explicit all-eight affiliate contract; future offer changes must preserve relevance, disclosure, and privacy boundaries.

## Acceptance criteria

- [x] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [x] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [x] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [x] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [x] No fixed Pro price, disabled purchase CTA, or unfinished billing panel is rendered before a verified purchase path is active.

- [x] Contextual Amazon affiliate handoffs follow the reviewed only after OCR/manual result text exists contract, use fixed tool-specific destinations, and exclude user-derived values from outbound URLs/events. Evidence: `assets/old-kanji-amazon-context.js`, `assets/amazon-affiliate.js`, and `scripts/check-old-kanji-amazon.mjs`.

## Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/tests/behavior.test.mjs` — one-image lifecycle/source contract, Japanese Tesseract wiring, exact OCR/handoff text preservation, detection, degraded dictionary mode, metadata/rendering-card contract, and no rendered unfinished Pro sales panel.
- `tools/old-kanji-ocr-scanner/style.css`
- `assets/amazon-affiliate.js`
- `assets/old-kanji-amazon-context.js`
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/compatibility-notes.json`
