# INCI FastScan — canonical tool specification

- **Slug:** `inci-fastscan`
- **Display name (JA):** INCI成分高速チェック
- **Display name (EN):** INCI FastScan
- **Implementation:** `tools/inci-fastscan/`
- **Registry state:** active (registered implementation present)
- **Category:** inci, cosmetic, ingredients, scan
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `inci-fastscan` implementation at `/tools/inci-fastscan/`. It does not authorize a production rewrite.

## 2. Purpose

Parse pasted or OCR-extracted cosmetic ingredient labels and compare the normalized ingredients with the local/generated INCI dictionary so known, review-needed, and unknown items can be inspected quickly.

## 3. Inputs

- Pasted English/INCI or Japanese ingredient-label text.
- Optional local image for OCR.
- INCI/Japanese tab, sample, OCR, reset, and check actions.
- UI language.

## 4. Processing behavior

- Provide INCI/English-label and Japanese-label scan tabs.
- Accept pasted comma/line-separated ingredient text and built-in samples.
- Accept an image and run browser-side OCR using Tesseract.js loaded from an external CDN, with separate English/Japanese OCR actions.
- Normalize/parse OCR or pasted text and match ingredients against the generated dictionary and implemented aliases/rules.
- Show ingredient-analysis results that distinguish known, review-needed/caution, and unknown/unmatched items according to the current dictionary logic.
- Support Japanese-label translation/normalization into the ingredient-check workflow as implemented.
- Provide JP/EN UI and explicit warnings that OCR can misread text and ingredient results are not medical or safety guarantees.

## 5. Outputs

- OCR text/status where OCR is used.
- Parsed/matched ingredient result groups and explanatory notes.
- Known/review-needed/unknown classification according to the current dictionary/rules.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Ingredient text and selected image analysis run in the browser, but the Tesseract.js OCR library is loaded from the external `unpkg.com` CDN. Suite-wide analytics/advertising resources may also load. The current contract does not claim a fully offline page.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `unpkg.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Text/OCR input and result panels work on mobile but benefit from wider space for ingredient result review.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same scanner; separate INCI and Japanese-label tabs handle source-label style rather than separate site languages.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/inci-fastscan/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Pasted INCI/English and Japanese-label text can be parsed and checked against the current generated dictionary/rules.
- [ ] OCR can be started from a selected image when the external Tesseract library loads, and the OCR result remains reviewable before ingredient conclusions are trusted.
- [ ] Results distinguish known/review-needed/unknown states without presenting unknown as a medical safety judgment.
- [ ] JP/EN switching preserves text scan, OCR, dictionary status, and medical/OCR disclaimers.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/inci-fastscan/scripts/validate_dict.js` (data validation), `tools/inci-fastscan/validate-dictionary.mjs` (data validation). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/inci-fastscan/index.html`
- `tools/inci-fastscan/js/app.js`
- `tools/inci-fastscan/style.css`
