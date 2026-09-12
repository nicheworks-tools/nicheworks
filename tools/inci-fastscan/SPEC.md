# Tool Specification — INCI FastScan

- Slug: `inci-fastscan`
- Public URL: `https://nicheworks.app/tools/inci-fastscan/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Parse pasted or OCR-extracted cosmetic ingredient labels and compare normalized ingredients with the local/generated INCI dictionary so dictionary matches, additional-review entries, and unmatched items can be inspected quickly. INCI FastScan is the photo/OCR and detailed-review member of the NicheWorks cosmetics pair; Cosmetic Ingredient Checker Lite remains the faster paste-only Japanese entry point.

## Current functional contract

- Provide INCI/English-label and Japanese-label scan tabs in one bilingual page.
- Put the working text/OCR interface before long explanatory content so the scanner is immediately usable.
- Accept pasted comma/line-separated ingredient text and built-in samples.
- Preserve legitimate ingredient punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol` through parsing and OCR cleanup.
- Accept an image and run browser-side OCR using Tesseract.js loaded from an external CDN, with separate English and Japanese+English OCR actions.
- Show a local preview of the selected image before OCR and allow the user to remove/reselect it without uploading it.
- Show OCR progress in the page while recognition is running.
- Put OCR output back into the editable ingredient textarea and show a clear review cue after OCR; users review/correct OCR text before running ingredient matching.
- Normalize/parse OCR or pasted text and match ingredients against the local/generated dictionary and declared aliases.
- For every exact match, retain the canonical INCI name and identify the route used: canonical INCI, Japanese name, declared alias, or shared high-confidence naming variant.
- Show result cards with canonical INCI, original input, match route, matched spelling, Japanese names where available, category, review cue, and neutral explanatory note.
- Display `辞書一致 / Dictionary match`, `追加確認 / Additional review`, and `未一致 / Unmatched` as reference states; these are not safety or danger grades.
- For sufficiently close unmatched spellings, show up to three conservative near-match candidates without automatically replacing user input.
- Treat the Japanese-label tab as Japanese-name/alias matching, not machine translation.
- Provide JP/EN UI and explicit warnings that OCR can misread text and ingredient results are not medical or safety guarantees.
- Link to Cosmetic Ingredient Checker Lite near the lower related-tools area for users who only need a fast paste workflow.

## Inputs

- Pasted English/INCI or Japanese ingredient-label text.
- Optional local image for OCR.
- INCI/Japanese tab, sample, OCR, reset, and check actions.
- Optional Cmd/Ctrl + Enter check shortcut.
- UI language.

## Outputs

- Local selected-image preview prior to OCR.
- Editable OCR text and visible OCR status/progress where OCR is used.
- Post-OCR review reminder before ingredient matching.
- Result summary for dictionary matches, additional-review entries, and unmatched items.
- Detailed match cards exposing canonical INCI, original input spelling, match route, matched name, Japanese names where available, category, and reference note.
- Conservative close-match suggestions for eligible unmatched entries; suggestions are display-only and never auto-applied.

## Match-route semantics

Exact matched results may expose one of these internal routes:

```txt
canonical    = input matched the canonical INCI name
jp           = input matched a maintained Japanese name
alias        = input matched a maintained declared alias
shared_alias = input matched a reviewed high-confidence naming equivalent from the shared parser
```

The route describes how the name was resolved. It does not imply ingredient concentration, quality, efficacy, or safety.

## State and persistence

Ingredient text, selected image, OCR result, image preview, and scan result are current-session browser state. Preview object URLs are revoked when the image is removed/replaced. The current contract does not define saved scan history. UI language preference may be stored locally in the browser.

## Privacy and network behavior

Ingredient text and selected image analysis run in the browser, but the Tesseract.js OCR library is loaded from the external `unpkg.com` CDN. Suite-wide analytics/advertising resources may also load. Raw ingredient text, OCR output, filenames, images, matched ingredients, and complete analysis results must not be added to analytics or affiliate events. The current contract does not claim a fully offline page.

## Language mode

`bilingual single-page`

JP/EN controls switch the same scanner; separate INCI and Japanese-label tabs handle source-label style rather than separate site languages.

## Layout class

`hybrid`

Text/OCR input and result panels work on mobile but benefit from wider space for ingredient result review. The current layout is input-first, with explanatory/FAQ content after the primary scanner workflow.

