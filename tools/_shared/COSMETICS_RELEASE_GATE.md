# Cosmetics Two-Tool Release Gate

This gate closes the Amazon-ready improvement wave for:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

The tools remain intentionally separate:

- **Cosmetic Ingredient Checker Lite** — Japanese paste-first, quick dictionary coverage and category review, no OCR engine.
- **INCI FastScan** — JP/EN detailed review with image OCR, editable OCR text, exact match-route detail, and conservative near-match suggestions.

## Required gates

Every cosmetics change must keep all of these checks green:

1. shared parser regression;
2. dictionary / alias quality;
3. canonical duplicate merge regression;
4. FastScan result semantics contract;
5. fixed 100-case exact/parser benchmark;
6. full-label-shaped coverage benchmark;
7. two-tool cross-tool release contract;
8. Amazon-ready affiliate isolation contract.

JavaScript syntax is checked for the shared parser, Lite runtime/enhancements, and the FastScan app/parser/matcher/analyzer/OCR/result runtime files.

## Amazon invariant

Amazon Associates is still inactive. The stable slots are reserved at:

```txt
Lite     #amazonAffiliateSlot / after-summary
FastScan #amazonAffiliateSlot / after-results
```

Activation remains isolated to `tools/_shared/cosmetics-affiliate-config.js`. Until account setup is ready:

```txt
enabled = false
associateTag = empty
links = empty
```

No improvement PR may require moving the slots or restructuring parser, dictionary, OCR, or results merely to activate Amazon later.

## Privacy invariant

Affiliate analytics may never receive raw ingredient input, OCR output, selected images, filenames, matched ingredient lists, or complete analysis results. When activation becomes available, only the predeclared generic metadata contract may be used.

## Benchmark interpretation

The full-label fixture set is a deterministic representative regression corpus shaped like complete cosmetic labels across multiple product categories and languages. It is not a claim that those fixtures are a verified catalog of specific branded products.

The benchmark measures parser and dictionary coverage. It is not a medical, safety, efficacy, allergy, concentration, or regulatory evaluation.

## Current completion definition

This improvement wave is complete when the cross-tool release gate and all existing cosmetics CI steps pass on the final PR, while Amazon remains disabled. Further quality work can continue in later PRs without blocking a future independent Amazon activation PR.
