# Old Kanji Ocr Scanner — canonical tool specification

- **Slug:** `old-kanji-ocr-scanner`
- **Display name (JA):** 旧字体OCRスキャナー | Old Kanji OCR Scanner
- **Display name (EN):** Old Kanji Ocr Scanner
- **Implementation:** `tools/old-kanji-ocr-scanner/`
- **Registry state:** active (registered implementation present)
- **Category:** old, kanji, ocr, scanner
- **Common specification:** `common-spec/spec-ja.md`
- **Affiliate specification:** `common-spec/amazon-affiliate.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `old-kanji-ocr-scanner` implementation at `/tools/old-kanji-ocr-scanner/`. It does not authorize a production rewrite.

## 2. Purpose

Run browser-side Japanese OCR on one selected image, let the user correct the recognized text, detect registered old/variant kanji in the resulting text, and optionally expose contextual Amazon search handoffs for physical document-reading tools.

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
- The Amazon resource panel builds fixed tagged Amazon.co.jp search URLs only for `ブックスキャナー 非破壊` and `古文書 ルーペ` using tracking ID `nicheworks09-22`.

## 5. Outputs

- Local image preview and metadata.
- Japanese OCR text and progress/status.
- Old-kanji detection/highlighting.
- Mechanical modern-form preview.
- Clipboard outputs for OCR text, old forms, pairs, and preview.
- Optional contextual Amazon search links plus the required Associates disclosure.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** No dedicated recovery branch is implemented; a failed read/parse produces no successful derived output. This current limitation is recorded rather than converted into a product decision.
- **Network/API failure:** The current request path has no separate recovery policy; an unsuccessful request produces no verified remote result. This observed limitation is not treated as an unresolved product choice.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/old-kanji-ocr-scanner/app.js`, `tools/old-kanji-ocr-scanner/index.html`.

## 7. Privacy/data handling

The selected image is passed to Tesseract.js in the browser and is not uploaded to an external OCR API by tool code. However, the OCR engine script is loaded from jsDelivr and Tesseract may load OCR runtime/language data over the network. Same-site reference JSON, ads, and analytics may also load. Therefore the tool is browser-side OCR, not a fully offline page.

Amazon affiliate URLs are fixed-resource searches. OCR text, image filename/type/size, detected characters, modern-form preview, selected image state, and manually entered text are not appended to those URLs or affiliate analytics. Affiliate click events use only `tool`, `affiliate`, `target`, and `placement`.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts include `cdn.jsdelivr.net` and Amazon.co.jp through explicit user-initiated affiliate navigation.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- Camera/image selection, OCR status, editable result text, and detected cards form a mobile-friendly vertical scan workflow.
- The Amazon resource grid collapses to one column on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- Existing languages must not be removed.
- Affiliate resource labels follow the page language; the Associates disclosure remains bilingual.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/old-kanji-ocr-scanner/`, and valid `WebApplication` JSON-LD. SEO prose must remain evidence-based.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button.

### Affiliate contract

- Shared `/assets/amazon-affiliate.js`, local `affiliate-config.js`, and local `affiliate.js` form the Amazon path.
- Production tracking ID is `nicheworks09-22`.
- Active targets are fixed searches for non-destructive book scanners and document magnifiers only.
- Associates disclosure is visible whenever active targets are available.
- Links use `rel="sponsored noopener"` and shared coarse `affiliate_click` metadata only.
- No product images, prices, ratings, reviews, availability, or scraped product metadata are rendered.
- OCR text, image metadata, detected characters, manual text, or scan state may not enter affiliate URLs or analytics.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve the footer-near OFUSE + Ko-fi support block and shared support styling unless the suite contract intentionally changes.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: `required-and-present`.
- Usage documentation: `recommended-and-missing`.
- FAQ: `recommended-and-missing`.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A selected image can be previewed and cleared without uploading it to an external OCR API.
- [ ] Running OCR invokes Tesseract with Japanese language configuration and exposes progress/status feedback.
- [ ] Editing OCR text immediately updates old-kanji detection and the mechanical modern preview.
- [ ] Failure to load old-kanji reference data still leaves OCR/manual text editing available with an explicit data-load warning.
- [ ] Planned Pro controls remain locked while billing is unavailable.
- [ ] Amazon resource configuration uses `nicheworks09-22` and only the two approved fixed queries.
- [ ] OCR/image/user-derived values never enter Amazon URLs or affiliate analytics.
- [ ] Associates disclosure and shared sponsored-link behavior remain active.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs`. Behavior-level status remains **behavior-test-missing** for a full real-browser suite.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/old-kanji-ocr-scanner/index.html`
- `tools/old-kanji-ocr-scanner/app.js`
- `tools/old-kanji-ocr-scanner/style.css`
- `tools/old-kanji-ocr-scanner/amazon.css`
- `tools/old-kanji-ocr-scanner/affiliate-config.js`
- `tools/old-kanji-ocr-scanner/affiliate.js`
- `assets/amazon-affiliate.js`
