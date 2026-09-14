# Cosmetics Note Provenance Contract

PR38 measured 22 legacy `note_short` records whose text contains safety/risk/irritation/allergy/sensitivity or similar claim-bearing wording, while the maintained nine-file dictionary set had zero explicit per-record evidence metadata.

PR41 therefore made FastScan fail closed for dictionary-authored explanatory notes until a note has explicit provenance. It did not delete the legacy text from repository source data; the raw notes remain available for audit and later source-backed review.

PR42 formalizes the per-record schema and makes canonical merge provenance-aware so future verified notes cannot depend on dictionary file order.

## Runtime rule

FastScan may expose a dictionary-authored `note_short` only when all of the following are true:

```txt
note_verified = true
note_short is non-empty
note_sources contains at least one valid HTTPS source URL
```

Otherwise the result object carries no usable dictionary note and the UI falls back to its existing neutral message:

```txt
ローカル辞書に一致しました。必要に応じてメーカー等の公式情報も確認してください。
Matched the local dictionary. Check official manufacturer information when needed.
```

This default copy describes only the name-match event. It does not make a safety, irritation, suitability, efficacy, concentration, allergy, pregnancy, or regulatory claim.

## Per-record schema

The provenance fields are optional because the legacy dictionary remains intentionally unverified until individual records are reviewed.

```json
{
  "en": "Example Ingredient",
  "note_short": "Reviewed neutral explanatory text.",
  "note_verified": true,
  "note_sources": [
    "https://example.org/official-source"
  ]
}
```

Rules:

- `note_verified`, when present, must be a boolean.
- `note_sources`, when present, must be an array.
- every `note_sources` entry must be a valid HTTPS URL with a hostname.
- duplicate source URLs after URL normalization are invalid data.
- `note_verified = true` requires a non-empty `note_short`.
- `note_verified = true` requires at least one valid HTTPS `note_sources` entry.
- source metadata may be staged before verification, but it does not make a note user-visible until `note_verified = true`.
- `note_verified = true` is not a safety rating. It means only that the exact explanatory note was reviewed against the attached provenance.

Do not use `note_verified` to revive legacy `safe` / `caution` / `risk` values. Those remain isolated under the PR39 contract.

## Canonical merge contract

Raw dictionary files contain duplicate canonical identities, so provenance must not depend on which record happens to load first.

The shared parser therefore applies these rules:

1. A record is a verified-note candidate only when it satisfies the runtime rule above.
2. If one canonical identity has one verified note text, that text becomes the merged verified note regardless of raw record order.
3. If multiple records have the same verified note text, their unique valid HTTPS sources are unioned.
4. If one canonical identity has multiple different verified note texts, no verified winner is selected.
5. Conflicting verified-note candidates are retained in `note_provenance_conflict` / `semantic_conflicts.note_provenance` for audit, while runtime exposure fails closed.
6. Invalid or incomplete provenance never survives as `note_verified = true` after canonical merge.

Legacy unverified `note_short` values may remain in merged data for compatibility/audit, but FastScan does not display them because the verified flag is absent.

## Lite

Cosmetic Ingredient Checker Lite builds its displayed description from neutral match/category and explicit functional-rule text rather than rendering `note_short` directly. PR41/PR42 therefore do not make legacy dictionary notes user-visible in Lite.

Both tools still use the same shared canonical identity and dictionary data for recognition.

## Provenance migration

A cleanup wave may restore a dictionary-authored note to FastScan only after reviewing the text and adding explicit provenance under this schema. `note_verified = true` without at least one valid HTTPS `note_sources` entry is invalid and remains fail-closed at runtime.

The purpose is not to mass-fill the 538 missing notes identified by PR38. Missing text is preferable to generated filler or an unsupported claim. Provenance work should prioritize the 22 claim-bearing legacy notes and other user-visible statements with substantive meaning.

When a note is reviewed, review the exact final wording that will be stored in `note_short`; do not attach a source to a broader or stronger claim than the source actually supports.

## Recognition and OCR

The provenance work changes explanatory-note exposure only. It does not change:

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
node tools/_shared/check-cosmetics-note-provenance-schema.mjs
```

The isolation regression fails if FastScan can render an unverified dictionary note, if verified notes stop requiring provenance, if the neutral fallback copy disappears, or if PR38's semantic-note/evidence inventory is removed.

The schema regression validates all nine maintained dictionary files, exercises order-independent verified-note canonical merge, verifies source union behavior, and proves that conflicting or invalid provenance fails closed.
