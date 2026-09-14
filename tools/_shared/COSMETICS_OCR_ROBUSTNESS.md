# FastScan OCR Robustness Contract

This quality gate applies only to `tools/inci-fastscan/`. Cosmetic Ingredient Checker Lite remains paste-only and does not gain OCR behavior from this work.

## Objective

Improve OCR-label handling without turning OCR cleanup into an ingredient-identification guesser.

The pipeline is intentionally split into two stages:

1. `postProcessOcrText()` performs deterministic label cleanup and preserves candidate line boundaries.
2. `repairWrappedIngredientFragments()` may join adjacent candidates only when the combined value is an exact maintained dictionary name or alias.

The OCR cleanup stage must not heuristically merge lines merely because one token looks like a common INCI prefix or suffix.

## Exact wrapped-name repair

A repair is permitted when the combined candidate is an exact maintained identity and the two fragments are not already two independently known ingredients.

This includes the case where one fragment is itself a known ingredient name. For example, `Cetearyl` + `Alcohol` may become `Cetearyl Alcohol` only because that complete name exists exactly in the maintained dictionary. By contrast, `Water` + `Glycerin` remain separate because both are already complete known ingredients, and `Unknown Alpha` + `Alcohol` remain separate because the combined string is not a maintained exact identity.

## Character-confusion rule

Common OCR character confusions such as `I/l/1` and `O/0` remain review hints only. They do not become automatic exact matches or automatic textarea replacements.

## Source-backed round-trip

Run:

```bash
node tools/_shared/check-fastscan-ocr-robustness.mjs
```

The check reshapes every record in `cosmetics-real-label-corpus.json` into an OCR-like line stream using mixed label delimiters, passes it through FastScan OCR cleanup, and verifies that ingredient boundaries survive. It also verifies that safe cleanup does not reduce exact dictionary recognition relative to the maintained source-backed label text.

The current corpus is dated evidence from official product pages. This OCR gate does not claim that the formulas are permanent, medically safe, complete for every market, or representative of every cosmetics label.

## Privacy and Amazon isolation

OCR images, OCR text, filenames, repaired names, review hints, and analysis results remain local to the FastScan workflow. The OCR runtime must not reference the Amazon affiliate configuration, Amazon destinations, or affiliate event names.

Amazon monetization remains a separate fixed-category layer and is not selected or constructed from OCR output.
