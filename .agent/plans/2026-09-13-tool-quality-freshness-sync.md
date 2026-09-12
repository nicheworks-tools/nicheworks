# ExecPlan — Tool quality audit freshness sync

## Scope

Refresh the canonical `docs/tools/*.md` audit contracts that are stale relative to current `main` after the all-tool Phase 1 quality audit. This pass is documentation/audit synchronization only; it does not change public runtime behavior.

Target tools:

- `cosmetic-ingredient-checker-lite`
- `inci-fastscan`
- `trashnavi`

## Files to touch

- `.agent/plans/2026-09-13-tool-quality-freshness-sync.md`
- `docs/tools/cosmetic-ingredient-checker-lite.md`
- `docs/tools/inci-fastscan.md`
- `docs/tools/trashnavi.md`

## Steps

1. Compare the current canonical audit records with each tool's current `SPEC.md` and current-main runtime/evidence.
2. Carry forward only already-implemented contract changes; do not invent features or data.
3. Preserve Phase 1 audit semantics: recommendation-only help/test gaps remain recommendation-only.
4. Run Tool spec audit, Tool runtime contract audit, SEO audit, and any path-triggered tool checks through PR CI.
5. Merge only if the branch remains mergeable and CI is green.

## Verification

- Cosmetic Ingredient Checker Lite canonical record includes the implemented dictionary-recognition percentage and compact unclassified-name summary without describing either as a safety score.
- INCI FastScan canonical record includes image preview/reselection, post-OCR review cue, exact-match route metadata, and the current neutral result-state wording.
- TrashNavi canonical record reflects the 11-page Wave 4 publication baseline and current direct-link health-monitoring contract.
- No runtime files, common specs, deployment settings, or unrelated tools are modified.
