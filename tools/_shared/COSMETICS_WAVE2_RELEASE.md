# Cosmetics improvement wave 2 release contract

This gate closes the second Amazon-ready improvement term for:

- `cosmetic-ingredient-checker-lite`
- `inci-fastscan`

The purpose of this wave is to improve real use while keeping Amazon Associates activation independent from product-quality work.

## Frozen wave 2 capabilities

### Shared coverage

- The maintained cosmetics dictionary includes the wave 2 high-frequency additions used by the JP/EN barrier and emulsion regression fixtures.
- The full-label benchmark retains at least 16 representative fixtures.
- Reviewed Japanese long-form / Na / K naming variants remain in the shared parser so Lite and FastScan resolve them consistently.

### Cosmetic Ingredient Checker Lite

- Remains Japanese, paste-first, and OCR-free.
- Keeps dictionary recognition and unclassified summaries.
- Keeps client-side result filters for all / unclassified / review-candidate / dictionary-match rows.
- Keeps the explicit unclassified-only clipboard action.
- Filtering does not change or rerun analysis.

### INCI FastScan

- Remains the bilingual OCR + detailed-review tool.
- Keeps local image preview, OCR progress, editable OCR output, and manual review flow.
- Common `I/l/1` and `O/0` OCR-confusion hints are review hints only and never automatic correction.
- Keeps all / dictionary-match / additional-review / unmatched result filters.
- A close-match candidate may edit the active textarea only after an explicit user click.
- Candidate application never automatically reruns analysis.

## Amazon-ready invariant

Amazon Associates is intentionally still inactive during this wave.

The shared configuration must remain:

```txt
enabled = false
associateTag = empty
links = empty
```

Stable placements remain:

```txt
Lite     -> #amazonAffiliateSlot / after-summary
FastScan -> #amazonAffiliateSlot / after-results
```

No live Amazon URL, Associate tag, purchase recommendation, affiliate impression, or affiliate click is activated by this wave. Raw ingredient text, OCR output, images, matched ingredients, and correction choices remain prohibited from affiliate analytics.

When Amazon Associates setup becomes available, activation should still be possible as a separate small PR without reopening parser, dictionary, OCR, or result-control implementation.

## CI release condition

`check-cosmetics-wave2-release.mjs` verifies the wave 2 dictionary additions, benchmark breadth, shared Japanese variants, conservative OCR hints, both tools' result controls, privacy wording, and the inactive Amazon contract. It runs in the existing `Cosmetics accuracy benchmark` workflow alongside the earlier parser, dictionary, detailed-result, cross-tool, and affiliate gates.
