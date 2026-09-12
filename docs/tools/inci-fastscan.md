# INCI FastScan — canonical tool specification

- **Slug:** `inci-fastscan`
- **Display name (JA):** INCI成分高速チェック
- **Display name (EN):** INCI FastScan
- **Implementation:** `tools/inci-fastscan/`
- **Registry state:** active (registered implementation present)
- **Category:** inci, cosmetic, ingredients, scan
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `inci-fastscan` implementation at `/tools/inci-fastscan/`. It reflects the current runtime after synchronization with main and does not authorize unrelated production rewrites.

## 2. Purpose

Parse pasted or OCR-extracted cosmetic ingredient labels and compare normalized ingredients with the local/generated INCI dictionary so known, review-needed, and unknown items can be inspected quickly. INCI FastScan is the photo/OCR and detailed-review member of the NicheWorks cosmetics pair; Cosmetic Ingredient Checker Lite remains the faster paste-only Japanese entry point.

## 3. Inputs

- Pasted English/INCI or Japanese ingredient-label text.
- Optional local image for OCR.
- INCI/Japanese tab, sample, OCR, reset, and check actions.
- Optional Cmd/Ctrl + Enter check shortcut.
- JP/EN UI language selection.

## 4. Processing behavior

- Provide INCI/English-label and Japanese-label scan tabs in one bilingual page.
- Keep the working text/OCR interface before long explanatory content so the scanner is immediately usable.
- Accept pasted comma/line-separated ingredient text and built-in samples.
- Preserve legitimate ingredient punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol` through parsing and OCR cleanup.
- Accept an image and run browser-side OCR using Tesseract.js loaded from an external CDN, with separate English and Japanese+English OCR actions.
- Show OCR progress while recognition is running and place OCR output back into the editable ingredient textarea for user review/correction before matching.
- Normalize/parse OCR or pasted text and match ingredients against the local/generated dictionary and declared aliases.
- Show known, review-needed/caution, and unknown/unmatched result states according to the current dictionary logic.
- For sufficiently close unknown spellings, show up to three conservative near-match candidates without automatically replacing user input.
- Treat the Japanese-label tab as Japanese-name/alias matching, not machine translation.
- Provide JP/EN UI and explicit warnings that OCR can misread text and ingredient results are not medical or safety guarantees.
- Link to Cosmetic Ingredient Checker Lite for users who only need a fast paste workflow.

## 5. Outputs

- Editable OCR text and visible OCR status/progress where OCR is used.
- Parsed/matched ingredient result groups and explanatory notes.
- Known/review-needed/unknown classification according to the current dictionary/rules.
- Conservative close-match suggestions for eligible unknown entries; suggestions are display-only and never auto-applied.

Observed delivery capabilities: clipboard copy **not found as a primary result export**; download/export **not found as a primary result export**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented guard clauses prevent the affected action from completing as a successful scan and use the page’s visible feedback path.
- **OCR/library failure:** External Tesseract/CDN load or recognition failures are surfaced through the implemented OCR error/status path; the tool does not substitute fabricated OCR text.
- **Parse or unsupported input:** Unrecognized ingredients remain unknown/unmatched rather than being assigned invented identities or safety conclusions.
- **Near-match handling:** Suggestions are advisory spelling/OCR candidates only and are never silently applied to user input.
- **Safe fallback/reset:** OCR output remains editable before matching, and reset removes current working state so the user can retry.
- **Runtime evidence inspected:** `tools/_shared/cosmetic-ingredient-parser.js`, `tools/inci-fastscan/index.html`, `tools/inci-fastscan/js/app.js`, `tools/inci-fastscan/js/core_matcher.js`, `tools/inci-fastscan/js/core_ocr_post.js`, `tools/inci-fastscan/js/core_parser.js`, `tools/inci-fastscan/js/web_ocr.js`, `tools/inci-fastscan/js/web_ui.js`.

## 7. Privacy/data handling

Ingredient text and selected image analysis run in the browser, but the Tesseract.js OCR library is loaded from the external `unpkg.com` CDN. Suite-wide analytics/advertising resources may also load. Raw ingredient text, OCR output, filenames, and images must not be added to analytics or affiliate requests. The current contract does not claim a fully offline page.

Ingredient text, selected image, OCR result, and scan result are current-session browser state. UI language preference may be stored locally in the browser; the current contract does not define saved scan history.

Network-capable application code: **present** because OCR depends on an external CDN. Non-suite hosts observed include `unpkg.com` plus ordinary suite support/advertising endpoints.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Text/OCR input and result panels work on mobile but benefit from wider space for ingredient result review.
- The current layout is input-first, with explanatory/FAQ content after the primary scanner workflow.
- The implementation must preserve its functional width class and follow common-spec section 9-2 adaptation rules; it must not be forced into a universal fixed narrow width.
- Current audit: no concrete responsive defect was established after the latest main changes.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same scanner; separate INCI and Japanese-label tabs handle source-label style rather than separate site languages.
- The Japanese-label workflow performs dictionary/name/alias matching; it must not be described as machine translation unless the product contract intentionally changes.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/inci-fastscan/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code. Advertising must follow common-spec placement rules and must not be inserted into the primary input flow or directly beneath the principal action button.

The current page also contains an intentionally inactive hidden Amazon-ready slot: `#amazonAffiliateSlot`, provider `amazon`, placement `after-results`, state `inactive`. It must contain no live Amazon URL, Associates tag, affiliate claim, product recommendation, or click tracking until Amazon Associates configuration is explicitly activated. Future activation must not transmit raw ingredient text, OCR output, filenames, images, or complete analysis results; any optional click analytics may use only non-sensitive static metadata.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Current main-page donation/support evidence: **present**. Preserve the existing support block unless the suite contract intentionally changes.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-missing` under the Phase 1 matrix semantics; current `howto/` guidance exists but no separate canonical `usage.html` requirement is imposed.
- **FAQ:** `recommended-and-present`.
- Missing recommendation-only documentation does not independently produce `FIX`.

