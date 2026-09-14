# ExecPlan — Old Kanji Amazon optimization

## Scope

Optimize the two already-active, task-adjacent Amazon surfaces in the Old Kanji cluster without expanding affiliate links to unrelated tools.

Current allowed scope:
- Old Kanji Reference: dictionary, magnifier, book stand.
- Old Kanji OCR Scanner: non-destructive book scanner, magnifier.

## Changes

- Keep the existing `nicheworks09-22` tracking ID and fixed Amazon.co.jp search-link generation.
- Keep Reference placement after the reference/list task and before Pro.
- Move the OCR Amazon panel to immediately after the OCR result/copy actions so it appears at the relevant task-completion point rather than after the Pro/caution blocks.
- Make Japanese/English copy explicit that these searches are optional and only for users who need physical reference/reading tools.
- Preserve one-column mobile layouts already present in both tools.
- Do not add Amazon to Kanji Modernizer, Old Document Kanji Highlighter, Unicode Kanji Checker, Variant Kanji Compare, Place Old Kanji Checker, or Name Old Kanji Checker in this wave.

## Measurement

Existing `/assets/amazon-affiliate.js` remains the sole sender of `affiliate_click`. `target` distinguishes the five categories and `placement` remains `reference_resources` or `ocr_resources`.

## Safety

No searched kanji, OCR text, image names, document text, names, addresses, or any user-derived value enters Amazon URLs or affiliate analytics. No product image, price, rating, review, availability, or scraped product metadata is displayed.

## Validation

Add a dedicated Old Kanji Amazon checker that locks the two-page/five-category scope, tracking tag, fixed search terms, mobile one-column behavior, OCR placement move, shared disclosure/helper use, and absence of Amazon activation in the other six cluster tools.