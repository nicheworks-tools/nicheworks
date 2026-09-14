# Cosmetics Note Provenance Contract

PR38 measured 22 legacy `note_short` records whose text contains safety/risk/irritation/allergy/sensitivity or similar claim-bearing wording, while the maintained nine-file dictionary set had zero explicit per-record evidence metadata.

PR41 made FastScan fail closed for dictionary-authored explanatory notes until a note has explicit provenance. PR42 formalized the per-record schema and made canonical merge provenance-aware. PR48 begins source-backed migration without rewriting the raw recognition dictionary: reviewed notes may now also enter through a canonical verified-note overlay and must pass the same runtime provenance gate.

## Runtime rule

FastScan may expose a dictionary-authored `note_short` only when all of the following are true after canonical merge:

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

The provenance fields remain valid on raw dictionary records:

```json
{
  "en": "Example Ingredient",
  "note_short": "Reviewed explanatory text.",
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

## Canonical verified-note overlay

PR48 adds `VERIFIED_NOTE_EVIDENCE` in the shared parser. This separates reviewed explanatory text/evidence from the raw recognition dictionary in the same way verified category evidence is separated from recognition records.

Each overlay entry is keyed by canonical identity and contains:

- exact reviewed `note_short` text;
- one or more HTTPS `note_sources`;
- `authority` identifying the source organization.

The overlay does not bypass provenance handling. It is converted into an ordinary verified-note candidate and enters the same conflict-aware canonical merge as per-record verified notes. If a future per-record verified note conflicts with the overlay text, runtime exposure fails closed rather than selecting a winner.

## Canonical merge contract

Raw dictionary files contain duplicate canonical identities, so provenance must not depend on which record happens to load first.

The shared parser applies these rules:

1. A raw record is a verified-note candidate only when it satisfies the runtime rule above.
2. A canonical overlay entry is injected as another verified-note candidate; it has no privileged conflict bypass.
3. If one canonical identity has one verified note text, that text becomes the merged verified note regardless of raw record order.
4. If multiple candidates have the same verified note text, their unique valid HTTPS sources are unioned.
5. If one canonical identity has multiple different verified note texts, no verified winner is selected.
6. Conflicting verified-note candidates are retained in `note_provenance_conflict` / `semantic_conflicts.note_provenance` for audit, while runtime exposure fails closed.
7. Invalid or incomplete provenance never survives as `note_verified = true` after canonical merge.

Legacy unverified `note_short` values remain in raw source data for compatibility/audit, but FastScan does not display them because the verified flag is absent.

## PR48 wave 1

PR48 verifies exactly three claim-bearing canonical notes against European Commission SCCS material:

| Canonical identity | Reviewed runtime note | Source basis |
| --- | --- | --- |
| `phenoxyethanol` | `Preservative; SCCS considers it safe for use up to 1.0% in cosmetic products.` | SCCS/1575/16 concludes 2-phenoxyethanol is safe as a preservative at a maximum concentration of 1.0%, taking the supplied information into account. |
| `limonene` | `Fragrance ingredient; oxidised limonene is an established contact allergen in the SCCS opinion.` | SCCS/1459/11 lists oxidised limonene among established fragrance contact allergens of special concern. |
| `linalool` | `Fragrance ingredient; oxidised linalool is an established contact allergen in the SCCS opinion.` | SCCS/1459/11 lists oxidised linalool among established fragrance contact allergens of special concern. |

The raw legacy notes are intentionally not rewritten. The original PR38 claim-bearing baseline therefore remains 22 raw rows, while `check-cosmetics-verified-note-wave1.mjs` reports 3 resolved rows and 19 still unresolved after wave 1.

## Lite

Cosmetic Ingredient Checker Lite builds its displayed description from neutral match/category and explicit functional-rule text rather than rendering `note_short` directly. PR48 does not make these reviewed FastScan notes a new Lite message surface.

Both tools still use the same shared canonical identity and dictionary data for recognition.

## Provenance migration

A cleanup wave may restore a dictionary-authored note to FastScan only after reviewing the exact final text against source evidence. Missing text is preferable to generated filler or an unsupported claim. Do not mass-fill the 538 missing notes identified by PR38.

When a note is reviewed, do not attach a source to a broader or stronger claim than the source actually supports. Prefer authoritative or primary material, and narrow or rewrite the legacy note when needed rather than preserving unsupported wording.

## Recognition and OCR

The provenance work changes explanatory-note exposure only. It does not change:

- exact canonical/Japanese/alias recognition;
- the cohort 1, 2, or 3 coverage floors;
- ambiguity protections;
- OCR processing or exact line repair;
- near-match suggestions or explicit candidate application;
- functional category handling.

## Privacy and Amazon

No user ingredient input, OCR text, image, filename, selected correction, review position, or analysis result is added to any network request by this change.

Amazon remains a separate fixed neutral tagged-search layer. Affiliate destinations are not selected from note text or analysis output, and affiliate events remain limited to coarse fixed metadata.

## Regression

Run:

```bash
node tools/_shared/check-cosmetics-note-provenance-isolation.mjs
node tools/_shared/check-cosmetics-note-provenance-schema.mjs
node tools/_shared/check-cosmetics-verified-note-wave1.mjs
```

The isolation regression fails if FastScan can render an unverified dictionary note, if verified notes stop requiring provenance, if the neutral fallback copy disappears, or if PR38's semantic-note/evidence inventory is removed.

The schema regression validates all nine maintained dictionary files, exercises order-independent verified-note canonical merge, verifies source union behavior, and proves that conflicting or invalid provenance fails closed. The wave-1 regression additionally pins the three reviewed canonical notes, SCCS source URLs, overlay-to-runtime merge behavior, and 22 → 3 resolved / 19 unresolved claim-bearing progress accounting.
