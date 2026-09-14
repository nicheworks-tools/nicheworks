# Cosmetics Canonical Semantic Merge Contract

PR40 changes how duplicate canonical ingredient records are merged at runtime for both Cosmetic Ingredient Checker Lite and INCI FastScan.

The source dictionaries remain auditable as-is. PR40 does not erase the raw conflicts measured by PR38; it prevents those conflicts from being silently resolved by file order when the runtime canonical record is built.

## Safety conflict rule

If all source records for one canonical identity carry the same legacy `safety` value, the merged compatibility record may retain that value.

If two or more distinct legacy values exist:

- the merged canonical record has no selected `safety` winner;
- every observed value is retained in `legacy_safety_values`;
- `semantic_conflicts.safety` records the conflict explicitly.

This complements PR39, which already prevents legacy safety metadata from driving user-facing result state. PR40 therefore makes the canonical runtime data itself conflict-aware rather than merely relying on the UI to ignore a first-record winner.

The 16 safety conflicts measured by PR38 remain visible and auditable. PR40 does not claim that one legacy value is medically or scientifically correct.

## Functional category rule

A single consistent source category remains unchanged.

When duplicate canonical records contain distinct category strings, PR40 preserves every observed function instead of letting the first record win. Slash-delimited multi-function source values are normalized into unique functional tokens for the runtime record.

Examples from the PR38 audit become:

```txt
Urea
  source variants: active | humectant
  runtime categories: active / humectant

Titanium Dioxide
  source variants: uv filter/colorant | colorant
  runtime categories: uv filter / colorant

Microcrystalline Wax
  source variants: wax | texture agent
  runtime categories: wax / texture agent

PEG-32
  source variants include humectant and humectant/solvent
  runtime categories: humectant / solvent
```

The original category strings remain available in `semantic_conflicts.category` so normalization does not destroy evidence of the underlying source-record disagreement.

## Notes

PR40 deliberately does not rewrite `note_short`. PR38 found no canonical note conflicts, but most duplicate source records lack notes and the existing notes have no explicit provenance metadata. Note normalization belongs to the later provenance/copy-quality wave.

## Recognition and ambiguity

This merge changes semantic metadata only. It does not change canonical identity keys, Japanese names, aliases, ambiguity blocks, parser splitting, OCR repair, or near-match behavior.

Existing source-backed exact-recognition floors remain:

```txt
cohort 1 >= 96.5%
cohort 2 >= 97.6%
cohort 3 >= 99.2%
```

Broad or deliberately unresolved names remain unresolved.

## Privacy and monetization

The semantic merge operates on static repository dictionary records only. No user ingredient input, OCR text, image, filename, selected correction, filter state, or analysis result is sent elsewhere by this change.

Amazon remains a separate fixed neutral tagged-search layer and is not selected from semantic metadata or ingredient results.

## Regression

Run:

```bash
node tools/_shared/check-cosmetics-canonical-merge.mjs
node tools/_shared/check-cosmetics-runtime-semantic-merge.mjs
```

The runtime regression freezes the current audit relationship:

```txt
725 maintained source records
599 canonical runtime identities
16 explicit safety conflicts, 0 selected safety winners
4 explicit category conflicts, all functions preserved
```
