# SPEC conformance audit — Wave 6 current-main completion

## Purpose

Complete the sequential runtime/SPEC conformance cycle for the final registry tools 76–87 against current `main`, while preserving the already-merged all-tool quality audit and parallel accepted work.

The older branch `audit/spec-conformance-wave6-20260912` contains only its initial ExecPlan and no completed runtime audit or fixes. This plan supersedes that stale execution branch without redoing Waves 1–5.

## Base and scope

- Base main SHA: `9345f1a4439202e1d58fca186093636afc0ae5bc`.
- Branch: `audit/spec-conformance-wave6-20260913`.
- Scope: registry tools 76–87 plus the Wave 6 runtime-contract checker/workflow wiring and any SPEC files that require synchronization because of an in-scope P0/P1 fix.

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
5. Fix every in-scope P0/P1 and synchronize only affected specifications.
6. Preserve the eight support-block repairs already merged in #639 and all accepted parallel current-main work.
7. Add read-only Wave 6 runtime-contract coverage and wire it into the existing `Tool runtime contract audit` workflow.
8. Reconcile with latest main before PR and merge only when relevant CI is green.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, billing bypass, or materially misleading behavior.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Allowed files

- `.agent/plans/2026-09-13-spec-conformance-wave6.md`
- `scripts/check-tool-runtime-contracts-wave6.mjs`
- `.github/workflows/tool-runtime-contract-audit.yml`
- current Wave 6 tool implementation/SPEC files only when necessary to correct a verified P0/P1

Do not modify common specifications, unrelated tool families, deployment configuration, or monetization/product definitions.

## Acceptance

Wave 6 closes only after all final 12 registered tools have been inspected against current specifications and active runtime, every discovered P0/P1 is fixed or explicitly justified as not a defect, read-only runtime-contract coverage reaches all 87 registered tools, existing Waves 1–5 checks remain intact, and relevant repository CI is green on the final integrated head.
