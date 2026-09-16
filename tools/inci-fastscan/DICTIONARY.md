# INCI FastScan dictionary policy

INCI FastScan is not complete just because the page UI works. The dictionary is a maintained data asset shared by the current FastScan matching workflow and Cosmetic Ingredient Checker Lite.

## Current dictionary sources

The app loads these static JSON files:

```txt
data/ingredients.json
data/ingredients-extra-1.json
data/ingredients-extra-2.json
data/ingredients-extra-3.json
data/ingredients-extra-4.json
data/ingredients-extra-5.json
data/ingredients-extra-6.json
data/ingredients-extra-7.json
data/ingredients-extra-8.json
```

It also loads a generated dictionary layer:

```txt
js/generated_dictionary.js
```

The generated layer covers repeatable INCI naming families such as PEG/PPG series, ethoxylated emulsifiers, ester families, CI colorants, UV filters, plant extracts, ferments, and peptide names.

## Validation command

Run from the repository root:

```bash
node tools/inci-fastscan/validate-dictionary.mjs
```

## Minimum acceptance line

The current baseline remains:

```txt
uniqueEnglishIngredients >= 1000
```

This is a dictionary-coverage floor, not a product-quality or safety score.

## Current record shape

The maintained schema currently includes fields such as:

```json
{
  "id": "unique_snake_case_id",
  "en": "INCI Name",
  "jp": ["Japanese label candidate"],
  "alias": ["Optional alias"],
  "safety": "safe | caution | risk",
  "category": "humectant"
}
```

`id`, `en`, and the legacy `safety` field are currently validated as required strings by `validate-dictionary.mjs`; `jp` is an array and `alias` is an optional array.

## Legacy `safety` metadata isolation

The `safety` field remains in the stored dictionary schema for compatibility with the existing data asset and validator. It is **legacy metadata** and is not the current FastScan or Lite user-facing classification contract.

Current runtime/UI rules:

- FastScan result objects do not expose legacy `safety` metadata.
- FastScan presents neutral reference states such as `Dictionary match`, `Additional review`, and `Unmatched`.
- Lite review state is not driven by legacy `safety` metadata.
- A stored value of `safe`, `caution`, or `risk` must not be presented as a product or ingredient safety verdict.
- Legacy `safety` metadata must not select, rank, or rewrite Amazon affiliate destinations.

Do not reinterpret the legacy field as a medical, dermatological, regulatory, allergy, irritation, pregnancy, concentration, or product-suitability judgment.

## Matching and semantic priorities

Dictionary maintenance should prioritize:

1. Correct canonical INCI identity.
2. Reviewed Japanese label names and aliases.
3. Exact and high-confidence naming equivalence.
4. Neutral functional category consistency.
5. Provenance for claim-bearing notes/categories where required by the cosmetics quality contracts.
6. Avoiding duplicate or colliding canonical/alias identities.

Unknown or unmatched input must remain explicit rather than being force-matched to a plausible ingredient.

## Completion standard for this tool

INCI FastScan can be treated as current-contract complete only when:

1. Photo/OCR and direct-text workflows remain usable in JP/EN.
2. OCR output is editable and users are prompted to review it before matching.
3. `node tools/inci-fastscan/validate-dictionary.mjs` passes.
4. `uniqueEnglishIngredients >= 1000` is reported.
5. Result cards expose canonical/name-match/category/reference information without reviving SAFE / CAUTION / RISK as user-facing safety ranks.
6. Unmatched entries remain visible, and conservative correction candidates are never auto-applied.
7. The cross-tool cosmetics release gates and accuracy/real-label benchmarks pass.

## Next dictionary work

Priorities:

1. Remove or resolve duplicate/overlapping English identities.
2. Normalize categories further under the maintained taxonomy.
3. Add reviewed Japanese label variants and aliases.
4. Improve coverage using source-backed real product labels and regression fixtures.
5. Expand provenance coverage for claim-bearing metadata.
6. Keep shared parser, canonical merge, semantic-quality, and real-label regressions passing before merge.
