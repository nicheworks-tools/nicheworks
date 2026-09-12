# Tool Specification — INCI FastScan

- Slug: `inci-fastscan`
- Public URL: `https://nicheworks.app/tools/inci-fastscan/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Parse pasted or OCR-extracted cosmetic ingredient labels and compare the normalized ingredients with the local/generated INCI dictionary so known, review-needed, and unknown items can be inspected quickly.

## Current functional contract

- Provide INCI/English-label and Japanese-label scan tabs.
- Accept pasted comma/line-separated ingredient text and built-in samples.
- Accept an image and run browser-side OCR using Tesseract.js loaded from an external CDN, with separate English/Japanese OCR actions.
- Normalize/parse OCR or pasted text and match ingredients against the generated dictionary and implemented aliases/rules.
- Show ingredient-analysis results that distinguish known, review-needed/caution, and unknown/unmatched items according to the current dictionary logic.
- Support Japanese-label translation/normalization into the ingredient-check workflow as implemented.
- Provide JP/EN UI and explicit warnings that OCR can misread text and ingredient results are not medical or safety guarantees.

## Inputs

- Pasted English/INCI or Japanese ingredient-label text.
- Optional local image for OCR.
- INCI/Japanese tab, sample, OCR, reset, and check actions.
- UI language.

## Outputs

- OCR text/status where OCR is used.
- Parsed/matched ingredient result groups and explanatory notes.
- Known/review-needed/unknown classification according to the current dictionary/rules.

## State and persistence

Ingredient text, selected image, OCR result, and scan result are current-session browser state. The current contract does not define saved scan history.

## Privacy and network behavior

Ingredient text and selected image analysis run in the browser, but the Tesseract.js OCR library is loaded from the external `unpkg.com` CDN. Suite-wide analytics/advertising resources may also load. The current contract does not claim a fully offline page.

## Language mode

`bilingual single-page`

JP/EN controls switch the same scanner; separate INCI and Japanese-label tabs handle source-label style rather than separate site languages.

## Layout class

`hybrid`

Text/OCR input and result panels work on mobile but benefit from wider space for ingredient result review.

## Limits and non-goals

- OCR may be slow and can omit, split, or misrecognize characters; users must visually verify OCR text before trusting scan results.
- Dictionary coverage is finite; an unknown result is not evidence that an ingredient is unsafe.
- The tool does not provide medical/dermatological diagnosis, allergy prediction, concentration analysis, product-safety certification, or regulatory approval.
- External CDN availability can affect OCR even though ingredient processing itself is browser-side.

## Acceptance criteria

- [ ] Pasted INCI/English and Japanese-label text can be parsed and checked against the current generated dictionary/rules.
- [ ] OCR can be started from a selected image when the external Tesseract library loads, and the OCR result remains reviewable before ingredient conclusions are trusted.
- [ ] Results distinguish known/review-needed/unknown states without presenting unknown as a medical safety judgment.
- [ ] JP/EN switching preserves text scan, OCR, dictionary status, and medical/OCR disclaimers.

## Implementation evidence

- `tools/inci-fastscan/index.html`
- `tools/inci-fastscan/js/core_parser.js`
- `tools/inci-fastscan/js/core_matcher.js`
- `tools/inci-fastscan/js/core_analyze.js`
- `tools/inci-fastscan/js/core_ocr_post.js`
- `tools/inci-fastscan/js/web_ocr.js`
- `tools/inci-fastscan/js/generated_dictionary.js`
- `tools/inci-fastscan/js/app.js`
