# Cosmetics Wave 3 Release Contract

Wave 3 covers Cosmetic Ingredient Checker Lite and INCI FastScan while Amazon Associates remains unavailable.

## Release scope

The release gate freezes the following improvements:

- at least 24 complete-label fixtures across at least 12 product categories;
- explicit sunscreen, conditioner, active-serum, and color-cosmetic JP/EN coverage;
- shared canonical identity equivalence for a finite set of maintained duplicate identities such as CI 77891 / Titanium Dioxide and Bemotrizinol / Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine;
- preserved blocking of ambiguous exact group labels such as AHA, BHA, PHA, Iron Oxides, and 酸化鉄;
- FastScan OCR line-wrap repair only when adjacent unmatched fragments form an exact maintained dictionary key;
- Lite long-result navigation with status/category filtering and local clipboard actions;
- FastScan review-queue navigation that only scrolls/focuses visible Additional review / Unmatched cards and never edits or reruns analysis.

## Amazon invariant

Wave 3 does not activate Amazon monetization.

The shared cosmetics affiliate configuration must remain:

```txt
enabled = false
associateTag = empty
links = empty
```

The stable placements remain:

```txt
Lite     = after-summary
FastScan = after-results
```

No live Amazon URL may be present. Raw ingredient input, OCR text, images, filenames, matched ingredients, correction choices, or review position must never be attached to affiliate analytics.

## Release gate

Run:

```bash
node tools/_shared/check-cosmetics-wave3-release.mjs
```

The path-scoped cosmetics workflow runs this gate together with the atomic 100-case benchmark, full-label coverage benchmark, dictionary/canonical checks, OCR regressions, result-control regressions, prior release gates, and the frozen affiliate contract.

## Next wave

Wave 4 may expand source-backed real-label coverage, close corpus-derived dictionary gaps, improve manual OCR review navigation, and measure long-list performance. It must keep this release contract and the Amazon invariant passing until Associates activation is explicitly allowed.
