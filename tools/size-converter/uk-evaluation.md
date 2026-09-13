# Size Converter — UK support evaluation

Evaluation date: 2026-09-13
Decision: **defer generic UK runtime conversion**

## Question

Can the current generic JP / US / EU representative table safely add a single UK column without implying a cross-brand mapping that current official manufacturer charts contradict?

## Official sources compared

### adidas footwear

Source: https://www.adidas.com/us/help/size_charts/shoes

Selected men's rows:

- US 4 → UK 3.5 / EU 36 / JP 220
- US 8.5 → UK 8 / EU 42 / JP 265

### ASICS Men's/Unisex footwear

Source: https://www.asics.com/nz/en-nz/japan-s-unisex-1203a615-109

Selected rows:

- US 4 → UK 3 / EU 36 / CM 22.5
- US 8.5 → UK 7.5 / EU 42 / CM 26.5

### New Balance Men's/Unisex footwear

Source: https://www.newbalance.com/size-guide.html

Selected rows:

- US 4 → UK 3.5 / EU 36 / length 22 cm
- US 8.5 → UK 8 / EU 42 / length 26.5 cm

## Finding

The sources do not support one generic US→UK mapping as a brand-independent fact.

For both checked men's sizes, adidas and New Balance use a UK label that is 0.5 higher than the ASICS UK label for the same nominal US size:

- US 4: adidas/New Balance UK 3.5 vs ASICS UK 3
- US 8.5: adidas/New Balance UK 8 vs ASICS UK 7.5

The disagreement is not resolved by EU: all three examples can share the same EU label while still disagreeing on UK. It is therefore not defensible to infer UK from the current generic US or EU columns with one fixed offset.

## Decision

Do **not** add a generic UK column to the current runtime table in this term.

Reasons:

1. A single displayed UK value would look more authoritative than the source evidence warrants.
2. Averaging or selecting the majority mapping would fabricate a synthetic size that no longer represents a specific official chart.
3. A fixed arithmetic US→UK rule would encode a brand assumption as a universal conversion.
4. The current tool already positions its table as representative orientation; adding a disputed UK value would weaken that contract.

## What would make UK support acceptable later

UK may be added only under one of these stronger models:

- **brand/model-specific charts**, clearly sourced and kept separate from the generic representative table; or
- a future generic model that explicitly exposes multiple official mappings/ranges instead of one fake universal answer, with enough source coverage to justify the presentation.

A future implementation must still preserve men's/women's and product-category context.

## Clothing note

UK clothing labels also depend on brand/category-specific charts. This evaluation does not create a generic UK clothing conversion. Apparel UK support needs its own verified source model rather than piggybacking on footwear offsets.

## Runtime impact

None. The active direct converter remains JP / US / EU only. No bundled row, measurement heuristic, fit handoff, comparison state, or affiliate behavior changes in this evaluation.

## Amazon boundary

Amazon remains disabled. UK research/decision state is documentation only and must never be included in affiliate URLs or affiliate analytics.
