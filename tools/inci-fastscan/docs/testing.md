# Testing (INCI FastScan)

This document describes manual regression checks for OCR post-processing and ingredient parsing.

## Quick smoke test (2 minutes)

Run the four manual input tests below (EN/JP), then confirm:

- Results render in the output area.
- Unknown items appear as **Unknown** (or equivalent) instead of disappearing.

**TAB1 (EN)**

1. `Sodium Hyaluronate, Fragrance, Salicylic Acid`
2.
   ```
   Hyaluronic Acid
   Perfume
   BHA
   ```

**TAB2 (JP)**

3.
   ```
   ヒアルロン酸Na
   香料
   サリチル酸
   ```
4. `ヒアルロン酸Na・香料／サリチル酸`

## OCR regression (copy/paste fixtures)

These fixtures contain raw OCR output (including noise). Copy/paste exactly as-is.

1. **TAB1 (EN)**: open `tools/inci-fastscan/data/fixtures_ocr_samples/en_sample_01.txt` → copy all → paste into TAB1 → run **Analyze**.
2. **TAB2 (JP)**: open `tools/inci-fastscan/data/fixtures_ocr_samples/jp_sample_01.txt` → copy all → paste into TAB2 → run **Analyze**.

**PASS criteria**

- Ingredient-like tokens are extracted and listed (e.g., **Sodium Hyaluronate**, **ヒアルロン酸Na**, **香料**, **サリチル酸**).
- Obvious non-ingredient blocks (e.g., **CAUTION / 注意 / 発売元 / 内容量**) do not dominate the results.

## PASS / FAIL criteria

**PASS** when:

- Results render for each tab without errors or blank output.
- Unknown entries remain visible as **Unknown** (or equivalent) rather than disappearing.
- Layout remains usable at 360px width (no overlap or clipped buttons).
- Support sheet opens and closes without breaking the page.
- OCR fixture runs populate the textarea before analysis and produce a non-empty result list.

**FAIL** if any of the following occur:

- Results are empty after a valid input or fixture run.
- Layout breaks at 360px (overlapping, clipped, or unreadable UI).
- Support sheet fails to open, close, or renders blank.
- OCR output does not fill the textarea or analysis yields no results.
- Unknown items vanish from results instead of being labeled.

## Pre-merge checklist

- [ ] Mobile 360px layout OK.
- [ ] Support sheet opens/closes.
- [ ] OCR runs and fills textarea.
- [ ] 4 manual tests OK.
- [ ] Fixtures regression OK.

## Dictionary validation

Run the dictionary validation script before expanding `ingredients.json` by hand:

```bash
node tools/inci-fastscan/scripts/validate_dict.js
```

What it checks:

- Required fields exist (at minimum: `en` and `safety`) and are non-empty.
- `jp` values are a non-empty string or array of non-empty strings when present.
- Aliases (`alias`, `aliases`, `en_aliases`, `jp_aliases`) are non-empty strings.
- No duplicate EN names after normalization (trim, lower-case, collapse whitespace).
- No duplicate JP names after normalization (trim, collapse whitespace).
- No alias collides with another entry’s main EN/JP name after normalization.
- `safety` is one of: `safe`, `caution`, `risk`.

Rule of thumb for manual additions:

- Keep EN names unique and consistent in casing/spacing.
- Keep JP names unique across the dictionary.
- Avoid aliases that match any existing EN/JP main name.
