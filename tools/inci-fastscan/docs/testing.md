# Testing (INCI FastScan)

This document describes manual regression checks for OCR post-processing and ingredient parsing.

## Manual input tests (must pass)

Run each of the following in the correct tab, then click **Analyze** (TAB1) or **Translate & Check Safety** (TAB2) as applicable.

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

## OCR fixture regression (copy/paste)

These fixtures contain raw OCR output (including noise). Copy/paste exactly as-is.

- **EN fixture**: open `tools/inci-fastscan/data/fixtures_ocr_samples/en_sample_01.txt` → copy all → paste into **TAB1** textarea → run **Analyze**.
- **JP fixture**: open `tools/inci-fastscan/data/fixtures_ocr_samples/jp_sample_01.txt` → copy all → paste into **TAB2** textarea → run **Translate & Check Safety**.

### PASS criteria (plain language)

- Obvious non-ingredient blocks (e.g., **CAUTION / 注意 / 発売元 / 内容量**) should not dominate the parsed ingredient list.
- Ingredient tokens should be extracted and split reasonably (examples: **Sodium Hyaluronate**, **ヒアルロン酸Na**, **香料**, **サリチル酸**).

## Pre-merge checklist

- [ ] All four manual input tests above behave as expected.
- [ ] EN OCR fixture parses into ingredient-like tokens without CAUTION blocks dominating.
- [ ] JP OCR fixture parses into ingredient-like tokens without 注意/発売元/内容量 blocks dominating.
- [ ] No runtime code changes were required for this doc update.

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