## Monetization readiness

The page includes the stable, intentionally inactive result-adjacent container:

```txt
#amazonAffiliateSlot
provider = amazon
placement = after-results
state = inactive
```

Both cosmetics tools share these frozen runtime assets:

```txt
/tools/_shared/cosmetics-affiliate-config.js
/tools/_shared/cosmetics-affiliate-slot.js
/tools/_shared/cosmetics-affiliate-slot.css
```

`cosmetics-affiliate-config.js` is the single activation point. Before Amazon Associates setup is ready it must remain:

```txt
enabled = false
associateTag = empty
links = empty
```

The shared adapter is loaded only when the stable affiliate slot exists. While disabled it clears and hides the slot and emits no affiliate impression/click event. Future activation must not require changes to OCR, ingredient parsing, dictionary matching, result rendering, or the slot ID/placement.

When activation is eventually allowed, optional analytics are limited to `affiliate_impression` and `affiliate_click` with generic metadata only: `tool`, `provider`, `placement`, `link_key`. Raw ingredient text, OCR output, filenames, images, matched ingredients, and complete analysis results must never be attached.

## Limits and non-goals

- OCR may be slow and can omit, split, or misrecognize characters; users must visually verify OCR text before trusting scan results.
- Image preview is a review aid only; this wave does not rotate/crop/re-encode the selected file before OCR.
- Near-match suggestions are spelling/OCR repair hints only; they are not authoritative ingredient identification and are never auto-applied.
- `追加確認 / Additional review` reflects existing dictionary metadata or review cues and is not a declaration that an ingredient is dangerous or unsuitable.
- Dictionary coverage is finite; an unmatched result is not evidence that an ingredient is unsafe.
- The tool does not provide medical/dermatological diagnosis, allergy prediction, concentration analysis, product-safety certification, pregnancy suitability, drug-interaction advice, or regulatory approval.
- External CDN availability can affect OCR even though ingredient processing itself is browser-side.
- Amazon Associates is not active until account setup and policy verification are complete.

## Acceptance criteria

- [x] Pasted INCI/English and Japanese-label text can be parsed and checked against the current generated dictionary/rules.
- [x] Slash / middle-dot names and numeric locant commas survive the current parsing/OCR cleanup path.
- [x] OCR can be started from a selected image when the external Tesseract library loads and visible progress is exposed in the page.
- [x] Selected OCR images can be previewed locally and removed/reselected without upload.
- [x] OCR results remain editable and a review cue is shown before ingredient matching.
- [x] Exact matched results expose canonical INCI plus canonical / Japanese / alias / shared-variant match route metadata.
- [x] Displayed result states use neutral dictionary/review language rather than presenting a safe/unsafe score.
- [x] Eligible unmatched spellings can show conservative candidates without auto-replacement.
- [x] Japanese-label wording describes dictionary matching rather than machine translation.
- [x] JP/EN switching preserves text scan, OCR, dictionary status, and medical/OCR disclaimers.
- [x] The Lite tool is linked as the paste-only alternative.
- [x] The Amazon-ready slot exists and keeps the frozen `after-results` placement.
- [x] Shared affiliate configuration remains disabled, empty, and non-tracking before activation.

## Implementation evidence

- `tools/_shared/cosmetic-ingredient-parser.js`
- `tools/_shared/cosmetics-affiliate-config.js`
- `tools/_shared/cosmetics-affiliate-slot.js`
- `tools/_shared/cosmetics-affiliate-slot.css`
- `tools/_shared/check-cosmetics-affiliate-contract.mjs`
- `tools/inci-fastscan/index.html`
- `tools/inci-fastscan/style.css`
- `tools/inci-fastscan/enhancements.js`
- `tools/inci-fastscan/enhancements.css`
- `tools/inci-fastscan/js/core_parser.js`
- `tools/inci-fastscan/js/core_matcher.js`
- `tools/inci-fastscan/js/core_analyze.js`
- `tools/inci-fastscan/js/core_ocr_post.js`
- `tools/inci-fastscan/js/web_ui.js`
- `tools/inci-fastscan/js/web_ocr.js`
- `tools/inci-fastscan/js/generated_dictionary.js`
- `tools/inci-fastscan/js/app.js`
- `tools/inci-fastscan/validate-dictionary.mjs`
