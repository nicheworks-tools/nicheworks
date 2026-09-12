# ExecPlan — Cosmetics Amazon-ready improvement wave

## Goal

Improve the two cosmetics tools while preserving the ability to activate Amazon Associates at any point without restructuring either tool.

## Base

- Base main SHA: `6785239a902ef0a2df05e77f3d35589851c045f7`
- PR4 branch: `feat/cosmetics-affiliate-contract-20260913`
- Follow-up PR5: shared accuracy benchmark
- Follow-up PR6: dictionary / alias quality expansion

## Scope

This wave covers both:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

Shared cosmetics-only support may live under `tools/_shared/`.

## PR4 — affiliate activation contract

- Freeze stable affiliate slot IDs/placements for both tools.
- Add one shared, disabled-by-default affiliate config.
- Add one shared renderer/event adapter.
- Add shared styling so later activation does not require layout work.
- Keep Amazon disabled with no Amazon URL, Associates tag, affiliate disclosure claim, or live affiliate event.
- Define future event names `affiliate_impression` and `affiliate_click` with only generic metadata: tool, provider, placement, link_key.
- Never send ingredient input, OCR text, image/file metadata, matched ingredients, or analysis results through affiliate analytics.

## PR5 — shared accuracy benchmark

- Add deterministic fixtures spanning English INCI, Japanese names, mixed input, separators, numeric locants, slash/middle-dot names, aliases, unknowns, and OCR-like misspellings.
- Exercise the shared parser and the same dictionary data used by both tools.
- Record baseline match / unknown / parser expectations without inventing safety conclusions.
- Add a repeatable Node check suitable for CI/manual regression use.
- Add a path-scoped GitHub Actions workflow that runs only when the two cosmetics tools, shared cosmetics runtime/benchmark files, their dictionary data, or the workflow itself changes.

## PR6 — dictionary and alias quality

- Improve high-frequency cosmetics coverage used by both tools.
- Prefer exact canonical names and explicit aliases; do not add fuzzy auto-replacement.
- Add collision/duplicate checks for canonical names and aliases.
- Add regression fixtures for every corrected or newly added high-frequency alias.
- Do not attempt exhaustive global INCI coverage.
- Extend the PR5 path-scoped benchmark/check workflow rather than creating an unrelated global CI requirement.

## Amazon activation invariant

At the end of PR4 and throughout PR5/PR6:

- both public pages keep their stable affiliate slot IDs;
- shared affiliate configuration remains the only activation point;
- `enabled` remains `false` until account setup is ready;
- no Amazon URL or tracking tag is committed before activation;
- later activation must be possible without changing ingredient parsing, dictionary matching, OCR, or result layout.

## Non-goals

- No Amazon Associates activation in this wave.
- No Product Advertising API.
- No product ranking or personalized product recommendation.
- No raw user input in analytics.
- No medical, allergy, efficacy, suitability, or safety recommendation engine.
- No unrelated NicheWorks tools.
