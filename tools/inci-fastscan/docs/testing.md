# Testing (INCI FastScan)

This document describes manual regression checks for the current photo/OCR-first and direct-text ingredient-matching workflow.

The current user-facing contract is neutral dictionary/reference state. Do not treat the legacy dictionary `safety` field as a UI safety rank.

## Quick smoke test

Run the four manual text-input checks below, then confirm:

- Results render in the result area.
- Exact known names remain identifiable through the maintained dictionary.
- Unmatched items remain visible instead of disappearing.
- Result states use the current neutral wording (`Dictionary match` / `Additional review` / `Unmatched`, or the Japanese equivalents).
- No SAFE / CAUTION / RISK safety ranking is shown as the current result contract.

### INCI / English source-label mode

1. `Sodium Hyaluronate, Fragrance, Salicylic Acid`
2.
   ```txt
   Hyaluronic Acid
   Perfume
   BHA
   ```

### Japanese source-label mode

3.
   ```txt
   ヒアルロン酸Na
   香料
   サリチル酸
   ```
4. `ヒアルロン酸Na・香料／サリチル酸`

The Japanese source-label mode performs maintained Japanese-name/alias matching. It is not a machine-translation test.

## Photo/OCR smoke test

Confirm the current first-view photo workflow:

1. Open FastScan and confirm photo/image mode is available as the primary entry path.
2. Select a local ingredient-label image.
3. Confirm a local image preview appears.
4. Run the appropriate OCR action for the source label.
5. Confirm OCR progress/status is visible while recognition runs.
6. Confirm recognized text is placed in the editable ingredient textarea.
7. Review/correct the OCR text before ingredient matching.
8. Run ingredient matching and confirm results are non-empty for a valid readable label.
9. Remove/reselect the image and confirm the previous preview does not remain as stale UI state.

OCR depends on the externally loaded Tesseract.js library, so this test also verifies that the OCR dependency can load in the test environment.

## OCR regression fixtures

These fixtures contain raw OCR-style output including noise. Copy/paste them into the text workflow when a real image is not convenient:

1. INCI/English: `tools/inci-fastscan/data/fixtures_ocr_samples/en_sample_01.txt`
2. Japanese: `tools/inci-fastscan/data/fixtures_ocr_samples/jp_sample_01.txt`

**PASS criteria**

- Ingredient-like tokens are extracted and remain reviewable, including examples such as **Sodium Hyaluronate**, **ヒアルロン酸Na**, **香料**, and **サリチル酸** where present in the fixture.
- OCR cleanup does not silently merge arbitrary adjacent lines.
- Exact dictionary-aware line repair may join adjacent OCR fragments only when the current regression contract allows it.
- Obvious non-ingredient blocks do not dominate the result list.

## Detailed result regression

For known matches, confirm cards expose the maintained reference information expected by the current UI, including canonical INCI and the route used to resolve the name where available.

For an unmatched spelling such as:

```txt
PhenoxyethanoI
```

confirm:

- The item remains visibly unmatched.
- Conservative close-match candidates may be shown when eligible.
- A candidate is never auto-applied.
- Applying a candidate requires an explicit user action.
- Applying a candidate edits the current input but does not automatically rerun analysis.

## Result controls regression

After generating a mixed result set:

- Filter by Dictionary match / Additional review / Unmatched and confirm filtering changes visibility only.
- Confirm filtering does not alter the underlying analysis.
- Use previous/next review navigation and confirm it moves only among currently visible Additional review / Unmatched cards.
- Confirm review navigation does not edit input or rerun analysis.

## Language regression

Test both JP and EN UI states:

- Static labels change language.
- Current scan/input state is preserved where the implementation contract requires it.
- Dynamic result/reference wording follows the selected UI language.
- The non-safety/non-diagnostic disclaimer remains present in both languages.
- The Japanese-label mode is not described as machine translation in either language.

## Layout regression

At minimum, verify:

- 360px width: no overlapping controls, clipped primary actions, or unusable result navigation.
- Photo/text mode controls remain usable on narrow screens.
- Result filters/review controls remain usable without breaking the page.
- Desktop keeps adequate width for detailed result review.

## PASS / FAIL criteria

**PASS** when:

- Photo/OCR and direct-text entry paths work without blank results for valid input.
- OCR output is editable before matching.
- Unknown/unmatched entries remain visible.
- Neutral result semantics are preserved.
- JP/EN switching does not revive legacy safety-ranking or translation copy.
- Result filtering and review navigation do not mutate analysis state.
- Layout remains usable at 360px and desktop widths.

**FAIL** if any of the following occur:

- Results disappear after valid input.
- OCR output cannot be reviewed/corrected before matching.
- Unmatched items vanish from results.
- SAFE / CAUTION / RISK returns as the current user-facing result ranking.
- Japanese-label matching is presented as machine translation.
- Result filters or review navigation edit/reclassify data unexpectedly.
- Layout breaks at narrow mobile width.

## Pre-merge checklist

- [ ] Photo/image path usable.
- [ ] OCR progress and editable OCR result verified.
- [ ] Direct text path usable.
- [ ] INCI/English and Japanese source-label tests pass.
- [ ] Result state/filter/review navigation checks pass.
- [ ] JP/EN wording and disclaimers pass.
- [ ] Mobile 360px layout OK.
- [ ] Automated cosmetics benchmark/release gates pass.

## Dictionary validation

Run the canonical dictionary validator from the repository root:

```bash
node tools/inci-fastscan/validate-dictionary.mjs
```

The validator currently checks the maintained static files plus the generated dictionary layer, schema fields, duplicate/overlapping identities, allowed categories, the legacy `safety` enum, and the minimum unique-English-ingredient threshold.

The legacy `safety` field remains part of the stored dictionary schema for compatibility. Passing validation for that field does **not** authorize exposing it as a current UI safety score. Runtime isolation is covered by the cosmetics legacy-safety regression.

## Automated regression commands

The pull-request workflow `.github/workflows/cosmetics-accuracy-benchmark.yml` runs the maintained cosmetics checks, including:

- shared parser regression
- dictionary/alias and semantic-quality checks
- legacy safety runtime/public-copy isolation
- canonical merge/equivalent checks
- Japanese label variants
- FastScan result, OCR, line-repair, robustness, result-control, and review-queue regressions
- Lite navigation regression
- 100-case, full-label, and source-backed real-label benchmarks
- cross-tool and release gates
- affiliate isolation contract

Keep these automated checks green before merging FastScan or shared cosmetics changes.
