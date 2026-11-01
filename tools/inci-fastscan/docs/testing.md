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

## Real-photo OCR accuracy benchmark (local-only runner)

The suite includes a measurement page at `/tools/inci-fastscan/qa/photo-ocr-benchmark.html` (file: `tools/inci-fastscan/qa/photo-ocr-benchmark.html`). This page is a **QA tool, not an already measured accuracy result**. It reuses the production `runOCR`, image preprocessing, OCR text cleanup and shared ingredient parser.

1. Select an **actual** cosmetic ingredient-label photo, not a text-file fixture, and independently transcribe the ingredient lines from the package as the ground-truth reference. Do not copy the initial OCR output as ground truth.
2. Select English or Japanese+English OCR according to the photographed label.
3. Run the **original** image first. This supplies a baseline with no image modifications.
4. Set 90° rotation, fine deskew ±12°, edge crop or 100–180% contrast. Run the **adjusted** image using the same photo/reference.
5. Compare normalized character error rate (CER, edit distance/reference characters), exact-ingredient recall and precision (duplicates counted) and time to complete. The CER normalizer first tokenizes label ingredients via the shared parser so the OCR cleanup's comma-to-line-break formatting does not create false OCR character errors; numeric locant commas inside ingredient names remain significant. For CER lower is better; for exact-name recall higher is better.
6. Copy the **metrics-only JSON** for later aggregation. It contains no source image, filename, transcribed label or OCR output. Raw photo and label transcription stay local to the browser. Tesseract's library/language data are downloaded externally.
7. Repeat on independent English and Japanese packaging photos, including low contrast, imperfect lighting, slight tilt, shadows, different phone cameras, high ingredient density, and text wrapping.

**Minimum objective QA sample before declaring success:** 10 independent real photos spanning both language modes, with a ground-truth transcription, measured baseline and adjusted runs for each. Record browser/device OS and test context separately without transmitting private photo contents. Report per-photo and pooled CER and exact ingredient recall; do not present a single-photo improvement as a general OCR accuracy gain. Validate mobile 360px controls and OCR execution on an actual handset before closing the device QA gate. This repository does **not** yet contain or claim results from ten independently labeled real photos.

The deterministic metric/HTML privacy regression is:
```bash
node tools/_shared/check-fastscan-photo-ocr-metrics.mjs
```
This checks metric mathematics and wiring, **not** Tesseract recognition quality on real photographs. Changes in the image options must invalidate stale measurements. For real-annotation sets, a bad recognition result is diagnostic information, not permission to silently alter the transcription or auto-correct exact dictionary matches.

## External annotated real-photo OCR pilot (12 English-language labels)

An independent real-photo baseline can run in GitHub Actions via
`.github/workflows/fastscan-real-photo-ocr-pilot.yml`. It is an **actual photo OCR
measurement**, not a generated/simulated label regression and **not a completed
mobile-browser QA certification**.

