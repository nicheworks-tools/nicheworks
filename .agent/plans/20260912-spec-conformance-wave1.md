# SPEC conformance audit — wave 1

## Purpose

Use the completed 87/87 per-tool specifications as the source of truth for implementation quality work. This wave audits the first 15 registry tools against their documented acceptance criteria, fixes concrete production mismatches, and leaves passing behavior unchanged.

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
4. Fix concrete failures or misleading production behavior.
5. If implementation is correct but the SPEC points at a stale runtime, correct the SPEC in the same PR.
6. Keep unrelated redesigns and new features out of this wave.

## Priority

- P0: privacy/security/data-loss/misleading behavior, broken core action, destructive behavior.
- P1: acceptance criterion failure, broken export/copy/state/language flow, material mobile/desktop failure.
- P2: misleading copy or weak edge-case handling that does not block the core workflow.

## Audit results

### P0/P1 fixed in this wave

- `api-key-token-redactor` — detected-secret previews previously retained the first 6 and last 4 characters and those preview strings could flow into visible findings and Pro review/export material. The bridge now suppresses visible credential fragments and scrubs clipboard/download artifacts. The SPEC now explicitly requires secret-safe finding previews and exports.
- `cold-email-requirement-checker` — Pro could be unlocked by `?pro=1` or a tool-local localStorage key. The addon now uses the existing shared legacy `NWPro.getLocalStatus()` / `nicheworks_pro` entitlement and no longer accepts URL/local self-unlock bypasses.

### Safety/quality correction

- `cosmetic-ingredient-checker-lite` — an unknown token was described as a "general cosmetic ingredient" even when the lightweight dictionary did not recognize it. Unknown entries now explicitly say they cannot be classified by this dictionary and point users to product/manufacturer official information.

### Runtime-evidence corrections

- `codex-usage-forecaster` — the public page loads `app-fixed.js`; the SPEC now names that active runtime rather than the stale `app.js` file.
- `command-safety-checker` — the public page loads `app-core.js` plus `pro-bridge.js`; the SPEC now records those active runtime files.
- `construction-tools-atlas` — the public page loads `app.runtime.js` plus `data/quality-loader.js`; the SPEC now records the current runtime instead of the older `app.js` file.

### P0/P1 pass without production change

- `ai-interaction-atlas` — search/filter/detail/recent/favorites/free-compare/legacy-shared-Pro behavior matches the current SPEC. The legacy `nicheworks_pro` path is intentionally not migrated in this wave because the common billing architecture explicitly keeps legacy shared Pro separate from the new product-scoped server-verified foundation.
- `ai-project-pack` — repository-first operating-guide behavior and report-only → bounded safe-update → update-log workflow match the SPEC.
- `analytics-privacy-kit` — provider selection, draft generation, copy/download/clear and non-legal-advice boundary match the SPEC.
- `ats-paste-doctor` — free/Pro input caps, analysis/copy/export, and legacy shared entitlement behavior match the SPEC.
- `codex-product-shipping-playbooks` — ordered shipping stages, human review boundaries, and repository guidance match the SPEC.
- `codex-work-os` — five domain packs and review-oriented workflow framing match the SPEC.
- `color-replace` — browser image processing, color replacement, 4 MP cap, alpha behavior, and PNG output match the SPEC.
- `command-safety-checker` — active checker runtime, risk guidance, non-execution boundary, free checker, and legacy shared Pro gate match after evidence correction.
- `construction-tools-atlas` — active runtime search/detail/favorites/import-export/language behavior matches after evidence correction.
- `contract-cleaner` — browser-local rule matching, review-priority framing, matched-only view and copy/TXT flows match the SPEC.
- `contract-risk-highlighter` — pasted-text analysis, free finding cap, Pro output gating, and browser Print/Save PDF result path match the operative runtime contract.
- `cosmetic-ingredient-checker-lite` — input parsing, flags, clear/copy, Japanese-only UI and disclaimer match after the unknown-entry wording correction.

## P2 backlog discovered during this wave

These do not block the current acceptance criteria and are intentionally not treated as P0/P1 closure blockers, but they should be removed in subsequent copy/runtime cleanup:

- `ai-project-pack`: EN/JA metadata still contains a generic "browser-only lightweight tool" description inconsistent with the repository-guide product. The EN status card also contains the awkward phrase "not as a draft or stable content".
- `contract-risk-highlighter`: static HTML / JSON-LD contains stale "PDF extraction ready" wording while the active runtime correctly says direct PDF extraction is coming soon and input is pasted text only.
- `construction-tools-atlas`: the static how-to sheet list is Japanese and the active runtime does not currently translate that list when switching the reference UI to English. Core search/detail/favorites behavior remains bilingual.
- Stale inactive runtime files remain beside active implementations in several tools. SPEC and the new runtime-contract checker now identify the active files so future audits do not inspect the wrong implementation by accident.

## Regression guardrail

- Added `scripts/check-tool-runtime-contracts.mjs` for the first 15 tools.
- Added `.github/workflows/tool-runtime-contract-audit.yml`.
- The checker locks active runtime wiring, important storage/limit contracts, legacy shared Pro gates, the removal of the Cold Email self-unlock bypass, Redactor secret-safe preview/export hardening, and the Cosmetic unknown-entry wording.
- Future waves can extend this same checker rather than creating one-off scripts.

## Progress

- [x] 87/87 SPEC coverage is merged and machine-valid.
- [x] Known cross-wave disclosure/copy contradictions found during specification work were repaired through PRs #515 and #517.
- [x] Created conformance wave-1 branch from main.
- [x] Audited tools 1–5.
- [x] Audited tools 6–10.
- [x] Audited tools 11–15.
- [x] Applied discovered P0/P1 fixes and synchronized affected SPECs.
- [x] Added a reusable runtime-contract checker and workflow.
- [ ] Run PR CI, resolve any checker false positives/regressions, and merge only when green.

## Acceptance

The wave closes only after all 15 tools have been inspected against their acceptance criteria, every discovered P0/P1 failure in scope is fixed or explicitly documented as unresolved with a concrete reason, the runtime-contract audit passes, and existing repository checks are green.
