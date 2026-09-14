# ExecPlan — Old Kanji dictionary audit

## Scope

Audit the canonical Old Kanji mapping/data layer before any per-kanji SEO page rollout.

Primary data scope:
- `tools/old-kanji-reference/dict.json`
- `tools/old-kanji-reference/meta*.json`
- `tools/old-kanji-reference/compatibility-notes.json`
- related Old Kanji mapping consumers only as needed for validation

## Objectives

Classify the current dictionary records without silently inventing linguistic facts.

Required audit classes:
- `old_to_modern`: old/kyujitai-style source mapped to a different modern form
- `variant`: variant/itaiji-style source where the record is not a straightforward canonical old-to-modern pair
- `compatibility`: Unicode compatibility ideograph / compatibility-oriented record
- `identity`: source and mapped value are identical, e.g. `霧 -> 霧`
- `unresolved`: current repository data does not support a safe classification

## Required outputs

- a machine-readable audit artifact derived from the current canonical dictionary;
- counts for total records and each audit class;
- explicit list of identity mappings and other high-risk records;
- evidence fields explaining whether a classification comes from Unicode range, existing compatibility notes, existing repository metadata, or mapping shape;
- no mass deletion or remapping solely from inference;
- a read-only checker that detects audit drift when the canonical dictionary changes.

## SEO gate

Per-kanji indexable pages remain blocked for records that are `identity`, `unresolved`, or otherwise lack enough standalone data. The audit must produce a clear eligibility signal rather than auto-publishing pages.

## Non-goals

- no broad dictionary rewrite based on model knowledge;
- no new per-kanji SEO pages in this PR;
- no title/meta changes;
- no Pro/Amazon changes;
- no changes to ManualFinder;
- no external dependency additions.

## Validation

- validate JSON structure and counts;
- ensure every `dict.json.old_to_new` record appears exactly once in the audit artifact;
- ensure identity mappings are never marked SEO-eligible;
- ensure compatibility-range characters are not mislabeled as plain old-to-modern without an explicit override/evidence;
- run existing Old Kanji runtime/spec/SEO/Amazon/Pro checks through CI.
