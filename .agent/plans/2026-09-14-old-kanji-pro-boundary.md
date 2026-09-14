# ExecPlan — Old Kanji Pro boundary normalization

## Scope

Normalize the public Pro presentation across the eight Old Kanji tools while billing is unavailable.

Target tools:
- `tools/old-kanji-reference/`
- `tools/kanji-modernizer/`
- `tools/old-kanji-ocr-scanner/`
- `tools/old-document-kanji-highlighter/`
- `tools/unicode-kanji-checker/`
- `tools/variant-kanji-compare/`
- `tools/place-old-kanji-checker/`
- `tools/name-old-kanji-checker/`

## Required changes

- Remove fixed public purchase-price language such as `$4.99 one-time` / `$4.99 買い切り` while billing is unavailable.
- Keep all Pro controls disabled and non-purchasable while billing is unavailable.
- Replace misleading availability language such as “features are ready” with explicit “planned/preparing; billing unavailable” language.
- Preserve all currently shipped Free capabilities and current Pro feature concepts; do not move Free features behind Pro.
- Preserve the measurement contract: disabled/unavailable Pro controls must not emit `old_kanji_pro_click`.
- Add a read-only regression checker for the eight-tool boundary.

## Non-goals

- no billing integration;
- no product price decision;
- no checkout/session changes;
- no Amazon changes;
- no dictionary/mapping changes;
- no SEO title/description changes;
- no layout redesign beyond text/state normalization required for this boundary.

## Validation

- Run the Old Kanji Pro-boundary checker.
- Run existing Old Kanji cluster, measurement, runtime, tool-spec, SEO, Amazon, and billing-foundation checks through CI.
- Confirm no enabled purchase CTA or fixed public Pro price remains on the eight target pages while billing is unavailable.
