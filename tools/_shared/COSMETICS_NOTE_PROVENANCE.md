# Cosmetics Note Provenance Contract

PR38 measured 22 legacy `note_short` records whose text contains safety/risk/irritation/allergy/sensitivity or similar claim-bearing wording, while the maintained nine-file dictionary set has zero explicit per-record evidence metadata.

PR41 therefore makes FastScan fail closed for dictionary-authored explanatory notes until a note has explicit provenance. It does not delete the legacy text from repository source data; the raw notes remain available for audit and later source-backed review.

## Runtime rule

FastScan may expose a dictionary-authored `note_short` only when all of the following are true:

```txt
note_verified = true
note_short is non-empty
note_sources contains at least one HTTPS source URL
```

Otherwise the result object carries no usable dictionary note and the UI falls back to its existing neutral message:

```txt
ローカル辞書に一致しました。必要に応じてメーカー等の公式情報も確認してください。
Matched the local dictionary. Check official manufacturer information when needed.
```

This default copy describes only the name-match event. It does not make a safety, irritation, suitability, efficacy, concentration, allergy, pregnancy, or regulatory claim.

## Lite

Cosmetic Ingredient Checker Lite already builds its displayed description from neutral match/category and explicit functional-rule text rather than rendering `note_short` directly. PR41 therefore does not change Lite runtime output.

Both tools still use the same shared canonical identity and dictionary data for recognition.

## Provenance migration

A later cleanup wave may restore a dictionary-authored note to FastScan only after reviewing the text and adding explicit provenance. `note_verified = true` without at least one HTTPS `note_sources` entry is insufficient and remains fail-closed.

The purpose is not to mass-fill the 538 missing notes identified by PR38. Missing text is preferable to generated filler or an unsupported claim. Provenance work should prioritize the 22 claim-bearing legacy notes and other user-visible statements with substantive meaning.

## Recognition and OCR

PR41 changes explanatory-note exposure only. It does not change:

- exact canonical/Japanese/alias recognition;
- the cohort 1, 2, or 3 coverage floors;
- ambiguity protections;
- OCR processing or exact line repair;
- near-match suggestions or explicit candidate application;
- functional category handling introduced by PR40.

## Privacy and Amazon

No user ingredient input, OCR text, image, filename, selected correction, review position, or analysis result is added to any network request by this change.

Amazon remains a separate fixed neutral tagged-search layer. Affiliate destinations are not selected from note text or analysis output, and affiliate events remain limited to coarse fixed metadata.

## Regression

Run:

```bash
node tools/_shared/check-cosmetics-note-provenance-isolation.mjs
```

The regression fails if FastScan can render an unverified dictionary note, if verified notes stop requiring HTTPS provenance, if the neutral fallback copy disappears, or if PR38's semantic-note/evidence inventory is removed.
