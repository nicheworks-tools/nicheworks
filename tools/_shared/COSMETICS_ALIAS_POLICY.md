# Cosmetics Alias Policy

Shared by Cosmetic Ingredient Checker Lite and INCI FastScan.

## Rule

A shared alias-equivalent may be added only when it is a high-confidence naming variant of an existing maintained dictionary identity. It must not be a fuzzy guess, product claim, safety inference, marketing category, or loosely related ingredient family.

The shared parser currently recognizes these additional identity variants:

| Input variant | Existing maintained identity |
| --- | --- |
| 精製水 | Water |
| グリセロール | Glycerin |
| 1,3-ブチレングリコール | Butylene Glycol |
| 塩化ナトリウム | Sodium Chloride |
| クエン酸ナトリウム | Sodium Citrate |
| 水酸化ナトリウム | Sodium Hydroxide |
| エデト酸2ナトリウム | Disodium EDTA |
| エデト酸二ナトリウム | Disodium EDTA |
| ニコチン酸アミド | Niacinamide |
| ヒアルロン酸ナトリウム | Sodium Hyaluronate |
| ヒアルロン酸ソーダ | Sodium Hyaluronate |
| 乳酸ナトリウム | Sodium Lactate |
| Alcohol Denat | Alcohol Denat. |

## Ambiguous exact labels

Some legacy dictionary labels are classes/groups rather than one unique ingredient identity. These must not resolve to whichever record happened to be loaded first.

The shared parser therefore blocks exact matching for:

- `AHA`
- `BHA`
- `PHA`
- `Iron Oxides`
- `酸化鉄`

Both tools leave these exact labels unclassified for review. FastScan may still show conservative spelling suggestions for other unknown text, but no fuzzy suggestion is auto-applied.

## Legacy redundancy

The nine maintained JSON files contain intentional historical redundancy:

- full-width and half-width variants within one entry, such as `BG` / `ＢＧ`;
- repeated canonical ingredients across the base dictionary and supplemental files.

Runtime normalization already collapses same-entry width variants, and dictionary loading deduplicates repeated canonical identities by load order. PR6 does not attempt a risky bulk rewrite of those legacy files. The quality checker counts this redundancy so it remains visible, while failing only on unprotected cross-ingredient exact-name ambiguity.

Known same-identity canonical pairs such as Bemotrizinol / its full INCI name and Bisoctrizole / its full INCI name are classified as equivalent-identity collisions rather than arbitrary different-ingredient collisions.

## Quality requirements

`check-cosmetics-dictionary-quality.mjs` must reject:

- missing canonical names or empty normalized names;
- an unprotected exact Japanese/alias key assigned to different ingredient identities;
- an ambiguous class/group label that is not blocked from exact matching;
- an alias-equivalent whose target does not exist in the maintained dictionary identity set;
- an alias-equivalent that collides with a different maintained ingredient identity.

The checker reports, but does not fail merely because of, NFKC-equivalent spellings within one entry or repeated copies of the same normalized canonical name across the legacy dictionary files.

Shared alias normalization is deliberately separate from FastScan's fuzzy suggestion layer. An OCR misspelling may be suggested to the user, but it must not become an exact match unless an explicit identity alias has been reviewed and added here/the shared parser.

## Non-goals

This policy does not establish cosmetic safety, effectiveness, allergy suitability, concentration, formulation equivalence, or regulatory identity beyond the ingredient-name matching function of the two tools.
