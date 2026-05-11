# INCI FastScan dictionary policy

INCI FastScan is not complete just because the page UI works. The dictionary must be treated as a maintained data asset.

## Current dictionary files

The app loads these files in order:

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

## Validation command

Run from the repository root:

```bash
node tools/inci-fastscan/validate-dictionary.mjs
```

## Minimum acceptance line

The current minimum is:

```txt
uniqueEnglishIngredients >= 500
```

This is only a v0 practical-coverage threshold. It is not the final target.

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

## Next dictionary work

Priorities:

1. Remove duplicate/overlapping English names.
2. Normalize categories.
3. Add more Japanese label variants.
4. Add more common J-beauty ingredients.
5. Add sample product ingredient-list test cases.
