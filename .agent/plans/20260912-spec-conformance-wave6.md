# SPEC conformance audit — wave 6

## Purpose

Complete the 87-tool implementation-quality cycle by auditing the final registry tools 76–87 against their complete per-tool specifications and current active runtime.

## Base and scope

- Base main SHA: `b5e1c7b32767196f9e20c87a1f60df30d21a9762`.
- Branch: `audit/spec-conformance-wave6-20260912`.
- Scope: registry tools 76–87.

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
1. Read `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the current public page and active runtime actually loaded.
3. Verify privacy/network, persistence, language, limits, export/copy, billing/gating, and safety/non-goal boundaries.
4. Classify findings P0/P1/P2.
5. Fix every in-scope P0/P1 and synchronize affected specifications.
6. Preserve existing runtime-contract coverage for tools 1–75 and add Wave 6 coverage for tools 76–87.
7. Reconcile with latest main before PR and preserve accepted parallel work.
8. Merge only when relevant CI is green on the final head.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, billing bypass, or materially misleading behavior.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Progress

- [x] Branch created from current main.
- [ ] Audit tools 76–79.
- [ ] Audit tools 80–83.
- [ ] Audit tools 84–87.
- [ ] Fix P0/P1 findings and synchronize affected specs.
- [ ] Add Wave 6 runtime-contract coverage.
- [ ] Reconcile final branch with latest main.
- [ ] Run CI, open PR, and merge only when green.

## Acceptance

Wave 6 closes only after all final 12 registered tools have been inspected against current specifications and active runtime, all discovered P0/P1 failures are fixed or explicitly justified, runtime-contract coverage reaches all 87 registered tools, and relevant repository checks are green on the final integrated head.
