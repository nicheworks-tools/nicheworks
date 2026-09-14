# Cosmetics Category Gap Remediation

PR38 froze the current raw dictionary baseline at 187 records with no `category` value. PR43 does not fill those records. It first separates the missing rows into review classes so category cleanup can be source-backed instead of copied from unaudited legacy metadata.

## Why this inventory exists

A missing raw record may share a canonical identity with another record that already has one or more legacy category values. That is useful as a review hint, but it is not evidence by itself.

The category-gap inventory therefore assigns every missing-category row to one of three dispositions as verified remediation progresses:

- `resolved_by_verified_category_evidence`
  - the canonical identity has reviewed source-backed functional metadata in the verified category overlay;
  - the raw recognition row remains unchanged so the original debt remains auditable.
- `legacy_hint_requires_source_verification`
  - another raw record with the same canonical identity already contains one or more category values;
  - those values may guide research, but must not be auto-copied as verified truth.
- `external_source_required`
  - no raw record in the canonical group contains a category;
  - an external authoritative or primary source is required before the canonical identity can be resolved.

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

## PR44 wave 1

PR44 begins remediation through a separate canonical evidence overlay rather than rewriting the raw recognition dictionaries. The first reviewed set is intentionally small:

- Water → `solvent`
- Glycerin → `humectant`
- Propylene Glycol → `humectant`
- Phenoxyethanol → `preservative`
- Carbomer → `thickener`

Four of those canonical identities had no raw category anywhere in their canonical group. Water already had a duplicate raw `solvent` hint, but the missing Water recognition row is now backed by independent reviewed evidence rather than by copying the duplicate.

See `COSMETICS_CATEGORY_PROVENANCE.md` for the source/provenance contract.

## Inventory command

```bash
node tools/_shared/check-cosmetics-category-gap-inventory.mjs
```

The report includes every raw missing row with canonical identity, source file/index, canonical group size, observed legacy category hints, verified evidence state, and disposition. The existing 187-row raw ceiling remains a ceiling: later cleanup may reduce raw debt deliberately, but source-backed overlay work does not disguise it by mutating recognition records.
