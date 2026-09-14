# Cosmetics Category Gap Remediation

PR38 froze the current raw dictionary baseline at 187 records with no `category` value. PR43 does not fill those records. It first separates the missing rows into review classes so category cleanup can be source-backed instead of copied from unaudited legacy metadata.

## Why this inventory exists

A missing raw record may share a canonical identity with another record that already has one or more legacy category values. That is useful as a review hint, but it is not evidence by itself.

The category-gap inventory therefore assigns every missing-category row to one of two dispositions:

- `legacy_hint_requires_source_verification`
  - another raw record with the same canonical identity already contains one or more category values;
  - those values may guide research, but must not be auto-copied as verified truth.
- `external_source_required`
  - no raw record in the canonical group contains a category;
  - an external authoritative or primary source is required before filling the gap.

## Non-negotiable rules

- Do not lower the recognition coverage floors to make semantic cleanup pass.
- Do not revive legacy `safe` / `caution` / `risk` values.
- Do not infer a category from ingredient name shape alone.
- Do not treat a duplicate canonical record as an external source.
- Do not fill missing categories with generic placeholders such as `general` merely to reduce the count.
- Do not change ambiguity handling for AHA, BHA, PHA, Iron Oxides, or 酸化鉄.
- Do not change OCR, Amazon affiliate behavior, or privacy metadata while doing category remediation.

## Source-backed remediation order

1. Review missing rows that have same-canonical legacy category hints.
2. Verify or reject those hints against an authoritative/primary source.
3. Review source-required unique canonical identities.
4. Review source-required duplicate groups where every raw record lacks category.
5. Apply only categories supported by the reviewed source evidence.
6. Re-run the semantic baseline, recognition/OCR regressions, note provenance regressions, and affiliate isolation checks.

## Inventory command

```bash
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

The report includes every missing row with canonical identity, source file/index, canonical group size, observed legacy category hints, and disposition. The existing 187-row ceiling remains a ceiling: later cleanup may reduce it, but new dictionary work may not increase it.
