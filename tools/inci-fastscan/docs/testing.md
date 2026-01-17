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
