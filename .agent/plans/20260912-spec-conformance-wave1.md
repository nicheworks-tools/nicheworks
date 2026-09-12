# SPEC conformance audit — wave 1

## Purpose

Use the newly completed 87/87 per-tool specifications as the source of truth for implementation quality work. This wave audits the first 15 registry tools against their documented acceptance criteria, fixes concrete production mismatches, and leaves passing behavior unchanged.

## Base and scope

- Base main SHA: `78b52e00b3f4067cf80cfeb56f997e3b3d88cf6d`.
- Branch: `audit/spec-conformance-wave1-20260912`.
- Scope: first 15 registry tools.

## Wave 1 tools

1. `ai-interaction-atlas`
2. `ai-project-pack`
3. `analytics-privacy-kit`
4. `api-key-token-redactor`
5. `ats-paste-doctor`
6. `codex-product-shipping-playbooks`
7. `codex-usage-forecaster`
8. `codex-work-os`
9. `cold-email-requirement-checker`
10. `color-replace`
11. `command-safety-checker`
12. `construction-tools-atlas`
13. `contract-cleaner`
14. `contract-risk-highlighter`
15. `cosmetic-ingredient-checker-lite`

## Audit method

For each tool:
1. Read `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the referenced runtime files rather than relying on page copy.
3. Classify each criterion as satisfied, ambiguous, or failing.
4. Fix only concrete failures or misleading production behavior.
5. If implementation is correct but the SPEC is wrong, correct the SPEC in the same PR.
6. Keep unrelated redesigns and new features out of this wave.

## Priority

- P0: privacy/security/data-loss/misleading behavior, broken core action, destructive behavior.
- P1: acceptance criterion failure, broken export/copy/state/language flow, material mobile/desktop failure.
- P2: misleading copy or weak edge-case handling that does not block the core workflow.

## Progress

- [x] 87/87 SPEC coverage is merged and machine-valid.
- [x] Known cross-wave disclosure/copy contradictions found during specification work have been repaired through PRs #515 and #517.
- [x] Created conformance wave-1 branch from current main.
- [ ] Audit tools 1–5.
- [ ] Audit tools 6–10.
- [ ] Audit tools 11–15.
- [ ] Apply concrete fixes and synchronize any affected SPECs.
- [ ] Run relevant CI, open PR, and merge only when green.

## Acceptance

The wave closes only after all 15 tools have been inspected against their acceptance criteria, every discovered P0/P1 failure in scope is either fixed or explicitly documented as unresolved with a concrete reason, and existing repository checks are green.
