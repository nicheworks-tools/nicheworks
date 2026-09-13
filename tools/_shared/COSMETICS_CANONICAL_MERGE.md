# Cosmetics Canonical Merge

Shared by Cosmetic Ingredient Checker Lite and INCI FastScan.

## Runtime rule

Exact duplicate canonical records are merged by normalized canonical identity. Japanese names and aliases from later duplicate records are preserved instead of being silently discarded.

Wave 3 also defines a small reviewed set of equivalent canonical identities where the maintained dictionaries intentionally contain both a generic/common/CI name and a preferred ingredient name for the same chemical identity:

- `Bemotrizinol` → `Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine`
- `Bisoctrizole` → `Methylene Bis-Benzotriazolyl Tetramethylbutylphenol`
- `CI 77891` → `Titanium Dioxide`
- `CI 77019` → `Mica`

These equivalences are explicit, finite, and identity-based. They are not fuzzy synonym inference.

When a preferred canonical record is present later in the maintained data, runtime merge promotes that preferred name while preserving the alternate canonical name as a searchable alias. This lets FastScan keep a stable canonical result while accepting both maintained naming systems.

## Name merge rule

- Japanese names and aliases are normalized with the shared base normalizer before duplicate removal.
- Full-width/half-width and equivalent punctuation duplicates collapse.
- Unique later names survive.
- A canonical equivalence is merged only when it is explicitly declared in the shared parser.
- Related ingredients are not merged merely because their names or functions are similar.
- Ambiguous exact labels such as `AHA`, `BHA`, `PHA`, `Iron Oxides`, and `酸化鉄` remain blocked from exact matching.

## Benchmark rule

The full-label benchmark resolves owners by the same canonical identity key used by runtime. Therefore equivalent maintained records no longer make `Titanium Dioxide`, `酸化チタン`, or the long-form BEMT name appear artificially unknown simply because a second equivalent record exists.

Wave 3 sunscreen and color-cosmetic fixtures require these identities to resolve with `maxUnknown: 0`.

## Semantic field rule

Canonical identity merging does not attempt a broad safety/category/note reconciliation. When a preferred canonical record is promoted, its maintained semantic fields win; otherwise the first maintained record remains authoritative. A later source audit may explicitly reconcile semantic metadata.

## Amazon invariant

Canonical dictionary work must not change the stable Amazon affiliate slots, activation config, or analytics privacy contract. Amazon remains disabled until Associates setup is ready.
