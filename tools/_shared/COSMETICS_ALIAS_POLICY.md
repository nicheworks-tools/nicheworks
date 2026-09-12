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

## Quality requirements

`check-cosmetics-dictionary-quality.mjs` must reject:

- duplicate normalized canonical names across the nine maintained JSON dictionaries;
- the same exact Japanese/alias key assigned to different canonical ingredients;
- an alias-equivalent whose target does not exist in the maintained dictionary identity set;
- an alias-equivalent that collides with the exact name of a different maintained ingredient;
- empty normalized names.

Shared alias normalization is deliberately separate from FastScan's fuzzy suggestion layer. An OCR misspelling may be suggested to the user, but it must not become an exact match unless an explicit identity alias has been reviewed and added here/the shared parser.

## Non-goals

This policy does not establish cosmetic safety, effectiveness, allergy suitability, concentration, formulation equivalence, or regulatory identity beyond the ingredient-name matching function of the two tools.
