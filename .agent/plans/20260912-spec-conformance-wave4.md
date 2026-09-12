# SPEC conformance audit — wave 4

## Purpose

Continue the 87-tool implementation-quality cycle by auditing registry tools 46–60 against their complete per-tool specifications and the current active runtime.

## Base and scope

- Base main SHA: `5e79fc8c8ec023370e3c87811a57244bae94466c`.
- Branch: `audit/spec-conformance-wave4-20260912`.
- Scope: registry tools 46–60.

## Wave 4 tools

1. `microtool-launch-checklist`
2. `mini-game-utility`
3. `minutes-to-ops`
4. `money-template-checker`
5. `motion-atlas`
6. `moving-checklist-generator`
7. `moving-lease-final-check`
8. `name-old-kanji-checker`
9. `newsletter-kit-generator`
10. `niche-job-starter-kit`
11. `notion-form-design-kit`
12. `og-image-maker`
13. `old-document-kanji-highlighter`
14. `old-kanji-ocr-scanner`
15. `old-kanji-reference`

## Audit method

For each tool:
1. Read the current `SPEC.md` acceptance criteria and implementation evidence.
2. Inspect the public page and the runtime it actually loads.
3. Verify privacy/network, persistence, language, limits, export/copy, billing/gating, and safety/non-goal boundaries that materially affect user expectations.
4. Classify findings P0/P1/P2.
5. Fix every in-scope P0/P1; keep unrelated redesign/new feature work out of scope.
6. Preserve the existing waves 1–3 checker and add a dedicated Wave 4 checker for tools 46–60, executed by the same read-only runtime-contract workflow.
7. Reconcile with any current-main parallel work before opening a PR; never overwrite newer accepted work.
8. Run repository CI and merge only when the current-main integration is green.

## Priority

- P0: privacy/security/data loss, false trust/safety claim, destructive behavior, broken core action.
- P1: material acceptance-criterion failure, broken state/export/language/network contract, billing bypass, or misleading behavior likely to alter a user decision.
- P2: cleanup, dead code, copy precision, or edge-case hardening that does not block the core contract.

## Findings and fixes

### P0

None found in this wave.

### P1 — Motion Atlas accepted any cached active entitlement

The legacy Motion Atlas Pro bridge used only `status.active`. The shared `NWPro` cache now stores the entitlement name returned by current billing/status flows, including product-scoped entitlement migrations. An active entitlement for a different product could therefore be interpreted as Motion Atlas Pro.

Fix:
- added `EXPECTED_ENTITLEMENT = "nicheworks_pro"` to the legacy bridge;
- Pro activates only when both `status.active` and the expected legacy shared entitlement match;
- synchronized the tool specification so another product entitlement is explicitly non-authoritative for Motion Atlas.

### P1 — Moving / Lease Final Check had the same entitlement-isolation failure

Its Pro bridge also converted any cached `status.active` into an unlocked state without checking the entitlement name.

Fix:
- require `nicheworks_pro` in addition to the active flag;
- keep the Free checklist/TXT/print flow independent of Pro;
- synchronized the specification and added `pro-bridge.js` to implementation evidence.

## No P0/P1 findings in the other thirteen tools

The remaining tools were checked against their current specifications and active runtimes without a material acceptance/privacy/state/export failure:

- `microtool-launch-checklist`
- `mini-game-utility`
- `minutes-to-ops`
- `money-template-checker`
- `moving-checklist-generator`
- `name-old-kanji-checker`
- `newsletter-kit-generator`
- `niche-job-starter-kit`
- `notion-form-design-kit`
- `og-image-maker`
- `old-document-kanji-highlighter`
- `old-kanji-ocr-scanner`
- `old-kanji-reference`

Notable confirmations:
- OG Image Maker loads its safe shared-entitlement bridge after the generic app helper, so the old tool-local helper cannot be authoritative for batch unlock.
- Notion Form Design Kit contains no Notion API/fetch path in its active design runtime.
- Old Kanji OCR uses `Tesseract.recognize(file, 'jpn', ...)`, exposes external OCR runtime/data loading, and keeps the selected image out of an external OCR API path.
- Old Kanji Reference current CSV/JSON/Markdown/print actions are Free and its future Pro panel remains billing-unavailable/disabled.

## P2 follow-up notes

These do not block the current contract but should be removed or polished in later cleanup:

- `mini-game-utility`, `newsletter-kit-generator`, and the base OG app still contain generic template-era `window.NW.hasPro` helpers that inspect `nw_pro_key`; they are not used as authoritative gates in the audited active flows.
- Newsletter blank-value placeholders are Japanese text reused inside the bilingual artifact's English section; the artifact remains structurally correct but the placeholder copy can be improved.
- Some Old Kanji static source copy says features are "implemented" while the runtime i18n replaces it with "being prepared"; the controls remain disabled/billing-unavailable either way.

## Runtime regression coverage

- Existing `scripts/check-tool-runtime-contracts.mjs` remains the waves 1–3 contract for tools 1–45.
- New `scripts/check-tool-runtime-contracts-wave4.mjs` covers tools 46–60 using stable structural/runtime markers.
- `.github/workflows/tool-runtime-contract-audit.yml` runs both checkers and retains the clean-working-tree assertion.
- Wave 4 specifically guards the two entitlement-isolation fixes, OG Maker script order, Free export boundaries, browser persistence keys, local/no-backend contracts, and locked Old Kanji Pro surfaces.

## Progress

- [x] Branch reset to current main and plan restarted.
- [x] Audit tools 46–50.
- [x] Audit tools 51–55.
- [x] Audit tools 56–60.
- [x] Fix P0/P1 findings and synchronize affected specs.
- [x] Add runtime-contract coverage for tools 46–60.
- [ ] Reconcile final branch with latest main.
- [ ] Run CI, open PR, and merge only when green.

## Acceptance

Wave 4 closes only after all 15 tools have been inspected against their current specifications and active runtime, all discovered P0/P1 failures are fixed or explicitly justified, runtime-contract coverage reaches 60 tools, and the relevant repository checks are green on the final integrated head.