## 14. Functional acceptance tests

- [ ] Pasted INCI/English and Japanese-label text can be parsed and checked against the current generated dictionary/rules.
- [ ] Slash/middle-dot names and numeric locant commas survive parsing and OCR cleanup.
- [ ] OCR can be started from a selected image when the external Tesseract library loads and visible progress is exposed in the page.
- [ ] OCR results remain editable before ingredient matching.
- [ ] Results distinguish known/review-needed/unknown states without presenting unknown as a medical safety judgment.
- [ ] Eligible unknown spellings can show conservative candidates without auto-replacement.
- [ ] Japanese-label wording describes dictionary matching rather than machine translation.
- [ ] JP/EN switching preserves text scan, OCR, dictionary status, and medical/OCR disclaimers.
- [ ] Cosmetic Ingredient Checker Lite remains linked as the paste-only alternative.
- [ ] The Amazon-ready slot remains inactive and hidden with no live affiliate URL/tag until explicitly configured.

Automated evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/_shared/check-cosmetic-ingredient-parser.mjs` (shared-parser regression/behavior assertions), `tools/inci-fastscan/scripts/validate_dict.js` and `tools/inci-fastscan/validate-dictionary.mjs` (data validation). Phase 1 tool-level behavior-test status remains **behavior-test-missing** because these checks do not exercise the complete OCR/UI workflow.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the bilingual single-page mode.
- The matrix retains the `desktop-wide` audit class for this hybrid information-dense workflow; mobile adaptation must not collapse it into an arbitrary fixed narrow width.
- Amazon affiliate integration is structural readiness only and is not live monetization.

### Implementation evidence

- `tools/_shared/cosmetic-ingredient-parser.js`
- `tools/_shared/check-cosmetic-ingredient-parser.mjs`
- `tools/inci-fastscan/index.html`
- `tools/inci-fastscan/style.css`
- `tools/inci-fastscan/js/core_parser.js`
- `tools/inci-fastscan/js/core_matcher.js`
- `tools/inci-fastscan/js/core_analyze.js`
- `tools/inci-fastscan/js/core_ocr_post.js`
- `tools/inci-fastscan/js/web_ui.js`
- `tools/inci-fastscan/js/web_ocr.js`
- `tools/inci-fastscan/js/generated_dictionary.js`
- `tools/inci-fastscan/js/app.js`
- `tools/inci-fastscan/validate-dictionary.mjs`
- `tools/inci-fastscan/qa.json`
