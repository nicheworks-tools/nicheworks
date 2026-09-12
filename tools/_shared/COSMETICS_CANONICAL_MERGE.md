# Cosmetics Canonical Merge — Wave 1

Shared by Cosmetic Ingredient Checker Lite and INCI FastScan.

## Runtime rule

Exact duplicate canonical INCI records are merged by normalized canonical name. The first record keeps semantic fields such as `safety`, `category`, and `note_short`; later duplicate records may contribute additional unique `jp` and `alias` names.

This prevents FastScan's previous first-record-only dedupe from silently discarding valid Japanese names or aliases that exist only in a later supplemental dictionary file.

## Name merge rule

- Japanese names and aliases are normalized with the shared base normalizer before duplicate removal.
- Full-width/half-width and equivalent punctuation duplicates collapse.
- Unique later names survive.
- Distinct canonical identities are never merged merely because they are related or synonymous.
- Ambiguous exact labels such as `AHA`, `BHA`, `PHA`, `Iron Oxides`, and `酸化鉄` remain blocked from exact matching.

## Semantic field rule

Wave 1 does not attempt to reconcile conflicting safety/category/note metadata between duplicate canonical records. The first maintained record remains authoritative for those fields. A later audit may explicitly reconcile semantic metadata with source review.

## Amazon invariant

Canonical dictionary work must not change the stable Amazon affiliate slots, activation config, or analytics privacy contract. Amazon remains disabled until Associates setup is ready.
