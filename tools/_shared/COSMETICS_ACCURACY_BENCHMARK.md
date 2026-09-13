# Cosmetics Accuracy Benchmark

This benchmark is shared by:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

Run:

```bash
node tools/_shared/check-cosmetics-accuracy-benchmark.mjs
node tools/_shared/check-cosmetics-full-label-benchmark.mjs
```

## Fixed 100-case composition

- 25 exact canonical INCI-name cases
- 25 exact Japanese-name cases
- 10 declared dictionary-alias cases
- 10 shared high-confidence alias-equivalent cases
- 20 parser edge cases
- 10 intentionally unknown / OCR-noise cases

The dictionary-derived cases are selected deterministically from the nine maintained INCI FastScan JSON dictionary files and only use keys that resolve uniquely to one canonical ingredient.

The 10 shared alias-equivalent cases cover common naming variants that are intentionally normalized to an existing canonical ingredient by the shared cosmetics parser. They are identity aliases only; they are not fuzzy guesses.

The parser cases explicitly cover Japanese punctuation, newlines, semicolons, numeric locant commas (`1,2-Hexanediol`, `1,3-Butanediol`), slash-containing names, middle-dot text, NFKC normalization, and deduplication.

The unknown/OCR-noise cases must remain unknown to exact matching. FastScan may separately display conservative spelling candidates, but the benchmark does not permit fuzzy input to become an automatic exact match.

## Full-label benchmark

The full-label layer complements the atomic 100-case suite by exercising complete representative ingredient lists. It is a regression corpus, not a branded-product catalog and not a claim that every market formula is covered.

Wave 3 raises the floor to:

- at least 24 complete-label fixtures;
- at least 12 distinct product categories;
- Japanese, English, and mixed-language coverage;
- explicit sunscreen, conditioner, active-serum, and color-cosmetic coverage;
- at least 80% coverage per fixture and 95% coverage overall.

The fixture set also retains the earlier toner, serum, cream, cleanser, haircare, barrier-care, emulsion, OCR-review, and mixed-language cases.

## Cross-tool contract

The benchmark also verifies that:

- Lite references all nine maintained FastScan dictionary JSON files.
- FastScan references the same nine dictionary JSON files.
- Lite keeps using the shared cosmetics parser.
- FastScan keeps using the shared cosmetics parser.

These benchmarks measure parsing and exact dictionary identity only. They do not claim medical safety, ingredient concentration, product suitability, allergy risk, regulatory status, or formulation quality.

## Quality gates

The path-scoped cosmetics workflow runs shared parser regression, dictionary/canonical/alias checks, FastScan review regressions, the 100-case benchmark, the full-label benchmark, cross-tool release gates, and the frozen Amazon-ready affiliate contract check.

## Change policy

Later dictionary work must keep both benchmark layers passing. New aliases must be explicit and deterministic. When an alias collision is discovered, resolve the collision rather than weakening the benchmark to accept an ambiguous exact match. Amazon readiness must remain isolated from ingredient analysis and benchmark logic.
