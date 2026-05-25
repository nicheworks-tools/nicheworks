# INCI FastScan dictionary policy

INCI FastScan is not complete just because the page UI works. The dictionary must be treated as a maintained data asset.

## Current dictionary sources

The app loads static JSON files first:

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

The current v1 target is:

```txt
uniqueEnglishIngredients >= 1000
```

This is a practical v1 threshold, not a final dictionary ceiling.

## Required fields

Each item should have:

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

## Important rule

The dictionary does not guarantee safety. Labels mean:

- `safe`: generally common ingredient, not a safety guarantee
- `caution`: review if sensitive, allergic, pregnant, using acids/retinoids, etc.
- `risk`: higher review priority, not a medical diagnosis

## Completion standard for this tool

INCI FastScan can be treated as v1-complete only when:

1. The UI, OCR notes, donation links, SEO, and language switching are in place.
2. `node tools/inci-fastscan/validate-dictionary.mjs` passes.
3. `uniqueEnglishIngredients >= 1000` is reported.
4. The result cards show category and do not imply medical diagnosis or safety guarantees.
5. Common ingredient-list samples produce mostly known/review results rather than mostly unknown results.

## Next dictionary work after v1

Priorities:

1. Remove duplicate/overlapping English names.
2. Normalize categories further.
3. Add more Japanese label variants.
4. Add more common J-beauty ingredients.
5. Add sample product ingredient-list test cases.
6. Add CI automation so dictionary regressions fail before merge.