- External data source: [ToxFox OCR development corpus](https://github.com/ki-iw/toxfox-ocr),
  fixed commit `5ba39a7b06c59ff1edb30a396fdd640f82506742`, GPL-3.0 repo.
  The pilot downloads 12 publicly available cropped ingredient-label photos and
  their associated `INCI_list` / `raw_ingredients_list` ground-truth YAML files.
  Source photo binaries and transcriptions are fetched into temporary CI storage
  and **never committed to or uploaded as NicheWorks artifacts**.
- OCR engine: Tesseract.js 5.0.3 with English language model. Output then passes
  the actual FastScan `coreProcessOCRText` and `postProcessOcrText` functions,
  and the existing `photo_ocr_metrics.js` character error / exact ingredient
  scoring with the shared ingredient parser.
- Metric outputs: per-image exact ingredient recall against the external annotated
  ingredient list, and CER against the external raw package transcription.
  The additionally reported **annotation-only control** scores the same source's
  `raw_ingredients_list` against its `INCI_list` without any photo OCR. This
  explicitly measures how much strict exact-name scoring disagrees with the
  dataset's own spellings, aliases, names with explanatory parentheses and
  separator formatting. It is **not** an OCR quality score or a correct-output
  upper bound; compare it with the raw photo OCR score before diagnosing the model.
  Pooled metrics correctly weight ingredient counts and reference characters.
  CI uploads **aggregate numeric results only**, including per-photo numeric
  scores without the image, filename of the local user, input transcription,
  OCR output or raw text. Public corpus sample IDs are included for reproducibility.
- Important limitation: source labels can contain spelling/normalization errors,
  aliases and imperfect human transcriptions. The pilot runs on **unmodified
  source photos** with no client-side canvas preprocessing. Therefore the result
  is a raw Tesseract.js real-photo baseline, **not** the accuracy of the
  end-to-end browser FastScan image-processing workflow. All 12 must have real
  OCR output to count as measured; there is no assumed acceptable performance
  threshold.
- Additional acceptance gates after this pilot: **production browser** original
  versus adjusted preprocessing, Japanese ingredient-label photos with independent
  transcription, actual 360px smartphone photo/OCR operation, curved/glare-rich
  packaging, and evaluation of errors before declaring product completion.

**First measured 12-photo pilot (2026-11-01, [GitHub Actions run 41307444468](https://github.com/nicheworks-tools/nicheworks/actions/runs/41307444468)):** all 12 external real English-language label photos were recognized, with **19.28% pooled strict annotated-ingredient exact recall**, **44.60% pooled CER against the raw transcription**, and **62.05% pooled annotation-only exact-recall control**. These are negative diagnostic results, **not a passed OCR accuracy gate**; strict matching also disagrees with the corpus's own spelling/alias conventions, so raw image OCR and exact-ingredient matching must be debugged separately. Results vary widely by photo. The first run printed valid per-photo numbers but its upload-artifact step skipped the hidden `.qa-external-fastscan-results.json` output; the next workflow revision changes to a visible numeric-only filename and makes a missing artifact a hard failure. No photographed label, OCR text, or ground truth is uploaded. Real smartphone/browser original-versus-preprocessed and Japanese measurements remain outstanding.

**Controlled real-photo segmentation A/B (2026-11-02, [GitHub Actions run 41335294961](https://github.com/nicheworks-tools/nicheworks/actions/runs/41335294961)):** all 36 OCR recognitions completed on the same 12 independently annotated English package photos and a metrics-only artifact was uploaded. Reported pooled results:

| Fixed OCR mode | Strict annotated INCI recall (higher better) | CER vs raw label transcription (lower better) | Raw OCR CER before FastScan cleanup |
| --- | ---: | ---: | ---: |
| Tesseract.js default | **19.28%** | 44.60% | 46.57% |
| PSM6 uniform text block | **19.28%** | 44.60% | 46.57% |
| PSM11 sparse text | 16.57% | **38.22%** | 40.12% |

**Decision:** retain production default. PSM11 reduces pooled character edits by 6.38 percentage points but **decreases exact-name recall by 2.71 points**; an unconditional switch would worsen a primary user-facing metric. PSM6 replicates default in this corpus. The FastScan OCR cleanup slightly reduces pooled CER in both modes (without demonstrating better exact-name recall). Individual photos vary widely and some show near-zero exact recall despite moderately low CER, so OCR text segmentation, missing ingredient boundaries, ground-truth spellings/aliases, and image quality must be investigated separately. This is not an overall mobile or Japanese accuracy certification, and is not an instruction to silently auto-correct user text. See CI numeric-only artifact `fastscan-real-photo-ocr-metrics` in that run.

The pilot also compares default Tesseract page segmentation with fixed **PSM 6** (uniform text block) and **PSM 11** (sparse text) on the same 12 photos. It reports baseline and experimental per-photo/pooled exact ingredient recall, CER against package transcription, and the raw OCR CER before ingredient cleanup, without logging image or OCR text. These modes are **offline experiments only**: no best-per-photo oracle selection and no production mode change without proven reproducible improvement. A successful job means the measurement ran, not that the recognition accuracy passed.

The pilot may be triggered manually in GitHub Actions and also runs when its own
workflow or runner is changed in a pull request. If external image/model downloads
are unavailable, the job must fail transparently rather than report a made-up
recognition score.

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
