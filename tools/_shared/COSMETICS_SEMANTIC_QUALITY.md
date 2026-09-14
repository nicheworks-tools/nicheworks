# Cosmetics Dictionary Semantic Quality Contract

This contract applies to the shared maintained dictionary set used by both:

- `tools/cosmetic-ingredient-checker-lite/`
- `tools/inci-fastscan/`

PR38 is an audit-first change. It does not alter matching, OCR behavior, source-backed corpus labels, affiliate destinations, or ingredient identities. Its purpose is to make semantic debt measurable before cleanup begins.

## Why this audit exists

Exact-name coverage is now high across the three source-backed real-product cohorts, but recognition alone does not prove that the metadata attached to a recognized ingredient is internally consistent or source-backed.

The nine maintained files currently contain legacy duplicate canonical records and scalar semantic fields such as `category` and `safety`. The runtime parser can merge duplicate identities for matching, but conflicting metadata can still exist in the source records. PR38 therefore audits semantics independently from exact-name recognition.

The legacy `safety` field is compatibility metadata. Values such as `safe`, `caution`, and `risk` are **not** a medical determination, safety guarantee, concentration-aware assessment, allergy prediction, pregnancy recommendation, or regulatory conclusion. They must not be treated as an objective ingredient-safety rating merely because they exist in the dictionary.

## Frozen PR38 baseline

The first CI inventory on the current nine-file dictionary set measured:

```txt
dictionary records:                         725
canonical identities:                       599
duplicate canonical groups:                 120
duplicate records beyond first:             126
records missing category:                   187
records missing safety:                     0
records missing note_short:                 538
generated placeholder notes:                0
claim-bearing notes requiring review:        22
records with explicit evidence metadata:     0
canonical groups with safety conflict:       16
canonical groups with category conflict:     4
canonical groups with note conflict:         0
duplicate groups with incomplete semantics:  120
```

The semantic audit freezes the debt-like counts above as **ceilings**, not targets. Future work may reduce them, but ordinary dictionary expansion must not increase them silently while continuing to pass recognition benchmarks.

`records_with_explicit_evidence_metadata` is reported but is not yet a release floor because the baseline is zero. Raising this from zero is a required provenance improvement for subsequent semantic cleanup.

## Conflict examples found by PR38

The audit found 16 canonical identities with conflicting legacy `safety` values. Examples include:

- `Urea`: `caution` vs `safe`;
- `Bemotrizinol` / `Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine`: `caution` vs `safe`;
- `Caprylhydroxamic Acid`: `safe` vs `caution`;
- `Ceteareth-20`: `caution` vs `safe`;
- `Diazolidinyl Urea`: `risk` vs `caution`;
- `DMDM Hydantoin`: `risk` vs `caution`;
- `Ferulic Acid`: `caution` vs `safe`;
- `Malic Acid`: `risk` vs `caution`;
- `Bisoctrizole` / `Methylene Bis-Benzotriazolyl Tetramethylbutylphenol`: `caution` vs `safe`.

The audit also found four canonical identities with conflicting scalar categories:

- `Titanium Dioxide`: `uv filter/colorant` vs `colorant`;
- `Urea`: `active` vs `humectant`;
- `Microcrystalline Wax`: `wax` vs `texture agent`;
- `PEG-32`: `humectant` vs `humectant/solvent`.

These findings are evidence that the current scalar metadata model must be normalized rather than that one existing value should automatically win.

## Cleanup priorities after PR38

### P0 — conflicting semantics

Resolve the 16 safety conflicts and four category conflicts without choosing a value by file order or convenience. Where a field is retained as factual metadata, the canonical semantic record must have explicit evidence/provenance. If a legacy safety classification cannot be supported as a meaningful, concentration-aware statement, the runtime should stop presenting it as authoritative rather than inventing a stronger justification.

### P1 — canonical source normalization

Reduce the 120 duplicate canonical groups and 126 duplicate records beyond the first. A canonical identity should own the maintained English name, Japanese labels, aliases, functional metadata, and provenance once. Compatibility aliases may remain, but they should not carry independent contradictory semantics.

### P2 — provenance and copy quality

Add explicit evidence metadata for semantic fields that are retained. Review the 22 notes containing safety/risk/irritation/allergy/sensitivity or similar claim-bearing wording. Unsupported or overly broad statements should be removed or rewritten as neutral functional descriptions.

The 538 missing `note_short` values are inventory debt, not a requirement to generate filler text. A missing note is preferable to a fabricated or generic claim.

## Non-regression rules

Run:

```bash
node tools/_shared/check-cosmetics-semantic-quality.mjs
```

The checker fails if semantic debt exceeds the PR38 frozen ceilings, if a maintained record loses `safety`, if an unsupported `safety` enum is introduced, if note conflicts are introduced, or if the maintained nine-file runtime contract changes unexpectedly.

Existing exact-recognition floors remain independent:

```txt
cohort 1 >= 96.5%
cohort 2 >= 97.6%
cohort 3 >= 99.2%
```

Semantic cleanup must not reduce these floors by deleting difficult records, rewriting source-backed labels, or weakening ambiguity protections.

## Privacy and monetization

This audit operates only on repository-maintained public dictionary data. It does not use or persist user ingredient input, OCR text, OCR images, filenames, selected corrections, review position, or analysis results.

Amazon affiliate destinations remain fixed neutral categories and are independent of dictionary semantics and analysis output. Affiliate telemetry remains restricted to coarse fixed metadata under the existing cosmetics affiliate contract.
