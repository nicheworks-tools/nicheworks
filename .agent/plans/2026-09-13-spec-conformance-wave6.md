# SPEC conformance audit — Wave 6 current-main completion

## Purpose

Complete the sequential runtime/SPEC conformance cycle for the final registry tools 76–87 against current `main`, while preserving the already-merged all-tool quality audit and parallel accepted work.

The older branch `audit/spec-conformance-wave6-20260912` contains only its initial ExecPlan and no completed runtime audit or fixes. This plan supersedes that stale execution branch without redoing Waves 1–5.

## Base and scope

- Starting main SHA: `9345f1a4439202e1d58fca186093636afc0ae5bc`.
- Branch: `audit/spec-conformance-wave6-20260913`.
- Scope: registry tools 76–87 plus the Wave 6 runtime-contract checker/workflow wiring and SPEC files synchronized for in-scope findings.
- Main advanced in parallel on TrashNavi while this branch was open. The PR must therefore be integrated/tested against current main rather than treating the starting SHA as a frozen release baseline.

## Wave 6 tools

1. `sukima-baito-income`
2. `tiny-audio-meter`
3. `trashnavi`
4. `ui-atlas`
5. `unicode-kanji-checker`
6. `unitmaster`
7. `url-title-collector`
8. `variant-kanji-compare`
9. `vibe-lexicon`
10. `weatherdiff`
11. `webp-avif-converter`
12. `wifi-meter`

## Audit method

For each tool:
1. Read the current `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the public entry page and the active runtime actually loaded from that page.
3. Verify core action behavior, error/empty states, privacy/network boundary, persistence, language, limits, export/copy, billing/gating, and safety/non-goal boundaries.
4. Classify findings P0/P1/P2.
5. Fix every in-scope P0/P1 and synchronize affected specifications. Synchronize stale specification wording when current runtime is already safer/correct and no behavior change is required.
6. Preserve the eight support-block repairs already merged in #639 and all accepted parallel current-main work.
7. Add read-only Wave 6 runtime-contract coverage and wire it into the existing `Tool runtime contract audit` workflow.
8. Merge only when current-main PR integration is clean and relevant CI is green.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, billing bypass, or materially misleading behavior.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Final inspection result before PR CI

- **P0: 0.**
- **P1: 2, both fixed on this branch.**
  - `ui-atlas`: legacy bridge and direct fallback accepted any cached `active` shared status. Both now require exact `active && entitlement === "nicheworks_pro"`; another product's active entitlement cannot raise the compare limit from Free 2 to Pro 5.
  - `vibe-lexicon`: shared status used `active` only and legacy `nw_pro_vibe-lexicon=1` could independently unlock paid copy/export. Both app and bridge now require exact `nicheworks_pro`; the old tool-local flag is removed on bridge boot and is no longer authority.
- `url-title-collector`: runtime privacy wording was already correct about sending entered URLs through the NicheWorks Worker. Stale `SPEC.md` wording claiming the page still had local-only language was synchronized; no runtime behavior change was needed.
- `sukima-baito-income`: page-memory income rows, bounded OCR/import flow, and CSV contract inspected; no P0/P1 found.
- `tiny-audio-meter`: measurement constraints, actual processing-setting disclosure, local bounded snapshots/records, pitch bounds/cadence, and disabled Amazon configuration inspected; no P0/P1 found.
- `trashnavi`: repository-data runtime, publication gate, existing runtime checker, and direct-link hard-error boundary inspected; no new P0/P1 found. Parallel current-main data/coverage waves remain outside this branch and must be preserved by PR integration.
- `unicode-kanji-checker`: code-point-safe browser analysis, same-site old-kanji data, and non-authoritative legal/registration warning inspected; no P0/P1 found.
- `unitmaster`: JSON runtime/fallback, seven categories, numeric/absolute-zero guards, and five-item local history inspected; no P0/P1 found.
- `variant-kanji-compare`: browser-side glyph/Unicode comparison, same-site reference data, and staged/non-live paid boundary inspected; no P0/P1 found.
- `weatherdiff`: explicit geocoding/weather API network flow, HTTPS geolocation gate, 5-second location timeout, separate provider errors, and safety warning inspected; no P0/P1 found.
- `webp-avif-converter`: single-file local conversion, WebP/AVIF guard, JPEG white-background handling, object-URL cleanup, and FileType Sniffer fallback inspected; no P0/P1 found.
- `wifi-meter`: Network Information API-only estimate, manual 1-second sampling, max-50 page-memory graph, unsupported-browser handling, and no speed-test fetch inspected; no P0/P1 found.

## Regression coverage added

`scripts/check-tool-runtime-contracts-wave6.mjs` now protects the key runtime contracts for all twelve tools above, including the two entitlement-isolation fixes. `.github/workflows/tool-runtime-contract-audit.yml` runs Wave 6 after the existing Waves 1–5 checks, so the sequential runtime-contract gate now covers registry tools 1–87. The audit remains read-only.

A temporary branch-only repair script/workflow was used solely for deterministic targeted edits and was deleted before PR creation.

## Allowed files

- `.agent/plans/2026-09-13-spec-conformance-wave6.md`
- `scripts/check-tool-runtime-contracts-wave6.mjs`
- `.github/workflows/tool-runtime-contract-audit.yml`
- current Wave 6 tool implementation/SPEC files necessary for the two P1 repairs and one specification synchronization

No common specification, unrelated tool family, deployment configuration, or monetization/product definition is changed.

## Acceptance

Wave 6 is implementation-complete on the branch when all final 12 registered tools have been inspected, both P1 findings are fixed, the stale URL Title Collector specification is synchronized, temporary repair machinery is removed, and read-only runtime-contract coverage extends through tool 87. Final closure still requires relevant PR CI against current main to be green and the PR to merge cleanly.
